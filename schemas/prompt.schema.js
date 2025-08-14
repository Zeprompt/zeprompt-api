const { z } = require('zod');

// Schéma pour la création d'un prompt
const createPromptSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Le titre doit contenir au moins 5 caractères" })
    .max(100, { message: "Le titre ne peut pas dépasser 100 caractères" })
    .trim(),

  content: z
    .string()
    .min(10, { message: "Le contenu doit contenir au moins 10 caractères" })
    .max(5000, { message: "Le contenu ne peut pas dépasser 5000 caractères" }),

  tags: z.array(z.string()).optional().default([]),

  isPublic: z.boolean().optional().default(true),

  imageUrl: z.string().url().optional().nullable(),
});

// Schéma pour la mise à jour d'un prompt
const updatePromptSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Le titre doit contenir au moins 5 caractères" })
    .max(100, { message: "Le titre ne peut pas dépasser 100 caractères" })
    .trim()
    .optional(),

  content: z
    .string()
    .min(10, { message: "Le contenu doit contenir au moins 10 caractères" })
    .max(5000, { message: "Le contenu ne peut pas dépasser 5000 caractères" })
    .optional(),

  tags: z.array(z.string()).optional(),

  isPublic: z.boolean().optional(),

  imageUrl: z.string().url().optional().nullable(),
});

module.exports = {
  createPromptSchema,
  updatePromptSchema,
};
