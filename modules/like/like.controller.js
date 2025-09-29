const AppResponse = require("../../utils/appResponse");
const likeService = require("./like.service");

/**
 * @openapi
 * components:
 *   schemas:
 *     LikeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Prompt liké avec succès."
 *         likesCount:
 *           type: integer
 *           example: 42
 *         liked:
 *           type: boolean
 *           example: true
 *
 * /api/prompts/{id}/like:
 *   post:
 *     summary: Liker un prompt
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Prompt liké avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *
 * /api/prompts/{id}/dislike:
 *   post:
 *     summary: Dislike/unlike un prompt
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Prompt unliké avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *
 * /api/prompts/{id}/likes:
 *   get:
 *     summary: Récupère le nombre de likes d'un prompt
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Nombre de likes récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nombres de likes récupéré avec succès"
 *                 count:
 *                   type: integer
 *                   example: 42
 */

class LikeController {
  _getIdentifier(req) {
    const user = req.user || null;
    const anonymousId = !user
      ? req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip
      : null;
    return { user, anonymousId };
  }

  async likePrompt(req, res, next) {
    try {
      const { id } = req.params;
      const { user, anonymousId } = this._getIdentifier(req);
      const likesCount = await likeService.likePrompt(id, user, anonymousId);
      new AppResponse({
        message: "Prompt liké avec succès.",
        data: { likesCount, liked: true },
        statusCode: 201,
        code: "PROMPT_LIKED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async dislikePrompt(req, res, next) {
    try {
      const { id } = req.params;
      const { user, anonymousId } = this._getIdentifier(req);
      const likesCount = await likeService.dislikePrompt(id, user, anonymousId);
      new AppResponse({
        message: "Prompt unliké avec succès.",
        data: { likesCount, liked: false },
        statusCode: 200,
        code: "PROMPT_UNLIKED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getLikesCount(req, res, next) {
    try {
      const { id } = req.params;
      const count = await likeService.getLikesCount(id);
      new AppResponse({
        message: "Nombres de likes récupéré avec succès",
        data: { count },
        statusCode: 200,
        code: "LIKES_COUNTED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LikeController();
