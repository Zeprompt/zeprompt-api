const crypto = require("crypto");
const redisClient = require("../config/redis");
const userService = require("../modules/users/user.service");
const generateEmailVerificationTemplate = require("../templates/emailVerification");
const emailQueue = require("../queues/emailQueue");

class EmailVerificationService {
  /**
   * Génère un token de vérification aléatoire.
   * @returns {string} Token de vérification.
   */
  static generateVerificationToken() {
    // Génère un token sécurisé de 32 octets en hexadécimal
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Envoie un email de vérification à l'utilisateur.
   * @param {Object} user - Utilisateur cible.
   * @param {boolean} testMode - Mode test (n'envoie pas réellement l'email).
   * @returns {Promise<Object>} Résultat de l'envoi.
   */
  static async sendVerificationEmail(user, testMode = false) {
    try {
      const verificationToken = this.generateVerificationToken();

      // Stocke le token dans Redis avec expiration (1 heure)
      const redisKey = `email_verification:${user.email}`;
      await redisClient.set(redisKey, verificationToken, "EX", 3600);

      // Génère l'URL de vérification à envoyer à l'utilisateur
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(
        user.email
      )}`;

      // Génère le contenu HTML de l'email
      const htmlContent = generateEmailVerificationTemplate({
        user: {
          username: user.username,
          email: user.email,
        },
        verificationUrl,
      });

      await emailQueue.add("sendVerificationEmail", {
        to: user.email,
        subject: "Vérifiez votre adresse email - ZePrompt",
        htmlContent,
        options: {
          testMode,
          recipientName: user.username,
        },
      }, {
        removeOnComplete: true,  // Supprime le job après succès
        removeOnFail: true,     // On garde l'échec pour pouvoir le réessayer
        attempts: 5,             // Nombre de tentatives avant abandon
        backoff: {
            type: "exponential", // Attente progressive entre les tentatives
            delay: 60000         // 1 min avant la premièe nouvelle tentative
        }
      });

      return {
        success: true,
        message: "Email de vérification mis en queue pour envoi",
      };
    } catch (error) {
      console.error("Erreur dans sendVerificationEmail : ", error);
      return {
        success: false,
        error: "Erreur interne lors de l'envoie de l'email de vérification",
      };
    }
  }

  /**
   * Vérifie le token de vérification reçu par email.
   * @param {string} token - Token reçu.
   * @param {string} email - Email de l'utilisateur.
   * @returns {Promise<Object>} Résultat de la vérification.
   */
  static async verifyEmailToken(token, email) {
    try {
      // Récupère le token stocké dans Redis
      const redisKey = `email_verification:${email}`;
      const storedToken = await redisClient.get(redisKey);

      // Vérifie la validité du token
      if (!storedToken) {
        return {
          success: false,
          error: "Token de vérification expiré ou invalide",
        };
      }

      if (storedToken !== token) {
        return {
          success: false,
          error: "Token de vérification invalide",
        };
      }

      // Supprime le token de Redis après vérification
      await redisClient.del(redisKey);

      // Met à jour l'utilisateur comme vérifié
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: "Utilisateur non trouvé",
        };
      }

      await userService.updateUser(user.id, { emailVerified: true });

      return {
        success: true,
        message: "Email vérifié avec succès",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: true,
        },
      };
    } catch (error) {
      console.error("Erreur dans verifyEmailToken : ", error);
      return {
        success: false,
        error: "Erreur interne lors de la vérification de l'email",
      };
    }
  }
}

module.exports = EmailVerificationService;
