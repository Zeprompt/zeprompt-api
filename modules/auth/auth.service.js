const userService = require("../users/user.service");
const { hashPassword, comparePassword } = require("../../utils/passwordUtils");
const EmailVerificationService = require("../../services/emailVerificationService");
const { generateToken } = require("../../utils/jwt");
const redisClient = require("../../config/redis");
const emailQueue = require("../../queues/emailQueue");
const generateResetPasswordEmailTemplate = require("../../templates/resentPasswordEmail");
const AppError = require("../../utils/appError");

class AuthService {
  // Inscription
  async register(data) {
    const { email, username, password } = data;

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new AppError({
        message: "Email already in use",
        statusCode: 409,
        errorCode: "EMAIL_IN_USE",
        userMessage: "Cet email est déjà utilisé.",
      });
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
      throw new AppError({
        message: "Email non trouvé",
        statusCode: 401,
        errorCode: "INVALID_EMAIL",
        userMessage: "Aucun utilisateur avec cet email.",
      });
    }

    // Vérifie status du compte
    await this.checkUserStatus(user);

    if (!user.emailVerified) {
      throw new AppError({
        message: "Email not verified",
        statusCode: 403,
        errorCode: "EMAIL_NOT_VERIFIED",
        userMessage: "Veuillez vérifier votre email avant de vous connecter.",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError({
        message: "Invalid email or password",
        statusCode: 401,
        errorCode: "INVALID_CREDENTIALS",
        userMessage: "Email ou mot de passe incorrect.",
      });
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
      throw new AppError({
        message: "Token et email requis",
        statusCode: 400,
        errorCode: "TOKEN_REQUIRED",
        userMessage: "Token et email requis.",
      });
    }

    // Vérifier si le token est valide
    const result = await EmailVerificationService.verifyEmailToken(
      token,
      email
    );

    if (!result.success) {
      throw new AppError({
        message: "Vérification échouée.",
        statusCode: 403,
        errorCode: "VERIFICATION_FAILD",
        userMessage: "Vérification échouée.",
      });
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
      throw new AppError({
        message: "Utilisateur non trouvé.",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND",
        userMessage: "Utilisateur non trouvé.",
      });
    }

    // Vérifie si l'email est déjà validé
    if (user.emailVerified) {
      throw new AppError({
        message: "Email déjà vérifié.",
        statusCde: 400,
        errorCode: "EMAIL_VERIFIED",
        userMessage: "Email déjà vérifié.",
      });
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
      throw new AppError({
        message: "Utilisateur non trouvé.",
        userMessage: "Utilisateur non trouvé",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND",
      });
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
      throw new AppError({
        message: "Token invalide ou expiré.",
        userMessage: "Token invalide ou expiré.",
        statusCode: 400,
        errorCode: "INVALID_TOKEN",
      });
    }

    return { valid: true, email };
  }

  // Changer le mot de passe d'un compte
  async resetPassword(token, email, newPassword) {
    await this.verifyPasswordResetToken(token, email);

    const hashedPassword = await hashPassword(newPassword);
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new AppError({
        message: "Utilisateur non trouvé.",
        userMessage: "Utilisateur non trouvé.",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND",
      });
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
      throw new AppError({
        message: "Utilisateur déjà désactivé.",
        userMessage: "Utilisateur déjà désactivé.",
        statusCode: 400,
        errorCode: "USER_ALREADY_DEACTIVATE",
      });
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
      throw new AppError({
        message: "Utilisateur déjà actif.",
        userMessage: "Utilisateur déjà actif.",
        statusCode: 400,
        errorCode: "USER_ALREADY_ACTIVE",
      });
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
      throw new AppError({
        message: "Utilisateur déjà supprimé.",
        userMessage: "Utilisateur déjà supprimé.",
        statusCode: 400,
        errorCode: "USER_ALREADY_DELETE",
      });
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
      throw new AppError({
        message: "Utilisateur non supprimé.",
        userMessage: "Utilisateur non supprimé.",
        statusCode: 400,
        errorCode: "USER_NOT_DELETE",
      });
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
      throw new AppError({
        message: "Compte désactivée.",
        userMessage: "Votre compte est désactivé. Contactez l'administration.",
        statusCode: 400,
        errorCode: "USER_DELETED",
      });
    }

    if (user.deletedAt) {
      throw new AppError({
        message: "Ce compte a été supprimé.",
        userMessage: "Ce compte a été supprimé.",
        statusCode: "403",
        errorCode: "ACCESS_REQUIRED",
      });
    }

    return true;
  }

  async getUserProfile(userId) {
    const user = await userService.getUserById(userId);

    if (!user) {
      throw new AppError({
        message: "Utilisateur non trouvé.",
        userMessage: "Utilisateur non trouvé.",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND",
      });
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
      throw new AppError({
        message: "Mise à jour impossible.",
        userMessage: "Mise à jour impossible.",
        statusCode: 400,
        errorCode: "IMPOSSIBLE_TO_UPDATE",
      });
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
