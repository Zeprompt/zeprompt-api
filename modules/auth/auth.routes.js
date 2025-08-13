const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const validate = require("../../middleware/validate");
const { registerSchema, loginSchema } = require("../../schemas/auth.schema");

// Route d'inscription avec validation
router.post("/register", validate(registerSchema), (req, res) =>
  authController.register(req, res)
);
router.post("/login", validate(loginSchema), (req, res) => {
  authController.login(req, res);
});
router.get("/verify-email", (req, res) => {
  authController.verifyEmail(req, res);
});
router.post("/resend-verification-email", (req, res) => {
  authController.resendVerificationEmail(req, res);
});
router.post("/request-password-reset", (req, res) => {
  authController.requestPasswordReset(req, res);
});
router.get("/verify-password-reset-token", (req, res) => {
  authController.verifyPasswordResetToken(req, res);
});
router.post("/reset-password", (req, res) => {
  authController.resetPassword(req, res);
});
router.put("/disabled/:userId", (req, res) => {
  authController.disableUser(req, res);
});
router.put("/enable/:userId", (req, res) => {
  authController.enableUser(req, res);
});
router.delete("/soft-delete/:userId", (req, res) => {
  authController.softDeleteUser(req, res);
});
router.put("/restore/:userId", (req, res) => {
  authController.restoreUser(req, res);
});

module.exports = router;
