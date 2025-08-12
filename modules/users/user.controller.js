const userService = require("./user.service");
const httpResponse = require("../../utils/httpResponse");

/**
 * Contrôleur pour la gestion des utilisateurs.
 * Gère les requêtes HTTP liées aux utilisateurs et fait le lien avec le service utilisateur.
 */
class UserController {
  /**
   * Récupère la liste de tous les utilisateurs.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   */
  async getAll(req, res) {
    try {
      const users = await userService.getAllUser();
      httpResponse.sendSuccess(res, 200, "user", "fetched", users);
    } catch (error) {
      httpResponse.sendError(res, 500, "user", "fetching", error);
    }
  }

  /**
   * Récupère un utilisateur par son identifiant.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   */
  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found !" });
      httpResponse.sendSuccess(res, 200, "user", "fetched by Id", user);
    } catch (error) {
      httpResponse.sendError(res, 500, "user", "fetching by Id", error);
    }
  }

  /**
   * Crée un nouvel utilisateur.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   */
  async create(req, res) {
    try {
      const user = await userService.createUser(req.body);
      httpResponse.sendSuccess(res, 201, "user", "created", user);
    } catch (error) {
      httpResponse.sendError(res, 500, "user", "creating", error);
    }
  }

  /**
   * Met à jour un utilisateur existant.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   */
  async update(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: "User not found ! " });
      httpResponse.sendSuccess(res, 200, "user", "updated", user);
    } catch (error) {
      httpResponse.sendError(res, 500, "user", "updating", error);
    }
  }

  /**
   * Supprime un utilisateur.
   * @param {Object} req - Objet de la requête HTTP.
   * @param {Object} res - Objet de la réponse HTTP.
   */
  async delete(req, res) {
    try {
      const user = await userService.deleteUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found ! " });
      httpResponse.sendSuccess(res, 200, "user", "deleted", user);
    } catch (error) {
      httpResponse.sendError(res, 500, "user", "deleting", error);
    }
  }
}

module.exports = new UserController();
