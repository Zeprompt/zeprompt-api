#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  const table = process.argv[2] || 'prompts';
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: process.env.PGSSLMODE && process.env.PGSSLMODE !== 'disable' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  try {
    console.log(`\n=== Structure de la table: ${table} ===`);

    const cols = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );

    if (cols.rows.length === 0) {
      console.log(`Table '${table}' introuvable (schema public).`);
      process.exit(0);
    }

    console.log('\nColonnes:');
    cols.rows.forEach((r) => {
      console.log(`- ${r.column_name} :: ${r.data_type}` +
        ` | nullable=${r.is_nullable}` +
        (r.column_default ? ` | default=${r.column_default}` : ''));
    });

    const idx = await client.query(
      `SELECT indexname, indexdef FROM pg_indexes
       WHERE schemaname='public' AND tablename=$1
       ORDER BY indexname`,
      [table]
    );

    console.log('\nIndex:');
    if (idx.rows.length === 0) {
      console.log('- (aucun)');
    } else {
      idx.rows.forEach((r) => console.log(`- ${r.indexname}: ${r.indexdef}`));
    }

    const cons = await client.query(
      `SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
       FROM information_schema.table_constraints AS tc
       LEFT JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public' AND tc.table_name = $1
       ORDER BY tc.constraint_name, kcu.ordinal_position`,
      [table]
    );

    console.log('\nContraintes:');
    if (cons.rows.length === 0) {
      console.log('- (aucune)');
    } else {
      const byName = cons.rows.reduce((acc, r) => {
        acc[r.constraint_name] = acc[r.constraint_name] || { type: r.constraint_type, cols: [] };
        if (r.column_name) acc[r.constraint_name].cols.push(r.column_name);
        return acc;
      }, {});
      Object.entries(byName).forEach(([name, info]) => {
        console.log(`- ${name} [${info.type}] cols: ${info.cols.join(', ') || '(n/a)'}`);
      });
    }

    console.log('\n');
  } catch (e) {
    console.error('Erreur:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
