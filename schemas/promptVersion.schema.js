const { z } = require("zod");

const allowedContentTypes = ["text", "pdf"];

const createPromptVersionSchema = z
  .object({
    promptId: z
      .string()
      .uuid({ message: "L'ID du prompt doit être un UUID valide" }),
    versionNumber: z.number().int().positive().optional(), // sera calculé si non fourni
    versionDate: z.date().optional(), // sera généré automatiquement

    title: z
      .string()
      .min(5, { message: "Le titre doit contenir au moins 5 caractères" })
      .max(100, { message: "Le titre ne peut pas dépasser 100 caractères" })
      .trim(),

    content: z
      .string()
      .max(5000, {
        message: "Le contenu ne peut pas dépasser 5000 caractères",
      }),

    contentType: z.enum(allowedContentTypes, {
      errorMap: () => ({
        message: `Le type de contenu doit être l'un de : ${allowedContentTypes.join(
          ", "
        )}`,
      }),
    }),

    pdfFilePath: z.string().optional().nullable(),
    pdfFileSize: z.number().int().optional().nullable(),
    pdfOriginalName: z.string().optional().nullable(),

    imageUrl: z.string().url().optional().nullable(),

    isPublic: z.boolean().optional().default(true),
    userId: z
      .string()
      .uuid({ message: "L'ID de l'utilisateur doit être un UUID valide" }),

    hash: z.string(),
  })
  .refine(
    (data) =>
      data.contentType === "text"
        ? !!data.content && data.content.trim().length > 0
        : true,
    {
      message: "Le champ 'content' est requis pour un contenu texte",
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
        "Les champs 'pdfFilePath' et 'pdfOriginalName' sont requis pour un contenu PDF",
      path: ["pdfFilePath"],
    }
  );

module.exports = {
  createPromptVersionSchema,
};
