const { Op } = require("sequelize");
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
        { model: User, as: "user", attributes: ["id", "username", "profilePicture"] }, // Pas d'email dans les réponses publiques
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
        { model: User, as: "user", attributes: ["id", "username", "profilePicture"] }, // Pas d'email dans les réponses publiques
        { model: Tag, through: { attributes: [] }, attributes: ["id", "name"] },
        { model: Like, attributes: [] },
        { model: View, attributes: [] },
      ],
      attributes: {
        exclude: ['views'], // Exclure le champ obsolète 'views'
        include: [
          [sequelize.literal('CAST(COUNT(DISTINCT "Likes"."id") AS INTEGER)'), "likeCount"],
          [sequelize.literal('CAST(COUNT(DISTINCT "Views"."id") AS INTEGER)'), "viewCount"],
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
          attributes: ["id", "username", "profilePicture"], // Pas d'email dans les réponses publiques
        },
        {
          model: Like,
          attributes: []
        },
        {
          model: View,
          attributes: []
        },
      ],
      attributes: {
        exclude: ['views'], // Exclure le champ obsolète 'views'
        include: [
          [sequelize.literal('CAST(COUNT(DISTINCT "Likes"."id") AS INTEGER)'), "likeCount"],
          [sequelize.literal('CAST(COUNT(DISTINCT "Views"."id") AS INTEGER)'), "viewCount"],
        ],
      },
      group: [
        "Prompt.id",
        "user.id",
        "Tags.id",
        "Tags->prompt_tags.prompt_id",
        "Tags->prompt_tags.tag_id",
      ],
      where: {
        id: { [Op.ne]: promptId },
      },
      order: sequelize.random(),
      limit,
      subQuery: false,
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
    { page = 1, limit = 15, currentUser = null },
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

    // Première requête : récupérer le total et les IDs des prompts paginés
    const totalCount = await Prompt.count({
      where: whereCondition,
      distinct: true,
      col: 'id'
    });

    // Deuxième requête : récupérer les IDs paginés
    const paginatedIds = await Prompt.findAll({
      where: whereCondition,
      attributes: ['id'],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      raw: true,
      ...options,
    });

    if (paginatedIds.length === 0) {
      return {
        prompts: [],
        meta: {
          total: totalCount,
          page,
          limit,
          pageCount: Math.ceil(totalCount / limit),
        }
      };
    }

    const ids = paginatedIds.map(p => p.id);

    // Troisième requête : charger les prompts complets avec toutes les relations
    const prompts = await Prompt.findAll({
      where: { id: ids },
      include: [
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ["id", "name"]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "profilePicture"] // Pas d'email dans les réponses publiques
        },
        {
          model: Like,
          attributes: []
        },
        {
          model: View,
          attributes: []
        },
      ],
      attributes: {
        exclude: ['views'], // Exclure le champ obsolète 'views'
        include: [
          [sequelize.literal('CAST(COUNT(DISTINCT "Likes"."id") AS INTEGER)'), "likeCount"],
          [sequelize.literal('CAST(COUNT(DISTINCT "Views"."id") AS INTEGER)'), "viewCount"],
        ],
      },
      group: [
        "Prompt.id",
        "user.id",
        "Tags.id",
        "Tags->prompt_tags.prompt_id",
        "Tags->prompt_tags.tag_id",
      ],
      order: [["createdAt", "DESC"]],
      subQuery: false,
      ...options,
    });

    return {
      prompts,
      meta: {
        total: totalCount,
        page,
        limit,
        pageCount: Math.ceil(totalCount / limit),
      }
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

  async searchPrompts({ q, tags, sort, order = "DESC", page = 1, limit = 15 }) {
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
        attributes: ["id", "username", "profilePicture"], // Pas d'email dans les réponses publiques
      },
      {
        model: Like,
        attributes: []
      },
      {
        model: View,
        attributes: []
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
      likes: "likeCount",
      views: "viewCount",
      date: "createdAt",
    };

    // Première requête : compter le total
    const totalCount = await Prompt.count({
      where,
      include: tags.length > 0 ? [{
        model: Tag,
        where: { name: tags },
        through: { attributes: [] },
        required: true,
      }] : [],
      distinct: true,
      col: 'id'
    });

    // Deuxième requête : récupérer les IDs paginés (sans GROUP BY pour pagination correcte)
    const offset = (page - 1) * limit;
    const paginatedIds = await Prompt.findAll({
      where,
      include: tags.length > 0 ? [{
        model: Tag,
        where: { name: tags },
        through: { attributes: [] },
        required: true,
      }] : [],
      attributes: ['id'],
      order: [["createdAt", order.toUpperCase()]],
      limit,
      offset,
      raw: true,
    });

    if (paginatedIds.length === 0) {
      return {
        prompts: [],
        meta: {
          total: totalCount,
          page,
          limit,
          pageCount: Math.ceil(totalCount / limit),
        }
      };
    }

    const ids = paginatedIds.map(p => p.id);

    // Troisième requête : charger les prompts complets avec toutes les relations
    const prompts = await Prompt.findAll({
      where: { id: ids },
      include,
      attributes: {
        exclude: ['views'], // Exclure le champ obsolète 'views'
        include: [
          [sequelize.literal('CAST(COUNT(DISTINCT "Likes"."id") AS INTEGER)'), "likeCount"],
          [sequelize.literal('CAST(COUNT(DISTINCT "Views"."id") AS INTEGER)'), "viewCount"],
        ],
      },
      group: [
        "Prompt.id",
        "user.id",
        "Tags.id",
        "Tags->prompt_tags.prompt_id",
        "Tags->prompt_tags.tag_id",
      ],
      order: sort && orderMapping[sort]
        ? [[sequelize.literal(orderMapping[sort]), order.toUpperCase()]]
        : [["createdAt", order.toUpperCase()]],
      subQuery: false,
    });

    return {
      prompts,
      meta: {
        total: totalCount,
        page,
        limit,
        pageCount: Math.ceil(totalCount / limit),
      }
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
