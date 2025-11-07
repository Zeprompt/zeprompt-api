const fs = require('fs');
const path = require('path');

/**
 * Template d'email pour annoncer les mises à jour de la plateforme
 *
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 */
const generatePlatformUpdateTemplate = (data) => {
  const { user } = data;

  // Lire le fichier HTML template
  const templatePath = path.join(__dirname, '../docs/platformUpdate.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  // Remplacer les placeholders
  htmlTemplate = htmlTemplate.replace(/\{\{username\}\}/g, user.username || 'utilisateur');

  return htmlTemplate;
};

module.exports = generatePlatformUpdateTemplate;

