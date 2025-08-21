const { verifyToken } = require("../utils/jwt");
const logger = require("../utils/logger");

class AuthMiddleware {
  static authenticate(req, res, next) {
    try {
      if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({
          error: "Authorization header manquant.",
        });
      }

      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          error: "Token manquant.",
        });
      }

      req.user = verifyToken(token);
      next();
    } catch (error) {
      logger.error(`Erreur d'authentification : ${error.message}`);
      return res.status(401).json({
        error: "Authentification echouée.",
        details: error.message,
      });
    }
  }

  static isAdmin(req, res, next) {
    if (!req.user) {
      logger.error(
        "Utilisateur non authentifié (cet admin essaie d'accéder à une route admin)"
      );
      return res.status(401).json({
        error: "Utilisateur non authentifié.",
      });
    }

    if (req.user.role != "admin") {
      logger.error(`${req.user.email} n'est pas un admin.`);
      return res.status(403).json({
        error: "Accès refusé : droits administrateur requis",
      });
    }
    next();
  }
}
// Export a callable middleware function for Express
module.exports = (req, res, next) => AuthMiddleware.authenticate(req, res, next);
