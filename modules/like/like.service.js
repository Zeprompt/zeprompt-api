const likeRepository = require("./like.repository");
const redisClient = require("../../config/redis");
const { getIO } = require("../../config/socket");
const Errors = require("./like.errors");
const { sequelize } = require("../../models");
const CacheService = require("../../services/cacheService");

class LikeService {
  // --- Méthodes privées Redis ---
  async _hasUserLiked(promptId, identifier) {
    const key = `prompt:likes:${promptId}`;
    const result = await redisClient.sismember(key, identifier);
    return result === 1;
  }

  async _invalidateCache() {
    const leaderBoardCachKey = `leaderboard:top20`;
    await CacheService.del(leaderBoardCachKey);
  }

  async _addUserLikeCache(promptId, identifier) {
    const setKey = `prompt:likes:${promptId}`;
    const countKey = `prompt:likes:count:${promptId}`;
    const ttlSeconds = 30 * 60 * 60 * 1000;

    const pipeline = redisClient.pipeline();
    pipeline.sadd(setKey, identifier);
    pipeline.incr(countKey);
    pipeline.expire(setKey, ttlSeconds);
    pipeline.expire(countKey, ttlSeconds);
    await pipeline.exec();
  }

  async _removeUserLikeCache(promptId, identifier) {
    const setKey = `prompt:likes:${promptId}`;
    const countKey = `prompt:likes:count:${promptId}`;
    const ttlSeconds = 30 * 60 * 60 * 1000;

    const pipeline = redisClient.pipeline();
    pipeline.srem(setKey, identifier);
    pipeline.decr(countKey);
    pipeline.expire(setKey, ttlSeconds);
    pipeline.expire(countKey, ttlSeconds);

    await pipeline.exec();
  }

  async _getLikeCountCache(promptId) {
    const countKey = `prompt:likes:count:${promptId}`;
    const value = await redisClient.get(countKey);
    return value ? parseInt(value, 10) : 0;
  }

  _getIdentifier(user, anonymousId) {
    return user ? `user_${user.id}` : `anon_${anonymousId}`;
  }

  async _broadcastLikeUpdate(promptId) {
    const newCount = await this._getLikeCountCache(promptId);
    getIO().emit("prompt:likeUpdated", { promptId, likes: newCount });
    return newCount;
  }

  // --- Méthodes publiques ---
  async likePrompt(promptId, user = null, anonymousId = null) {
    const identifier = this._getIdentifier(user, anonymousId);

    if (await this._hasUserLiked(promptId, identifier))
      throw Errors.alreadyLiked();

    const transaction = await sequelize.transaction();
    try {
      // DB comme source de vérité
      await likeRepository.createLike(
        promptId,
        {
          userId: user?.id || null,
          anonymousId: user ? null : anonymousId,
        },
        { transaction }
      );

      // Mise à jour Redis pour compteur rapide
      await this._addUserLikeCache(promptId, identifier);
      await this._invalidateCache();

      await transaction.commit();

      // WebSocket
      return this._broadcastLikeUpdate(promptId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async dislikePrompt(promptId, user = null, anonymousId = null) {
    const identifier = this._getIdentifier(user, anonymousId);

    if (!(await this._hasUserLiked(promptId, identifier)))
      throw Errors.neverLiked();

    const transaction = await sequelize.transaction();
    try {
      // DB
      await likeRepository.removeLike(
        promptId,
        {
          userId: user?.id || null,
          anonymousId: user ? null : anonymousId,
        },
        { transaction }
      );

      // Redis
      await this._removeUserLikeCache(promptId, identifier);
      await this._invalidateCache();

      await transaction.commit();

      return this._broadcastLikeUpdate(promptId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getLikesCount(promptId) {
    return this._getLikeCountCache(promptId);
  }
}

module.exports = new LikeService();
