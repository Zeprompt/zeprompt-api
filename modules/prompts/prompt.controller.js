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
 *       required: [title, contentType]
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
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
 */

/**
 * @openapi
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
 */

/**
 * @openapi
 * /api/prompts/public:
 *   get:
 *     summary: Récupère tous les prompts publics avec pagination
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
 *         description: Liste des prompts publics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prompt'
 */

/**
 * @openapi
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
 */

/**
 * @openapi
 * /api/prompts/{id}:
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
 */

/**
 * @openapi
 * /api/prompts/{id}:
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
 */

class PromptController {
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
      const data = await promptService.getPromptById(id);
      new AppResponse({
        message: "Prompt récupéré avec succès.",
        statusCode: 200,
        data: { prompt: data },
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
}

module.exports = new PromptController();
