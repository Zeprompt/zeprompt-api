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
router.get("/", (req, res) => tagController.getAll(req, res));
router.get("/:id", (req, res) => tagController.getById(req, res));

// Protected (admin): create/update/delete
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  validate(createTagSchema),
  (req, res) => tagController.create(req, res)
);
router.put(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  validate(updateTagSchema),
  (req, res) => tagController.update(req, res)
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  (req, res) => tagController.delete(req, res)
);

module.exports = router;
