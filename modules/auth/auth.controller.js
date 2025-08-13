const httpResponse = require("../../utils/httpResponse");
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
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      httpResponse.sendSuccess(res, 201, "user", "registered", user);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "user",
        "registration",
        error.message
      );
    }
  }

  /**
   * Connecte un utilisateur existant.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   * @returns {Promise<void>}
   */
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      httpResponse.sendSuccess(res, 200, "auth", "login", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(res, statusCode, "auth", "login", error.message);
    }
  }

  /**
   * Vérifie l'email d'un utilisateur via un token.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   * @returns {Promise<void>}
   */
  async verifyEmail(req, res) {
    try {
      const { token, email } = req.query;
      const result = await authService.verifyEmail(token, email);

      httpResponse.sendSuccess(res, 200, "auth", "verifyEmail", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "auth",
        "email verification",
        error.message
      );
    }
  }

  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerificationEmail(email);
      httpResponse.sendSuccess(
        res,
        200,
        "auth",
        "resendVerificationEmail",
        result
      );
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "auth",
        "resendVerificationEmail",
        error.message
      );
    }
  }

  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      httpResponse.sendSuccess(
        res,
        200,
        "auth",
        "requestPasswordReset",
        result
      );
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "auth",
        "requestPasswordReset",
        error.message
      );
    }
  }

  async verifyPasswordResetToken(req, res) {
    try {
      const { token, email } = req.query;
      const result = await authService.verifyPasswordResetToken(token, email);
      httpResponse.sendSuccess(
        res,
        200,
        "auth",
        "verificationPasswordResetToken",
        result
      );
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "auth",
        "verifyPasswordResetToken",
        error.message
      );
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, email, newPassword } = req.body;
      const result = await authService.resetPassword(token, email, newPassword);
      httpResponse.sendSuccess(res, 200, "auth", "resetPassword", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "auth",
        "resetPassword",
        error.message
      );
    }
  }

  async disableUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await authService.disableUser(userId);
      httpResponse.sendSuccess(res, 200, "user", "disable", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(res, statusCode, "user", "disable", error.message);
    }
  }

  async enableUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await authService.enableUser(userId);
      httpResponse.sendSuccess(res, 200, "user", "enable", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(res, statusCode, "user", "enable", error.message);
    }
  }

  async softDeleteUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await authService.softDeleteUser(userId);
      httpResponse.sendSuccess(res, 200, "user", "softDelete", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(
        res,
        statusCode,
        "user",
        "softDelete",
        error.message
      );
    }
  }

  async restoreUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await authService.restoreUser(userId);
      httpResponse.sendSuccess(res, 200, "user", "restore", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(res, statusCode, "user", "restore", error.message);
    }
  }
}

module.exports = new AuthController();
