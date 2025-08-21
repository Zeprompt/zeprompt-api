const userService = require("../users/user.service");
const { hashPassword, comparePassword } = require("../../utils/passwordUtils");
const EmailVerificationService = require("../../services/emailVerificationService");
const { generateToken } = require("../../utils/jwt");
const redisClient = require("../../config/redis");
const emailQueue = require("../../queues/emailQueue");
const generateResetPasswordEmailTemplate = require("../../templates/resentPasswordEmail");

class AuthService {
  // Inscription
  async register(data) {
    const { email, username, password } = data;

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await hashPassword(password);
    const user = await userService.createUser({
      email,
      username,
      password: hashedPassword,
      emailVerified: false,
    });

    const testMode = process.env.NODE_ENV !== "production";
    const emailResult = await EmailVerificationService.sendVerificationEmail(
      user,
      testMode
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        emailVerified: user.emailVerified,
      },
      emailResult,
    };
  }

  // Connexion
  async login(data) {
    const { email, password } = data;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

    // Vérifie status du compte
    await this.checkUserStatus(user);

    if (!user.emailVerified) {
      const err = new Error("Email non vérifié");
      err.statusCode = 403;
      throw err;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const err = new Error("Mot de passe incorrect");
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  // Vérifier le token qui a été envoyé par email
  async verifyEmail(token, email) {
    if (!token || !email) {
      const err = new Error("Token et email requis");
      err.statusCode = 400;
      throw err;
    }

    // Vérifier si le token est valide
    const result = await EmailVerificationService.verifyEmailToken(
      token,
      email
    );

    if (!result.success) {
      const err = new Error(result.error || "Vérification échouée.");
      err.statusCode = 403;
      throw err;
    }

    return {
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
    };
  }

  // Renvoyer un mail de confirmation
  async resendVerificationEmail(email) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

    // Vérifie si l'email est déjà validé
    if (user.emailVerified) {
      const err = new Error("Email déjà vérifié.");
      err.statusCode = 400;
      throw err;
    }

    // Envoi dans la queue
    const testMode = process.env.NODE_ENV !== "production";
    const emailResult = await EmailVerificationService.sendVerificationEmail(
      user,
      testMode
    );

    return {
      message: "Email de vérification renvoyé.",
      emailResult,
    };
  }

  // Demander le changement d'un mot de passe
  async requestPasswordReset(email) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

    const resetToken = EmailVerificationService.generateVerificationToken();
    const redisKey = `password_reset:${user.email}`;
    await redisClient.set(redisKey, resetToken, "EX", 3600); // expire en 1h

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/api/auth/verify-password-reset-token?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const htmlContent = generateResetPasswordEmailTemplate({
      user: {
        username: user.username,
        email: user.email,
      },
      resetUrl,
    });

    // Détecte si on est en mode test
    const testMode = process.env.NODE_ENV !== "production";
    await emailQueue.add(
      "sendPasswordResetEmail",
      {
        to: user.email,
        subject: "Réinitialisation de mot de passe - ZePrompt",
        htmlContent,
        options: { testMode, recipientName: user.username },
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 5,
        backoff: { type: "exponential", delay: 60000 },
      }
    );

    return { message: "Email de réinitialisation envoyé." };
  }

  // Vérifier le token envoyé par email
  async verifyPasswordResetToken(token, email) {
    const redisKey = `password_reset:${email}`;
    const storedToken = await redisClient.get(redisKey);

    if (!storedToken || storedToken !== token) {
      const err = new Error("Token invalide ou expiré.");
      err.statusCode = 400;
      throw err;
    }

    return { valid: true, email };
  }

  // Changer le mot de passe d'un compte
  async resetPassword(token, email, newPassword) {
    await this.verifyPasswordResetToken(token, email);

    const hashedPassword = await hashPassword(newPassword);
    const user = await userService.getUserByEmail(email);
    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

    await userService.updateUser(user.id, { password: hashedPassword });
    await redisClient.del(`password_reset:${email}`);

    return {
      succes: true,
      message: "Mot de passe mis à jour avec succès.",
    };
  }

  // Désactiver un compte
  async disableUser(userId) {
    const user = await userService.getUserById(userId);
    if (!user.active) {
      const err = new Error("Utilisateur déjà désactivé.");
      err.statusCode = 400;
      throw err;
    }

    const updatedUser = await userService.updateUser(userId, { active: false });
    return {
      message: "Compte désactivé avec succès",
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        email: updatedUser.email,
        username: updatedUser.username,
        emailVerified: updatedUser.emailVerified,
      },
    };
  }

  // Réactiver un compte
  async enableUser(userId) {
    const user = await userService.updateUser(userId, { active: true });

    if (user.active) {
      const err = new Error("Utilisateur déjà actif.");
      err.statusCode = 400;
      throw err;
    }

    return {
      message: "Compte réactivé avec succès",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        emailVerified: user.emailVerified,
      },
    };
  }

  // Soft delete (marqer comme supprimé)
  async softDeleteUser(userId) {
    const user = await userService.getUserById(userId);

    if (user.deletedAt) {
      const err = new Error("Utilisateur déjà supprimé.");
      err.statusCode = 400;
      throw err;
    }

    const deletedUser = await userService.updateUser(userId, {
      deletedAt: new Date(),
    });
    return {
      message: "Compte supprimé (soft delete)",
      user: {
        id: deletedUser.id,
        role: deletedUser.role,
        email: deletedUser.email,
        username: deletedUser.username,
        emailVerified: deletedUser.emailVerified,
      },
    };
  }

  // Restaurer un compte supprimé
  async restoreUser(userId) {
    const user = await userService.updateUser(userId, { deletedAt: null });

    if (!user.deletedAt) {
      const err = new Error("Utilisateur non supprimé.");
      err.statusCode = 400;
      throw err;
    }

    return {
      message: "Compte restauré",
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
      },
    };
  }

  // Vérifier avant connexion
  async checkUserStatus(user) {
    if (!user.active) {
      const err = new Error(
        "Votre compte est désactivé. Contactez l'administration."
      );
      err.statusCode = 403;
      throw err;
    }

    if (user.deletedAt) {
      const err = new Error("Ce compte a été supprimé.");
      err.statusCode = 403;
      throw err;
    }

    return true;
  }

  async getUserProfile(userId) {
    const user = await userService.getUserById(userId);

    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

    return {
      message: "Profile récupéré avec succès",
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
      },
    };
  }

  async updateUserProfile(userId, updateData) {
    const allowedFields = ["username", "email", "avatar", "bio"];
    const dataToUpdate = {};

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        dataToUpdate[key] = updateData[key];
      }
    }

    const updatedUser = await userService.updateUser(userId, dataToUpdate);

    if (!updatedUser) {
      const err = new Error("Mise à jour impossible.");
      err.statusCode = 400;
      throw err;
    }

    return {
      message: "Profile mis à jour avec succès.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser?.avatar,
        bio: updatedUser?.bio,
      },
    };
  }
}

module.exports = new AuthService();
