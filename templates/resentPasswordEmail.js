const fs = require('fs');
const path = require('path');

/**
 * Template d'email de réinitialisation de mot de passe
 *
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 * @param {string} data.resetUrl - URL de réinitialisation
 */
const generateResetPasswordEmailTemplate = (data) => {
  const { user, resetUrl } = data;

  // Lire le fichier HTML template
  const templatePath = path.join(__dirname, '../docs/resetPassword.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  // Remplacer les placeholders
  htmlTemplate = htmlTemplate.replace(/\{\{username\}\}/g, user.username || '');
  htmlTemplate = htmlTemplate.replace(/\{\{resetUrl\}\}/g, resetUrl || '');

  return htmlTemplate;
};

module.exports = generateResetPasswordEmailTemplate;
