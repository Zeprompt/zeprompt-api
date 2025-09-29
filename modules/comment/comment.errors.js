const AppError = require("../../utils/appError");

module.exports = {
  commentNotFound: () =>
    new AppError({
      message: "Le commentaire n'existe pas",
      statusCode: 404,
      errorCode: "COMMENT_NOT_FOUND",
      userMessage: "Commentaire introuvable",
    }),

  alreadyDeleted: () =>
    new AppError({
      message: "Ce commentaire a déjà été supprimé",
      statusCode: 400,
      errorCode: "COMMENT_ALREADY_DELETED",
      userMessage: "Ce commentaire a déjà été supprimé",
    }),

  cannotReplyToSelf: () =>
    new AppError({
      message:
        "Vous ne pouvez pas répondre à votre propre commentaire de cette façon",
      statusCode: 400,
      errorCode: "INVALID_REPLY",
      userMessage: "Réponse invalide au commentaire",
    }),

  unauthorizedAction: () =>
    new AppError({
      message:
        "Vous n'êtes pas autorisé à effectuer cette action sur ce commentaire",
      statusCode: 403,
      errorCode: "UNAUTHORIZED_COMMENT_ACTION",
      userMessage: "Action non autorisée sur ce commentaire",
    }),
};
