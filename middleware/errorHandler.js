/* eslint-disable no-unused-vars */
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  // Erreur métier (AppError)
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { details: err.details });
    const response = {
      success: false,
      code: err.errorCode,
      message: err.userMessage || err.message || "Une erreur est survenue.",
    };

    if (err.details != null) response.details = err.details;
    return res.status(err.statusCode).json(response);
  }

  // Sequelize Errors
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message).join(", ");
    logger.error(`[VALIDATION ERROR] ${messages}`);
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: messages,
    });
  }

  if (err.name === "SequelizeConnectionError") {
    logger.error(`[DATABASE CONNEXION ERROR] ${err.message}`);
    return res.status(500).json({
      success: false,
      code: "DATABASE_CONNEXION_ERROR",
      message:
        "Impossible de se connecter à la base de données. Vérifiez votre connexion et vos paramètres.",
      details: err.message,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0].path;
    const value = err.errors[0].value;
    const message = `The value '${value}' for field '${field}' must be unique.`;
    logger.error(`[UNIQUE CONSTRAINT ERROR] ${message}`);
    return res.status(400).json({
      success: false,
      code: "UNIQUE_CONSTRAINT_ERROR",
      message: message,
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    const message = `Foreign key constraint error on field '${err.index}'.`;
    logger.error(`[FOREIGN KEY CONSTRAINT ERROR] ${message}`);
    return res.status(400).json({
      succes: false,
      code: "FOREIGN_KEY_CONSTRAINT_ERROR",
      message: message,
    });
  }

  if (err.name === "SequelizeDatabaseError") {
    logger.error(`[DATABASE ERROR] ${err.message}`);
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "A database error occurred.",
      details: err.message,
    });
  }

  // JWT ERRORS
  if (err.name === "JsonWebTokenError") {
    logger.error(`[JWT ERROR] ${err.message}`);
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "The token is invalid. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    logger.error(`[TOKEN EXPIRED] ${err.message}`);
    return res.status(401).json({
      success: false,
      code: "TOKEN_EXPIRED",
      message: "Your token has expired. Please log in again.",
    });
  }

  if (
    err.message &&
    err.message.includes("secretOrPrivateKey must have a value")
  ) {
    logger.error(`[JWT SECRET MISSING] ${err.message}`);
    return res.status(500).json({
      success: false,
      code: "JWT_SECRET_MISSING",
      message: "Error interne : JWT secret is not configured.",
    });
  }

  // Erreurs HTTP standards
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    logger.error(`[BAD REQUEST] ${err.message}`);
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      message: "Malformed JSON in request body.",
    });
  }

  if (err.name === "UnauthorizedError") {
    logger.warn(`[UNAUTHORIZED] ${err.message}`);
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Access denied. Please authenticate.",
    });
  }

  // Autres erreurs non gérées
  logger.error(`Unhandled Error: ${err.stack || err}`);
  res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "An internal server error occurred.",
  });
};
