const httpResponse = require("../../utils/httpResponse");
const authService = require("./auth.service");

class AuthController {
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      httpResponse.sendSuccess(res, 201, "user", "registered", user);
    } catch (error) {
      httpResponse.sendError(res, 500, "user", "registration", error);
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      httpResponse.sendSuccess(res, 200, "auth", "login", result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      httpResponse.sendError(res, statusCode, "auth", "login", error.message);
    }
  }
}

module.exports = new AuthController();
