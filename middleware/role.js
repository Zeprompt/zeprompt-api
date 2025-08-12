/**
 * Middleware de vérification du rôle Admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Accès refusé: droits d'administrateur requis" });
  }
};

module.exports = { isAdmin };