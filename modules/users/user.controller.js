const AppResponse = require("../../utils/appResponse");
const userService = require("./user.service");
const { validate: isUuid } = require("uuid");

/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         profilePicture:
 *           type: string
 *           nullable: true
 *         githubUrl:
 *           type: string
 *           nullable: true
 *         linkedinUrl:
 *           type: string
 *           nullable: true
 *         whatsappNumber:
 *           type: string
 *           nullable: true
 *         twitterUrl:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /api/users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Photo de profil (JPEG, PNG, GIF, WebP - max 5MB)
 *               username:
 *                 type: string
 *                 description: Nouveau nom d'utilisateur
 *                 example: johndoe123
 *               githubUrl:
 *                 type: string
 *                 description: URL du profil GitHub
 *                 example: https://github.com/johndoe
 *               linkedinUrl:
 *                 type: string
 *                 description: URL du profil LinkedIn
 *                 example: https://linkedin.com/in/johndoe
 *               whatsappNumber:
 *                 type: string
 *                 description: Numéro WhatsApp (format international)
 *                 example: +33612345678
 *               twitterUrl:
 *                 type: string
 *                 description: URL du profil Twitter/X
 *                 example: https://twitter.com/johndoe
 *           encoding:
 *             profilePicture:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Données invalides
 */

class UserController {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return new AppResponse({
          message: "Utilisateur non trouvé",
          statusCode: 404,
          code: "USER_NOT_FOUND",
          success: false,
        }).send(res);
      }
      
      new AppResponse({
        message: "Profil récupéré avec succès",
        statusCode: 200,
        data: profile,
        code: "PROFILE_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   */
  async updateUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profileData = req.body;
      const profilePicturePath = req.file ? req.file.path : null;
      
      // Rejeter explicitement toute base64/dataURL envoyée en tant que string
      if (typeof profileData.profilePicture === "string" && profileData.profilePicture.startsWith("data:image/")) {
        return new AppResponse({
          message: "Les images base64 ne sont pas autorisées. Utilisez multipart/form-data avec un fichier.",
          statusCode: 400,
          code: "BASE64_NOT_ALLOWED",
          success: false,
        }).send(res);
      }
      
      const updatedProfile = await userService.updateUserProfile(
        userId,
        profileData,
        profilePicturePath
      );
      
      new AppResponse({
        message: "Profil mis à jour avec succès",
        statusCode: 200,
        data: updatedProfile,
        code: "PROFILE_UPDATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère le profil public d'un utilisateur avec ses prompts publics et ses stats
   * Route publique - accessible sans authentification
   * 
   * Sécurité :
   * - Validation stricte de l'UUID pour éviter l'énumération
   * - Ne retourne jamais l'email ou informations sensibles
   * - Seuls les prompts publics et activés sont retournés
   */
  async getUserPublicProfile(req, res, next) {
    try {
      const { userId } = req.params;
      
      // Validation stricte de l'UUID pour éviter les attaques par énumération
      if (!userId || !isUuid(userId)) {
        return new AppResponse({
          message: "ID utilisateur invalide",
          statusCode: 400,
          code: "INVALID_USER_ID",
          success: false,
        }).send(res);
      }

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 15;

      // Limite la pagination pour éviter les abus
      if (page < 1 || page > 100) {
        return new AppResponse({
          message: "Numéro de page invalide (doit être entre 1 et 100)",
          statusCode: 400,
          code: "INVALID_PAGE",
          success: false,
        }).send(res);
      }

      if (limit < 1 || limit > 50) {
        return new AppResponse({
          message: "Limite invalide (doit être entre 1 et 50)",
          statusCode: 400,
          code: "INVALID_LIMIT",
          success: false,
        }).send(res);
      }

      const profile = await userService.getUserPublicProfile(userId, page, limit);

      // Ne pas révéler si l'utilisateur existe ou non (même message pour éviter l'énumération)
      if (!profile) {
        return new AppResponse({
          message: "Utilisateur non trouvé",
          statusCode: 404,
          code: "USER_NOT_FOUND",
          success: false,
        }).send(res);
      }

      // S'assurer qu'on ne retourne jamais l'email dans une réponse publique
      if (profile.user && profile.user.email) {
        delete profile.user.email;
      }

      new AppResponse({
        message: "Profil public récupéré avec succès",
        statusCode: 200,
        data: profile,
        code: "PUBLIC_PROFILE_FETCHED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
