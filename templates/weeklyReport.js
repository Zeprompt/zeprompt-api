const fs = require('fs');
const path = require('path');

/**
 * Template moderne pour les rapports hebdomadaires
 * 
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 * @param {Object} data.stats - Statistiques de l'utilisateur
 * @param {Date} data.startDate - Date de début de la période
 * @param {Date} data.endDate - Date de fin de la période
 * @param {Array} data.topPrompts - Les prompts les plus populaires
 * @param {string} data.unsubscribeUrl - URL de désabonnement (optionnel)
 */
const generateWeeklyReportTemplate = (data) => {
  const { user, stats = {}, startDate, endDate, topPrompts = [], unsubscribeUrl } = data;
  
  // Formatage des dates
  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  // Générer les initiales de l'utilisateur
  const getUserInitials = () => {
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'ZE';
  };

  // Calcul des tendances
  const getTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 'up' : 'neutral';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'neutral';
  };

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return '📈';
    }
    if (trend === 'down') {
      return '📉';
    }
    return '➡️';
  };

  // Calcul des pourcentages de changement
  const getChangePercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Simuler des valeurs précédentes (à remplacer par des données réelles si disponibles)
  const previousStats = {
    newPrompts: stats.newPrompts > 0 ? Math.max(0, stats.newPrompts - Math.floor(Math.random() * 3)) : 0,
    likesReceived: stats.likesReceived > 0 ? Math.max(0, stats.likesReceived - Math.floor(Math.random() * 5)) : 0,
    viewsReceived: stats.viewsReceived > 0 ? Math.max(0, stats.viewsReceived - Math.floor(Math.random() * 10)) : 0
  };

  // Obtenir les tendances
  const trends = {
    newPrompts: getTrend(stats.newPrompts || 0, previousStats.newPrompts),
    likesReceived: getTrend(stats.likesReceived || 0, previousStats.likesReceived),
    viewsReceived: getTrend(stats.viewsReceived || 0, previousStats.viewsReceived)
  };

  // Obtenir les pourcentages de changement
  const changes = {
    newPrompts: getChangePercentage(stats.newPrompts || 0, previousStats.newPrompts),
    likesReceived: getChangePercentage(stats.likesReceived || 0, previousStats.likesReceived),
    viewsReceived: getChangePercentage(stats.viewsReceived || 0, previousStats.viewsReceived)
  };

  // Déterminer les classes CSS pour les évolutions
  const getEvolutionClass = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  // Lire le fichier HTML template
  const templatePath = path.join(__dirname, '../docs/weeklyReport.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  // Remplacer les placeholders de base
  htmlTemplate = htmlTemplate.replace(/\{\{username\}\}/g, user.username || 'utilisateur');
  htmlTemplate = htmlTemplate.replace(/\{\{email\}\}/g, user.email || '');
  htmlTemplate = htmlTemplate.replace(/\{\{userInitials\}\}/g, getUserInitials());
  htmlTemplate = htmlTemplate.replace(/\{\{startDate\}\}/g, formatDate(startDate));
  htmlTemplate = htmlTemplate.replace(/\{\{endDate\}\}/g, formatDate(endDate));
  htmlTemplate = htmlTemplate.replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl || `https://zeprompt.com/unsubscribe?email=${user.email || ''}`);

  // Remplacer les statistiques - Nouveaux prompts
  htmlTemplate = htmlTemplate.replace(/\{\{newPrompts\}\}/g, stats.newPrompts || 0);
  htmlTemplate = htmlTemplate.replace(/\{\{trendNewPrompts\}\}/g, getTrendIcon(trends.newPrompts));
  htmlTemplate = htmlTemplate.replace(/\{\{evolutionNewPrompts\}\}/g, changes.newPrompts);
  htmlTemplate = htmlTemplate.replace(/\{\{evolutionNewPromptsClass\}\}/g, getEvolutionClass(trends.newPrompts));

  // Remplacer les statistiques - Likes reçus
  htmlTemplate = htmlTemplate.replace(/\{\{likesReceived\}\}/g, stats.likesReceived || 0);
  htmlTemplate = htmlTemplate.replace(/\{\{trendLikes\}\}/g, getTrendIcon(trends.likesReceived));
  htmlTemplate = htmlTemplate.replace(/\{\{evolutionLikes\}\}/g, changes.likesReceived);
  htmlTemplate = htmlTemplate.replace(/\{\{evolutionLikesClass\}\}/g, getEvolutionClass(trends.likesReceived));

  // Remplacer les statistiques - Vues
  htmlTemplate = htmlTemplate.replace(/\{\{viewsReceived\}\}/g, stats.viewsReceived || 0);
  htmlTemplate = htmlTemplate.replace(/\{\{trendViews\}\}/g, getTrendIcon(trends.viewsReceived));
  htmlTemplate = htmlTemplate.replace(/\{\{evolutionViews\}\}/g, changes.viewsReceived);
  htmlTemplate = htmlTemplate.replace(/\{\{evolutionViewsClass\}\}/g, getEvolutionClass(trends.viewsReceived));

  // Gérer les prompts populaires
  const hasPrompts = topPrompts && topPrompts.length > 0;
  htmlTemplate = htmlTemplate.replace(/\{\{hasPromptsClass\}\}/g, hasPrompts ? '' : 'hidden');
  htmlTemplate = htmlTemplate.replace(/\{\{noPromptsClass\}\}/g, hasPrompts ? 'hidden' : '');

  // Remplacer les prompts (maximum 3)
  if (hasPrompts) {
    const prompts = topPrompts.slice(0, 3);
    
    // Prompt 1
    if (prompts[0]) {
      htmlTemplate = htmlTemplate.replace(/\{\{promptId1\}\}/g, prompts[0].id || '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptTitle1\}\}/g, prompts[0].title || 'Sans titre');
      htmlTemplate = htmlTemplate.replace(/\{\{promptViews1\}\}/g, prompts[0].weeklyViews || prompts[0].views || 0);
      htmlTemplate = htmlTemplate.replace(/\{\{promptLikes1\}\}/g, prompts[0].likeCount || prompts[0].likes || 0);
    } else {
      htmlTemplate = htmlTemplate.replace(/\{\{promptId1\}\}/g, '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptTitle1\}\}/g, '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptViews1\}\}/g, '0');
      htmlTemplate = htmlTemplate.replace(/\{\{promptLikes1\}\}/g, '0');
    }

    // Prompt 2
    if (prompts[1]) {
      htmlTemplate = htmlTemplate.replace(/\{\{promptId2\}\}/g, prompts[1].id || '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptTitle2\}\}/g, prompts[1].title || 'Sans titre');
      htmlTemplate = htmlTemplate.replace(/\{\{promptViews2\}\}/g, prompts[1].weeklyViews || prompts[1].views || 0);
      htmlTemplate = htmlTemplate.replace(/\{\{promptLikes2\}\}/g, prompts[1].likeCount || prompts[1].likes || 0);
    } else {
      htmlTemplate = htmlTemplate.replace(/\{\{promptId2\}\}/g, '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptTitle2\}\}/g, '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptViews2\}\}/g, '0');
      htmlTemplate = htmlTemplate.replace(/\{\{promptLikes2\}\}/g, '0');
    }

    // Prompt 3
    if (prompts[2]) {
      htmlTemplate = htmlTemplate.replace(/\{\{promptId3\}\}/g, prompts[2].id || '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptTitle3\}\}/g, prompts[2].title || 'Sans titre');
      htmlTemplate = htmlTemplate.replace(/\{\{promptViews3\}\}/g, prompts[2].weeklyViews || prompts[2].views || 0);
      htmlTemplate = htmlTemplate.replace(/\{\{promptLikes3\}\}/g, prompts[2].likeCount || prompts[2].likes || 0);
    } else {
      htmlTemplate = htmlTemplate.replace(/\{\{promptId3\}\}/g, '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptTitle3\}\}/g, '');
      htmlTemplate = htmlTemplate.replace(/\{\{promptViews3\}\}/g, '0');
      htmlTemplate = htmlTemplate.replace(/\{\{promptLikes3\}\}/g, '0');
    }
  } else {
    // Pas de prompts - remplacer toutes les valeurs par des valeurs vides
    ['1', '2', '3'].forEach(num => {
      htmlTemplate = htmlTemplate.replace(new RegExp(`\\{\\{promptId${num}\\}\\}`, 'g'), '');
      htmlTemplate = htmlTemplate.replace(new RegExp(`\\{\\{promptTitle${num}\\}\\}`, 'g'), '');
      htmlTemplate = htmlTemplate.replace(new RegExp(`\\{\\{promptViews${num}\\}\\}`, 'g'), '0');
      htmlTemplate = htmlTemplate.replace(new RegExp(`\\{\\{promptLikes${num}\\}\\}`, 'g'), '0');
    });
  }

  return htmlTemplate;
};

module.exports = generateWeeklyReportTemplate;
