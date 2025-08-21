/**
 * Template d'email de vérification d'adresse email
 *
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 * @param {string} data.verificationUrl - URL de vérification
 */
const generateResetPasswordEmailTemplate = (data) => {
  const { user, resetUrl } = data;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe - ZePrompt</title>
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
          margin-top: 40px;
          margin-bottom: 40px;
        }
        
        /* En-tête */
        .header {
          background: linear-gradient(125deg, #6a11cb 0%, #2575fc 100%);
          padding: 40px 30px;
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
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="2" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="2" fill="white" opacity="0.1"/></svg>');
          background-size: 50px 50px;
          opacity: 0.2;
          z-index: 0;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .logo {
          margin-bottom: 20px;
        }
        
        .logo img {
          height: 50px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        .header .subtitle {
          margin-top: 8px;
          font-size: 16px;
          opacity: 0.9;
        }
        
        /* Contenu */
        .content {
          padding: 40px 30px;
        }
        
        .welcome-message {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .welcome-message h2 {
          color: #333;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 15px 0;
        }
        
        .welcome-message p {
          color: #666;
          font-size: 16px;
          margin: 0;
        }
        
        .verification-section {
          background: linear-gradient(135deg, #f8faff 0%, #f5f8ff 100%);
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          text-align: center;
          border: 1px solid #eaeffd;
          position: relative;
        }
        
        .verification-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(to bottom, #6a11cb, #2575fc);
          border-radius: 4px 0 0 4px;
        }
        
        .verification-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 25px rgba(106, 17, 203, 0.2);
        }
        
        .verification-section h3 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0 0 15px 0;
        }
        
        .verification-section p {
          color: #666;
          font-size: 16px;
          margin: 0 0 25px 0;
        }
        
        .verify-button {
          display: inline-block;
          background: linear-gradient(to right, #6a11cb, #2575fc);
          color: white !important;
          text-decoration: none;
          padding: 15px 35px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 5px 15px rgba(106, 17, 203, 0.2);
          margin-bottom: 20px;
        }
        
        .verify-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 20px rgba(106, 17, 203, 0.3);
        }
        
        .alternative-link {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }
        
        .alternative-link p {
          margin: 0 0 10px 0;
          font-weight: 500;
        }
        
        .alternative-link code {
          background-color: #e9ecef;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          word-break: break-all;
          display: block;
          margin-top: 5px;
        }
        
        .security-notice {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        
        .security-notice h4 {
          color: #856404;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 10px 0;
          display: flex;
          align-items: center;
        }
        
        .security-notice p {
          color: #856404;
          font-size: 14px;
          margin: 0;
        }
        
        .warning-icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }
        
        /* Instructions */
        .instructions {
          margin: 30px 0;
        }
        
        .instructions h3 {
          color: #333;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 15px 0;
        }
        
        .instructions ol {
          padding-left: 20px;
          color: #666;
        }
        
        .instructions li {
          margin-bottom: 8px;
          font-size: 15px;
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
        
        .footer p {
          margin: 0 0 10px 0;
        }
        
        .footer .support {
          color: #99a4bd;
          font-size: 12px;
          margin-top: 20px;
        }
        
        .footer .support a {
          color: #677087;
          text-decoration: underline;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
            margin-top: 0;
            margin-bottom: 0;
          }
          
          .content {
            padding: 25px 20px;
          }
          
          .header {
            padding: 25px 20px;
          }
          
          .footer {
            padding: 25px 20px;
          }
          
          .verification-section {
            padding: 25px 20px;
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
              <img src="https://res.cloudinary.com/ds6ijmuk8/image/upload/v1750050822/e8lr3gertpmeqv2gh7vf.png" alt="ZePrompt" width="60" onerror="this.style.display='none'">
            </div>
            <h1>Réinitialisation de mot de passe</h1>
            <div class="subtitle">Réinitialisez votre mot de passe en cliquant sur le lien ci-dessous.</div>
          </div>
        </div>
        
        <!-- Contenu principal -->
        <div class="content">
          <div class="welcome-message">
            <h2>Bonjour ${user.username} !</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ZePrompt. Suivez les instructions ci-dessous pour créer un nouveau mot de passe.</p>
          </div>
          
          <div class="verification-section">
            <div class="verification-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10C6 8.89543 6.89543 8 8 8H16C17.1046 8 18 8.89543 18 10V14C18 15.1046 17.1046 16 16 16H8C6.89543 16 6 15.1046 6 14V10Z" stroke="white" stroke-width="2"/>
                <path d="M9 8V6C9 4.89543 9.89543 4 11 4H13C14.1046 4 15 4.89543 15 6V8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="1" fill="white"/>
              </svg>
            </div>
            <h3>Réinitialisez votre mot de passe</h3>
            <p>Cliquez sur le bouton ci-dessous pour réinitialiser le mot de passe de votre compte <strong>${user.email}</strong> sur ZePrompt.</p>
            
            <a href="${resetUrl}" class="verify-button">Réinitialiser mon mot de passe</a>
            
            <div class="alternative-link">
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <code>${resetUrl}</code>
            </div>
          </div>
          
          <div class="security-notice">
            <h4>
              <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L21.09 21H2.91L12 2Z" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 9V13" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17H12.01" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Important - Sécurité
            </h4>
            <p>Ce lien de réinitialisation expire dans 24 heures. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>
          </div>
          
          <div class="instructions">
            <h3>Instructions :</h3>
            <ol>
              <li>Cliquez sur le bouton "Réinitialiser mon mot de passe" ci-dessus</li>
              <li>Vous serez redirigé vers une page sécurisée</li>
              <li>Saisissez votre nouveau mot de passe (minimum 8 caractères)</li>
              <li>Confirmez votre nouveau mot de passe</li>
              <li>Connectez-vous avec vos nouveaux identifiants</li>
            </ol>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div class="footer">
          <div class="footer-logo">
            <img src="https://res.cloudinary.com/ds6ijmuk8/image/upload/v1750050822/e8lr3gertpmeqv2gh7vf.png" alt="ZePrompt" width="100" onerror="this.style.display='none'">
          </div>
          
          <p>Sécurisez votre compte ZePrompt !</p>
          <p>La plateforme collaborative pour créer et partager des prompts d'intelligence artificielle.</p>
          
          <div class="support">
            Besoin d'aide ? Contactez-nous à 
            <a href="mailto:support@zeprompt.com">support@zeprompt.com</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = generateResetPasswordEmailTemplate;
