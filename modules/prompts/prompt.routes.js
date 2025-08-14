const express = require('express');
const router = express.Router();
const promptController = require('./prompt.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { createPromptSchema, updatePromptSchema } = require('../../schemas/prompt.schema');
const { uploadPDF, handleUploadError } = require('../../middleware/uploadPDF');

// Public list
router.get('/', (req, res) => promptController.listPublic(req, res));
// Auth: my prompts
router.get('/me/list', authenticate, (req, res) => promptController.listMine(req, res));
// Popular prompts (public)
router.get('/popular', (req, res) => promptController.listPopular(req, res));
// Public get by id
router.get('/:id', (req, res) => promptController.getPublicById(req, res));
// Auth: create
router.post('/', authenticate, validate(createPromptSchema), (req, res) => promptController.create(req, res));
// Auth: create PDF prompt (multipart/form-data)
router.post(
	'/pdf',
	authenticate,
	(req, res, next) => uploadPDF(req, res, (err) => handleUploadError(err, req, res, next)),
	(req, res, next) => promptController.transformFormData(req, res, next),
	(req, res) => promptController.createPdf(req, res)
);
// Generate share link (auth, owner)
router.post('/:id/share', authenticate, (req, res) => promptController.generateShareLink(req, res));
// Download PDF (public if prompt is public)
router.get('/:id/download', (req, res) => promptController.downloadPdf(req, res));
// Auth: update owned
router.put('/:id', authenticate, validate(updatePromptSchema), (req, res) => promptController.updateOwned(req, res));
// Auth: delete owned
router.delete('/:id', authenticate, (req, res) => promptController.deleteOwned(req, res));

module.exports = router;
