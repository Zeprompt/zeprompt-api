const AppResponse = require("../../utils/appResponse");
const tagService = require("./tag.service");

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
  async getAll(req, res, next) {
    try {
      const data = await tagService.getAll();
      new AppResponse({
        message: "Catégorie trouvée avec succès.",
        statusCode: 200,
        data: { tags: data },
        success: true,
        code: "TAGS_FOUNDS",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await tagService.getById(req.params.id);
      new AppResponse({
        message: "Catégorie récupéré avec succès.",
        statusCode: 200,
        data: { tag: data },
        sucess: true,
        code: "TAG_FOUND",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = await tagService.create(req.body);
      new AppResponse({
        message: "Catégorie créé avec succès.",
        statusCode: 201,
        data: { tag: data },
        success: true,
        code: "TAG_CREATED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const data = await tagService.update(req.params.id, req.body);
      new AppResponse({
        message: "Catégorie mis à jour avec succès.",
        statusCode: 200,
        data: { tag: data },
        success: true,
        code: "TAG_UPDATED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const data = await tagService.delete(req.params.id);
      new AppResponse({
        message: "Catégorie supprimé avec succès.",
        statusCode: 200,
        data: { tag: data },
        success: true,
        code: "TAG_DELETED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TagController();
