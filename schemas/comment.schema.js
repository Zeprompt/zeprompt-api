const { z } = require("zod");

// Schéma pour la création d'un commentaire
const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Le contenu du commentaire ne peut pas être vide." })
    .max(2000, { message: "Le commentaire ne peut pas dépasser 2000 caractères." })
    .trim(),

  parentId: z
    .string()
    .uuid({ message: "L'ID du commentaire parent doit être un UUID valide." })
    .optional()
    .nullable(),
});

// Schéma pour la mise à jour d'un commentaire
const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Le contenu du commentaire ne peut pas être vide." })
    .max(2000, { message: "Le commentaire ne peut pas dépasser 2000 caractères." })
    .trim(),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
