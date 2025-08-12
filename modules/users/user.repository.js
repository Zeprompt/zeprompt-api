const { User } = require("../../models");

/**
 * Repository pour la gestion des utilisateurs.
 */
class UserRepository {
  /**
   * Récupère tous les utilisateurs.
   * @returns {Promise<Array>} Liste des utilisateurs.
   */
  async findAll() {
    return await User.findAll();
  }

  /**
   * Recherche un utilisateur par son identifiant.
   * @param {number} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null.
   */
  async findById(id) {
    return await User.findByPk(id);
  }

  /**
   * 
   * @param {string} email 
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null.
   */
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  /**
   * Crée un nouvel utilisateur.
   * @param {Object} data - Données de l'utilisateur à créer.
   * @returns {Promise<Object>} Utilisateur créé.
   */
  async create(data) {
    return User.create(data);
  }

  /**
   * Met à jour un utilisateur existant.
   * @param {number} id - Identifiant de l'utilisateur.
   * @param {Object} data - Nouvelles données de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur mis à jour ou null si non trouvé.
   */
  async update(id, data) {
    const user = await this.findById(id);
    if (!user) return null;
    return user.update(data);
  }

  /**
   * Supprime un utilisateur.
   * @param {number} id - Identifiant de l'utilisateur.
   * @returns {Promise<Object|null>} Utilisateur supprimé ou null si non trouvé.
   */
  async delete(id) {
    const user = await this.findById(id);
    if (!user) return null;
    await user.destroy();
    return user;
  }
}

module.exports = new UserRepository();
