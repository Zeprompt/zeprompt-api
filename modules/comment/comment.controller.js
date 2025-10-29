const AppResponse = require("../../utils/appResponse");
const commentService = require("./comment.service");

/**
 * @openapi
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         promptId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/prompts/{id}/comments:
 *   post:
 *     summary: Ajouter un commentaire à un prompt
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Super prompt !"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Commentaire créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *   get:
 *     summary: Récupérer tous les commentaires d'un prompt
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des commentaires récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *
 * /api/prompts/{id}/comments/{commentId}:
 *   delete:
 *     summary: Supprimer un commentaire (propriétaire ou admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Commentaire supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Commentaire supprimé avec succès."
 *   put:
 *     summary: Mettre à jour un commentaire (propriétaire ou admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Nouveau contenu du commentaire"
 *     responses:
 *       200:
 *         description: Commentaire mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */

class CommentController {
  async createComment(req, res, next) {
    try {
      const { id: promptId } = req.params;
      const { content, parentId } = req.body;
      const user = req.user;

      const comment = await commentService.createComment(
        promptId,
        content,
        user,
        parentId
      );

      new AppResponse({
        message: "Commentaire créé avec succès.",
        data: comment,
        statusCode: 201,
        code: "COMMENT_CREATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const user = req.user;

      await commentService.deleteComment(commentId, user);

      new AppResponse({
        message: "Commentaire supprimé avec succès.",
        statusCode: 200,
        code: "COMMENT_DELETED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getCommentsByPrompts(req, res, next) {
    try {
      const { id: promptId } = req.params;
      const comments = await commentService.getCommentsByPrompts(promptId);

      new AppResponse({
        message: "Commentaires récupérés avec succès.",
        data: comments,
        statusCode: 200,
        code: "COMMENTS_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const user = req.user;

      const updatedComment = await commentService.updateComment(
        commentId,
        content,
        user
      );

      new AppResponse({
        message: "Commentaire mis à jour avec succès.",
        data: updatedComment,
        statusCode: 200,
        code: "COMMENT_UPDATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/prompts/comments/{id}/report:
   *   post:
   *     summary: Signaler un commentaire
   *     tags: [Comments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID du commentaire à signaler
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Raison du signalement (optionnel)
   *                 example: Commentaire offensant
   *     responses:
   *       200:
   *         description: Commentaire signalé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 reportCount:
   *                   type: integer
   *       404:
   *         description: Commentaire non trouvé
   */
  async reportComment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await commentService.reportComment(id, req.user.id, reason);
      new AppResponse({
        message: result.message,
        statusCode: 200,
        data: { reportCount: result.reportCount },
        code: "COMMENT_REPORTED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
