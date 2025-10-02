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
      attributes: ["id", "username", "email", "role", "createdAt"],
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
}

module.exports = new UserRepository();
