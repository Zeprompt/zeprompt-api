const viewRepository = require("./view.repository");
const redisClient = require("../../config/redis");

class ViewService {
  _getIdentifier(user, anonymousId) {
    return user ? `user_${user.id}` : `anon_${anonymousId}`;
  }

  _getRedisKey(promptId, identifier) {
    return `prompt:views:${promptId}:${identifier}`;
  }

  async _hasViewedRecently(promptId, identifier) {
    const key = this._getRedisKey(promptId, identifier);
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  async _markViewed(promptId, identifier, ttlSeconds = 24 * 60 * 60) {
    const key = this._getRedisKey(promptId, identifier);
    await redisClient.set(key, "1", "EX", ttlSeconds);
  }

  async recordView(promptId, user = null, anonymousId = null, options = {}) {
    const identifier = this._getIdentifier(user, anonymousId);

    if (await this._hasViewedRecently(promptId, identifier)) {
      return { isNewView: false };
    }
    await viewRepository.recordView(
      promptId,
      { userId: user?.id || null, anonymousId: user ? null : anonymousId },
      options
    );

    await this._markViewed(promptId, identifier);
    return { isNewView: true };
  }
}

module.exports = new ViewService();
