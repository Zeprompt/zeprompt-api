const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const AuthMiddleware = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { updateUserProfileSchema } = require("../../schemas/user.schema");
const uploadProfilePicture = require("../../middleware/uploadProfilePicture");

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (req, res, next) => {
  uploadProfilePicture(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        code: "UPLOAD_ERROR",
      });
    }
    next();
  });
};

// Route publique pour récupérer le profil public d'un utilisateur (avec prompts et stats)
// IMPORTANT: Cette route doit être définie AVANT /profile pour éviter les conflits
router.get(
  "/:userId/profile",
  (req, res, next) => userController.getUserPublicProfile(req, res, next)
);

// Route pour récupérer le profil de l'utilisateur connecté
router.get(
  "/profile",
  AuthMiddleware.authenticate,
  (req, res, next) => userController.getUserProfile(req, res, next)
);

// Route pour mettre à jour le profil de l'utilisateur connecté
router.put(
  "/profile",
  AuthMiddleware.authenticate,
  handleUploadErrors,
  validate(updateUserProfileSchema),
  (req, res, next) => userController.updateUserProfile(req, res, next)
);

module.exports = router;
