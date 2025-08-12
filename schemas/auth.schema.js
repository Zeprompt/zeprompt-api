const { z } = require("zod");

// Schéma pour l'enregistrement
const registerSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
    })
    .max(50, {
      message: "Le nom d'utilisateur ne peut pas dépasser 50 caractères",
    })
    .trim(),

  email: z
    .string()
    .email({ message: "Format d'email invalide" })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/[A-Z]/, {
      message: "Le mot de passe doit contenir au moins une majuscule",
    })
    .regex(/[0-9]/, {
      message: "Le mot de passe doit contenir au moins un chiffre",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Le mot de passe doit contenir au moins un caractère spécial",
    }),
});

// Schéma pour la connexion
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Format d'email invalide" })
    .trim()
    .toLowerCase(),

  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
