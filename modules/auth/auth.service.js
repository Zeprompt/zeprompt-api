const userService = require("../users/user.service");
const { hashPassword, comparePassword } = require("../../utils/passwordUtils");
const EmailVerificationService = require("../../services/emailVerificationService");
const { generateToken } = require("../../utils/jwt");

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
}

module.exports = new AuthService();
