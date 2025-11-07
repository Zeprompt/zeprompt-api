const { Prompt, User, Like, View } = require("../../models");
const CacheService = require("../../services/cacheService");

class StatsService {
  /**
   * Récupère les statistiques globales de la plateforme
   * @returns {Promise<Object>} Statistiques globales
   */
  async getGlobalStats() {
    const cacheKey = "stats:global";

    // Vérifier le cache
    const cachedStats = await CacheService.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    // Calcul des statistiques
    const [
      totalPublicPrompts,
      totalActiveContributors,
      totalViews,
      totalLikes
    ] = await Promise.all([
      // Total des prompts publics et activés
      Prompt.count({
        where: {
          isPublic: true,
          status: "activé"
        }
      }),

      // Total des contributeurs actifs (utilisateurs ayant au moins 1 prompt public)
      User.count({
        include: [{
          model: Prompt,
          where: {
            isPublic: true,
            status: "activé"
          },
          required: true
        }],
        distinct: true
      }),

      // Total des vues
      View.count(),

      // Total des likes
      Like.count()
    ]);

    const stats = {
      totalPublicPrompts,
      totalActiveContributors,
      totalViews,
      totalLikes
    };

    // Mettre en cache pour 5 minutes (300 secondes)
    await CacheService.set(cacheKey, stats, 300);

    return stats;
  }
}

module.exports = new StatsService();
