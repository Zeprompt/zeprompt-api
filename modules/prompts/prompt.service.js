const AppError = require("../../utils/appError");
const { validate: isUuid } = require("uuid");
const crypto = require("crypto");
const promptRepository = require("./prompt.repository");
const CacheService = require("../../services/cacheService");

class PromptService {
  validateUuid(id, action = "opération") {
    if (!id) {
      throw new AppError({
        message: `Id est requis pour ${action}`,
        userMessage: "Id est requis.",
        statusCode: 400,
        errorCode: "ID_REQUIRED",
      });
    }

    if (!isUuid(id)) {
      throw new AppError({
        message: "L'identifiant fourni est invalide.",
        userMessage: "ID invalide.",
        statusCode: 400,
        errorCode: "INVALIDE_ID",
      });
    }
  }

  ensurePromptExists(prompt, id) {
    if (!prompt) {
      throw new AppError({
        message: `Aucun prompt trouvé avec l'id ${id}`,
        userMessage: "Prompt introuvable.",
        statusCode: 404,
        errorCode: "PROMPT_NOT_FOUND",
      });
    }
  }

  async invalidateCache() {
    await CacheService.del("prompts:page_1_limit_20");
  }

  /**
   *
   * @param {*} data
   * @returns
   */
  async createPrompt(data) {
    const hash = crypto
      .createHash("sha256")
      .update(
        (data.title || "") + (data.content || "") + (data.contentType || "")
      )
      .digest("hex");

    data.hash = hash;

    const existing = await promptRepository.findByHash(hash);
    if (existing) {
      throw new AppError({
        message: "Ce prompt existe déjà dans la base.",
        userMessage: "Prompt existe déjà.",
        statusCode: 400,
        errorCode: "DUPLICATE_PROMPT",
      });
    }
    const prompt = await promptRepository.createPrompt(data);
    const cacheKey = "prompts:page_1_limit_20";
    await CacheService.del(cacheKey);

    return prompt;
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  async getPromptById(id) {
    this.validateUuid(id, "Get Prompt By Id");

    const prompt = await promptRepository.findPromptById(id);

    this.ensurePromptExists(prompt, id);

    return prompt;
  }

  async getAllPrompts({ page = 1, limit = 20, currentUser }) {
    const prompts = await promptRepository.getAllPrompts({
      page,
      limit,
      currentUser,
    });

    if (!prompts) {
      throw new AppError({
        message: "Aucun prompts n'a été trouvé.",
        userMessage: "Aucun prompts n'a été trouvée.",
        statusCode: 404,
        errorCode: "PROMPTS_NOT_FOUNFD",
      });
    }

    return prompts;
  }

  /**
   *
   * @param {*} params
   * @returns
   */
  async getAllPublicPrompts({ page = 1, limit = 20 }) {
    const cacheKey = `prompts:page_${page}_limit_${limit}`;

    const cachedPrompts = await CacheService.get(cacheKey);
    if (cachedPrompts) {
      return JSON.parse(cachedPrompts);
    }

    const prompts = await promptRepository.getAllPrompts({ page, limit });

    await CacheService.set(cacheKey, prompts, 3600);

    return prompts;
  }

  async updatePrompt(id, data, currentUser) {
    this.validateUuid(id, "Update Prompt By Id");

    const prompt = await promptRepository.updatePrompt(id, data, currentUser);

    this.ensurePromptExists(prompt, id);

    // Invalidation du cache
    await this.invalidateCache();

    return prompt;
  }

  async deletePrompt(id) {
    this.validateUuid(id, "Delete Prompt By Id");

    const deleted = await promptRepository.deletePrompt(id);

    this.ensurePromptExists(deleted, id);

    // Invalidation du cache
    await this.invalidateCache();

    return {
      message: "Prompt supprimé avec succès",
    };
  }
}

module.exports = new PromptService();
