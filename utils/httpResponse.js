const logger = require("./logger");
/**
 * Classe utilitaire pour standardiser les réponses HTTP de l'API.
 * Fournit des méthodes statiques pour envoyer des réponses de succès ou d'erreur.
 */
class HttpResponse {
  /**
   * Envoie une réponse d'erreur HTTP standardisée.
   * @param {Object} res - Objet de la réponse HTTP.
   * @param {number} status - Code HTTP à retourner.
   * @param {string} resource - Nom de la ressource concernée (ex: "user").
   * @param {string} action - Action effectuée (ex: "creating", "updating").
   * @param {Error} [error] - Objet erreur à logger (optionnel).
   */
  static sendError(res, status, resource, action, error) {
    if (error) logger.error(`Error ${action} ${resource}: ${error.stack || error}`);
    res.status(status).json({
      message: `Internal server error while ${action} ${resource}.`,
    });
  }

  /**
   * Envoie une réponse de succès HTTP standardisée.
   * @param {Object} res - Objet de la réponse HTTP.
   * @param {number} status - Code HTTP à retourner.
   * @param {string} resource - Nom de la ressource concernée (ex: "user").
   * @param {string} action - Action effectuée (ex: "created", "updated").
   * @param {Object} [data] - Données à retourner (optionnel).
   */
  static sendSuccess(res, status, resource, action, data) {
    logger.info(`Success ${action} ${resource} : ${JSON.stringify(data)}`);
    res.status(status).json({
      message: `${resource} successfully ${action}.`,
      data: data,
    });
  }
}

module.exports = HttpResponse;