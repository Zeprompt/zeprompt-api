// middleware/validate.js
const validate = (schema) => (req, res, next) => {

  // Vérification plus robuste du schema
  if (!schema) {
    console.error("Schema est null ou undefined");
    return res.status(500).json({
      status: "error",
      message: "Invalid validation schema: schema is null or undefined",
    });
  }

  if (typeof schema !== "object") {
    console.error("Schema n'est pas un objet");
    return res.status(500).json({
      status: "error",
      message: "Invalid validation schema: schema is not an object",
    });
  }

  // Vérification de la méthode parse/parseAsync (pour Zod)
  if (
    !schema.parse &&
    !schema.parseAsync &&
    !schema.safeParse &&
    !schema.safeParseAsync
  ) {
    console.error("Schema ne contient aucune méthode de validation Zod");
    return res.status(500).json({
      status: "error",
      message: "Invalid validation schema: missing Zod validation methods",
    });
  }

  try {
    // Utilisation de safeParse pour éviter les exceptions
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Vérification de la structure de l'erreur
      let errors = [];

      if (
        result.error &&
        result.error.issues &&
        Array.isArray(result.error.issues)
      ) {
        // Formatage des erreurs Zod standard
        errors = result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
          code: issue.code,
          received: issue.received || undefined,
        }));
      } else if (result.error && result.error.message) {
        // Erreur simple avec juste un message
        errors = [
          {
            message: result.error.message,
            path: [],
            code: "unknown",
          },
        ];
      } else {
        // Erreur inconnue
        errors = [
          {
            message: "Unknown validation error",
            path: [],
            code: "unknown",
          },
        ];
      }

      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors,
      });
    }

    // Remplacer le body avec la valeur validée et transformée
    req.body = result.data;
    next();
  } catch (error) {
    console.error("Erreur lors de la validation :", error);
    return res.status(500).json({
      status: "error",
      message: "Internal validation error",
      details: error.message,
    });
  }
};

module.exports = validate;
