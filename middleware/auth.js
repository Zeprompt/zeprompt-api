const { verifyToken } = require("../utils/jwt");

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  // Check if being used properly as middleware
  if (!req || !res || !next) {
    console.error("Authentication middleware not used correctly");
    throw new Error(
      "Authentication middleware must be used as Express middleware"
    );
  }

  try {
    // Vérification de l'existence des headers
    if (!req.headers) {
      return res.status(401).json({ error: "Headers manquants" });
    }

    // Extraction du token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header manquant" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token manquant" });
    }

    // Vérification du token
    req.user = verifyToken(token);
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    res.status(401).json({
      error: "Authentification échouée",
      details: error.message,
    });
  }
};

module.exports = authenticate;
