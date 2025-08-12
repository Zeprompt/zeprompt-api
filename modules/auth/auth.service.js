const userService = require("../users/user.service");
const { hashPassword } = require("../../utils/passwordUtils");
const EmailVerificationService = require("../../services/emailVerificationService");

class AuthService {
  async register(data) {
    const { email, username, password } = data;

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email already is use");
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
}

module.exports = new AuthService();
