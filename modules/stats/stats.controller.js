const statsService = require("./stats.service");
const AppResponse = require("../../utils/AppResponse");

class StatsController {
  /**
   * Récupère les statistiques globales de la plateforme
   */
  async getGlobalStats(req, res, next) {
    try {
      const stats = await statsService.getGlobalStats();

      new AppResponse({
        message: "Statistiques récupérées avec succès",
        statusCode: 200,
        data: stats,
        code: "STATS_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StatsController();
