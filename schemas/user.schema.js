const { z } = require('zod');

const updateUserSchema = z.object({
  username: z.string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères")
    .optional(),
  email: z.string()
    .email("Format d'email invalide")
    .optional()
});

module.exports = { updateUserSchema };