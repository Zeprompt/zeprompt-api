const userService = require("../users/user.service");
const { hashPassword, comparePassword } = require("../../utils/passwordUtils");
const EmailVerificationService = require("../../services/emailVerificationService");
const { generateToken } = require("../../utils/jwt");
const redisClient = require("../../config/redis");
const emailQueue = require("../../queues/emailQueue");
const generateResetPasswordEmailTemplate = require("../../templates/resentPasswordEmail");

class AuthService {
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
      user,
      emailResult,
    };
  }

  async login(data) {
    const { email, password } = data;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

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

    const token = await generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    };
  }

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
      user: result.user,
    };
  }

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

  async requestPasswordReset(email) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      const err = new Error("Utilisateur non trouvé.");
      err.statusCode = 404;
      throw err;
    }

    const resetToken = EmailVerificationService.generateVerificationToken();
    const redisKey = `password_reset:${user.email}`;
    await redisClient.set(redisKey, resetToken, "EX", 3000); // expire en 1h

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/api/auth/verify-password-reset-token?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const htmlContent = generateResetPasswordEmailTemplate({
      user: { username: user.username, email: user.email },
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
  }
}

module.exports = new AuthService();
