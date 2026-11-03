const { loadEnv } = require('../src/config/env');
const { createPool } = require('../src/config/database');
(async () => {
  let pool;
  try {
    pool = createPool(loadEnv().database);
    const [[row]] = await pool.query('SELECT DATABASE() AS database_name, (SELECT COUNT(*) FROM categories) AS categories, (SELECT COUNT(*) FROM products) AS products');
    console.log('Database connected:', row);
  } catch (error) { console.error('Database check failed:', error.code || 'CONFIGURATION_ERROR'); process.exitCode = 1; }
  finally { if (pool) await pool.end(); }
})();
