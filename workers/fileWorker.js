const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const r2StorageService = require("../services/r2StorageService");
const { User, Prompt } = require("../models");

/**
 * Worker pour traiter les uploads de fichiers
 * Gère les images de profil, les PDFs et upload vers Cloudflare R2
 */
const fileWorker = new Worker(
  "fileQueue",
  async (job) => {
    const { type, filePath, userId, metadata } = job.data;

    logger.info(` File worker started for type: ${type}`);

    try {
      let result;
      
      switch (type) {
        case "profile_picture":
          result = await processProfilePicture(filePath, userId, metadata);
          break;

        case "pdf_prompt":
          result = await processPdfPrompt(filePath, userId, metadata);
          break;

        case "prompt_image":
          result = await processPromptImage(filePath, userId, metadata);
          break;

        default:
          throw new Error(`Type de fichier non supporté: ${type}`);
      }

      logger.info(` Fichier traité avec succès: ${filePath}`);
      return { success: true, type, ...result };
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
 * - Upload vers Cloudflare R2
 * - Suppression du fichier local
 */
async function processProfilePicture(filePath, userId) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  logger.info(` Traitement de l'image de profil pour l'utilisateur ${userId}`);

  try {
    // Générer la clé R2
    const filename = path.basename(filePath);
    const r2Key = r2StorageService.generateKey("profiles", userId, filename);

    // Upload l'image optimisée avec thumbnail vers R2
    const result = await r2StorageService.uploadImageWithThumbnail(
      filePath,
      r2Key,
      {
        imageWidth: 800,
        imageHeight: 800,
        imageQuality: 85,
        thumbWidth: 150,
        thumbHeight: 150,
        thumbQuality: 80,
      }
    );

    // Mettre à jour la base de données avec l'URL R2
    await User.update(
      { profilePicture: result.image.url },
      { where: { id: userId } }
    );
    logger.info(` Base de données mise à jour avec l'URL R2 pour l'utilisateur ${userId}`);

    // Supprimer le fichier local après upload réussi
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(` Fichier local supprimé: ${filePath}`);
    }

    logger.info(` Image de profil uploadée vers R2: ${result.image.url}`);

    return {
      imageUrl: result.image.url,
      thumbnailUrl: result.thumbnail.url,
      r2Key: result.image.key,
      thumbnailKey: result.thumbnail.key,
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
 * - Upload vers Cloudflare R2
 * - Suppression du fichier local
 */
async function processPromptImage(filePath, userId, metadata) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  logger.info(` Traitement de l'image de prompt pour l'utilisateur ${userId}`);

  try {
    // Générer la clé R2
    const filename = path.basename(filePath);
    const r2Key = r2StorageService.generateKey("prompts/images", userId, filename);

    // Upload l'image optimisée avec thumbnail vers R2
    const result = await r2StorageService.uploadImageWithThumbnail(
      filePath,
      r2Key,
      {
        imageWidth: 1200,
        imageHeight: 1200,
        imageQuality: 90,
        thumbWidth: 300,
        thumbHeight: 300,
        thumbQuality: 85,
      }
    );

    // Supprimer le fichier local après upload réussi
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(` Fichier local supprimé: ${filePath}`);
    }

    logger.info(` Image de prompt uploadée vers R2: ${result.image.url}`);

    // Mettre à jour la base de données avec l'URL R2
    if (metadata && metadata.promptId) {
      const updateFields = metadata.isSecondImage 
        ? { 
            imageUrl2: result.image.url,
            thumbnailUrl2: result.thumbnail.url 
          }
        : { 
            imageUrl: result.image.url,
            thumbnailUrl: result.thumbnail.url 
          };
      
      await Prompt.update(
        updateFields,
        { where: { id: metadata.promptId } }
      );
      logger.info(` Base de données mise à jour avec l'URL R2 pour le prompt ${metadata.promptId} (image ${metadata.isSecondImage ? '2' : '1'})`);
    }

    return {
      imageUrl: result.image.url,
      thumbnailUrl: result.thumbnail.url,
      r2Key: result.image.key,
      thumbnailKey: result.thumbnail.key,
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
 * - Upload vers Cloudflare R2
 * - Suppression du fichier local
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

    // 3. Générer la clé R2
    const filename = path.basename(filePath);
    const r2Key = r2StorageService.generateKey("prompts/pdfs", userId, filename);

    // 4. Upload vers R2
    const result = await r2StorageService.uploadPDF(filePath, r2Key);

    // 5. Supprimer le fichier local après upload réussi
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(` Fichier local supprimé: ${filePath}`);
    }

    logger.info(` PDF uploadé vers R2: ${result.url}`);

    // Mettre à jour la base de données avec l'URL R2
    if (metadata && metadata.promptId) {
      await Prompt.update(
        { pdfUrl: result.url },
        { where: { id: metadata.promptId } }
      );
      logger.info(` Base de données mise à jour avec l'URL R2 pour le prompt ${metadata.promptId}`);
    }

    return {
      pdfUrl: result.url,
      r2Key: result.key,
      sizeInMB: fileSizeInMB,
      validated: true,
      metadata,
    };
  } catch (error) {
    logger.error(` Erreur lors du traitement du PDF: ${error.message}`);
    
    // Supprimer le fichier local si invalide
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
