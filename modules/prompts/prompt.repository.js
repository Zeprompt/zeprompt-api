const { fn, col, Op } = require("sequelize");
const { Prompt, User, Tag, Like, View, sequelize } = require("../../models");

class PromptRepository {
  /**
   * Créer un nouveau prompt
   * @param {Object} data
   * @returns {Promise<Prompt>}
   */
  async createPrompt(data, options = {}) {
    const prompt = await Prompt.create(data, options);
    // Recharger le prompt avec ses relations (tags, user, etc.)
    await prompt.reload({
      include: [
        { model: Tag, through: { attributes: [] } },
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
      ...options,
    });
    return prompt;
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
        { model: Tag, through: { attributes: [] }, attributes: ["id", "name"] },
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

  async findSimilarPrompts(promptId, tagsIds, limit = 3, options = {}) {
    return await Prompt.findAll({
      include: [
        {
          model: Tag,
          where: { id: tagsIds },
          through: { attributes: [] },
          attributes: ["id", "name"],
          required: true,
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
      where: {
        id: { [Op.ne]: promptId },
      },
      order: sequelize.random(),
      limit,
      ...options,
      distinct: true,
    });
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
      // Utilisateurs publics : seulement les prompts publics ET activés
      whereCondition = { isPublic: true, status: "activé" };
    } else if (currentUser.role === "admin") {
      // Admins : tous les prompts quel que soit le statut
      whereCondition = {};
    } else {
      // Utilisateurs connectés : leurs propres prompts OU les prompts publics activés
      whereCondition = {
        [Op.or]: [
          { isPublic: true, status: "activé" },
          { userId: currentUser.id },
        ],
      };
    }

    const { rows, count } = await Prompt.findAndCountAll({
      where: whereCondition,
      include: [
        { 
          model: Tag, 
          through: { attributes: [] },
          attributes: ["id", "name"]
        },
        { 
          model: User, 
          as: "user", 
          attributes: ["id", "username", "email"] 
        },
      ],
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      distinct: true,
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
    const where = {
      isPublic: true,
      status: "activé", // Seulement les prompts activés dans la recherche publique
    };

    // Recherche texte (titre + contenu)
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q || ""}%` } },
        { content: { [Op.iLike]: `%${q || ""}%` } },
      ];
    }

    // Filtrage par tags
    const include = [
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
      },
    ];
    
    if (tags.length > 0) {
      include.push({
        model: Tag,
        where: { name: tags },
        through: { attributes: [] },
        attributes: ["id", "name"],
        required: true,
      });
    } else {
      include.push({
        model: Tag,
        through: { attributes: [] },
        attributes: ["id", "name"],
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

  /**
   * Incrémenter le compteur de signalements d'un prompt
   * @param {string} id - ID du prompt
   * @returns {Promise<Prompt>}
   */
  async reportPrompt(id) {
    const prompt = await Prompt.findByPk(id);
    if (!prompt) {
      return null;
    }
    prompt.reportCount += 1;
    await prompt.save();
    return prompt;
  }
}

module.exports = new PromptRepository();
