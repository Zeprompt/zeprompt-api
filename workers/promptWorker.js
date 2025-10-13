const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const { uploadImage } = require("../services/uploadImageService");
const logger = require("../utils/logger");

const promptWorker = new Worker(
  "promptQueue",
  async (job) => {
    const {
      key,
      buffer,
      contentType,
      promptId,
      fileType, // 'image' ou 'pdf'
    } = job.data;

    logger.info(`🚀 Prompt worker started for ${fileType} upload`);
    logger.info(`📁 Uploading ${fileType} with key: ${key}`);

    try {
      // Upload du fichier sur Cloudflare R2
      const fileUrl = await uploadImage(key, buffer, contentType);

      logger.info(`✅ ${fileType} uploadé avec succès: ${fileUrl}`);
      logger.info(`📦 Prompt ID: ${promptId}`);

      // Retourner l'URL pour mise à jour ultérieure
      return {
        success: true,
        url: fileUrl,
        promptId,
        fileType,
        key,
      };
    } catch (error) {
      logger.error(`❌ Erreur lors de l'upload du ${fileType}:`, error);
      throw new Error(
        `Failed to upload ${fileType} for prompt ${promptId}: ${error.message}`
      );
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Nombre d'uploads simultanés
    limiter: {
      max: 10, // Maximum 10 jobs
      duration: 1000, // Par seconde
    },
  }
);

// Événement de succès
promptWorker.on("completed", (job, result) => {
  logger.info(`✅ Job ${job.id} completed successfully`);
  logger.info(`📷 File URL: ${result.url}`);
});

// Événement d'échec
promptWorker.on("failed", (job, err) => {
  logger.error(`❌ Job ${job.id} failed:`, err.message);
  logger.error(`📦 Prompt ID: ${job.data.promptId}`);
  logger.error(`🔑 File key: ${job.data.key}`);
});

// Événement de progression (optionnel)
promptWorker.on("progress", (job, progress) => {
  logger.info(`⏳ Job ${job.id} is ${progress}% complete`);
});

// Événement d'erreur du worker
promptWorker.on("error", (err) => {
  logger.error("❌ Prompt worker error:", err);
});

module.exports = promptWorker;
