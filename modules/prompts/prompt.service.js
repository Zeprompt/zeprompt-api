const { validate: isUuid } = require("uuid"); // Librairie pour vérifier que les IDs sont des UUID valides
const crypto = require("crypto"); // Pour générer des hash (SHA256)
const promptRepository = require("./prompt.repository"); // Accès aux fonctions de la DB pour les prompts
const CacheService = require("../../services/cacheService"); // Service pour gérer le cache Redis ou similaire
const Errors = require("./prompt.errors"); // Erreurs centralisées pour le module Prompt

class PromptService {
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
    await CacheService.del("prompts:page_1_limit_20"); // Suppression de la clé cache spécifique
  }

  /**
   * Création d'un nouveau prompt
   * @param {*} data - Contient title, content et contentType
   * @returns Le prompt créé
   */
  async createPrompt(data) {
    // Génération d'un hash unique pour détecter les doublons
    const hash = crypto
      .createHash("sha256")
      .update(
        (data.title || "") + (data.content || "") + (data.contentType || "")
      )
      .digest("hex");

    data.hash = hash;

    // Vérifie si un prompt identique existe déjà
    const existing = await promptRepository.findByHash(hash);
    if (existing) throw Errors.duplicatePrompt(); // Erreur si doublon

    // Création du prompt dans la DB
    const prompt = await promptRepository.createPrompt(data);

    // Invalidation du cache pour forcer le rafraîchissement
    const cacheKey = "prompts:page_1_limit_20";
    await CacheService.del(cacheKey);

    return prompt;
  }

  /**
   * Récupération d'un prompt par son ID
   * @param {*} id - UUID du prompt
   * @returns Le prompt correspondant
   */
  async getPromptById(id) {
    this._validateUuid(id, "Get Prompt By Id"); // Vérifie l'ID
    const prompt = await promptRepository.findPromptById(id); // Récupère le prompt dans la DB
    this._ensurePromptExists(prompt, id); // Vérifie que le prompt existe
    return prompt;
  }

  /**
   * Récupération de tous les prompts (avec pagination)
   * @param {*} param0 - { page, limit, currentUser }
   * @returns Liste de prompts
   */
  async getAllPrompts({ page = 1, limit = 20, currentUser }) {
    const prompts = await promptRepository.getAllPrompts({
      page,
      limit,
      currentUser,
    });
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
    if (cachedPrompts) return JSON.parse(cachedPrompts);

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
    this._validateUuid(id, "Update Prompt By Id"); // Vérifie l'ID
    const prompt = await promptRepository.updatePrompt(id, data, currentUser);
    this._ensurePromptExists(prompt, id); // Vérifie que le prompt existe

    await this._invalidateCache(); // Rafraîchit le cache
    return prompt;
  }

  /**
   * Suppression d'un prompt (soft delete ou delete)
   * @param {*} id - UUID du prompt
   * @returns Message de succès
   */
  async deletePrompt(id) {
    this._validateUuid(id, "Delete Prompt By Id"); // Vérifie l'ID
    const deleted = await promptRepository.deletePrompt(id);
    this._ensurePromptExists(deleted, id); // Vérifie que le prompt existe

    await this._invalidateCache(); // Rafraîchit le cache
    return {
      message: "Prompt supprimé avec succès",
    };
  }
}

module.exports = new PromptService();
