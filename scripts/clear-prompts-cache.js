const redisClient = require("../config/redis");
const logger = require("../utils/logger");

async function clearPromptsCache() {
  try {
    logger.info("🔄 Clearing prompts cache...");

    // Supprimer les clés de cache connues
    const keys = [
      "prompts:page_1_limit_20",
      "leaderboard:top20"
    ];

    for (const key of keys) {
      const result = await redisClient.del(key);
      logger.info(`✅ Deleted cache key: ${key} (result: ${result})`);
    }

    // Chercher toutes les clés qui commencent par "prompts:"
    const promptKeys = await redisClient.keys("prompts:*");
    logger.info(`📋 Found ${promptKeys.length} prompt cache keys`);

    if (promptKeys.length > 0) {
      for (const key of promptKeys) {
        await redisClient.del(key);
        logger.info(`✅ Deleted: ${key}`);
      }
    }

    logger.info("✅ Cache cleared successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error clearing cache:", error);
    process.exit(1);
  }
}

clearPromptsCache();
