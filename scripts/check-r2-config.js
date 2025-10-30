#!/usr/bin/env node

/**
 * Script de vérification de la configuration Cloudflare R2
 * Teste la connexion et vérifie que tout est correctement configuré
 * 
 * Usage: node scripts/check-r2-config.js
 */

require("dotenv").config();
const r2StorageService = require("../services/r2StorageService");
const logger = require("../utils/logger");

async function checkConfiguration() {
  logger.info("🔍 Vérification de la configuration Cloudflare R2...\n");

  const checks = {
    passed: 0,
    failed: 0,
  };

  // 1. Vérifier les variables d'environnement
  logger.info("1️⃣ Vérification des variables d'environnement...");
  
  const requiredVars = [
    "CLOUDFLARE_BUCKET_NAME",
    "CLOUDFLARE_ENDPOINT_URL",
    "CLOUDFLARE_ACCESS_KEY_ID",
    "CLOUDFLARE_SECRET_ACCESS_KEY",
  ];

  let envOk = true;
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      logger.error(`   ❌ ${varName} non configuré`);
      envOk = false;
      checks.failed++;
    } else if (process.env[varName].includes("your_") || process.env[varName].includes("YOUR_")) {
      logger.error(`   ❌ ${varName} contient une valeur par défaut (non configuré)`);
      envOk = false;
      checks.failed++;
    } else {
      logger.info(`   ✅ ${varName} configuré`);
      checks.passed++;
    }
  }

  if (!envOk) {
    logger.error("\n❌ Configuration incomplète. Veuillez configurer vos credentials R2 dans .env");
    logger.info("\n📖 Consultez docs/R2_QUICK_START.md pour obtenir vos credentials");
    process.exit(1);
  }

  logger.info("");

  // 2. Tester la connexion R2
  logger.info("2️⃣ Test de connexion à Cloudflare R2...");

  try {
    // Créer un fichier test
    const testContent = Buffer.from("Test Cloudflare R2 - ZePrompt API");
    const testKey = `test/${Date.now()}-test.txt`;

    // Upload
    logger.info("   📤 Upload d'un fichier test...");
    const uploadResult = await r2StorageService.uploadFile(testContent, testKey, {
      contentType: "text/plain",
      metadata: { test: "true" },
    });

    logger.info(`   ✅ Upload réussi: ${uploadResult.url}`);
    checks.passed++;

    // Vérifier l'existence
    logger.info("   🔍 Vérification de l'existence du fichier...");
    const exists = await r2StorageService.fileExists(testKey);
    
    if (exists) {
      logger.info("   ✅ Fichier trouvé sur R2");
      checks.passed++;
    } else {
      logger.error("   ❌ Fichier non trouvé après upload");
      checks.failed++;
    }

    // Nettoyer (supprimer le fichier test)
    logger.info("   🗑️ Nettoyage du fichier test...");
    await r2StorageService.deleteFile(testKey);
    logger.info("   ✅ Fichier test supprimé");
    checks.passed++;

  } catch (error) {
    logger.error(`   ❌ Erreur de connexion R2: ${error.message}`);
    logger.error("\n💡 Vérifiez :");
    logger.error("   - Vos credentials sont corrects");
    logger.error("   - L'endpoint URL correspond à votre compte");
    logger.error("   - Le bucket existe");
    logger.error("   - Le token a les permissions Read/Write/Delete");
    checks.failed++;
  }

  logger.info("");

  // 3. Vérifier les dépendances
  logger.info("3️⃣ Vérification des dépendances...");

  try {
    require("@aws-sdk/client-s3");
    logger.info("   ✅ @aws-sdk/client-s3 installé");
    checks.passed++;
  } catch {
    logger.error("   ❌ @aws-sdk/client-s3 manquant");
    logger.info("      npm install @aws-sdk/client-s3");
    checks.failed++;
  }

  try {
    require("@aws-sdk/s3-request-presigner");
    logger.info("   ✅ @aws-sdk/s3-request-presigner installé");
    checks.passed++;
  } catch {
    logger.error("   ❌ @aws-sdk/s3-request-presigner manquant");
    logger.info("      npm install @aws-sdk/s3-request-presigner");
    checks.failed++;
  }

  try {
    require("sharp");
    logger.info("   ✅ sharp installé");
    checks.passed++;
  } catch {
    logger.error("   ❌ sharp manquant");
    logger.info("      npm install sharp");
    checks.failed++;
  }

  logger.info("");

  // Résumé
  logger.info("═══════════════════════════════════════");
  logger.info("📊 Résumé de la vérification");
  logger.info("═══════════════════════════════════════");
  logger.info(`✅ Tests réussis : ${checks.passed}`);
  logger.info(`❌ Tests échoués : ${checks.failed}`);
  logger.info("═══════════════════════════════════════");

  if (checks.failed === 0) {
    logger.info("\n🎉 Configuration parfaite ! Vous êtes prêt à migrer vers R2");
    logger.info("\n📝 Prochaines étapes :");
    logger.info("   1. Test migration : npm run migrate:r2:dry");
    logger.info("   2. Migration réelle : npm run migrate:r2");
    logger.info("\n📖 Guide complet : docs/R2_MIGRATION_GUIDE.md");
  } else {
    logger.error("\n⚠️ Des problèmes ont été détectés. Corrigez-les avant de continuer.");
    process.exit(1);
  }
}

// Exécution
checkConfiguration().catch((error) => {
  logger.error("❌ Erreur fatale:", error.message);
  process.exit(1);
});
