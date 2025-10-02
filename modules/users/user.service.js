const CacheService = require("../../services/cacheService");
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

  async getUserProfile(userId) {
    const user = await userRepository.findUserProfile(userId);
    if (!user) return null;
    const stats = await userRepository.getUserStats(userId);
    return {
      ...user.toJSON(),
      stats,
    };
  }

  async getLeaderBoard(limit = 20) {
    const cachKey = `leaderboard:top${limit}`;
    const cached = await CacheService.get(cachKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const leaderBoard = await userRepository.getLeaderBoard(limit);
    const formatted = leaderBoard.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      promptCount: parseInt(user.get("promptCount"), 10) || 0,
      likeCount: parseInt(user.get("likeCount"), 10) || 0,
      viewCount: parseInt(user.get("viewsCount"), 10) || 0,
      score: parseInt(user.get("score"), 10) || 0,
    }));
    await CacheService.set(cachKey, JSON.stringify(formatted), 600);
    return formatted;
  }
}

module.exports = new UserService();
