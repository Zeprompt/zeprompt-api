#!/usr/bin/env node

/**
 * Script de migration des fichiers locaux vers Cloudflare R2
 * 
 * Ce script migre tous les fichiers existants dans uploads/ vers Cloudflare R2
 * et met à jour les références en base de données
 * 
 * Usage: node scripts/migrate-to-r2.js [--dry-run] [--type=all|profiles|prompts|pdfs]
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize } = require("../models");
const r2StorageService = require("../services/r2StorageService");
const logger = require("../utils/logger");

// Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const typeArg = args.find(arg => arg.startsWith("--type="));
const migrationType = typeArg ? typeArg.split("=")[1] : "all";

// Statistiques
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
};

/**
 * Migrer les photos de profil
 */
async function migrateProfilePictures() {
  logger.info("📸 Migration des photos de profil...");

  const uploadsDir = path.resolve(process.cwd(), "uploads", "profiles");

  if (!fs.existsSync(uploadsDir)) {
    logger.warn("⚠️ Dossier uploads/profiles introuvable");
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  logger.info(`📦 ${files.length} fichiers trouvés dans uploads/profiles/`);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);

    // Ignorer les fichiers _thumb (seront recréés)
    if (file.includes("_thumb")) {
      stats.skipped++;
      continue;
    }

    try {
      stats.total++;

      // Extraire l'userId du nom de fichier (format: userId-timestamp-name.ext)
      const userId = file.split("-")[0];

      if (isDryRun) {
        logger.info(`[DRY RUN] Migrerait: ${file}`);
        stats.success++;
        continue;
      }

      // Générer la clé R2
      const r2Key = r2StorageService.generateKey("profiles", userId, file);

      // Upload vers R2 avec thumbnail
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

      // Mettre à jour la base de données
      await sequelize.query(
        `UPDATE users SET profile_picture = :newUrl WHERE profile_picture LIKE :oldPath`,
        {
          replacements: {
            newUrl: result.image.url,
            oldPath: `%${file}%`,
          },
        }
      );

      logger.info(`✅ Migré: ${file} -> ${result.image.url}`);
      stats.success++;

      // Supprimer les fichiers locaux
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const thumbPath = filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "_thumb$&");
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    } catch (error) {
      logger.error(`❌ Erreur migration ${file}: ${error.message}`);
      stats.failed++;
    }
  }
}

/**
 * Migrer les images de prompts
 */
async function migratePromptImages() {
  logger.info("🖼️ Migration des images de prompts...");

  const uploadsDir = path.resolve(process.cwd(), "uploads", "prompts", "images");

  if (!fs.existsSync(uploadsDir)) {
    logger.warn("⚠️ Dossier uploads/prompts/images introuvable");
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  logger.info(`📦 ${files.length} fichiers trouvés dans uploads/prompts/images/`);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);

    // Ignorer les fichiers _thumb
    if (file.includes("_thumb")) {
      stats.skipped++;
      continue;
    }

    try {
      stats.total++;

      if (isDryRun) {
        logger.info(`[DRY RUN] Migrerait: ${file}`);
        stats.success++;
        continue;
      }

      // Récupérer le prompt associé
      const [prompts] = await sequelize.query(
        `SELECT id, "userId" FROM prompts WHERE image_path LIKE :imagePath LIMIT 1`,
        {
          replacements: {
            imagePath: `%${file}%`,
          },
        }
      );

      if (prompts.length === 0) {
        logger.warn(`⚠️ Aucun prompt trouvé pour ${file}`);
        stats.skipped++;
        continue;
      }

      const userId = prompts[0].userId;
      const promptId = prompts[0].id;

      // Générer la clé R2
      const r2Key = r2StorageService.generateKey("prompts/images", userId, file);

      // Upload vers R2 avec thumbnail
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

      // Mettre à jour la base de données
      await sequelize.query(
        `UPDATE prompts SET image_path = :newUrl WHERE id = :promptId`,
        {
          replacements: {
            newUrl: result.image.url,
            promptId,
          },
        }
      );

      logger.info(`✅ Migré: ${file} -> ${result.image.url}`);
      stats.success++;

      // Supprimer les fichiers locaux
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const thumbPath = filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "_thumb$&");
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    } catch (error) {
      logger.error(`❌ Erreur migration ${file}: ${error.message}`);
      stats.failed++;
    }
  }
}

