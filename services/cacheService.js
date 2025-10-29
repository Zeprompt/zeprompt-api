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
}

module.exports = CacheService;
