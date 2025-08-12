#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const config = require('./console-log-config');

/**
 * Script pour vérifier la présence de console.log dans les fichiers staged
 */

function checkConsoleLogsInStagedFiles() {
  try {
    // Récupérer les fichiers staged
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(file => file && config.fileExtensions.some(ext => file.endsWith(ext)))
      .filter(file => {
        // Exclure les fichiers/dossiers selon la configuration
        return !config.excludePatterns.some(pattern => file.includes(pattern));
      });

    if (stagedFiles.length === 0) {
      console.log(config.messages.noFilesToCheck);
      return;
    }

    const filesWithConsoleLog = [];

    for (const file of stagedFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Rechercher console.log (en évitant les commentaires)
        const lines = content.split('\n');
        const problematicLines = [];

        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          
          // Ignorer les lignes commentées
          if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
            return;
          }
          
          // Chercher console.log, console.warn, console.error, etc.
          if (config.consolePatterns.test(line)) {
            problematicLines.push({
              lineNumber: index + 1,
              content: line.trim()
            });
          }
        });

        if (problematicLines.length > 0) {
          filesWithConsoleLog.push({
            file,
            lines: problematicLines
          });
        }
      }
    }

    if (filesWithConsoleLog.length > 0) {
      console.error(config.messages.consoleDetected);
      console.error('');
      
      filesWithConsoleLog.forEach(({ file, lines }) => {
        console.error(`📄 ${file}:`);
        lines.forEach(({ lineNumber, content }) => {
          console.error(`   Ligne ${lineNumber}: ${content}`);
        });
        console.error('');
      });
      
      console.error(config.messages.commitCancelled);
      console.error('');
      console.error(config.messages.tip);
      
      process.exit(1);
    } else {
      console.log(config.messages.noConsoleFound);
    }

  } catch (error) {
    console.error(config.messages.error, error.message);
    process.exit(1);
  }
}

// Exécuter la vérification
checkConsoleLogsInStagedFiles();