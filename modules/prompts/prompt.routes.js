const express = require("express");
const router = express.Router();
const promptController = require("./prompt.controller");
const validate = require("../../middleware/validate");
const AuthMiddleware = require("../../middleware/auth");
const {
  createPromptSchema,
  updatePromptSchema,
} = require("../../schemas/prompt.schema");
const likeController = require("../like/like.controller");
const {
  createCommentSchema,
  updateCommentSchema,
} = require("../../schemas/comment.schema");
const commentController = require("../comment/comment.controller");

router.post(
  "/",
  AuthMiddleware.authenticate,
  validate(createPromptSchema),
  (req, res, next) => promptController.createPrompt(req, res, next)
);
router.get("/", (req, res, next) =>
  promptController.getAllPublicPrompts(req, res, next)
);
router.get("/admin", AuthMiddleware.authenticate, (req, res, next) =>
  promptController.getAllPromptsForAdmin(req, res, next)
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

module.exports = router;
