const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const validate = require("../../middleware/validate");
const { registerSchema } = require("../../schemas/auth.schema");

// Route d'inscription avec validation
router.post("/register", validate(registerSchema), (req, res) =>
  authController.register(req, res)
);

module.exports = router;