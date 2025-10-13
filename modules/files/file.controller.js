const AppResponse = require("../../utils/appResponse");
const fileUploadService = require("../../services/fileUploadService");

/**
 * @openapi
 * /api/files/job/{jobId}:
 *   get:
 *     summary: Vérifier le statut d'un job de traitement de fichier
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du job
 *     responses:
 *       200:
 *         description: Statut du job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 found:
 *                   type: boolean
 *                 jobId:
 *                   type: string
 *                 state:
 *                   type: string
 *                   enum: [waiting, active, completed, failed, delayed]
 *                 progress:
 *                   type: number
 *
 * /api/files/queue/stats:
 *   get:
 *     summary: Obtenir les statistiques de la queue de fichiers
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de la queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 waiting:
 *                   type: number
 *                 active:
 *                   type: number
 *                 completed:
 *                   type: number
 *                 failed:
 *                   type: number
 *                 total:
 *                   type: number
 */

class FileController {
  /**
   * Vérifier le statut d'un job
   */
  async getJobStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const status = await fileUploadService.getJobStatus(jobId);

      new AppResponse({
        message: status.found
          ? "Statut du job récupéré"
          : "Job non trouvé",
        statusCode: status.found ? 200 : 404,
        data: status,
        code: status.found ? "JOB_STATUS_FETCHED" : "JOB_NOT_FOUND",
        success: status.found,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtenir les statistiques de la queue
   */
  async getQueueStats(req, res, next) {
    try {
      const stats = await fileUploadService.getQueueStats();

      new AppResponse({
        message: "Statistiques de la queue récupérées",
        statusCode: 200,
        data: stats,
        code: "QUEUE_STATS_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
