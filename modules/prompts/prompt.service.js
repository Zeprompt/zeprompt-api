const { validate: isUuid } = require("uuid"); // Librairie pour vérifier que les IDs sont des UUID valides
const crypto = require("crypto"); // Pour générer des hash (SHA256)
const promptRepository = require("./prompt.repository"); // Accès aux fonctions de la DB pour les prompts
const CacheService = require("../../services/cacheService"); // Service pour gérer le cache Redis ou similaire
const Errors = require("./prompt.errors"); // Erreurs centralisées pour le module Prompt
const { sequelize } = require("../../models");
const promptVersionService = require("../promptVersion/promptVersion.service");
const viewService = require("../view/view.service");
const tagRepository = require("../tags/tag.repository");
const logger = require("../../utils/logger");
const r2StorageService = require("../../services/r2StorageService");
const fs = require("fs");
const path = require("path");

class PromptService {
  _formatFileName(originalName) {
    const extension = originalName.split(".").pop();

    const baseName = originalName
      .replace(/\.[^/.]+$/, "") // Enlève l'extension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Remplace les espaces et caractères spéciaux par "-"
      .replace(/^-+|-+$/g, ""); // Supprime les "-" au début/fin

    const timestamp = Date.now();
    return `${baseName}-${timestamp}.${extension}`;
  }
  // Vérifie que l'ID est présent et valide
  _validateUuid(id, action = "opération") {
    if (!id) throw Errors.idRequired(action); // ID manquant
    if (!isUuid(id)) throw Errors.invalidId(); // ID invalide
  }

  // Vérifie qu'un prompt existe après récupération depuis la DB
  _ensurePromptExists(prompt, id) {
    if (!prompt) throw Errors.notFound("Prompt", id); // Prompt introuvable
  }

  // Invalide le cache des prompts (utile après création, suppression ou update)
  async _invalidateCache() {
    const leaderBoardCachKey = `leaderboard:top20`;
    await CacheService.del(leaderBoardCachKey);
    await CacheService.del("prompts:page_1_limit_20"); // Suppression de la clé cache spécifique
  }

