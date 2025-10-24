const AppError = require("../../utils/appError");

module.exports = {
  // --- Utilisateur ---
  alreadyLiked: () =>
    new AppError({
      message: "Vous avez déjà liké ce prompt",
      statusCode: 400,
      errorCode: "PROMPT_ALREADY_LIKED",
      userMessage: "Vous avez déjà liké ce prompt",
    }),

  neverLiked: () =>
    new AppError({
      message: "Vous n'avez pas encore liké ce prompt",
      statusCode: 400,
      errorCode: "PROMPT_NEVER_LIKED",
      userMessage: "Vous n'avez pas encore liké ce prompt",
    }),

  promptNotFound: () =>
    new AppError({
      message: "Le prompt n'existe pas",
      statusCode: 404,
      errorCode: "PROMPT_NOT_FOUND",
      userMessage: "Prompt introuvable",
    }),
};
