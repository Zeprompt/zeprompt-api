require('dotenv').config();
const db = require('../models');
const emailQueue = require('../queues/emailQueue');
const generatePlatformUpdateTemplate = require('../templates/platformUpdate');
const logger = require('../utils/logger');

/**
 * Script pour envoyer un email de mise à jour de la plateforme à tous les utilisateurs actifs
 * 
 * Usage: node scripts/send-platform-update-email.js
 */
async function sendPlatformUpdateEmailToAllUsers() {
  try {
    logger.info('🚀 Démarrage de l\'envoi des emails de mise à jour de la plateforme...');

    // Récupérer tous les utilisateurs actifs avec email vérifié
    const users = await db.User.findAll({
      where: {
        active: true,
        emailVerified: true,
        deletedAt: null,
      },
      attributes: ['id', 'username', 'email'],
    });

    logger.info(`📧 ${users.length} utilisateurs trouvés pour recevoir l'email`);

    if (users.length === 0) {
      logger.warn('⚠️  Aucun utilisateur trouvé. Arrêt du script.');
      process.exit(0);
    }

    // Demander confirmation avant d'envoyer
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      readline.question(
        `⚠️  Vous êtes sur le point d'envoyer un email à ${users.length} utilisateurs. Continuer ? (oui/non): `,
        resolve
      );
    });

    readline.close();

    if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o') {
      logger.info('❌ Envoi annulé par l\'utilisateur.');
      process.exit(0);
    }

    const testMode = process.env.NODE_ENV !== 'production';
    if (testMode) {
      logger.warn('⚠️  Mode test activé - les emails ne seront pas réellement envoyés');
    }

    let successCount = 0;
    let errorCount = 0;

    // Envoyer l'email à chaque utilisateur
    for (const user of users) {
      try {
        // Génère le contenu HTML de l'email
        const htmlContent = generatePlatformUpdateTemplate({
          user: {
            username: user.username,
            email: user.email,
          },
        });

        await emailQueue.add(
          'sendPlatformUpdateEmail',
          {
            to: user.email,
            subject: 'Nouvelles fonctionnalités disponibles sur ZePrompt ! 🎉',
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
              type: 'exponential',
              delay: 60000, // 1 minute
            },
          }
        );

        successCount++;
        logger.info(`✅ Email ajouté à la queue pour ${user.email} (${successCount}/${users.length})`);
      } catch (error) {
        errorCount++;
        logger.error(`❌ Erreur lors de l'ajout de l'email pour ${user.email}:`, error.message);
      }
    }

    logger.info('\n📊 Résumé de l\'envoi:');
    logger.info(`   ✅ Succès: ${successCount}`);
    logger.info(`   ❌ Erreurs: ${errorCount}`);
    logger.info(`   📧 Total: ${users.length}`);

    logger.info('\n✨ Les emails ont été ajoutés à la queue et seront envoyés progressivement.');
    logger.info('💡 Surveillez les logs du worker email pour suivre l\'envoi.');

    // Fermer la connexion à la base de données
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur fatale lors de l\'envoi des emails:', error);
    await db.sequelize.close();
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  sendPlatformUpdateEmailToAllUsers();
}

module.exports = sendPlatformUpdateEmailToAllUsers;

