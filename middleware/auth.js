const AppError = require("../utils/appError");
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

  /**
   * Middleware d'authentification optionnelle
   * Permet les requêtes avec OU sans token JWT
   * Si un token est fourni et valide, req.user sera défini
   * Si pas de token ou token invalide, req.user sera undefined (mais la requête continue)
   */
  static optionalAuthenticate(req, res, next) {
    try {
      // Si pas d'Authorization header, continuer sans authentification
      if (!req.headers || !req.headers.authorization) {
        logger.debug("Requête sans authentification (utilisateur anonyme)");
        req.user = undefined;
        return next();
      }

      const token = req.headers.authorization.split(" ")[1];
      
      // Si pas de token après "Bearer ", continuer sans authentification
      if (!token) {
        logger.debug("Token manquant après 'Bearer' (utilisateur anonyme)");
        req.user = undefined;
        return next();
      }

      // Tenter de vérifier le token
      req.user = verifyToken(token);
      logger.debug(`Utilisateur authentifié : ${req.user.email || req.user.id}`);
      next();
    } catch (error) {
      // En cas d'erreur de vérification du token, continuer quand même
      // (l'utilisateur sera traité comme anonyme)
      logger.warn(`Token invalide, requête traitée comme anonyme : ${error.message}`);
      req.user = undefined;
      next();
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

  static validate(schema) {
    return (req, res, next) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        let details = [];
        
        if (error.issues && Array.isArray(error.issues)) {
          details = error.issues.map(err => ({
            field: err.path ? err.path.join('.') : 'unknown', 
            message: err.message || 'Erreur de validation',
            code: err.code || 'unknown',
            received: err.received
          }));
        } else {
          details = [{
            field: 'unknown',
            message: error.message || 'Erreur de validation inconnue',
            code: 'unknown'
          }];
        }
        
        return next(
          new AppError({
            message: "Validation error",
            userMessage: "Données invalides",
            statusCode: 400,
            errorCode: "VALIDATION_ERROR",
            details,
          })
        );
      }
    };
  }
}

module.exports = AuthMiddleware;