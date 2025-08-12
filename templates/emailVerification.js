/**
 * Template d'email de vérification d'adresse email
 *
 * @param {Object} data - Données nécessaires pour générer le template
 * @param {Object} data.user - Informations sur l'utilisateur
 * @param {string} data.verificationUrl - URL de vérification
 */
const generateEmailVerificationTemplate = (data) => {
  const { user, verificationUrl } = data;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification de votre adresse email - ZePrompt</title>
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
            <h1>Vérification d'email</h1>
            <div class="subtitle">Confirmez votre adresse email pour activer votre compte</div>
          </div>
        </div>
        
        <!-- Contenu principal -->
        <div class="content">
          <div class="welcome-message">
            <h2>Bienvenue sur ZePrompt, ${user.username} !</h2>
            <p>Votre compte a été créé avec succès. Pour commencer à utiliser ZePrompt, vous devez vérifier votre adresse email.</p>
          </div>
          
          <div class="verification-section">
            <div class="verification-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Vérifiez votre adresse email</h3>
            <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email <strong>${user.email}</strong> et activer votre compte ZePrompt.</p>
            
            <a href="${verificationUrl}" class="verify-button">Vérifier mon email</a>
            
            <div class="alternative-link">
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <code>${verificationUrl}</code>
            </div>
          </div>
          
          <div class="security-notice">
            <h4>
              <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L21.09 21H2.91L12 2Z" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 9V13" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17H12.01" stroke="#856404" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Note de sécurité
            </h4>
            <p>Ce lien de vérification expire dans 24 heures. Si vous n'avez pas demandé la création de ce compte, vous pouvez ignorer cet email.</p>
          </div>
          
          <div class="instructions">
            <h3>Prochaines étapes :</h3>
            <ol>
              <li>Cliquez sur le bouton "Vérifier mon email" ci-dessus</li>
              <li>Vous serez redirigé vers ZePrompt avec votre compte activé</li>
              <li>Connectez-vous avec votre email et mot de passe</li>
              <li>Commencez à explorer et créer des prompts !</li>
            </ol>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div class="footer">
          <div class="footer-logo">
            <img src="https://res.cloudinary.com/ds6ijmuk8/image/upload/v1750050822/e8lr3gertpmeqv2gh7vf.png" alt="ZePrompt" width="100" onerror="this.style.display='none'">
          </div>
          
          <p>Merci de rejoindre ZePrompt !</p>
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

module.exports = generateEmailVerificationTemplate;
