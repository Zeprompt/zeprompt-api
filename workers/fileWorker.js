const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

/**
 * Worker pour traiter les uploads de fichiers
 * Gère les images de profil et les PDFs
 */
const fileWorker = new Worker(
  "fileQueue",
  async (job) => {
    const { type, filePath, userId, metadata } = job.data;

    logger.info(` File worker started for type: ${type}`);

    try {
      switch (type) {
        case "profile_picture":
          await processProfilePicture(filePath, userId, metadata);
          break;

        case "pdf_prompt":
          await processPdfPrompt(filePath, userId, metadata);
          break;

        case "prompt_image":
          await processPromptImage(filePath, userId, metadata);
          break;

        default:
          throw new Error(`Type de fichier non supporté: ${type}`);
      }

      logger.info(` Fichier traité avec succès: ${filePath}`);
      return { success: true, type, filePath };
    } catch (error) {
      logger.error(` Erreur lors du traitement du fichier: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Traiter 3 fichiers en parallèle max
  }
);

/**
 * Traiter une image de profil
 * - Optimisation de l'image
 * - Création de thumbnails
 * - Validation
 */
async function processProfilePicture(filePath, userId) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  logger.info(` Traitement de l'image de profil pour l'utilisateur ${userId}`);

  const fileInfo = path.parse(filePath);
  const outputDir = path.dirname(filePath);

  try {
    // 1. Optimiser l'image originale (max 800x800)
    const optimizedPath = path.join(
      outputDir,
      `${fileInfo.name}_optimized${fileInfo.ext}`
    );

    await sharp(filePath)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // 2. Créer un thumbnail (150x150)
    const thumbnailPath = path.join(
      outputDir,
      `${fileInfo.name}_thumb${fileInfo.ext}`
    );

    await sharp(filePath)
      .resize(150, 150, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // 3. Remplacer l'original par la version optimisée
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath);

    logger.info(` Image optimisée et thumbnail créé`);

    return {
      originalPath: filePath,
      thumbnailPath,
      optimized: true,
    };
  } catch (error) {
    logger.error(` Erreur lors de l'optimisation de l'image: ${error.message}`);
    throw error;
  }
}

/**
 * Traiter une image de prompt (pour prompts texte)
 * - Optimisation de l'image
 * - Création de thumbnails
 * - Validation
 */
async function processPromptImage(filePath, userId, metadata) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  logger.info(` Traitement de l'image de prompt pour l'utilisateur ${userId}`);

  const fileInfo = path.parse(filePath);
  const outputDir = path.dirname(filePath);

  try {
    // 1. Optimiser l'image (max 1200x1200 pour les prompts)
    const optimizedPath = path.join(
      outputDir,
      `${fileInfo.name}_optimized${fileInfo.ext}`
    );

    await sharp(filePath)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toFile(optimizedPath);

    // 2. Créer un thumbnail (300x300)
    const thumbnailPath = path.join(
      outputDir,
      `${fileInfo.name}_thumb${fileInfo.ext}`
    );

    await sharp(filePath)
      .resize(300, 300, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    // 3. Remplacer l'original par la version optimisée
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath);

    logger.info(` Image de prompt optimisée et thumbnail créé`);

    return {
      originalPath: filePath,
      thumbnailPath,
      optimized: true,
      metadata,
    };
  } catch (error) {
    logger.error(` Erreur lors de l'optimisation de l'image de prompt: ${error.message}`);
    throw error;
  }
}

/**
 * Traiter un PDF de prompt
 * - Validation du PDF
 * - Extraction de métadonnées
 * - Scan antivirus (optionnel)
 */
async function processPdfPrompt(filePath, userId, metadata) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier PDF introuvable: ${filePath}`);
  }

  logger.info(` Traitement du PDF pour l'utilisateur ${userId}`);

  try {
    // 1. Vérifier que le fichier est bien un PDF
    const fileBuffer = fs.readFileSync(filePath);
    const isPdf = fileBuffer.toString("utf8", 0, 4) === "%PDF";

    if (!isPdf) {
      throw new Error("Le fichier n'est pas un PDF valide");
    }

    // 2. Obtenir la taille du fichier
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    logger.info(` PDF validé - Taille: ${fileSizeInMB.toFixed(2)} MB`);

    // 3. Ici, vous pouvez ajouter d'autres traitements :
    // - Scan antivirus
    // - Extraction de texte avec pdf-parse
    // - Compression du PDF si trop volumineux
    // - Génération d'une miniature de la première page

    return {
      filePath,
      validated: true,
      sizeInMB: fileSizeInMB,
      metadata,
    };
  } catch (error) {
    logger.error(` Erreur lors du traitement du PDF: ${error.message}`);
    
    // Supprimer le fichier si invalide
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(` Fichier PDF invalide supprimé`);
    }
    
    throw error;
  }
}

// Événements du worker
fileWorker.on("completed", (job) => {
  logger.info(` Job ${job.id} complété avec succès`);
});

fileWorker.on("failed", (job, err) => {
  logger.error(` Job ${job.id} échoué:`, err.message);
});

fileWorker.on("error", (err) => {
  logger.error(` Erreur du worker:`, err);
});

module.exports = fileWorker;
