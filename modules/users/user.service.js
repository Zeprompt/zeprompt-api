const CacheService = require("../../services/cacheService");
const userRepository = require("./user.repository");
const fileUploadService = require("../../services/fileUploadService");
const logger = require("../../utils/logger");

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
  async updateUser(user, data) {
    return userRepository.update(user, data);
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
      const parsed = JSON.parse(cached);
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
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

  /**
   * Met à jour le profil d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} profileData - Données du profil à mettre à jour
   * @param {string} profilePicturePath - Chemin de la photo de profil (optionnel)
   * @returns {Promise<Object>} Utilisateur mis à jour
   */
  async updateUserProfile(userId, profileData, profilePicturePath = null) {
    const updateData = { ...profileData };
    
    // Ajouter le chemin de la photo si fourni
    if (profilePicturePath) {
      updateData.profilePicture = profilePicturePath;
      
      // Ajouter à la queue pour optimisation de l'image
      try {
        await fileUploadService.processProfilePicture(
          profilePicturePath,
          userId,
          {
            username: profileData.username || updateData.username,
            uploadedAt: new Date().toISOString(),
          }
        );
        logger.info(` Image de profil ajoutée à la queue pour traitement: ${userId}`);
      } catch (error) {
        logger.error(` Erreur lors de l'ajout de l'image à la queue: ${error.message}`);
        // Continue quand même, l'image sera utilisée même si le traitement échoue
      }
    }
    
    // Convertir les chaînes vides en null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        updateData[key] = null;
      }
    });
    
    const updatedUser = await userRepository.updateUserProfile(userId, updateData);
    
    if (!updatedUser) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Retourner l'utilisateur sans le mot de passe
    const userJson = updatedUser.toJSON();
    delete userJson.password;
    return userJson;
  }
}

module.exports = new UserService();
