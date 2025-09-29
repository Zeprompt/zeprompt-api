const { Like } = require("../../models");

class LikeRepository {
  /**
   * Cherche un like existant
   * @param {*} promptId
   * @param {*} identifier
   * @param {*} options Sequelize options, ex: { transaction }
   * @returns {Promise<Like|null>}
   */
  async findExistingLike(promptId, identifier, options = {}) {
    return Like.findOne({
      where: {
        ...identifier,
        promptId,
      },
      ...options,
    });
  }

  /**
   * Crée un like
   * @param {*} promptId
   * @param {*} identifier
   * @param {*} options Sequelize options, ex: { transaction }
   * @returns {Promise<Like>}
   */
  async createLike(promptId, identifier, options = {}) {
    return Like.create(
      {
        ...identifier,
        promptId,
        lastLikedAt: new Date(),
      },
      options
    );
  }

  /**
   * Compte les likes pour un prompt
   * @param {*} promptId
   * @param {*} options Sequelize options, ex: { transaction }
   * @returns {Promise<number>}
   */
  async countActiveLikes(promptId, options = {}) {
    return Like.count({
      where: {
        promptId,
      },
      ...options,
    });
  }

  /**
   * Supprime un like
   * @param {*} promptId
   * @param {*} identifier
   * @param {*} options Sequelize options, ex: { transaction }
   * @returns {Promise<number>} nombre de lignes supprimées
   */
  async removeLike(promptId, identifier, options = {}) {
    return Like.destroy({
      where: {
        ...identifier,
        promptId,
      },
      ...options,
    });
  }
}

module.exports = new LikeRepository();
