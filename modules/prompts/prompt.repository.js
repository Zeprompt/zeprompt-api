const { fn, col, Op } = require("sequelize");
const { Prompt, User, Tag, Like, View } = require("../../models");
const AppError = require("../../utils/appError");

class PromptRepository {
  /**
   * Créer un nouveau prompt
   * @param {Object} data
   * @returns {Promise<Prompt>}
   */
  async createPrompt(data) {
    return await Prompt.create(data);
  }

  /**
   *
   * @param {hash} hash
   * @returns {Promise<Prompt>}
   */
  async findByHash(hash) {
    return await Prompt.findOne({
      where: { hash },
    });
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<Prompt | null>}
   */
  async findPromptById(id) {
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
    });

    return prompt;
  }

  /**
   *
   * @param {*} param0
   * @returns
   */
  async getAllPrompts({ page = 1, limit = 20, currentUser = null }) {
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
  async updatePrompt(id, data, currentUser) {
    const prompt = await Prompt.findByPk(id);
    if (!prompt) {
      throw new AppError({
        message: "Aucun prompt trouvé avec cet id",
        userMessage: "Prompt introuvable.",
        statusCode: 404,
        errorCode: "PROMPT_NOT_FOUND",
      });
    }

    // Vérification des droits
    if (prompt.userId !== currentUser.id && currentUser.role !== "admin") {
      throw new AppError({
        message: "Vous n'avez pas les droits pour modifier ce prompt",
        userMessage: "Accès refusé",
        statusCode: 403,
        errorCode: "FORBIDDEN",
      });
    }

    await prompt.update(data);
    return prompt;
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  async deletePrompt(id) {
    const deletedCount = await Prompt.destroy({ where: { id } });
    return deletedCount > 0;
  }
}

module.exports = new PromptRepository();
