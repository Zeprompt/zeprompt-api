const AppError = require("../../utils/appError");

module.exports = {
  // --- Utilisateur ---
  userNotFound: () =>
    new AppError({
      message: "Utilisateur non trouvé.",
      statusCode: 404,
      errorCode: "USER_NOT_FOUND",
      userMessage: "Utilisateur non trouvé.",
    }),

  updateFailed: () =>
    new AppError({
      message: "Mise à jour impossible.",
      statusCode: 400,
      errorCode: "IMPOSSIBLE_TO_UPDATE",
      userMessage: "Mise à jour impossible.",
    }),

  // --- Auth / Email ---
  emailAlreadyUsed: () =>
    new AppError({
      message: "Email déjà utilisé.",
      statusCode: 409,
      errorCode: "EMAIL_IN_USE",
      userMessage: "Cet email est déjà utilisé.",
    }),

  emailAlreadyVerified: () =>
    new AppError({
      message: "Email déjà vérifié.",
      statusCode: 400,
      errorCode: "EMAIL_ALREADY_VERIFIED",
      userMessage: "Email déjà vérifié.",
    }),

  emailNotVerified: () =>
    new AppError({
      message: "Email non vérifié.",
      statusCode: 403,
      errorCode: "EMAIL_NOT_VERIFIED",
      userMessage: "Veuillez vérifier votre email avant de vous connecter.",
    }),

  // --- Connexion ---
  invalidCredentials: () =>
    new AppError({
      message: "Identifiants invalides.",
      statusCode: 401,
      errorCode: "INVALID_CREDENTIALS",
      userMessage: "Identifiants incorrects. Veuillez réessayer.",
    }),

  // --- Tokens / Vérifications ---
  tokenRequired: () =>
    new AppError({
      message: "Token et email requis.",
      statusCode: 400,
      errorCode: "TOKEN_REQUIRED",
      userMessage: "Token et email requis.",
    }),

  verificationFailed: () =>
    new AppError({
      message: "Vérification échouée.",
      statusCode: 403,
      errorCode: "VERIFICATION_FAILED",
      userMessage: "Vérification échouée.",
    }),

  invalidToken: () =>
    new AppError({
      message: "Token invalide ou expiré.",
      statusCode: 400,
      errorCode: "INVALID_TOKEN",
      userMessage: "Token invalide ou expiré.",
    }),

  // --- Statut compte utilisateur ---
  userDeactivated: () =>
    new AppError({
      message: "Compte désactivé.",
      statusCode: 400,
      errorCode: "USER_DEACTIVATED",
      userMessage: "Votre compte est désactivé. Contactez l'administration.",
    }),

  userDeleted: () =>
    new AppError({
      message: "Ce compte a été supprimé.",
      statusCode: 403,
      errorCode: "USER_DELETED",
      userMessage: "Ce compte a été supprimé.",
    }),

  userAlreadyDeactivated: () =>
    new AppError({
      message: "Utilisateur déjà désactivé.",
      statusCode: 400,
      errorCode: "USER_ALREADY_DEACTIVATED",
      userMessage: "Utilisateur déjà désactivé.",
    }),

  userAlreadyActivated: () =>
    new AppError({
      message: "Utilisateur déjà actif.",
      statusCode: 400,
      errorCode: "USER_ALREADY_ACTIVATED",
      userMessage: "Utilisateur déjà actif.",
    }),

  userAlreadyDeleted: () =>
    new AppError({
      message: "Utilisateur déjà supprimé.",
      statusCode: 400,
      errorCode: "USER_ALREADY_DELETED",
      userMessage: "Utilisateur déjà supprimé.",
    }),

  userNotDeleted: () =>
    new AppError({
      message: "Utilisateur non supprimé.",
      statusCode: 400,
      errorCode: "USER_NOT_DELETED",
      userMessage: "Utilisateur non supprimé.",
    }),
};
