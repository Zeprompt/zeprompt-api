const promptversion = require("../../models/promptversion");
const user = require("../../models/user");

class PromptVersionRepository {
  async createVersion(data, options = {}) {
    if (!data.versionNumber) {
      const lastVersion = await promptversion.findOne({
        where: { promptId: data.promptId },
        order: [["versionNumber", "DESC"]],
        ...options,
      });
      data.versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    }
    return await promptversion.create(data, options);
  }

  async getVersionById(id, options = {}) {
    return await promptversion.findByPk(id, {
      include: [
        { model: user, attributes: ["id", "username", "email"], ...options },
      ],
    });
  }

  async getVersionsByPrompt(promptId, versionNumber = null, options = {}) {
    const whereClause = { promptId };
    if (versionNumber !== null) {
      whereClause.versionNumber = versionNumber;
    }
    return await promptversion.findAll({
      where: whereClause,
      order: [["versionNumber", "ASC"]],
      include: [{ model: user, attributes: ["id", "username", "email"] }],
      ...options,
    });
  }

  async deleteVersionByPrompt(prompt, options = {}) {
    return prompt.destroy(options);
  }
}

module.exports = new PromptVersionRepository();
