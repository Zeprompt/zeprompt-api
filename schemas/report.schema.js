const { z } = require("zod");

/**
 * Schema pour le signalement d'un prompt
 * Optionnel : raison du signalement
 */
const reportPromptSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(3, "La raison doit contenir au moins 3 caractères")
      .max(500, "La raison ne peut pas dépasser 500 caractères")
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid("L'identifiant du prompt doit être un UUID valide"),
  }),
});

/**
 * Schema pour le signalement d'un commentaire
 * Optionnel : raison du signalement
 */
const reportCommentSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(3, "La raison doit contenir au moins 3 caractères")
      .max(500, "La raison ne peut pas dépasser 500 caractères")
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid("L'identifiant du commentaire doit être un UUID valide"),
  }),
});

module.exports = {
  reportPromptSchema,
  reportCommentSchema,
};
