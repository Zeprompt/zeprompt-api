/**
 * Middleware de validation avec Zod
 * @param {Object} schema - Schéma Zod pour la validation
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        error: "Validation error",
        details: {
          name: error.name,
          message: error.message,
        }
      });
    }
  };
};

module.exports = validate;
