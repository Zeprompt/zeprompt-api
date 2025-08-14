const httpResponse = require('../../utils/httpResponse');
const promptService = require('./prompt.service');
const { createPDFPromptSchema } = require('../../schemas/prompt.schema');
const fs = require('fs');
const path = require('path');

/**
 * @openapi
 * components:
 *   schemas:
 *     Prompt:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         title: { type: string }
 *         content: { type: string, nullable: true }
 *         contentType: { type: string, enum: [text, pdf] }
 *         pdfFilePath: { type: string, nullable: true }
 *         pdfFileSize: { type: integer, nullable: true }
 *         pdfOriginalName: { type: string, nullable: true }
 *         imageUrl: { type: string, nullable: true }
 *         isPublic: { type: boolean }
 *         views: { type: integer }
 *         userId: { type: string, format: uuid }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         Tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *     PromptListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/Prompt' }
 *         meta:
 *           type: object
 *           properties:
 *             total: { type: integer, example: 42 }
 *             page: { type: integer, example: 1 }
 *             limit: { type: integer, example: 10 }
 *             totalPages: { type: integer, example: 5 }
 *     PromptResponse:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/Prompt'
 *     CreatePromptInput:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         content: { type: string }
 *         contentType: { type: string, enum: [text, pdf] }
 *         pdfFilePath: { type: string }
 *         pdfFileSize: { type: integer }
 *         pdfOriginalName: { type: string }
 *         imageUrl: { type: string }
 *         isPublic: { type: boolean }
 *         tags:
 *           type: array
 *           items: { type: string }
 *       required: [title]
 */

/**
 * @openapi
 * /api/prompts:
 *   get:
 *     summary: Liste les prompts publics avec leurs tags
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC] }
  *       - in: query
  *         name: tags
  *         description: Liste de tags séparés par des virgules. Exige que TOUS les tags correspondent.
  *         schema: { type: string, example: "ai,seo" }
 *     responses:
 *       200:
 *         description: Liste paginée de prompts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: prompt fetched }
 *                 data:
 *                   $ref: '#/components/schemas/PromptListResponse'
 *             examples:
 *               default:
 *                 value:
 *                   status: success
 *                   message: prompt fetched
 *                   data:
 *                     items:
 *                       - id: "c5c9d3a8-1a2b-4d3e-9f1c-0b1a2b3c4d5e"
 *                         title: "AI SEO Prompt"
 *                         content: "Write a SEO-optimized article about AI."
 *                         contentType: text
 *                         isPublic: true
 *                         views: 12
 *                         userId: "8d2c9c1e-1234-5678-9abc-def012345678"
 *                         Tags:
 *                           - id: "1"
 *                             name: "ai"
 *                           - id: "2"
 *                             name: "seo"
 *                     meta:
 *                       total: 1
 *                       page: 1
 *                       limit: 10
 *                       totalPages: 1
 *   post:
 *     summary: Crée un prompt
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
 *         description: Prompt créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: prompt created }
 *                 data: { $ref: '#/components/schemas/Prompt' }
 * /api/prompts/pdf:
 *   post:
 *     summary: Crée un prompt de type PDF (multipart/form-data)
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: string
 *                 description: JSON array de strings, ex: ["ai","seo"]
 *               isPublic:
 *                 type: string
 *                 enum: ["true","false"]
 *     responses:
 *       201:
 *         description: Prompt PDF créé
 */

/**
 * @openapi
 * /api/prompts/{id}:
 *   get:
 *     summary: Récupère un prompt public par id (avec tags)
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Prompt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: prompt fetched }
 *                 data: { $ref: '#/components/schemas/Prompt' }
 * /api/prompts/popular:
 *   get:
 *     summary: Récupère les prompts publics les plus populaires (par vues)
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: Liste des prompts populaires
 * /api/prompts/{id}/share:
 *   post:
 *     summary: Génère un lien de partage pour un prompt public (propriétaire uniquement)
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lien de partage généré
 * /api/prompts/{id}/download:
 *   get:
 *     summary: Télécharge le fichier PDF d'un prompt public
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fichier PDF
 */

