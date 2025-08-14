const promptRepository = require('./prompt.repository');
const { Tag } = require('../../models');

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

  // Helpers for tags association
  async setTags(promptInstance, tagNames = []) {
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      await promptInstance.setTags([]);
      return [];
    }
    // Find or create tags by name
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const [tag] = await Tag.findOrCreate({ where: { name } });
        return tag;
      })
    );
    await promptInstance.setTags(tags);
    return tags;
  }

  async listPopular(limit) {
    return promptRepository.findPopular(limit);
  }
}

module.exports = new PromptService();
