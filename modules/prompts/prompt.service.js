const promptRepository = require('./prompt.repository');

class PromptService {
  async listPublic(query) {
    return promptRepository.findAllPublic(query);
  }

  async getPublicById(id) {
    return promptRepository.findByIdPublic(id);
  }

  async getById(id) {
    return promptRepository.findById(id);
  }

  async listMine(userId) {
    return promptRepository.findMine(userId);
  }

  async updateOwned(id, userId, data) {
    return promptRepository.updateOwned(id, userId, data);
  }

  async create(userId, data) {
  return promptRepository.create(userId, data);
  }

  async deleteOwned(id, userId) {
    return promptRepository.deleteOwned(id, userId);
  }

  async setTags(promptInstance, tagNames = []) {
    await promptRepository.upsertTagsForPrompt(promptInstance.id, tagNames);
    return promptInstance.getTags();
  }

  async listPopular(limit) {
    return promptRepository.findPopular(limit);
  }
}

module.exports = new PromptService();