/**
 * Migrer les PDFs
 */
async function migratePromptPDFs() {
  logger.info("📄 Migration des PDFs de prompts...");

  const uploadsDir = path.resolve(process.cwd(), "uploads", "pdfs");

  if (!fs.existsSync(uploadsDir)) {
    logger.warn("⚠️ Dossier uploads/pdfs introuvable");
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  logger.info(`📦 ${files.length} fichiers trouvés dans uploads/pdfs/`);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);

    try {
      stats.total++;

      if (isDryRun) {
        logger.info(`[DRY RUN] Migrerait: ${file}`);
        stats.success++;
        continue;
      }

      // Récupérer le prompt associé
      const [prompts] = await sequelize.query(
        `SELECT id, "userId" FROM prompts WHERE pdf_file_path LIKE :pdfPath LIMIT 1`,
        {
          replacements: {
            pdfPath: `%${file}%`,
          },
        }
      );

      if (prompts.length === 0) {
        logger.warn(`⚠️ Aucun prompt trouvé pour ${file}`);
        stats.skipped++;
        continue;
      }

      const userId = prompts[0].userId;
      const promptId = prompts[0].id;

      // Générer la clé R2
      const r2Key = r2StorageService.generateKey("prompts/pdfs", userId, file);

      // Upload vers R2
      const result = await r2StorageService.uploadPDF(filePath, r2Key);

      // Mettre à jour la base de données
      await sequelize.query(
        `UPDATE prompts SET pdf_file_path = :newUrl WHERE id = :promptId`,
        {
          replacements: {
            newUrl: result.url,
            promptId,
          },
        }
      );

      logger.info(`✅ Migré: ${file} -> ${result.url}`);
      stats.success++;

      // Supprimer le fichier local
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      logger.error(`❌ Erreur migration ${file}: ${error.message}`);
      stats.failed++;
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  logger.info("🚀 Début de la migration vers Cloudflare R2");
  logger.info(`Mode: ${isDryRun ? "DRY RUN (simulation)" : "RÉEL"}`);
  logger.info(`Type: ${migrationType}`);
  logger.info("================================\n");

  try {
    // Vérifier la connexion à la DB
    await sequelize.authenticate();
    logger.info("✅ Connexion DB OK\n");

    // Vérifier la configuration R2
    if (!process.env.CLOUDFLARE_BUCKET_NAME) {
      throw new Error("CLOUDFLARE_BUCKET_NAME non configuré");
    }
    if (!process.env.CLOUDFLARE_ENDPOINT_URL) {
      throw new Error("CLOUDFLARE_ENDPOINT_URL non configuré");
    }
    logger.info("✅ Configuration R2 OK\n");

    // Exécuter les migrations selon le type
    if (migrationType === "all" || migrationType === "profiles") {
      await migrateProfilePictures();
      logger.info("");
    }

    if (migrationType === "all" || migrationType === "prompts") {
      await migratePromptImages();
      logger.info("");
    }

    if (migrationType === "all" || migrationType === "pdfs") {
      await migratePromptPDFs();
      logger.info("");
    }

    // Afficher les statistiques
    logger.info("================================");
    logger.info("📊 Statistiques de migration:");
    logger.info(`Total traité: ${stats.total}`);
    logger.info(`✅ Succès: ${stats.success}`);
    logger.info(`❌ Échecs: ${stats.failed}`);
    logger.info(`⏭️ Ignorés: ${stats.skipped}`);
    logger.info("================================");

    if (isDryRun) {
      logger.info("\n⚠️ Mode DRY RUN - Aucune modification effectuée");
      logger.info("Relancez sans --dry-run pour migrer réellement");
    }
  } catch (error) {
    logger.error("❌ Erreur fatale:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécution
main();
