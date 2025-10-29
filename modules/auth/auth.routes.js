const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { registerSchema, loginSchema } = require("../../schemas/auth.schema");
const AuthMiddleware = require("../../middleware/auth");

// Route d'inscription avec validation
router.post(
  "/register",
  AuthMiddleware.validate(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);
router.post(
  "/login",
  AuthMiddleware.validate(loginSchema),
  (req, res, next) => {
    authController.login(req, res, next);
  }
);
router.get("/verify-email", (req, res, next) => {
  authController.verifyEmail(req, res, next);
});
router.post("/resend-verification-email", (req, res, next) => {
  authController.resendVerificationEmail(req, res, next);
});
router.post("/request-password-reset", (req, res, next) => {
  authController.requestPasswordReset(req, res, next);
});
router.get("/verify-password-reset-token", (req, res, next) => {
  authController.verifyPasswordResetToken(req, res, next);
});
router.post("/reset-password", (req, res, next) => {
  authController.resetPassword(req, res, next);
});
router.put(
  "/users/:userId/disabled",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  (req, res, next) => {
    authController.disableUser(req, res, next);
  }
);
router.put(
  "/users/:userId/enable",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  (req, res, next) => {
    authController.enableUser(req, res, next);
  }
);
router.delete(
  "/users/:userId/soft-delete",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  (req, res, next) => {
    authController.softDeleteUser(req, res, next);
  }
);
router.put(
  "/users/:userId/restore",
  AuthMiddleware.authenticate,
  (req, res, next) => {
    authController.restoreUser(req, res, next);
  }
);
router.get("/users/me", AuthMiddleware.authenticate, (req, res, next) => {
  authController.getProfile(req, res, next);
});
router.put("/users/me", AuthMiddleware.authenticate, (req, res, next) => {
  authController.updateProfile(req, res, next);
});

// --- leaderboard------
router.get(
  "/users/leaderboard",
  // AuthMiddleware.authenticate,
  (req, res, next) => authController.getLeaderBoard(req, res, next)
);

module.exports = router;
