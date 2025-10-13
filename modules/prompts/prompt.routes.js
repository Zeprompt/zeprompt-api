const express = require("express");
const router = express.Router();
const promptController = require("./prompt.controller");
const validate = require("../../middleware/validate");
const AuthMiddleware = require("../../middleware/auth");
const conditionalPdfUpload = require("../../middleware/conditionalUpload");
const {
  createPromptSchema,
  updatePromptSchema,
} = require("../../schemas/prompt.schema");
const { reportPromptSchema, reportCommentSchema } = require("../../schemas/report.schema");
const likeController = require("../like/like.controller");
const {
  createCommentSchema,
  updateCommentSchema,
} = require("../../schemas/comment.schema");
const commentController = require("../comment/comment.controller");
const promptVersionController = require("../promptVersion/promptVersion.controller");

router.post(
  "/",
  AuthMiddleware.authenticate,
  conditionalPdfUpload, // Gère l'upload de PDF si nécessaire
  validate(createPromptSchema),
  (req, res, next) => promptController.createPrompt(req, res, next)
);
// Routes spécifiques DOIVENT être définies AVANT les routes avec paramètres dynamiques /:id
router.get("/public", (req, res, next) =>
  promptController.getAllPublicPrompts(req, res, next)
);
router.get("/search", (req, res, next) =>
  promptController.searchPrompts(req, res, next)
);
router.get("/admin", AuthMiddleware.authenticate, (req, res, next) =>
  promptController.getAllPromptsForAdmin(req, res, next)
);
// Route avec paramètre dynamique - doit être définie EN DERNIER
router.get("/:id", AuthMiddleware.authenticate, (req, res, next) =>
  promptController.getPromptById(req, res, next)
);
router.put(
  "/:id",
  AuthMiddleware.authenticate,
  conditionalPdfUpload, // Gère l'upload de PDF si nécessaire
  validate(updatePromptSchema),
  (req, res, next) => promptController.updatePrompt(req, res, next)
);
router.delete("/:id", AuthMiddleware.authenticate, (req, res, next) =>
  promptController.deletePrompt(req, res, next)
);

// ---- Routes pour les likes ----
router.post("/:id/like", AuthMiddleware.authenticate, (req, res, next) =>
  likeController.likePrompt(req, res, next)
);

router.post("/:id/dislike", AuthMiddleware.authenticate, (req, res, next) =>
  likeController.dislikePrompt(req, res, next)
);

router.get("/:id/likes", (req, res, next) =>
  likeController.getLikesCount(req, res, next)
);

// ---- Route pour signaler un prompt ----
router.post(
  "/:id/report",
  AuthMiddleware.authenticate,
  validate(reportPromptSchema),
  (req, res, next) => promptController.reportPrompt(req, res, next)
);

//---- Route pour les commentaires ----
router.post(
  "/:id/comments",
  AuthMiddleware.authenticate,
  validate(createCommentSchema),
  (req, res, next) => commentController.createComment(req, res, next)
);

router.delete(
  "/:id/comments/:commentId",
  AuthMiddleware.authenticate,
  (req, res, next) => commentController.deleteComment(req, res, next)
);

router.put(
  "/:id/comments/:commentId",
  AuthMiddleware.authenticate,
  validate(updateCommentSchema)
);

router.get("/:id/comments", (req, res, next) =>
  commentController.getCommentsByPrompts(req, res, next)
);

// ---- Route pour signaler un commentaire ----
router.post(
  "/comments/:id/report",
  AuthMiddleware.authenticate,
  validate(reportCommentSchema),
  (req, res, next) => commentController.reportComment(req, res, next)
);

// ---- Route pour les versions de prompt --------
router.get("/versions/:id", (req, res, next) =>
  promptVersionController.getVersionById(req, res, next)
);
router.get("/:promptId/versions", (req, res, next) =>
  promptVersionController.getVersionsByPrompt(req, res, next)
);
router.delete("/:promptId/versions/:versionNumber", (req, res, next) =>
  promptVersionController.deleteVersionByPrompt(req, res, next)
);

module.exports = router;
