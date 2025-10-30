const AppResponse = require("../../utils/appResponse");
const userService = require("./user.service");
const fs = require("fs");
const path = require("path");

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
      let profilePicturePath = req.file ? req.file.path : null;

      // Support optionnel: data URL base64 dans body (ex: "data:image/jpeg;base64,...")
      if (!profilePicturePath && typeof profileData.profilePicture === "string" && profileData.profilePicture.startsWith("data:image/")) {
        try {
          const matches = profileData.profilePicture.match(/^data:(image\/(?:jpeg|jpg|png|gif|webp));base64,(.+)$/);
          if (matches && matches[2]) {
            const mime = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");

            // Assurer le dossier d'upload local (réutilisé par le worker R2)
            const uploadDir = path.join(process.cwd(), "uploads", "profiles");
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = mime.includes("jpeg") || mime.includes("jpg") ? ".jpg" : mime.includes("png") ? ".png" : mime.includes("webp") ? ".webp" : mime.includes("gif") ? ".gif" : ".jpg";
            const filename = `${userId}-${Date.now()}-profile${ext}`;
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            profilePicturePath = filePath;

            // Ne pas persister la data URL brute en base
            delete profileData.profilePicture;
          }
        } catch {
          return new AppResponse({
            message: "Image de profil invalide (base64)",
            statusCode: 400,
            code: "INVALID_PROFILE_PICTURE",
            success: false,
          }).send(res);
        }
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
}

module.exports = new UserController();
