const userRepository = require("./user.repository");

/**
 * Service pour la gestion des utilisateurs.
 * Fournit une couche d'abstraction entre les contrôleurs et le repository utilisateur.
 */
class UserService {
  /**
   * Récupère tous les utilisateurs.
   * @returns {Promise<Array>} Liste des utilisateurs.
   */
  async getAllUser() {
    return userRepository.findAll();
  }

  /**
   * Récupère un utilisateur par son identifiant.
   * @param {number} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null.
   */
  async getUserById(id) {
    return userRepository.findById(id);
  }

  /**
   * Récupère un utilisateur par son email.
   * @param {string} email - Email de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null.
   */
  async getUserByEmail(email) {
    return userRepository.findByEmail(email);
  }

  /**
   * Crée un nouvel utilisateur.
   * @param {Object} data - Données du nouvel utilisateur.
   * @returns {Promise<Object>} Utilisateur créé.
   */
  async createUser(data) {
    return userRepository.create(data);
  }

  /**
   * Met à jour un utilisateur existant.
   * @param {number} id - Identifiant de l'utilisateur.
   * @param {Object} data - Nouvelles données de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur mis à jour ou null si non trouvé.
   */
  async updateUser(id, data) {
    return userRepository.update(id, data);
  }

  /**
   * Supprime un utilisateur.
   * @param {number} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur supprimé ou null si non trouvé.
   */
  async deleteUser(id) {
    return userRepository.delete(id);
  }
}

module.exports = new UserService();
