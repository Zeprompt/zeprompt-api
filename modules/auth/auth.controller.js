const AppResponse = require("../../utils/appResponse");
const authService = require("./auth.service");

/**
 * Contrôleur pour la gestion de l'authentification des utilisateurs.
 * Gère l'inscription, la connexion et la vérification d'email.
 */
class AuthController {
  /**
   * Inscrit un nouvel utilisateur.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   * @returns {Promise<void>}
   */
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      new AppResponse({
        message: "Utilisateur créée avec succès.",
        statusCode: 201,
        data,
        success: true,
        code: "USER_CREATED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Connecte un utilisateur existant.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   * @returns {Promise<void>}
   */
  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      new AppResponse({
        message: "Utilisateur connecté avec succès.",
        statusCode: 200,
        data,
        success: true,
        code: "USER_LOGIN",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vérifie l'email d'un utilisateur via un token.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   * @returns {Promise<void>}
   */
  async verifyEmail(req, res, next) {
    try {
      const { token, email } = req.query;
      const data = await authService.verifyEmail(token, email);
      new AppResponse({
        message: "Utilisateur vérifié avec succès.",
        statusCode: 200,
        data,
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
        message: "Email de vérification envoyé avec succès.",
        statusCode: 200,
        data,
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
        message: "Password Request send.",
        statusCode: 200,
        data,
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
        message: "Reset password",
        statusCode: 200,
        data,
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
        message: "Utilisateur désactivée avec succès.",
        statusCode: 200,
        data,
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
        message: "Utilisateur activé avec succès.",
        statusCode: 200,
        data,
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
        message: "Utilisateur supprimée avec succès.",
        statusCode: 200,
        data,
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
        message: "Utilisateur retauré avec succès.",
        statusCode: 200,
        data,
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
        message: "Profile récupéré avec succès.",
        statusCode: 200,
        data,
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
        message: "Utilisateur mis à jour avec succès.",
        statusCode: 201,
        data,
        success: true,
        code: "USER_UPDATED",
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