  /**
   * Création d'un nouveau prompt
   * @param {*} data - Contient title, content et contentType
   * @returns Le prompt créé
   */
  async createPrompt(data) {
    return await sequelize.transaction(async (t) => {
      const hash = crypto
        .createHash("sha256")
        .update(
          (data.title || "") + (data.content || "") + (data.contentType || "")
        )
        .digest("hex");

      data.hash = hash;
      const existing = await promptRepository.findByHash(hash, {
        transaction: t,
      });
      if (existing) throw Errors.duplicatePrompt();

      // Extraire les tags avant de créer le prompt
      const tags = data.tags || [];
      delete data.tags; // Retirer tags de data car ce n'est pas un champ du modèle Prompt

      const prompt = await promptRepository.createPrompt(data, {
        transaction: t,
      });

      // Gérer les tags si présents
      if (tags.length > 0) {
        const tagInstances = await tagRepository.findByNames(tags, {
          transaction: t,
        });
        await prompt.setTags(tagInstances, { transaction: t });
      }
      
      // Si c'est un prompt PDF, uploader directement vers R2 de manière synchrone
      if (data.contentType === 'pdf' && data.pdfFilePath && fs.existsSync(data.pdfFilePath)) {
        try {
          const filename = path.basename(data.pdfFilePath);
          const r2Key = r2StorageService.generateKey("prompts/pdfs", data.userId, filename);
          const result = await r2StorageService.uploadPDF(data.pdfFilePath, r2Key);
          
          prompt.pdfUrl = result.url;
          await prompt.save({ transaction: t });
          
          // Supprimer le fichier local après upload réussi
          fs.unlinkSync(data.pdfFilePath);
          logger.info(`📄 PDF uploadé vers R2: ${result.url}`);
        } catch (error) {
          logger.error(`❌ Erreur upload PDF R2: ${error.message}`);
          throw error;
        }
      }
      
      // Si une image est attachée (pour prompts texte), uploader directement vers R2
      if (data.contentType === 'text' && data.imagePath && fs.existsSync(data.imagePath)) {
        try {
          const filename = path.basename(data.imagePath);
          const r2Key = r2StorageService.generateKey("prompts/images", data.userId, filename);
          const result = await r2StorageService.uploadImageWithThumbnail(
            data.imagePath,
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
          
          prompt.imageUrl = result.image.url;
          prompt.thumbnailUrl = result.thumbnail.url;
          await prompt.save({ transaction: t });
          
          // Supprimer le fichier local après upload réussi
          fs.unlinkSync(data.imagePath);
          logger.info(`🖼️ Image uploadée vers R2: ${result.image.url}`);
        } catch (error) {
          logger.error(`❌ Erreur upload image R2: ${error.message}`);
          throw error;
        }
      }
      
      // Si une deuxième image est attachée (pour prompts texte), uploader directement vers R2
      if (data.contentType === 'text' && data.imagePath2 && fs.existsSync(data.imagePath2)) {
        try {
          const filename = path.basename(data.imagePath2);
          const r2Key = r2StorageService.generateKey("prompts/images", data.userId, filename);
          const result = await r2StorageService.uploadImageWithThumbnail(
            data.imagePath2,
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
          
          prompt.imageUrl2 = result.image.url;
          prompt.thumbnailUrl2 = result.thumbnail.url;
          await prompt.save({ transaction: t });
          
          // Supprimer le fichier local après upload réussi
          fs.unlinkSync(data.imagePath2);
          logger.info(`🖼️ Image 2 uploadée vers R2: ${result.image.url}`);
        } catch (error) {
          logger.error(`❌ Erreur upload image 2 R2: ${error.message}`);
          throw error;
        }
      }
      
      await this._invalidateCache();
      return prompt;
    });
  }

  /**
   * Récupération d'un prompt par son ID
   * @param {*} id - UUID du prompt
   * @returns Le prompt correspondant
   */
  async getPromptById(id, { user, anonymousId }) {
    this._validateUuid(id);
    return await sequelize.transaction(async (t) => {
      await viewService.recordView(id, user || null, anonymousId || null, {
        transaction: t,
      });
      const prompt = await promptRepository.findPromptById(id, {
        transaction: t,
      });
      this._ensurePromptExists(prompt, id);
      const tagsIds = (prompt.Tags || []).map((tag) => tag.id);
      const similarePrompts = await promptRepository.findSimilarPrompts(
        prompt.id,
        tagsIds,
        3,
        { transaction: t }
      );
      return { prompt, similarePrompts };
    });
  }

  /**
   * Récupération de tous les prompts (avec pagination)
   * @param {*} param0 - { page, limit, currentUser }
   * @returns Liste de prompts
   */
  async getAllPrompts({ page = 1, limit = 20, currentUser }, options = {}) {
    const prompts = await promptRepository.getAllPrompts(
      {
        page,
        limit,
        currentUser,
      },
      options
    );
    if (!prompts) throw Errors.noPromptsFound(); // Si aucun prompt trouvé
    return prompts;
  }

  /**
   * Récupération de tous les prompts publics avec cache
   * @param {*} param0 - { page, limit }
   * @returns Liste de prompts publics
   */
  async getAllPublicPrompts({ page = 1, limit = 20 }) {
    const cacheKey = `prompts:page_${page}_limit_${limit}`;
    const cachedPrompts = await CacheService.get(cacheKey);

    // Retourne le cache si disponible
    if (cachedPrompts) return cachedPrompts;

    // Sinon récupère depuis la DB
    const prompts = await promptRepository.getAllPrompts({ page, limit });

    // Stocke le résultat dans le cache pour 1h (3600s)
    await CacheService.set(cacheKey, prompts, 3600);

    return prompts;
  }

  /**
   * Mise à jour d'un prompt
   * @param {*} id - UUID du prompt
   * @param {*} data - Données à mettre à jour
   * @param {*} currentUser - Utilisateur courant
   * @returns Le prompt mis à jour
   */
  async updatePrompt(id, data, currentUser) {
    this._validateUuid(id, "Update Prompt By Id");
    return await sequelize.transaction(async (t) => {
      const prompt = await this.getPromptById(id, { transaction: t });
      if (prompt.userId !== currentUser.id) throw Errors.forbidden();
      await promptVersionService.createVersion(
        {
          promptId: prompt.id,
          title: prompt.title,
          content: prompt.content,
          contentType: prompt.contentType,
          userId: currentUser.id,
          hash: prompt.hash,
        },
        { transaction: t }
      );
      const updatedPrompt = await promptRepository.updatePrompt(
        id,
        prompt,
        data,
        { transaction: t }
      );
      await this._invalidateCache();
      return updatedPrompt;
    });
  }

  /**
   * Suppression d'un prompt (soft delete ou delete)
   * @param {*} id - UUID du prompt
   * @returns Message de succès
   */
  async deletePrompt(id, currentUser) {
    this._validateUuid(id, "Delete Prompt By Id");
    return await sequelize.transaction(async (t) => {
      // Utiliser findPromptById au lieu de getPromptById pour éviter d'enregistrer une vue
      const prompt = await promptRepository.findPromptById(id, { transaction: t });
      this._ensurePromptExists(prompt, id);
      if (prompt.userId !== currentUser.id && currentUser.role !== "admin")
        throw Errors.forbidden();
      await promptRepository.deletePrompt(prompt, { transaction: t });
      await this._invalidateCache();
      return { message: "Prompt supprimé avec succès." };
    });
  }

  async searchPrompts(params) {
    return await promptRepository.searchPrompts(params);
  }

  /**
   * Signaler un prompt
   * @param {string} id - UUID du prompt
   * @param {string} userId - ID de l'utilisateur qui signale
   * @param {string} reason - Raison du signalement (optionnel)
   * @returns {Promise<Object>} Prompt avec le compteur de signalements mis à jour
   */
  async reportPrompt(id, userId, reason = null) {
    this._validateUuid(id, "Report Prompt");

    const prompt = await promptRepository.findPromptById(id);
    this._ensurePromptExists(prompt, id);

    const updatedPrompt = await promptRepository.reportPrompt(id);

    // Invalider le cache pour ce prompt spécifique
    await this._invalidateCache();

    // Log du signalement pour tracking
    logger.info(
      `Prompt ${id} signalé par l'utilisateur ${userId}. Raison: ${
        reason || "Non spécifiée"
      }. Total signalements: ${updatedPrompt.reportCount}`
    );

    return {
      message: "Prompt signalé avec succès",
      reportCount: updatedPrompt.reportCount,
    };
  }
}

module.exports = new PromptService();
