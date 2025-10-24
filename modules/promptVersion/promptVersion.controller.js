const AppResponse = require("../../utils/appResponse");
const promptVersionService = require("./promptVersion.service");

/**
 * @swagger
 * tags:
 *   name: PromptVersions
 *   description: Gestion des versions de prompts
 */

/**
 * @swagger
 * /promptVersions/{id}:
 *   get:
 *     summary: Récupérer une version spécifique d'un prompt
 *     tags: [PromptVersions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la version du prompt
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Version du prompt récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     prompt:
 *                       $ref: '#/components/schemas/PromptVersion'
 *       404:
 *         description: Version de prompt introuvable
 */

/**
 * @swagger
 * /promptVersions/prompt/{promptId}:
 *   get:
 *     summary: Récupérer toutes les versions d'un prompt
 *     tags: [PromptVersions]
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         description: ID du prompt
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: versionNumber
 *         required: false
 *         description: Numéro de version spécifique à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Versions du prompt récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     prompts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PromptVersion'
 *       404:
 *         description: Aucune version trouvée pour ce prompt
 */

/**
 * @swagger
 * /promptVersions/{promptId}/{versionNumber}:
 *   delete:
 *     summary: Supprimer une version spécifique d'un prompt
 *     tags: [PromptVersions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         description: ID du prompt
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: versionNumber
 *         required: true
 *         description: Numéro de version à supprimer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Version du prompt supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Version du prompt introuvable
 */

class PromptVersionController {
  async getVersionById(req, res, next) {
    try {
      const { id } = req.params;
      const version = await promptVersionService.getVersionById(id);
      new AppResponse({
        message: "Prompt récupéré avec succès.",
        statusCode: 200,
        data: { prompt: version },
        code: "PROMPT_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getVersionsByPrompt(req, res, next) {
    try {
      const { promptId } = req.params;
      const { versionNumber } = req.query;
      const versions = await promptVersionService.getVersionsByPrompt(
        promptId,
        versionNumber ? parseInt(versionNumber, 10) : null
      );
      new AppResponse({
        message: "Prompts récupéré avec succès.",
        statusCode: 200,
        data: { prompts: versions },
        code: "PROMPT_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async deleteVersionByPrompt(req, res, next) {
    try {
      const { promptId, versionNumber } = req.params;
      const { user } = req.user;
      const deletedCount = await promptVersionService.deleteVersionByPrompt(
        promptId,
        parseInt(versionNumber, 10),
        user
      );
      new AppResponse({
        message: "Version de prompt supprimé avec succès.",
        statusCode: 200,
        data: { deletedCount },
        code: "PROMPT_DELETED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromptVersionController();
