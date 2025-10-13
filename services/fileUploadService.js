const fileQueue = require("../queues/fileQueue");
const logger = require("../utils/logger");

/**
 * Service pour gérer l'upload de fichiers via la queue
 */
class FileUploadService {
  /**
   * Ajouter un job pour traiter une image de profil
   * @param {string} filePath - Chemin du fichier uploadé
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} metadata - Métadonnées supplémentaires
   * @returns {Promise<Object>} Job créé
   */
  async processProfilePicture(filePath, userId, metadata = {}) {
    try {
      const job = await fileQueue.add(
        "profile_picture",
        {
          type: "profile_picture",
          filePath,
          userId,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
          },
        },
        {
          priority: 2, // Priorité moyenne
          attempts: 3,
        }
      );

      logger.info(` Job de traitement d'image de profil créé: ${job.id}`);
      return {
        jobId: job.id,
        type: "profile_picture",
        status: "queued",
      };
    } catch (error) {
      logger.error(
        ` Erreur lors de la création du job d'upload d'image: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Ajouter un job pour traiter un PDF de prompt
   * @param {string} filePath - Chemin du fichier PDF uploadé
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} metadata - Métadonnées (promptId, title, etc.)
   * @returns {Promise<Object>} Job créé
   */
  async processPdfPrompt(filePath, userId, metadata = {}) {
    try {
      const job = await fileQueue.add(
        "pdf_prompt",
        {
          type: "pdf_prompt",
          filePath,
          userId,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
          },
        },
        {
          priority: 1, // Haute priorité pour les prompts
          attempts: 3,
        }
      );

      logger.info(` Job de traitement de PDF créé: ${job.id}`);
      return {
        jobId: job.id,
        type: "pdf_prompt",
        status: "queued",
      };
    } catch (error) {
      logger.error(
        ` Erreur lors de la création du job de PDF: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Ajouter un job pour traiter une image de prompt (prompts texte)
   * @param {string} filePath - Chemin du fichier image uploadé
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} metadata - Métadonnées (promptId, title, etc.)
   * @returns {Promise<Object>} Job créé
   */
  async processPromptImage(filePath, userId, metadata = {}) {
    try {
      const job = await fileQueue.add(
        "prompt_image",
        {
          type: "prompt_image",
          filePath,
          userId,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
          },
        },
        {
          priority: 2, // Priorité moyenne
          attempts: 3,
        }
      );

      logger.info(`🖼️ Job de traitement d'image de prompt créé: ${job.id}`);
      return {
        jobId: job.id,
        type: "prompt_image",
        status: "queued",
      };
    } catch (error) {
      logger.error(
        `❌ Erreur lors de la création du job d'image de prompt: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Vérifier le statut d'un job
   * @param {string} jobId - ID du job
   * @returns {Promise<Object>} Statut du job
   */
  async getJobStatus(jobId) {
    try {
      const job = await fileQueue.getJob(jobId);

      if (!job) {
        return { found: false, jobId };
      }

      const state = await job.getState();
      const progress = job.progress;

      return {
        found: true,
        jobId: job.id,
        state,
        progress,
        data: job.data,
        result: job.returnvalue,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
      };
    } catch (error) {
      logger.error(
        ` Erreur lors de la récupération du statut du job: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de la queue
   * @returns {Promise<Object>} Statistiques
   */
  async getQueueStats() {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        fileQueue.getWaitingCount(),
        fileQueue.getActiveCount(),
        fileQueue.getCompletedCount(),
        fileQueue.getFailedCount(),
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
      };
    } catch (error) {
      logger.error(
        ` Erreur lors de la récupération des stats: ${error.message}`
      );
      throw error;
    }
  }
}

module.exports = new FileUploadService();
