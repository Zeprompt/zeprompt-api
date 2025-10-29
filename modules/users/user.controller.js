const AppResponse = require("../../utils/appResponse");
const userService = require("./user.service");

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
}

module.exports = new UserController();
