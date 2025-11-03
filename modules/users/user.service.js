const CacheService = require("../../services/cacheService");
const userRepository = require("./user.repository");
const logger = require("../../utils/logger");
const r2StorageService = require("../../services/r2StorageService");

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
    const { normalizeImageUrl } = require("../../utils/imageUrlNormalizer");
    const user = await userRepository.findUserProfile(userId);
    if (!user) return null;
    const stats = await userRepository.getUserStats(userId);
    const userJson = user.toJSON();
    return {
      ...userJson,
      profilePicture: normalizeImageUrl(userJson.profilePicture),
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
      profilePicture: user.profilePicture,
      role: user.role,
      createdAt: user.createdAt,
      promptCount: parseInt(user.get("promptCount"), 10) || 0,
      likeCount: parseInt(user.get("likeCount"), 10) || 0,
      viewCount: parseInt(user.get("viewCount"), 10) || 0,
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
    const fs = require("fs");
    const path = require("path");
    
    // Si un fichier est uploadé, uploader directement vers R2 de manière synchrone
    if (profilePicturePath && fs.existsSync(profilePicturePath)) {
      try {
        // Générer la clé R2
        const filename = path.basename(profilePicturePath);
        const r2Key = r2StorageService.generateKey("profiles", userId, filename);
        
        // Upload l'image optimisée avec thumbnail vers R2
        const result = await r2StorageService.uploadImageWithThumbnail(
          profilePicturePath,
          r2Key,
          {
            imageWidth: 800,
            imageHeight: 800,
            imageQuality: 85,
            thumbWidth: 150,
            thumbHeight: 150,
            thumbQuality: 80,
          }
        );
        
        // Mettre à jour l'URL R2 dans les données
        updateData.profilePicture = result.image.url;
        
        // Supprimer le fichier local après upload réussi
        if (fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
          logger.info(` Fichier local supprimé: ${profilePicturePath}`);
        }
        
        logger.info(` Image de profil uploadée vers R2: ${result.image.url}`);
      } catch (error) {
        logger.error(` Erreur lors de l'upload R2: ${error.message}`);
        throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
      }
    }
    
    // Convertir les chaînes vides en null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        updateData[key] = null;
      }
    });
    
    // Mettre à jour la DB avec les données (incluant l'URL R2 si uploadé)
    const updatedUser = await userRepository.updateUserProfile(userId, updateData);
    
    if (!updatedUser) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Retourner l'utilisateur sans le mot de passe
    const { normalizeImageUrl } = require("../../utils/imageUrlNormalizer");
    const userJson = updatedUser.toJSON();
    delete userJson.password;
    userJson.profilePicture = normalizeImageUrl(userJson.profilePicture);
    return userJson;
  }
}

module.exports = new UserService();
