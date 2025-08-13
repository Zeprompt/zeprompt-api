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
}

module.exports = new AuthController();
