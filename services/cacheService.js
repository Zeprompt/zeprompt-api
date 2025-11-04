const redisClient = require("../config/redis");
const logger = require("../utils/logger");

class CacheService {
  /**
   *
   * @param {*} key
   * @returns
   */
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error(`Redis Get error for key ${key} : `, error);
      throw error;
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} value
   * @param {*} ttl
   */
  static async set(key, value, ttl = null) {
    try {
      const stringifyValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.set(key, stringifyValue, "EX", ttl);
      } else {
        await redisClient.set(key, stringifyValue);
      }
    } catch (error) {
      logger.error(`Redis SET error for key ${key} : `, error);
      throw error;
    }
  }

  /**
   *
   * @param {*} key
   * @returns
   */
  static async del(key) {
    try {
      const result = await redisClient.del(key);
      return result;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key} : `, error);
      throw error;
    }
  }

  /**
   *
   * @param {*} key
   * @returns
   */
  static async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key} : `, error);
      throw error;
    }
  }

  /**
   * Supprime toutes les clés qui correspondent à un pattern
   * @param {string} pattern - Pattern Redis (ex: "prompts:*", "leaderboard:*")
   * @returns {Promise<number>} - Nombre de clés supprimées
   */
  static async delByPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) {
        logger.info(`No keys found for pattern: ${pattern}`);
        return 0;
      }

      // Utiliser pipeline pour supprimer toutes les clés en une seule transaction
      const pipeline = redisClient.pipeline();
      keys.forEach(key => pipeline.del(key));
      const results = await pipeline.exec();

      const deletedCount = results.filter(([err, result]) => !err && result === 1).length;
      logger.info(`✅ Deleted ${deletedCount} keys matching pattern: ${pattern}`);
      return deletedCount;
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}: `, error);
      throw error;
    }
  }

  /**
   * Vide tout le cache Redis (ATTENTION: supprime TOUTES les clés)
   * @returns {Promise<number>} - Nombre de clés supprimées
   */
  static async flushAll() {
    try {
      const result = await redisClient.flushdb();
      logger.info("✅ All cache cleared (FLUSHDB)");
      return result;
    } catch (error) {
      logger.error("Redis FLUSHDB error: ", error);
      throw error;
    }
  }

  /**
   * Vide uniquement le cache des prompts
   * @returns {Promise<number>} - Nombre de clés supprimées
   */
  static async clearPromptsCache() {
    try {
      let deletedCount = 0;
      
      // Supprimer toutes les clés prompts:*
      deletedCount += await this.delByPattern("prompts:*");
      
      // Supprimer le leaderboard (peut contenir des données de prompts)
      deletedCount += await this.del("leaderboard:top20");
      
      logger.info(`✅ Prompts cache cleared. Total keys deleted: ${deletedCount}`);
      return deletedCount;
    } catch (error) {
      logger.error("Error clearing prompts cache: ", error);
      throw error;
    }
  }
}

module.exports = CacheService;
