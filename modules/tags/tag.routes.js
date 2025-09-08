const express = require('express');
const router = express.Router();
const tagController = require('./tag.controller');
const validate = require('../../middleware/validate');
const { createTagSchema, updateTagSchema } = require('../../schemas/tag.schema');
const authenticate = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/role');

// Public: list and get by id
router.get('/', (req, res) => tagController.getAll(req, res));
router.get('/:id', (req, res) => tagController.getById(req, res));

// Protected (admin): create/update/delete
router.post('/', authenticate, isAdmin, validate(createTagSchema), (req, res) => tagController.create(req, res));
router.put('/:id', authenticate, isAdmin, validate(updateTagSchema), (req, res) => tagController.update(req, res));
router.delete('/:id', authenticate, isAdmin, (req, res) => tagController.delete(req, res));

module.exports = router;
