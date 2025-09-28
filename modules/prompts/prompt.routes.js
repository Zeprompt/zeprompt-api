const express = require("express");
const router = express.Router();
const promptController = require("./prompt.controller");
// const likeController = require("../like/like.controller");
// const viewController = require("../view/view.controller");
const validate = require("../../middleware/validate");
const AuthMiddleware = require("../../middleware/auth");
const {
  createPromptSchema,
  updatePromptSchema,
} = require("../../schemas/prompt.schema");
// const { uploadPDF, handleUploadError } = require("../../middleware/uploadPDF");
// const { searchSchema } = require("../../schemas/search.schema");

router.post(
  "/",
  AuthMiddleware.authenticate,
  validate(createPromptSchema),
  (req, res, next) => promptController.createPrompt(req, res, next)
);
router.get("/", (req, res, next) =>
  promptController.getAllPrompts(req, res, next)
);
router.get("/:id", (req, res, next) =>
  promptController.getPromptById(req, res, next)
);
router.put(
  "/:id",
  AuthMiddleware.authenticate,
  validate(updatePromptSchema),
  (req, res, next) => promptController.updatePrompt(req, res, next)
);
router.delete("/:id", AuthMiddleware.authenticate, (req, res, next) =>
  promptController.deletePrompt(req, res, next)
);

module.exports = router;
