const express = require("express");
const router = express.Router();
const tagController = require("./tag.controller");
const validate = require("../../middleware/validate");
const {
  createTagSchema,
  updateTagSchema,
} = require("../../schemas/tag.schema");
const AuthMiddleware = require("../../middleware/auth");

// Public: list and get by id
router.get("/", (req, res, next) => tagController.getAll(req, res, next));
router.get("/:id", (req, res, next) => tagController.getById(req, res, next));

// Protected (admin): create/update/delete
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  validate(createTagSchema),
  (req, res, next) => tagController.create(req, res, next)
);
router.put(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  validate(updateTagSchema),
  (req, res, next) => tagController.update(req, res, next)
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  (req, res, next) => tagController.delete(req, res, next)
);

module.exports = router;
