const userService = require("../users/user.service");
const { hashPassword, comparePassword } = require("../../utils/passwordUtils");
const EmailVerificationService = require("../../services/emailVerificationService");
const { generateToken } = require("../../utils/jwt");
const emailQueue = require("../../queues/emailQueue");
const generateResetPasswordEmailTemplate = require("../../templates/resentPasswordEmail");
const CacheService = require("../../services/cacheService");
const Errors = require("./auth.errors");
const { normalizeImageUrl } = require("../../utils/imageUrlNormalizer");

/**
 * Service d'authentification
 * ---------------------------
 * Gère toutes les opérations liées à l'authentification et à la gestion des utilisateurs :
 * - Inscription et connexion
 * - Vérification d'email
 * - Réinitialisation de mot de passe
 * - Gestion du profil utilisateur
 * - Activation/désactivation et suppression/restauration de comptes
 */
class AuthService {
  /**
   * Formate un utilisateur avant de le retourner au client
   * @param {Object} user - Objet utilisateur brut venant de la base de données
   * @returns {Object} - Utilisateur formaté sans les informations sensibles (ex: mot de passe)
   */

  _formateUser(user) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.emailVerified,
      profilePicture: normalizeImageUrl(user.profilePicture),
      githubUrl: user.githubUrl || null,
      linkedinUrl: user.linkedinUrl || null,
      whatsappNumber: user.whatsappNumber || null,
      twitterUrl: user.twitterUrl || null,
    };
  }

  /**
   * Vérifie si l'email est disponible avant la création d'un compte
   * @param {string} email - Email à vérifier
   * @throws {Error} - Si l'email est déjà utilisé
   */
  async _ensureEmailIsAvailable(email) {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) throw Errors.emailAlreadyUsed();
  }

  /**
   * Crée un nouvel utilisateur en base de données
   * @param {Object} param0 - Contient email, username et mot de passe hashé
   * @returns {Object} - L'utilisateur nouvellement créé
   */
  async _createNewUser({ email, username, hashedPassword }) {
    const newUser = await userService.createUser({
      email,
      username,
      password: hashedPassword,
      emailVerified: false,
    });
    return newUser;
  }

  /**
   * Envoie un email de vérification à l'utilisateur
   * @param {Object} user - Utilisateur cible
   * @returns {Promise} - Résultat de l'envoi d'email
   */
  async _sendVerficationEmail(user) {
    const testMode = process.env.NODE_ENV !== "production";
    return await EmailVerificationService.sendVerificationEmail(user, testMode);
  }

  /**
   * Recherche un utilisateur par email et lance une erreur si non trouvé
   * @param {string} email - Email à rechercher
   * @throws {Error} - Si l'utilisateur n'existe pas
   */
  async _findUserByEmailOrThrow(email) {
    const user = await userService.getUserByEmail(email);
    if (!user) throw Errors.userNotFound();
    return user;
  }

  /**
   * Recherche un utilisateur par ID et lance une erreur si non trouvé
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Utilisateur trouvé
   * @throws {Error} - Si l'utilisateur n'existe pas
   */
  async _findUserByIdOrThrow(userId) {
    const user = await userService.getUserById(userId);
    if (!user) throw Errors.userNotFound();
    return user;
  }

  /**
   * Vérifie si le compte utilisateur est actif et non supprimé
   * @param {Object} user - Utilisateur
   * @throws {Error} - Si le compte est désactivé ou supprimé
   */
  async _checkUserStatus(user) {
    if (!user.active) throw Errors.userDeactivated();
    if (user.deletedAt) throw Errors.userDeleted();
  }

  /**
   * Génère un token JWT pour un utilisateur donné
   * @param {Object} user - Utilisateur
   * @returns {string} - JWT signé
   */
  _generateJWT(user) {
    return generateToken(user);
  }

  /**
   * Génère un token pour la réinitialisation du mot de passe
   * et le stocke dans Redis avec une durée de validité
   * @param {string} email - Email de l'utilisateur
   * @returns {string} - Token généré
   */
  async _generateResetToken(email) {
    const resetToken = EmailVerificationService.generateVerificationToken();
    const redisKey = `password_reset:${email}`;
    await CacheService.set(redisKey, resetToken, 3600); // Expire en 1h
    return resetToken;
  }

  /**
   * Construit l'URL de réinitialisation de mot de passe
   * @param {string} email - Email de l'utilisateur
   * @param {string} token - Token de réinitialisation
   * @returns {string} - URL complète
   */
  _buildResetUrl(email, token) {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return `${baseUrl}/api/auth/verify-password-reset-token?token=${token}&email=${encodeURIComponent(
      email
    )}`;
  }

  /**
   * Ajoute un email de réinitialisation de mot de passe à la queue pour envoi
   * @param {Object} user - Utilisateur cible
   * @param {string} resetUrl - URL de réinitialisation
   */
  async _queueResetPasswordEmail(user, resetUrl) {
    const htmlContent = generateResetPasswordEmailTemplate({
      user: {
        username: user.username,
        email: user.email,
      },
      resetUrl,
    });

    const testMode = process.env.NODE_ENV !== "production";

    await emailQueue.add(
      "sendPasswordResetEmail",
      {
        to: user.email,
        subject: "Réinitialisation de mot de passe - ZePrompt",
        htmlContent,
        options: { testMode, recipientName: user.username },
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 5,
        backoff: { type: "exponential", delay: 60000 },
      }
    );
  }

  /**
   * Filtre les champs autorisés pour la mise à jour du profil
   * @param {Object} data - Données à filtrer
   * @param {Array<string>} allowedFields - Champs autorisés
   * @returns {Object} - Données filtrées
   */
  _filterAllowedFields(data, allowedFields) {
    return Object.keys(data)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
  }

  // =============================
  // MÉTHODES PUBLIQUES
  // =============================

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} data - email, username, password
   * @returns {Object} - Utilisateur et résultat de l'envoi d'email
   */
  async register(data) {
    const { email, username, password } = data;
    await this._ensureEmailIsAvailable(email);
    const hashedPassword = await hashPassword(password);
    const user = await this._createNewUser({ email, username, hashedPassword });
    const emailResult = await this._sendVerficationEmail(user);
    return {
      user: this._formateUser(user),
      emailResult,
    };
  }

  /**
   * Connexion d'un utilisateur
   * @param {Object} data - email, password
   * @returns {Object} - Utilisateur et JWT
   */
  async login(data) {
    const { email, password } = data;
    const user = await this._findUserByEmailOrThrow(email);
    await this._checkUserStatus(user);
    if (!user.emailVerified) throw Errors.emailNotVerified();
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw Errors.invalidCredentials();
    const token = this._generateJWT(user);
    return {
      user: this._formateUser(user),
      token,
    };
  }

  /**
   * Vérification d'un email via le token envoyé
   * @param {string} token - Token de vérification
   * @param {string} email - Email de l'utilisateur
   * @returns {Object} - Message et utilisateur vérifié
   */
  async verifyEmail(token, email) {
    if (!token || !email) throw Errors.tokenRequired();
    const result = await EmailVerificationService.verifyEmailToken(
      token,
      email
    );
    if (!result.success) throw Errors.verificationFailed();
    return {
      message: result.message,
      user: this._formateUser(result.user),
    };
  }

  /**
   * Renvoyer un email de vérification à l'utilisateur
   * @param {string} email - Email de l'utilisateur
   * @returns {Object} - Message et résultat d'envoi
   */
  async resendVerificationEmail(email) {
    const user = await this._findUserByEmailOrThrow(email);
    if (user.emailVerified) throw Errors.emailAlreadyVerified();
    return {
      message: "Email de vérification renvoyé.",
      emailResult: await this._sendVerficationEmail(user),
    };
  }

  /**
   * Demander la réinitialisation du mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Object} - Message de confirmation
   */
  async requestPasswordReset(email) {
    const user = await this._findUserByEmailOrThrow(email);
    const resetToken = await this._generateResetToken(user.email);
    const resetUrl = this._buildResetUrl(user.email, resetToken);
    await this._queueResetPasswordEmail(user, resetUrl);
    return { message: "Email de réinitialisation envoyé." };
  }

  /**
   * Vérifier la validité du token de réinitialisation
   * @param {string} token - Token envoyé par email
   * @param {string} email - Email de l'utilisateur
   * @returns {Object} - Validation
   */
  async verifyPasswordResetToken(token, email) {
    const redisKey = `password_reset:${email}`;
    const storedToken = await CacheService.get(redisKey);
    if (!storedToken || storedToken !== token) throw Errors.invalidToken();
    return { valid: true, email, token: storedToken };
  }

  /**
   * Réinitialiser le mot de passe
   * @param {string} token - Token valide
   * @param {string} email - Email de l'utilisateur
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Object} - Message de confirmation
   */
  async resetPassword(token, email, newPassword) {
    this.verifyPasswordResetToken(token, email);
    const hashedPassword = await hashPassword(newPassword);
    const user = await this._findUserByEmailOrThrow(email);
    await userService.updateUser(user, { password: hashedPassword });
    await CacheService.del(`password_reset:${email}`);
    return {
      succes: true,
      message: "Mot de passe mis à jour avec succès.",
    };
  }

  /**
   * Désactiver un compte utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Message et utilisateur mis à jour
   */
  async disableUser(userId) {
    const user = await this._findUserByIdOrThrow(userId);
    if (!user.active) throw Errors.userAlreadyDeactivated();
    const updatedUser = await userService.updateUser(user, { active: false });
    return {
      message: "Compte désactivé avec succès",
      user: this._formateUser(updatedUser),
    };
  }

  /**
   * Réactiver un compte utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Message et utilisateur mis à jour
   */
  async enableUser(userId) {
    const user = await this._findUserByIdOrThrow(userId);
    if (user.active) throw Errors.userAlreadyActivated();
    const updatedUser = await userService.updateUser(user, { active: true });
    return {
      message: "Compte réactivé avec succès.",
      user: this._formateUser(updatedUser),
    };
  }

  /**
   * Supprimer un compte (soft delete)
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Message et utilisateur mis à jour
   */
  async softDeleteUser(userId) {
    const user = await this._findUserByIdOrThrow(userId);
    if (user.deletedAt) throw Errors.userAlreadyDeleted();
    const deletedUser = await userService.updateUser(user, {
      deletedAt: new Date(),
    });
    return {
      message: "Compte supprimé (soft delete)",
      user: this._formateUser(deletedUser),
    };
  }

  /**
   * Restaurer un compte supprimé
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Message et utilisateur restauré
   */
  async restoreUser(userId) {
    const user = await this._findUserByIdOrThrow(userId);
    if (!user.deletedAt) throw Errors.userNotDeleted();
    const restoredUser = await userService.updateUser(user, {
      deletedAt: null,
    });
    return {
      message: "Compte restauré avec succès.",
      user: this._formateUser(restoredUser),
    };
  }

  /**
   * Récupérer le profil d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Profil de l'utilisateur
   */
  async getUserProfile(userId) {
    const profile = await userService.getUserProfile(userId);
    if (!profile) throw Errors.userNotFound();
    return {
      message: "Profil récupéré avec succès.",
      user: profile,
    };
  }

  /**
   * Mettre à jour le profil d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} - Message et profil mis à jour
   */
  async updateUserProfile(userId, updateData) {
    const allowedFields = [
      "username",
      "email",
      "profilePicture",
      "githubUrl",
      "linkedinUrl",
      "whatsappNumber",
      "twitterUrl",
    ];
    const dataToUpdate = this._filterAllowedFields(updateData, allowedFields);

    // Récupérer l'utilisateur d'abord
    const user = await this._findUserByIdOrThrow(userId);

    // Mettre à jour l'utilisateur
    const updatedUser = await userService.updateUser(user, dataToUpdate);
    if (!updatedUser) throw Errors.updateFailed();
    return {
      message: "Profile mis à jour avec succès.",
      user: this._formateUser(updatedUser),
    };
  }
}

module.exports = new AuthService();
