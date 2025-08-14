const httpResponse = require('../../utils/httpResponse');
const tagService = require('./tag.service');

/**
 * @openapi
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *       required: [id, name]
 *     CreateTagInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *       required: [name]
 *     UpdateTagInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: Liste tous les tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Liste des tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *   post:
 *     summary: Crée un tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagInput'
 *     responses:
 *       201:
 *         description: Tag créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       409:
 *         description: Tag déjà existant
 */

/**
 * @openapi
 * /api/tags/{id}:
 *   get:
 *     summary: Récupère un tag par id
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tag trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag non trouvé
 *   put:
 *     summary: Met à jour un tag
 *     tags: [Tags]
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
 *             $ref: '#/components/schemas/UpdateTagInput'
 *     responses:
 *       200:
 *         description: Tag mis à jour
 *   delete:
 *     summary: Supprime un tag
 *     tags: [Tags]
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
 *         description: Tag supprimé
 */

class TagController {
  async getAll(req, res) {
    try {
      const tags = await tagService.getAll();
      httpResponse.sendSuccess(res, 200, 'tag', 'fetched', tags);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'fetching', error);
    }
  }

  async getById(req, res) {
    try {
      const tag = await tagService.getById(req.params.id);
      if (!tag) return res.status(404).json({ message: 'Tag not found' });
      httpResponse.sendSuccess(res, 200, 'tag', 'fetched by Id', tag);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'fetching by Id', error);
    }
  }

  async create(req, res) {
    try {
      const tag = await tagService.create(req.body);
      httpResponse.sendSuccess(res, 201, 'tag', 'created', tag);
    } catch (error) {
      const status = error.statusCode || 500;
      httpResponse.sendError(res, status, 'tag', 'creating', error);
    }
  }

  async update(req, res) {
    try {
      const tag = await tagService.update(req.params.id, req.body);
      if (!tag) return res.status(404).json({ message: 'Tag not found' });
      httpResponse.sendSuccess(res, 200, 'tag', 'updated', tag);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'updating', error);
    }
  }

  async delete(req, res) {
    try {
      const tag = await tagService.delete(req.params.id);
      if (!tag) return res.status(404).json({ message: 'Tag not found' });
      httpResponse.sendSuccess(res, 200, 'tag', 'deleted', tag);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'deleting', error);
    }
  }
}

module.exports = new TagController();
