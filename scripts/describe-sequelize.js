#!/usr/bin/env node
require('dotenv').config();
const { sequelize } = require('../models');

(async () => {
  const table = process.argv[2] || 'prompts';
  try {
    const qi = sequelize.getQueryInterface();
    const desc = await qi.describeTable(table);
    console.log(`\n=== Structure (Sequelize) de la table: ${table} ===`);
    Object.entries(desc).forEach(([name, info]) => {
      console.log(`- ${name}: ${info.type}` +
        (info.allowNull === false ? ' NOT NULL' : '') +
        (info.primaryKey ? ' PRIMARY KEY' : '') +
        (info.defaultValue !== undefined && info.defaultValue !== null ? ` DEFAULT ${info.defaultValue}` : '')
      );
    });
    console.log('');
  } catch (e) {
    console.error('Erreur describeTable:', e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
