const AppError = require("../../utils/appError");

module.exports = {
  VERSION_NOT_FOUND: new AppError({
    message: "Version introuvable.",
    userMessage: "Cette version n'existe pas.",
    statusCode: 404,
    errorCode: "VERSION_NOT_FOUND",
  }),

  VERSION_DELETE_FAILED: new AppError({
    message: "Impossible de supprimer cette version.",
    userMessage: "Suppression échouée.",
    statusCode: 400,
    errorCode: "VERSION_DELETE_FAILED",
  }),

  VERSION_NUMBER_REQUIRED: new AppError({
    message: "Le numéro de version est requis.",
    userMessage: "Veuillez spécifier un numéro de version.",
    statusCode: 400,
    errorCode: "VERSION_NUMBER_REQUIRED",
  }),

  FORBIDDEN: new AppError({
    message: "Vous n'avez pas les droits pour effectuer cette actions.",
    userMessage: "Accès refusé.",
    statusCode: 403,
    errorCode: "FORBIDDEN",
  }),
};
