const { Like, Prompt, User, sequelize } = require('../../models');
const { Op } = require('sequelize');

class LikeRepository {
  // Check if a user/anonymous has already liked a prompt in the last 24 hours
  async findExistingLike(promptId, identifier) {
    return Like.findOne({
      where: {
        ...identifier,
        promptId,
        lastLikedAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
  }

  // Remove older likes (> 24h old) for this prompt/user or anonymous
  async removeOldLikes(promptId, identifier) {
    return Like.destroy({
      where: {
        ...identifier,
        promptId,
        lastLikedAt: {
          [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
  }

  // Create a new like
  async createLike(promptId, identifier) {
    return Like.create({
      ...identifier,
      promptId,
      lastLikedAt: new Date()
    });
  }

  // Get the count of active likes for a prompt (within last 24h)
  async countActiveLikes(promptId) {
    return Like.count({
      where: {
        promptId,
        lastLikedAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
  }

  // Get popular prompts by like count
  async findPopularByLikes(limit = 10) {
    return Prompt.findAll({
      where: { isPublic: true },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "likes" WHERE "likes"."prompt_id" = "Prompt"."id" AND "likes"."last_liked_at" >= NOW() - INTERVAL \'24 hours\')'
            ),
            'likesCount',
          ],
        ],
      },
      include: [
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [[sequelize.literal('(SELECT COUNT(*) FROM "likes" WHERE "likes"."prompt_id" = "Prompt"."id" AND "likes"."last_liked_at" >= NOW() - INTERVAL \'24 hours\')'), 'DESC']],
      limit: parseInt(limit, 10),
    });
  }
}

module.exports = new LikeRepository();
