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

  async searchPrompts({ q, tags, sort, order = "DESC", page = 1, limit = 20 }) {
    const where = {};

    // Recherche texte (titre + contenu)
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q || ""}%` } },
        { content: { [Op.iLike]: `%${q || ""}%` } },
      ];
    }

    // Filtrage par tags
    const include = [];
    if (tags.length > 0) {
      include.push({
        model: Tag,
        where: { name: tags },
        through: { attributes: [] },
        as: "Tags",
        require: true,
      });
    } else {
      include.push({
        model: Tag,
        through: { attributes: [] },
        as: "Tags",
        required: false,
      });
    }

    const orderMapping = {
      likes: ["likes", "count", order],
      views: ["views", order],
      comments: ["comments", "count", order],
      date: ["createdAt", order],
    };

    // Pagination
    const offset = (page - 1) * limit;
    const prompts = await Prompt.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order:
        sort && orderMapping[sort]
          ? [orderMapping[sort]]
          : [["createdAt", "desc"]],
      distinct: true,
    });

    return {
      prompts: prompts.rows,
      total: prompts.count,
      page,
      limit,
    };
  }
}

module.exports = new PromptRepository();
