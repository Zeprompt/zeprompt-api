const promptService = require("./prompt.service");
const AppResponse = require("../../utils/appResponse");

class PromptController {
  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async createPrompt(req, res, next) {
    try {
      const prompt = await promptService.createPrompt({
        ...req.body,
        userId: req.user.id,
      });

      new AppResponse({
        message: "Prompt créé avec succès.",
        statusCode: 201,
        data: { prompt },
        code: "PROMPT_CREATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async getPromptById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await promptService.getPromptById(id);
      new AppResponse({
        message: "Prompt récupéré avec succès.",
        statusCode: 200,
        data: { prompt: data },
        code: "PROMPT_RETURNED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getAllPublicPrompts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const data = await promptService.getAllPublicPrompts({ page, limit });
      new AppResponse({
        message: "Prompts récupéré avec succès.",
        statusCode: 200,
        data: data,
        code: "PROMPTS_RETUNED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getAllPromptsForAdmin(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const user = req.user;

      const data = await promptService.getAllPrompts({ page, limit, user });
      new AppResponse({
        message: "Prompts récupéré avec succès.",
        statusCode: 200,
        data: data,
        code: "PROMPTS_RETURNED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async updatePrompt(req, res, next) {
    try {
      const { id } = req.params;

      const updatedPrompt = await promptService.updatePrompt(
        id,
        req.body,
        req.user
      );
      new AppResponse({
        message: "Prompt mis à jour avec succès.",
        statusCode: 200,
        data: { prompt: updatedPrompt },
        code: "PROMPT_UPDATED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async deletePrompt(req, res, next) {
    try {
      const { id } = req.params;
      const deletePrompt = await promptService.deletePrompt(id, req.user);
      new AppResponse({
        message: deletePrompt.message,
        statusCode: 200,
        data: {},
        code: "PROMPT_DELETED",
        success: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromptController();
