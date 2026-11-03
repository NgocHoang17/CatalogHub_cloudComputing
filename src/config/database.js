const mysql = require('mysql2/promise');
function createPool(config) {
  const pool = mysql.createPool({
    ...config, waitForConnections: true, queueLimit: 100,
    connectTimeout: 5000, charset: 'utf8mb4_unicode_ci', timezone: 'Z',
    supportBigNumbers: true, bigNumberStrings: false, decimalNumbers: false,
    multipleStatements: false
  });
  // TIMESTAMP and DATETIME defaults must be created in UTC on every session.
  pool.on('connection', connection => connection.query("SET time_zone = '+00:00'"));
  return pool;
}
module.exports = { createPool };
