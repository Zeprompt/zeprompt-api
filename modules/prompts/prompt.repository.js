const { fn, col, Op } = require("sequelize");
const { Prompt, User, Tag, Like, View } = require("../../models");

class PromptRepository {
  /**
   * Créer un nouveau prompt
   * @param {Object} data
   * @returns {Promise<Prompt>}
   */
  async createPrompt(data, options = {}) {
    return await Prompt.create(data, options);
  }

  /**
   *
   * @param {hash} hash
   * @returns {Promise<Prompt>}
   */
  async findByHash(hash, options = {}) {
    return await Prompt.findOne({
      where: { hash },
      ...options,
    });
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<Prompt | null>}
   */
  async findPromptById(id, options = {}) {
    const prompt = await Prompt.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        { model: Tag, through: { attributes: [] } },
        { model: Like, attributes: [] },
        { model: View, attributes: [] },
      ],
      attributes: {
        include: [
          [fn("COUNT", col("Likes.id")), "totalLikes"],
          [fn("COUNT", col("Views.id")), "totalViews"],
        ],
      },
      group: [
        "Prompt.id",
        "user.id",
        "Tags.id",
        "Tags->prompt_tags.prompt_id",
        "Tags->prompt_tags.tag_id",
      ],
      subQuery: false,
      ...options,
    });

    return prompt;
  }

  /**
   *
   * @param {*} param0
   * @returns
   */
  async getAllPrompts(
    { page = 1, limit = 20, currentUser = null },
    options = {}
  ) {
    const offset = (page - 1) * limit;

    let whereCondition;

    if (!currentUser) {
      whereCondition = { isPublic: true };
    } else if (currentUser.role === "admin") {
      whereCondition = {};
    } else {
      whereCondition = {
        [Op.or]: [{ isPublic: true }, { userId: currentUser.id }],
      };
    }

    const { rows, count } = await Prompt.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      ...options,
    });
    return {
      prompts: rows,
      total: count,
      page,
      pageCount: Math.ceil(count / limit),
    };
  }

  /**
   *
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Prompt | null>}
   */
  async updatePrompt(id, prompt, data, options = {}) {
    return await prompt.update(data, options);
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  async deletePrompt(prompt, options = {}) {
    return prompt.destroy(options);
  }
}

module.exports = new PromptRepository();
