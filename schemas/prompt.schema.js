const { z } = require("zod");

const allowedContentTypes = ["text", "pdf"];
const allowedStatus = ["activé", "désactivé"];

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

    imagePath: z
      .string()
      .optional()
      .nullable(),

    imageOriginalName: z
      .string()
      .optional()
      .nullable(),

    imageFileSize: z
      .number()
      .optional()
      .nullable(),

    imagePath2: z
      .string()
      .optional()
      .nullable(),

    imageOriginalName2: z
      .string()
      .optional()
      .nullable(),

    imageFileSize2: z
      .number()
      .optional()
      .nullable(),

    tags: z
      .union([
        z.array(z.string()), // Tableau de strings (JSON)
        z.string().transform((str) => str.split(",").map((s) => s.trim())), // String séparé par virgules (Form-Data)
      ])
      .optional()
      .default([]),

    isPublic: z
      .union([
        z.boolean(), // Boolean direct (JSON)
        z.string().transform((str) => str === "true"), // String "true"/"false" (Form-Data)
      ])
      .optional()
      .default(true),

    status: z.enum(allowedStatus, {
      errorMap: () => ({
        message: `Le statut doit être l'un de : ${allowedStatus.join(", ")}`,
      }),
    }).optional().default("activé"),

    application: z
      .string()
      .max(100, { message: "L'application ne peut pas dépasser 100 caractères" })
      .optional()
      .nullable(),

    imageUrl: z.string().url().optional().nullable(),
    imageUrl2: z.string().url().optional().nullable(),
    pdfUrl: z.string().url().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    thumbnailUrl2: z.string().url().optional().nullable(),
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

    imagePath: z.string().optional().nullable(),

    imageOriginalName: z.string().optional().nullable(),

    imageFileSize: z.number().optional().nullable(),

    imagePath2: z.string().optional().nullable(),

    imageOriginalName2: z.string().optional().nullable(),

    imageFileSize2: z.number().optional().nullable(),

    tags: z.array(z.string()).optional(),

    isPublic: z.boolean().optional(),

    status: z.enum(allowedStatus, {
      errorMap: () => ({
        message: `Le statut doit être l'un de : ${allowedStatus.join(", ")}`,
      }),
    }).optional(),

    application: z
      .string()
      .max(100, { message: "L'application ne peut pas dépasser 100 caractères" })
      .optional()
      .nullable(),

    imageUrl: z.string().url().optional().nullable(),
    imageUrl2: z.string().url().optional().nullable(),
    pdfUrl: z.string().url().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    thumbnailUrl2: z.string().url().optional().nullable(),
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
