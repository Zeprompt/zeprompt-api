const AppResponse = require("../../utils/appResponse");
const authService = require("./auth.service");

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         username:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         active:
 *           type: boolean
 *           example: true
 *         deletedAt:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           example: null
 *       required: [id, username, email]
 *
 *     RegisterInput:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *       required: [username, email, password]
 *
 *     LoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *       required: [email, password]
 *
 *     ResetPasswordInput:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "abcdef123456"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "NewPassword123!"
 *       required: [token, email, newPassword]
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Email déjà utilisé
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Identifiants invalides
 */

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     summary: Vérifie l'adresse email via un token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: "abcdef123456"
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *       400:
 *         description: Token invalide ou manquant
 */

/**
 * @openapi
 * /api/auth/resend-verification-email:
 *   post:
 *     summary: Renvoyer un email de vérification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *             required: [email]
 *     responses:
 *       200:
 *         description: Email de vérification envoyé
 */

/**
 * @openapi
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Demander la réinitialisation du mot de passe
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *             required: [email]
 *     responses:
 *       200:
 *         description: Lien de réinitialisation envoyé
 */

/**
 * @openapi
 * /api/auth/verify-password-reset-token:
 *   get:
 *     summary: Vérifie un token de réinitialisation
 *     tags: [Password]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: "abcdef123456"
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *     responses:
 *       200:
 *         description: Token valide
 *       400:
 *         description: Token invalide ou expiré
 */

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 */

/**
 * @openapi
 * /api/auth/users/me:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @openapi
 * /api/auth/users/me:
 *   put:
 *     summary: Met à jour le profil de l'utilisateur connecté
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe_updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john_new@example.com"
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 */

/**
 * @openapi
 * /api/auth/users/{userId}/disabled:
 *   put:
 *     summary: Désactive un utilisateur (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Utilisateur désactivé
 */

/**
 * @openapi
 * /api/auth/users/{userId}/enable:
 *   put:
 *     summary: Réactive un utilisateur (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Utilisateur activé
 */

/**
 * @openapi
 * /api/auth/users/{userId}/soft-delete:
 *   delete:
 *     summary: Supprime un utilisateur (soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */

/**
 * @openapi
 * /api/auth/users/{userId}/restore:
 *   put:
 *     summary: Restaure un utilisateur supprimé
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Utilisateur restauré
 */

class AuthController {
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      new AppResponse({
        message: data.message,
        statusCode: 201,
        data: data.user,
        success: true,
        code: "USER_CREATED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: {
          user: data.user,
          token: data.token,
        },
        success: true,
        code: "USER_LOGIN",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token, email } = req.query;
      const data = await authService.verifyEmail(token, email);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.user,
        success: true,
        code: "USER_VERIFED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;
      const data = await authService.resendVerificationEmail(email);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.emailResult,
        success: true,
        code: "VERIFICATION_CODE_SEND",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const data = await authService.requestPasswordReset(email);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: {},
        success: true,
        code: "REQUEST_PASSWORD_RESET_SEND",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async verifyPasswordResetToken(req, res, next) {
    try {
      const { token, email } = req.query;
      const data = await authService.verifyPasswordResetToken(token, email);
      new AppResponse({
        message: "Mot de passe de vérification.",
        statusCode: 200,
        data,
        success: true,
        code: "VERIFICATION_PASSWORD_RESET_TOKEN",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, email, newPassword } = req.body;
      const data = await authService.resetPassword(token, email, newPassword);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.succes,
        success: true,
        code: "RESET_PASSWORD",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async disableUser(req, res, next) {
    try {
      const { userId } = req.params;
      const data = await authService.disableUser(userId);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.user,
        success: true,
        code: "USER_DEACTIVATE",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async enableUser(req, res, next) {
    try {
      const { userId } = req.params;
      const data = await authService.enableUser(userId);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.user,
        success: true,
        code: "USER_ACTIVATE",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async softDeleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const data = await authService.softDeleteUser(userId);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.user,
        success: true,
        code: "USER_DELETE",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async restoreUser(req, res, next) {
    try {
      const { userId } = req.params;
      const data = await authService.restoreUser(userId);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.user,
        success: true,
        code: "USER_RESTORED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const data = await authService.getUserProfile(req.user.id);
      new AppResponse({
        message: data.message,
        statusCode: 200,
        data: data.user,
        success: true,
        code: "PROFILE_RETURNED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await authService.updateUserProfile(req.user.id, req.body);
      new AppResponse({
        message: data.message,
        statusCode: 201,
        data: data.message,
        success: true,
        code: "USER_UPDATED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
