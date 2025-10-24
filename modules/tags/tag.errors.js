const AppError = require("../../utils/appError");

module.exports = {
  TAG_NOT_FOUND: new AppError({
    message: "Tag non trouvé.",
    userMessage: "Aucun tag n'a été trouvé.",
    statusCode: 404,
    errorCode: "TAG_NOT_FOUND",
  }),

  TAG_ALREADY_EXIST: new AppError({
    message: "Tag existe déjà.",
    userMessage: "Un tag avec ce nom existe déjà.",
    statusCode: 409,
    errorCode: "TAG_ALREADY_EXIST",
  }),

  TAG_NAME_REQUIRED: new AppError({
    message: "Le champ 'name' est requis.",
    userMessage: "Veuillez renseigner un nom pour le tag.",
    statusCode: 400,
    errorCode: "TAG_NAME_REQUIRED",
  }),
};
