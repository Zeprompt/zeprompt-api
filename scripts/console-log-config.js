module.exports = {
  // Dossiers et fichiers à exclure de la vérification console.log
  excludePatterns: [
    'scripts/',           // Scripts utilitaires
    'tools/',            // Outils
    'config/',           // Configuration
    '.husky/',           // Husky hooks
    'node_modules/',     // Dependencies
    'dist/',             // Build output
    'build/',            // Build output
    'coverage/',         // Test coverage
    'docs/',             // Documentation
    // Tests (décommentez si vous voulez exclure les tests)
    // 'test/',
    // 'tests/',
    // '__tests__/',
    // '.test.',
    // '.spec.',
  ],

  // Extensions de fichiers à vérifier
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],

  // Patterns de console à détecter
  consolePatterns: /console\.(log|info|debug|table|trace)/,

  // Messages d'erreur personnalisables
  messages: {
    noFilesToCheck: '✅ Aucun fichier JavaScript/TypeScript à vérifier',
    consoleDetected: '❌ Des console.log ont été détectés dans les fichiers suivants :',
    commitCancelled: '🚫 Commit annulé. Veuillez supprimer ou commenter ces console.log avant de committer.',
    tip: '💡 Conseil: Utilisez un debugger ou des logs conditionnels pour le développement.',
    noConsoleFound: '✅ Aucun console.log détecté dans les fichiers staged',
    error: '❌ Erreur lors de la vérification des console.log:'
  }
};