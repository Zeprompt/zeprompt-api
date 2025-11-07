const fs = require('fs');
const path = require('path');

/**
 * Template d'email de vérification d'adresse email
 *
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 * @param {string} data.verificationUrl - URL de vérification
 */
const generateEmailVerificationTemplate = (data) => {
  const { user, verificationUrl } = data;

  // Lire le fichier HTML template
  const templatePath = path.join(__dirname, '../docs/emailVerification.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  // Remplacer les placeholders
  htmlTemplate = htmlTemplate.replace(/\{\{username\}\}/g, user.username || '');
  htmlTemplate = htmlTemplate.replace(/\{\{verificationUrl\}\}/g, verificationUrl || '');

  return htmlTemplate;
};

module.exports = generateEmailVerificationTemplate;
