const { literal } = require("sequelize");
const { User, Prompt, Like, View, Sequelize } = require("../../models");

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
