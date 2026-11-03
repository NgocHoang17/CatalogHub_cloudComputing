const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
const { loadEnv } = require('../src/config/env');
(async () => {
  let connection;
  try {
    const filename = process.argv[2];
    if (!['schema', 'seed'].includes(filename)) throw new Error('Usage: npm run db:import -- schema|seed');
    // Explicit operator command only. Requires setup credentials in the process environment.
    connection = await mysql.createConnection({ ...loadEnv().database, connectionLimit: undefined, multipleStatements: true });
    await connection.query(await fs.readFile(path.join(__dirname, `../database/${filename}.sql`), 'utf8'));
    console.log(`${filename}.sql imported successfully`);
  } catch (error) { console.error('Import failed:', error.code || error.message); process.exitCode = 1; }
  finally { if (connection) await connection.end(); }
})();
