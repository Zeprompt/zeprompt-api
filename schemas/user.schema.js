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

const updateUserProfileSchema = z.object({
  username: z.string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères")
    .optional(),
  email: z.string()
    .email("Format d'email invalide")
    .optional(),
  profilePicture: z.string()
    .optional(),
  githubUrl: z.string()
    .url("URL GitHub invalide")
    .regex(/^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/, "URL GitHub invalide (format: https://github.com/username)")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z.string()
    .url("URL LinkedIn invalide")
    .regex(/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/, "URL LinkedIn invalide (format: https://linkedin.com/in/username)")
    .optional()
    .or(z.literal("")),
  twitterUrl: z.string()
    .url("URL Twitter invalide")
    .regex(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w]+\/?$/, "URL Twitter/X invalide (format: https://twitter.com/username ou https://x.com/username)")
    .optional()
    .or(z.literal("")),
  whatsappNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Numéro WhatsApp invalide (format international: +33612345678)")
    .optional()
    .or(z.literal("")),
}).strict(); // ← Rejette les champs inconnus

module.exports = { 
  updateUserSchema,
  updateUserProfileSchema 
};