const { z } = require("zod");

const allowedContentTypes = ["text", "pdf"];

// Schéma pour la création d'un prompt
const createPromptSchema = z
  .object({
    title: z
      .string()
      .min(5, { message: "Le titre doit contenir au moins 5 caractères" })
      .max(100, { message: "Le titre ne peut pas dépasser 100 caractères" })
      .trim(),

    contentType: z.enum(allowedContentTypes, {
      errorMap: () => ({
        message: `Le type de contenu doit être l'un de : ${allowedContentTypes.join(
          ", "
        )}`,
      }),
    }),

    content: z
      .string()
      .max(5000, { message: "Le contenu ne peut pas dépasser 5000 caractères" })
      .optional()
      .nullable(),

    pdfFilePath: z
      .string({
        required_error: "Le chemin du fichier est requis pour un contenu PDF.",
      })
      .optional()
      .nullable(),

    pdfOriginalName: z
      .string({
        required_error:
          "Le nom original du fichier PDF est requis pour un contenu PDF.",
      })
      .optional()
      .nullable(),

    tags: z.array(z.string()).optional().default([]),

    isPublic: z.boolean().optional().default(true),

    imageUrl: z.string().url().optional().nullable(),
  })
  .refine(
    (data) =>
      data.contentType === "text"
        ? !!(data.content && data.content.trim().length > 0)
        : true,
    {
      message: "Le champ 'content' est requis pour un contenu texte.",
      path: ["content"],
    }
  )
  .refine(
    (data) =>
      data.contentType === "pdf"
        ? !!(data.pdfFilePath && data.pdfOriginalName)
        : true,
    {
      message:
        "Les champs 'pdfFilePath' et 'pdfOriginalName' sont requis pour un contenu PDF.",
      path: ["pdfFilePath"],
    }
  );

// Schéma pour la mise à jour d'un prompt (inspiré du createPromptSchema)
const updatePromptSchema = z
  .object({
    title: z
      .string()
      .min(5, { message: "Le titre doit contenir au moins 5 caractères" })
      .max(100, { message: "Le titre ne peut pas dépasser 100 caractères" })
      .trim()
      .optional(),

    contentType: z
      .enum(allowedContentTypes, {
        errorMap: () => ({
          message: `Le type de contenu doit être l'un de : ${allowedContentTypes.join(
            ", "
          )}`,
        }),
      })
      .optional(),

    content: z.string().max(5000).optional().nullable(),

    pdfFilePath: z.string().optional().nullable(),

    pdfOriginalName: z.string().optional().nullable(),

    tags: z.array(z.string()).optional(),

    isPublic: z.boolean().optional(),

    imageUrl: z.string().url().optional().nullable(),
  })
  .refine(
    (data) =>
      data.contentType === "text"
        ? !!(data.content && data.content.trim().length > 0)
        : true,
    {
      message: "Le champ 'content' est requis pour un contenu texte.",
      path: ["content"],
    }
  )
  .refine(
    (data) =>
      data.contentType === "pdf"
        ? !!(data.pdfFilePath && data.pdfOriginalName)
        : true,
    {
      message:
        "Les champs 'pdfFilePath' et 'pdfOriginalName' sont requis pour un contenu PDF.",
      path: ["pdfFilePath"],
    }
  );

module.exports = {
  createPromptSchema,
  updatePromptSchema,
};
