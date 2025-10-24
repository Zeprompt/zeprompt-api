const { sequelize } = require("../../models");
const Errors = require("./promptVersion.errors");
const promptVersionRepository = require("./promptVersion.repository");

class PromptVersionService {
  async createVersion(data, options = {}) {
    return await promptVersionRepository.createVersion(data, options);
  }

  async getVersionById(id, options = {}) {
    const version = await promptVersionRepository.getVersionById(id, options);
    if (!version) throw Errors.VERSION_NOT_FOUND();
    return version;
  }

  async getVersionsByPrompt(promptId, versionNumber = null, options = {}) {
    return await promptVersionRepository.getVersionsByPrompt(
      promptId,
      versionNumber,
      options
    );
  }

  async deleteVersionByPrompt(promptId, versionNumber, currentUser) {
    return await sequelize.transaction(async (t) => {
      const promptVersion = await promptVersionRepository.getVersionsByPrompt(
        promptId,
        versionNumber,
        { transaction: t }
      );
      if (
        promptVersion.userId !== currentUser.id ||
        currentUser.role !== "admin"
      )
        throw Errors.FORBIDDEN();
      const deletedCount = await promptVersionRepository.deleteVersionByPrompt(
        promptVersion,
        { transaction: t }
      );
      if (deletedCount === 0) throw Errors.VERSION_DELETE_FAILED();
    });
  }
}

module.exports = new PromptVersionService();
