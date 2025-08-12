const fetch = require("node-fetch");

class EmailUtils {
  // Valeur par défaut
  static DEFAULT_TEST_MODE = process.env.NODE_ENV !== "production";
  static FROM_EMAIL =
    process.env.MAILZEET_FROM_EMAIL || "notification@zeprompt.com";
  static FROM_NAME = process.env.MAILZEET_FROM_NAME || "ZePrompt";
  static API_KEY = process.env.MAILZEET_API_KEY;

  static async verifyMailzeetConfiguration(
    bypassVerification = false,
    testMode = EmailUtils.DEFAULT_TEST_MODE
  ) {
    if (testMode || bypassVerification) {
      console.log("✅ Vérification Mailzeet ignorée en mode test");
      return true;
    }

    if (!EmailUtils.API_KEY) {
      console.error(
        "❌ Mailzeet API Key non définie dans les variables d'environnement"
      );
      return false;
    }

    try {
      const response = await fetch("https://api.mailzeet.com/v1/mails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${EmailUtils.API_KEY}`,
        },
        body: JSON.stringify({
          sender: {
            email: EmailUtils.FROM_EMAIL,
            name: EmailUtils.FROM_NAME,
          },
          recipients: [
            {
              email: "test@example.com",
              name: "Test User",
            },
          ],
          subject: "Test de configuration Mailzeet",
          html: "<p>Ceci est un test de configuration Mailzeet.</p>",
          text: "Ceci est un test de configuration Mailzeet.",
        }),
      });

      if (response.ok) {
        console.log("✅ Configuration Mailzeet vérifiée avec succès");
        return true;
      } else {
        console.error(
          `❌ Erreur lors de la vérification de la configuration Mailzeet : ${response.statusText}`
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Exception lors de la vérification de la configuration Mailzeet :",
        error
      );
      return false;
    }
  }

  static async sendEmail(to, subject, htmlContent, options = {}) {
    const isTestMode =
      options.testMode !== undefined
        ? options.testMode
        : EmailUtils.DEFAULT_TEST_MODE;

    if (isTestMode) {
      console.log("MODE TEST - Email non envoyé");
      console.log(`À: ${to}`);
      console.log(`Sujet: ${subject}`);
      console.log("Contenu HTML:", htmlContent.substring(0, 100) + "...");
      return { success: true, messageId: "test-" + Date.now(), testMode: true };
    }

    const isConfigValid = await EmailUtils.verifyMailzeetConfiguration(
      options.bypassVerification,
      isTestMode
    );
    if (!isConfigValid) {
      return {
        success: false,
        error: {
          message: "Mailzeet configuration is invalid or not verified.",
        },
      };
    }

    try {
      const payload = {
        sender: {
          email: EmailUtils.FROM_EMAIL,
          name: EmailUtils.FROM_NAME,
        },
        recipients: [
          {
            email: to,
            name: options.recipientName || "",
          },
        ],
        subject,
        html: htmlContent,
        text: options.textContent || htmlContent.replace(/<[^>]+>/g, ""),
      };

      if (options.templateId) payload.template_id = options.templateId;
      if (options.params) payload.params = options.params;
      if (options.cc?.length)
        payload.cc = options.cc.map((email) => ({ email }));
      if (options.bcc?.length)
        payload.bcc = options.bcc.map((email) => ({ email }));

      const response = await fetch("https://api.mailzeet.com/v1/mails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${EmailUtils.API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(
          `❌ Erreur lors de l'envoi de l'email : ${
            result.message || response.statusText
          }`
        );
        return { success: false, error: result };
      }

      console.log(
        "✅ Email envoyé avec succès via Mailzeet :",
        result.data?.id
      );
      return {
        success: true,
        messageId: result.data?.id,
        data: result.data,
      };
    } catch (error) {
      console.error(
        "Exception lors de l'envoi de l'email via Mailzeet :",
        error
      );
      return {
        success: false,
        error: {
          message: "Exception lors de l'envoi de l'email via Mailzeet.",
          details: error.message,
        },
      };
    }
  }
}

module.exports = EmailUtils;