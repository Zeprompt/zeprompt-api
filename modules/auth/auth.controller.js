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
}

module.exports = new AuthController();