class PromptController {
  async listPublic(req, res) {
    try {
      const { count, rows, pageNumber, pageSize } = await promptService.listPublic(req.query);
      httpResponse.sendSuccess(res, 200, 'prompt', 'fetched', {
        items: rows,
        meta: {
          total: count,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(count / pageSize),
        },
      });
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'fetching', error);
    }
  }

  async getPublicById(req, res) {
    try {
      const prompt = await promptService.getPublicById(req.params.id);
      if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
      httpResponse.sendSuccess(res, 200, 'prompt', 'fetched', prompt);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'fetching by id', error);
    }
  }

  async listMine(req, res) {
    try {
      const prompts = await promptService.listMine(req.user.id);
      httpResponse.sendSuccess(res, 200, 'prompt', 'fetched', prompts);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'fetching mine', error);
    }
  }

  async create(req, res) {
    try {
      const { tags, ...rest } = req.body;
      const prompt = await promptService.create(req.user.id, rest);
      if (Array.isArray(tags)) {
        await promptService.setTags(prompt, tags);
        await prompt.reload();
      }
      httpResponse.sendSuccess(res, 201, 'prompt', 'created', prompt);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'creating', error);
    }
  }

  // Helper middleware to transform multipart form fields
  transformFormData(req, res, next) {
    try {
      if (req.body && typeof req.body.tags === 'string') {
        try {
          const parsed = JSON.parse(req.body.tags);
          if (Array.isArray(parsed)) req.body.tags = parsed;
    } catch {
          // ignore parse error, keep as string
        }
      }
      if (typeof req.body.isPublic === 'string') {
        req.body.isPublic = req.body.isPublic === 'true';
      }
      next();
  } catch {
      next();
    }
  }

  // Create a PDF prompt via multipart upload
  async createPdf(req, res) {
    try {
      // Validate payload with PDF schema (title, optional content/tags/isPublic)
      const parsed = createPDFPromptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Fichier PDF requis (champ: pdf)' });
      }

      const { tags, ...rest } = parsed.data;
      const prompt = await promptService.create(req.user.id, {
        ...rest,
        contentType: 'pdf',
        pdfFilePath: req.file.path,
        pdfFileSize: req.file.size,
        pdfOriginalName: req.file.originalname,
      });

      if (Array.isArray(tags)) {
        await promptService.setTags(prompt, tags);
        await prompt.reload();
      }

      // Optionally hide full path
      const data = {
        ...prompt.toJSON(),
        pdfFilePath: undefined,
        fileInfo: {
          originalName: req.file.originalname,
          size: req.file.size,
        },
      };

      httpResponse.sendSuccess(res, 201, 'prompt', 'created', data);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'creating pdf', error);
    }
  }

  async updateOwned(req, res) {
    try {
      const { id } = req.params;
      const { tags, ...rest } = req.body;
      const result = await promptService.updateOwned(id, req.user.id, rest);
      if (result === 'forbidden') return res.status(403).json({ message: 'Not authorized' });
      if (!result) return res.status(404).json({ message: 'Prompt not found' });
      if (Array.isArray(tags)) {
        await promptService.setTags(result, tags);
        await result.reload();
      }
      httpResponse.sendSuccess(res, 200, 'prompt', 'updated', result);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'updating', error);
    }
  }

  async deleteOwned(req, res) {
    try {
      const result = await promptService.deleteOwned(req.params.id, req.user.id);
      if (result === 'forbidden') return res.status(403).json({ message: 'Not authorized' });
      if (!result) return res.status(404).json({ message: 'Prompt not found' });
      httpResponse.sendSuccess(res, 200, 'prompt', 'deleted', result);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'deleting', error);
    }
  }

  async listPopular(req, res) {
    try {
      const { limit = 10 } = req.query;
      const prompts = await promptService.listPopular(limit);
      httpResponse.sendSuccess(res, 200, 'prompt', 'fetched', prompts);
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'fetching popular', error);
    }
  }

  async generateShareLink(req, res) {
    try {
      const { id } = req.params;
      const prompt = await promptService.getById(id);
      if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
      if (!prompt.isPublic) return res.status(400).json({ message: 'Prompt must be public to be shared' });
      if (prompt.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      const baseUrl = process.env.FRONTEND_URL || 'https://zeprompt.com';
      const shareUrl = `${baseUrl}/prompts/${prompt.id}`;
      httpResponse.sendSuccess(res, 200, 'prompt', 'share link generated', { shareUrl, promptId: prompt.id, title: prompt.title });
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'generating share link', error);
    }
  }

  async downloadPdf(req, res) {
    try {
      const { id } = req.params;
      const prompt = await promptService.getById(id);
      if (!prompt || prompt.contentType !== 'pdf') return res.status(404).json({ message: 'PDF prompt not found' });
      if (!prompt.isPublic) return res.status(403).json({ message: 'Access denied: private prompt' });
      if (!prompt.pdfFilePath || !fs.existsSync(prompt.pdfFilePath)) return res.status(404).json({ message: 'PDF file not found' });

      const fileName = prompt.pdfOriginalName || `prompt-${prompt.id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.sendFile(path.resolve(prompt.pdfFilePath));
    } catch (error) {
      httpResponse.sendError(res, 500, 'prompt', 'downloading pdf', error);
    }
  }
}

module.exports = new PromptController();
