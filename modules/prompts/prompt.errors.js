const AppError = require("../../utils/appError");

module.exports = {
  duplicatePrompt: () =>
    new AppError({
      message: "Ce prompt existe déjà dans la base.",
      userMessage: "Prompt existe déjà.",
      statusCode: 400,
      errorCode: "DUPLICATE_PROMPT",
    }),

  noPromptsFound: () =>
    new AppError({
      message: "Aucun prompts n'a été trouvé.",
      userMessage: "Aucun prompts n'a été trouvée.",
      statusCode: 404,
      errorCode: "PROMPTS_NOT_FOUND",
    }),
    
  idRequired: (action = "opération") =>
    new AppError({
      message: `Id est requis pour ${action}`,
      userMessage: "Id est requis.",
      statusCode: 400,
      errorCode: "ID_REQUIRED",
    }),

  invalidId: () =>
    new AppError({
      message: "L'identifiant fourni est invalide.",
      userMessage: "ID invalide.",
      statusCode: 400,
      errorCode: "INVALID_ID",
    }),

  notFound: (resource = "Ressource", id = null) =>
    new AppError({
      message: id
        ? `Aucun ${resource.toLowerCase()} trouvé avec l'id ${id}`
        : `${resource} introuvable.`,
      userMessage: `${resource} introuvable.`,
      statusCode: 404,
      errorCode: `${resource.toUpperCase()}_NOT_FOUND`,
    }),

  forbidden: () =>
    new AppError({
      message: "Vous n'avez pas les droits pour effectuer cette action.",
      userMessage: "Accès refusé.",
      statusCode: 403,
      errorCode: "FORBIDDEN",
    }),
};
