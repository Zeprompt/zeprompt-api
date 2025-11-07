const { literal } = require("sequelize");
const { User, Prompt, Like, View, Tag, Sequelize, sequelize } = require("../../models");

/**
 * Repository pour la gestion des utilisateurs.
 */
class UserRepository {
  async findAll() {
    return await User.findAll();
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async create(data) {
    return User.create(data);
  }

  async update(user, data) {
    return user.update(data);
  }

  async delete(user) {
    return await user.destroy();
  }

  async findUserProfile(userId) {
    return await User.findByPk(userId, {
      // Inclure les champs de profil publics pour la réponse
      attributes: [
        "id",
        "username",
        "email",
        "role",
        "createdAt",
        "profilePicture",
        "githubUrl",
        "linkedinUrl",
        "whatsappNumber",
        "twitterUrl",
      ],
      include: [
        {
          model: Prompt,
          as: "Prompts",
          attributes: [
            "id",
            "title",
            "content",
            "contentType",
            "isPublic",
            "imageUrl",
            "pdfFilePath",
            "pdfFileSize",
            "pdfOriginalName",
            "createdAt",
            // Sous-requête pour compter likes et vues par prompt
            [
              Sequelize.literal(`(
                SELECT COUNT(*)
                FROM Likes AS l
                WHERE l."prompt_id" = "Prompts"."id")`),
              "likeCount",
            ],
            [
              Sequelize.literal(`(
                SELECT COUNT(*)
                FROM Views AS v
                WHERE v."prompt_id" = "Prompts"."id"
                )`),
              "viewCount",
            ],
          ],
        },
      ],
    });
  }

  async getUserStats(userId) {
    const totalPrompts = await Prompt.count({ where: { userId } });
    const totalLikes = await Like.count({
      include: [{ model: Prompt, where: { userId } }],
    });
    const totalViews = await View.count({
      include: [{ model: Prompt, where: { userId } }],
    });
    return { totalLikes, totalPrompts, totalViews };
  }

  /**
   * Récupère les prompts publics d'un utilisateur avec pagination
   * @param {string} userId - ID de l'utilisateur
   * @param {number} page - Numéro de page
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Object|null>} Prompts avec métadonnées de pagination ou null si user n'existe pas
   */
  async getPublicPromptsByUser(userId, page = 1, limit = 15) {
    const offset = (page - 1) * limit;

    // Vérifier que l'utilisateur existe et récupérer les infos de profil publiques
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "profilePicture",
        "githubUrl",
        "linkedinUrl",
        "whatsappNumber",
        "twitterUrl",
        "createdAt",
      ],
    });
    if (!user) {
      return null;
    }

    // Condition : seulement les prompts publics et activés
    const whereCondition = {
      userId,
      isPublic: true,
      status: "activé",
    };

    // Compter le total
    const totalCount = await Prompt.count({
      where: whereCondition,
      distinct: true,
      col: "id",
    });

    // Récupérer les IDs paginés
    const paginatedIds = await Prompt.findAll({
      where: whereCondition,
      attributes: ["id"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      raw: true,
    });

    if (paginatedIds.length === 0) {
      return {
        user: user.toJSON(),
        prompts: [],
        meta: {
          total: totalCount,
          page,
          limit,
          pageCount: Math.ceil(totalCount / limit),
        },
      };
    }

    const ids = paginatedIds.map((p) => p.id);

    // Charger les prompts complets avec toutes les relations
    const prompts = await Prompt.findAll({
      where: { id: ids },
      include: [
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "profilePicture"], // Pas d'email dans les réponses publiques
        },
        {
          model: Like,
          attributes: [],
        },
        {
          model: View,
          attributes: [],
        },
      ],
      attributes: {
        exclude: ["views"],
        include: [
          [
            sequelize.literal('CAST(COUNT(DISTINCT "Likes"."id") AS INTEGER)'),
            "likeCount",
          ],
          [
            sequelize.literal('CAST(COUNT(DISTINCT "Views"."id") AS INTEGER)'),
            "viewCount",
          ],
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
    });

    return {
      user: user.toJSON(),
      prompts,
      meta: {
        total: totalCount,
        page,
        limit,
        pageCount: Math.ceil(totalCount / limit),
      },
    };
  }

  async getLeaderBoard(limit = 20) {
    return await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "profilePicture",
        "role",
        "createdAt",
        [
          literal(`(
          SELECT COUNT(*)
          FROM prompts AS p
          WHERE p.user_id = "User"."id"
        )`),
          "promptCount",
        ],
        [
          literal(`(
          SELECT COUNT(*)
          FROM likes AS l
          INNER JOIN prompts AS p ON l.prompt_id = p.id
          WHERE p.user_id = "User"."id"
        )`),
          "likeCount",
        ],
        [
          literal(`(
          SELECT COUNT(*)
          FROM views AS v
          INNER JOIN prompts AS p ON v.prompt_id = p.id
          WHERE p.user_id = "User"."id"
        )`),
          "viewCount",
        ],
        [
          literal(`(
          (SELECT COUNT(*) FROM prompts AS p WHERE p.user_id = "User"."id") * 3
          + (SELECT COUNT(*) FROM likes AS l INNER JOIN prompts AS p ON l.prompt_id = p.id WHERE p.user_id = "User"."id") * 2
          + (SELECT COUNT(*) FROM views AS v INNER JOIN prompts AS p ON v.prompt_id = p.id WHERE p.user_id = "User"."id") * 1
        )`),
          "score",
        ],
      ],
      order: [[literal("score"), "DESC"]],
      limit,
    });
  }

  /**
   * Met à jour le profil d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<User>}
   */
  async updateUserProfile(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    // Filtrer seulement les champs autorisés
    const allowedFields = [
      "username",
      "profilePicture",
      "githubUrl",
      "linkedinUrl",
      "whatsappNumber",
      "twitterUrl",
    ];
    const updateData = {};

    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        updateData[key] = data[key];
      }
    });

    await user.update(updateData);
    return user;
  }
}

module.exports = new UserRepository();
