const redisClient = require("../config/redis");
const generateWelcomeEmailTemplate = require("../templates/welcomeEmail");
const emailQueue = require("../queues/emailQueue");

class WelcomeEmailService {
  /**
   * Envoie un email de bienvenue à l'utilisateur lors de sa première connexion
   * @param {Object} user - Utilisateur cible
   * @param {boolean} testMode - Mode test (n'envoie pas réellement l'email)
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendWelcomeEmail(user, testMode = false) {
    try {
      // Vérifier si l'email de bienvenue a déjà été envoyé
      const redisKey = `welcome_email_sent:${user.email}`;
      const alreadySent = await redisClient.get(redisKey);

      if (alreadySent) {
        return {
          success: false,
          message: "Email de bienvenue déjà envoyé",
          skipped: true,
        };
      }

      // Génère le contenu HTML de l'email
      const htmlContent = generateWelcomeEmailTemplate({
        user: {
          username: user.username,
          email: user.email,
        },
      });

      await emailQueue.add(
        "sendWelcomeEmail",
        {
          to: user.email,
          subject: "Bienvenue sur ZePrompt ! 🎉",
          htmlContent,
          options: {
            testMode,
            recipientName: user.username,
          },
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 60000,
          },
        }
      );

      // Marquer l'email comme envoyé dans Redis (expire après 30 jours)
      await redisClient.set(redisKey, "true", "EX", 2592000); // 30 jours

      return {
        success: true,
        message: "Email de bienvenue mis en queue pour envoi",
      };
    } catch (error) {
      console.error("Erreur dans sendWelcomeEmail : ", error);
      return {
        success: false,
        error: "Erreur interne lors de l'envoi de l'email de bienvenue",
      };
    }
  }
}

module.exports = WelcomeEmailService;

