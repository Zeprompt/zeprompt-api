const CacheService = require("../services/cacheService");
const logger = require("../utils/logger");

async function clearPromptsCache() {
  try {
    logger.info("🔄 Clearing prompts cache...");

    // Utiliser la méthode dédiée du CacheService
    const deletedCount = await CacheService.clearPromptsCache();

    logger.info(`✅ Cache cleared successfully! ${deletedCount} keys deleted.`);
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error clearing cache:", error);
    process.exit(1);
  }
}

// Exécuter le script
clearPromptsCache();
