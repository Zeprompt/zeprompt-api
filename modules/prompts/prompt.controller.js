const promptService = require("./prompt.service");
const AppResponse = require("../../utils/appResponse");

/**
 * @openapi
 * components:
 *   schemas:
 *     Prompt:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         content:
 *           type: string
 *           nullable: true
 *         contentType:
 *           type: string
 *           enum: [text, pdf]
 *         pdfFilePath:
 *           type: string
 *           nullable: true
 *         pdfFileSize:
 *           type: integer
 *           nullable: true
 *         pdfOriginalName:
 *           type: string
 *           nullable: true
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         isPublic:
 *           type: boolean
 *         views:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [activé, désactivé]
 *           default: activé
 *         userId:
 *           type: string
 *           format: uuid
 *         hash:
 *           type: string
 *       required: [id, title, contentType, userId, hash]
 *
 *     CreatePromptInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *           nullable: true
 *         contentType:
 *           type: string
 *           enum: [text, pdf]
 *         pdfFilePath:
 *           type: string
 *           nullable: true
 *         pdfFileSize:
 *           type: integer
 *           nullable: true
 *         pdfOriginalName:
 *           type: string
 *           nullable: true
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         isPublic:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [activé, désactivé]
 *           default: activé
 *       required: [title, contentType]
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/prompts:
 *   post:
 *     summary: Crée un nouveau prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePromptInput'
 *     responses:
 *       201:
 *         description: Prompt créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 *
 * /api/prompts/{id}:
 *   get:
 *     summary: Récupère un prompt par son ID
 *     tags: [Prompts]
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
 *         description: Prompt récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 *       404:
 *         description: Prompt introuvable
 *   put:
 *     summary: Met à jour un prompt existant
 *     tags: [Prompts]
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
 *             $ref: '#/components/schemas/CreatePromptInput'
 *     responses:
 *       200:
 *         description: Prompt mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 *   delete:
 *     summary: Supprime un prompt
 *     tags: [Prompts]
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
 *         description: Prompt supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /api/prompts/public:
 *   get:
 *     summary: Récupère tous les prompts publics et activés avec pagination
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste des prompts publics et activés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prompt'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageCount:
 *                   type: integer
 *
 * /api/admin/prompts:
 *   get:
 *     summary: Récupère tous les prompts (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste de tous les prompts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prompt'
 *
 * /api/prompts/search:
 *   get:
 *     summary: Recherche et filtre des prompts
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Mot-clé à rechercher dans le titre ou le contenu
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Liste de tags séparés par des virgules pour filtrer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [likes, comments, views, date]
 *         description: Champ pour trier les résultats
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre du tri (ascendant ou descendant)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Résultats de la recherche et filtrage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prompt'
 *                 total:
 *                   type: integer
 *                   description: Nombre total de prompts correspondant aux critères
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */

class PromptController {
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

  async createPrompt(req, res, next) {
    try {
      const prompt = await promptService.createPrompt({
        ...req.body,
        userId: req.user.id,
      });

      new AppResponse({
        message: "Prompt créé avec succès.",
        statusCode: 201,
        data: { prompt },
        code: "PROMPT_CREATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getPromptById(req, res, next) {
    try {
      const { id } = req.params;
      const { user, anonymousId } = this._getIdentifier(req);
      const data = await promptService.getPromptById(id, { user, anonymousId });
      new AppResponse({
        message: "Prompt récupéré avec succès.",
        statusCode: 200,
        data: {
          prompt: data.prompt,
          similarePrompts: data.similarePrompts,
        },
        code: "PROMPT_RETURNED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getAllPublicPrompts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const data = await promptService.getAllPublicPrompts({ page, limit });
      new AppResponse({
        message: "Prompts récupérés avec succès.",
        statusCode: 200,
        data: data,
        code: "PROMPTS_RETURNED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getAllPromptsForAdmin(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const user = req.user;

      const data = await promptService.getAllPrompts({ page, limit, user });
      new AppResponse({
        message: "Prompts récupérés avec succès.",
        statusCode: 200,
        data: data,
        code: "PROMPTS_RETURNED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async updatePrompt(req, res, next) {
    try {
      const { id } = req.params;

      const updatedPrompt = await promptService.updatePrompt(
        id,
        req.body,
        req.user
      );
      new AppResponse({
        message: "Prompt mis à jour avec succès.",
        statusCode: 200,
        data: { prompt: updatedPrompt },
        code: "PROMPT_UPDATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async deletePrompt(req, res, next) {
    try {
      const { id } = req.params;
      const deletePrompt = await promptService.deletePrompt(id, req.user);
      new AppResponse({
        message: deletePrompt.message,
        statusCode: 200,
        data: {},
        code: "PROMPT_DELETED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async searchPrompts(req, res, next) {
    try {
      const { q, tags, sort, order, page, limit } = req.query;
      const results = await promptService.searchPrompts({
        q,
        tags: tags ? tags.split(",") : [],
        sort,
        order,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      new AppResponse({
        message: "Prompts récupérés avec succès",
        statusCode: 200,
        data: results,
        code: "PROMPT_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/prompts/{id}/report:
   *   post:
   *     summary: Signaler un prompt
   *     tags: [Prompts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID du prompt à signaler
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Raison du signalement (optionnel)
   *                 example: Contenu inapproprié
   *     responses:
   *       200:
   *         description: Prompt signalé avec succès
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
   *         description: Prompt non trouvé
   */
  async reportPrompt(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await promptService.reportPrompt(id, req.user.id, reason);
      new AppResponse({
        message: result.message,
        statusCode: 200,
        data: { reportCount: result.reportCount },
        code: "PROMPT_REPORTED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromptController();
