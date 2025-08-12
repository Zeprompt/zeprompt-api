/**
 * Template moderne pour les rapports hebdomadaires
 * 
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 * @param {Object} data.stats - Statistiques de l'utilisateur
 * @param {Date} data.startDate - Date de début de la période
 * @param {Date} data.endDate - Date de fin de la période
 * @param {Array} data.topPrompts - Les prompts les plus populaires
 */
const generateWeeklyReportTemplate = (data) => {
  const { user, stats, startDate, endDate, topPrompts } = data;
  
  // Formatage des dates
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };
  
  // Génération du HTML pour les prompts populaires
  const generatePromptsHTML = () => {
    if (!topPrompts || topPrompts.length === 0) {
      return `
        <tr>
          <td colspan="3" class="no-data">
            <div class="empty-state">
              <p>Aucun prompt consulté cette semaine</p>
            </div>
          </td>
        </tr>
      `;
    }
    
    return topPrompts.map((prompt, index) => `
      <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td class="prompt-title">
          <a href="https://zeprompt.com/prompt/${prompt.id || ''}" class="prompt-link">${prompt.title || 'Sans titre'}</a>
        </td>
        <td class="prompt-views">
          <div class="metric-badge views">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C7 4 2.73 7.11 1 12C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12C21.27 7.11 17 4 12 4ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#4D70B3"/>
            </svg>
            <span>${prompt.weeklyViews || 0}</span>
          </div>
        </td>
        <td class="prompt-likes">
          <div class="metric-badge likes">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" fill="#E74C3C"/>
            </svg>
            <span>${prompt.likeCount || 0}</span>
          </div>
        </td>
      </tr>
    `).join('');
  };

  // Calcul des tendances (simulation - à remplacer par la logique réelle)
  const getTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 'up' : 'neutral';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'neutral';
  };

  // Simuler des valeurs précédentes (à remplacer par des données réelles)
  const previousStats = {
    newPrompts: stats.newPrompts > 0 ? Math.max(0, stats.newPrompts - Math.floor(Math.random() * 3)) : 0,
    likesReceived: stats.likesReceived > 0 ? Math.max(0, stats.likesReceived - Math.floor(Math.random() * 5)) : 0,
    viewsReceived: stats.viewsReceived > 0 ? Math.max(0, stats.viewsReceived - Math.floor(Math.random() * 10)) : 0
  };

  // Obtenir les tendances
  const trends = {
    newPrompts: getTrend(stats.newPrompts, previousStats.newPrompts),
    likesReceived: getTrend(stats.likesReceived, previousStats.likesReceived),
    viewsReceived: getTrend(stats.viewsReceived, previousStats.viewsReceived)
  };

  // Calcul des pourcentages de changement pour affichage
  const getChangePercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Obtenir les pourcentages de changement
  const changes = {
    newPrompts: getChangePercentage(stats.newPrompts, previousStats.newPrompts),
    likesReceived: getChangePercentage(stats.likesReceived, previousStats.likesReceived),
    viewsReceived: getChangePercentage(stats.viewsReceived, previousStats.viewsReceived)
  };

  // Obtenir les icônes de tendance avec des SVGs plus modernes
  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return `<svg class="trend-icon up" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14l5-5 5 5" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`;
    }
    if (trend === 'down') {
      return `<svg class="trend-icon down" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`;
    }
    return `<svg class="trend-icon neutral" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
  };
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport Hebdomadaire ZePrompt</title>
      <style>
        /* Styles généraux */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f7fa;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        /* En-tête */
        .header {
          background: linear-gradient(125deg, #6a11cb 0%, #2575fc 100%);
          padding: 35px 30px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://zeprompt.com/images/header-pattern.png');
          background-size: cover;
          opacity: 0.1;
          z-index: 0;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        .period {
          margin-top: 12px;
          font-size: 16px;
          opacity: 0.95;
          background-color: rgba(255,255,255,0.2);
          border-radius: 50px;
          padding: 5px 15px;
          display: inline-block;
        }
        
        /* Logo */
        .logo {
          margin-bottom: 20px;
        }
        
        .logo img {
          height: 45px;
        }
        
        /* Contenu */
        .content {
          padding: 35px 30px;
        }
        
        .greeting {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #222;
        }
        
        .intro {
          margin-bottom: 35px;
          color: #555;
          font-size: 16px;
        }
        
        /* Cartes de statistiques */
        .stats-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 35px;
          flex-wrap: wrap;
          gap: 30px;
        }
        
        .stat-card {
          background-color: #f8faff;
          border-radius: 12px;
          padding: 18px 15px;
          width: calc(33.33% - 20px);
          text-align: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.04);
          min-width: 150px;
          margin-bottom: 15px;
          margin-right: 15px;
          border: 1px solid #eaeffd;
          position: relative;
          overflow: hidden;
        }
        
        .stat-card:last-child {
          margin-right: 0;
        }
        
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #6a11cb, #2575fc);
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #4a6cf7;
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        
        .stat-value .trend-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-left: 10px;
          font-size: 14px;
        }
        
        .trend {
          display: flex;
          align-items: center;
          font-weight: 500;
        }
        
        .trend-text {
          font-size: 14px;
          margin-left: 3px;
        }
        
        .trend-icon {
          display: inline-block;
          vertical-align: middle;
          margin-right: 2px;
        }
        
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-neutral { color: #6c757d; }
        
        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        
        /* Tableau des top prompts */
        .section-title {
          font-size: 20px;
          margin: 35px 0 20px;
          color: #222;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
          font-weight: 600;
        }
        
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 25px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 0 1px #eaeffd;
        }
        
        th {
          background-color: #f0f4ff;
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          color: #445177;
          border-bottom: 1px solid #e0e7ff;
        }
        
        td {
          padding: 14px 16px;
          border-bottom: 1px solid #eef2ff;
          color: #444;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        .row-even {
          background-color: #fcfdff;
        }
        
        .row-odd {
          background-color: #ffffff;
        }
        
        .no-data {
          text-align: center;
          padding: 30px 0;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #99a4bd;
          padding: 40px 20px;
          text-align: center;
        }
        
        .empty-state p {
          margin: 0;
          font-size: 16px;
          color: #6c757d;
        }
        
        .prompt-title {
          font-weight: 500;
          max-width: 280px;
        }
        
        .prompt-link {
          color: #4a6cf7;
          text-decoration: none;
          font-weight: 500;
          display: block;
          transition: color 0.2s;
        }
        
        .prompt-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        .prompt-views, .prompt-likes {
          text-align: center;
        }
        
        .metric-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 10px;
          border-radius: 30px;
          font-weight: 500;
        }
        
        .metric-badge.views {
          background-color: #edf3ff;
          color: #4d70b3;
        }
        
        .metric-badge.likes {
          background-color: #ffeeee;
          color: #e74c3c;
        }
        
        .metric-badge svg {
          margin-right: 5px;
        }
        
        /* Call to action */
        .cta {
          background: linear-gradient(135deg, #f6f9ff 0%, #f0f4ff 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 35px 0;
          text-align: center;
          border: 1px solid #eaeffd;
          position: relative;
          overflow: hidden;
        }
        
        .cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(to bottom, #6a11cb, #2575fc);
          border-radius: 4px 0 0 4px;
        }
        
        .cta p {
          margin: 0 0 8px;
          font-size: 16px;
          color: #444;
        }
        
        .cta p:first-child {
          font-size: 18px;
          font-weight: 600;
          color: #222;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(to right, #6a11cb, #2575fc);
          color: white !important; /* Force la couleur blanche */
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          margin-top: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 5px 15px rgba(106, 17, 203, 0.15);
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 20px rgba(106, 17, 203, 0.25);
        }
        
        /* Pied de page */
        .footer {
          background: linear-gradient(135deg, #f8faff 0%, #f2f6ff 100%);
          padding: 30px;
          text-align: center;
          color: #677087;
          font-size: 14px;
          border-top: 1px solid #eaeffd;
        }
        
        .footer-logo {
          margin-bottom: 15px;
        }
        

        
        .unsubscribe {
          color: #99a4bd;
          font-size: 12px;
          margin-top: 20px;
        }
        
        .unsubscribe a {
          color: #677087;
          text-decoration: underline;
        }
        
        /* Carte de profil */
        .profile-card {
          background: linear-gradient(135deg, #f8faff 0%, #f5f8ff 100%);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          border: 1px solid #eaeffd;
        }
        
        .profile-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #dbe4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a6cf7;
          font-weight: 700;
          font-size: 24px;
          margin-right: 20px;
          border: 2px solid #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .profile-info {
          flex: 1;
        }
        
        .profile-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 5px;
          color: #222;
        }
        
        .profile-meta {
          display: flex;
          color: #677087;
          font-size: 14px;
        }
        
        .profile-meta span:not(:last-child) {
          margin-right: 15px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
          
          .content {
            padding: 25px 20px;
          }
          
          .stats-container {
            flex-direction: column;
          }
          
          .stat-card {
            width: 100%;
            margin-bottom: 15px;
          }
          
          .header {
            padding: 25px 20px;
          }
          
          .footer {
            padding: 25px 20px;
          }
          
          th, td {
            padding: 12px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- En-tête -->
        <div class="header">
          <div class="header-content">
            <div class="logo">
              <img src="https://res.cloudinary.com/ds6ijmuk8/image/upload/v1750050822/e8lr3gertpmeqv2gh7vf.png" alt="ZePrompt" width="60">
            </div>
            <h1>Votre rapport hebdomadaire</h1>
            <div class="period">${formatDate(startDate)} - ${formatDate(endDate)}</div>
          </div>
        </div>
        
        <!-- Contenu principal -->
        <div class="content">
          <!-- Carte de profil -->
          <div class="profile-card">
            <div class="profile-avatar">
              ${user.username ? user.username.substring(0, 2).toUpperCase() : 'ZE'}
            </div>
            <div class="profile-info">
              <h3 class="profile-name">${user.username || 'Utilisateur ZePrompt'}</h3>
              <div class="profile-meta">
                <span>${user.email}</span>
              </div>
            </div>
          </div>
          
          <div class="greeting">Bonjour ${user.username || 'utilisateur'},</div>
          
          <p class="intro">Voici votre rapport d'activité hebdomadaire sur ZePrompt. Découvrez comment vos prompts ont performé cette semaine et comparez avec vos résultats précédents.</p>
          
          <!-- Statistiques -->
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-label">Nouveaux prompts</div>
              <div class="stat-value">
                ${stats.newPrompts || 0}
                <div class="trend-info">
                  <span class="trend trend-${trends.newPrompts}">
                    ${getTrendIcon(trends.newPrompts)}
                    <span class="trend-text">${changes.newPrompts}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-label">Likes reçus</div>
              <div class="stat-value">
                ${stats.likesReceived || 0}
                <div class="trend-info">
                  <span class="trend trend-${trends.likesReceived}">
                    ${getTrendIcon(trends.likesReceived)}
                    <span class="trend-text">${changes.likesReceived}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-label">Vues totales</div>
              <div class="stat-value">
                ${stats.viewsReceived || 0}
                <div class="trend-info">
                  <span class="trend trend-${trends.viewsReceived}">
                    ${getTrendIcon(trends.viewsReceived)}
                    <span class="trend-text">${changes.viewsReceived}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Top prompts -->
          <h2 class="section-title">Vos prompts les plus populaires cette semaine</h2>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>Prompt</th>
                <th>Vues</th>
                <th>Likes</th>
              </tr>
            </thead>
            <tbody>
              ${generatePromptsHTML()}
            </tbody>
          </table>
          
          <!-- Call to action -->
          <div class="cta">
            <p>Augmentez votre visibilité</p>
            <p>Créez de nouveaux prompts aujourd'hui et partagez votre expertise avec notre communauté grandissante !</p>
            <a href="https://zeprompt.com" class="button">Créer un nouveau prompt</a>
          </div>
          
          <!-- Conseils -->
          <h2 class="section-title">Conseils pour améliorer votre visibilité</h2>
          <ul>
            <li>Utilisez des titres clairs et descriptifs pour vos prompts</li>
            <li>Ajoutez des tags pertinents pour améliorer la découvrabilité</li>
            <li>Partagez vos prompts sur les réseaux sociaux</li>
            <li>Interagissez avec la communauté en commentant d'autres prompts</li>
          </ul>
          
        </div>
        
        <!-- Pied de page -->
        <div class="footer">
          <div class="footer-logo">
            <img src="https://res.cloudinary.com/ds6ijmuk8/image/upload/v1750050822/e8lr3gertpmeqv2gh7vf.png" alt="ZePrompt" width="100" onerror="this.style.display='none'">
          </div>
          
          <p>Merci d'utiliser ZePrompt !</p>
          
          <p class="unsubscribe">
            Si vous ne souhaitez plus recevoir ces rapports hebdomadaires,
            <a href="https://zeprompt.com/unsubscribe?email=${user.email}">cliquez ici</a> pour vous désabonner.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = generateWeeklyReportTemplate;