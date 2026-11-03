const { loadEnv } = require('./config/env');
const { createPool } = require('./config/database');
const { createApp } = require('./app');
let server, pool;
async function shutdown(signal, code = 0) {
  console.log(`Shutting down: ${signal}`);
  const timeout = setTimeout(() => process.exit(1), 10000).unref();
  try {
    if (server?.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    if (pool) await pool.end();
    clearTimeout(timeout);
    process.exit(code);
  } catch { process.exit(1); }
}
try {
  const config = loadEnv();
  pool = createPool(config.database);
  server = createApp({ pool, config }).listen(config.port, config.host, () => console.log(`CatalogHub listening on ${config.host}:${config.port}`));
  server.on('error', () => shutdown('HTTP_START_FAILURE', 1));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('uncaughtException', () => shutdown('UNCAUGHT_EXCEPTION', 1));
  process.once('unhandledRejection', () => shutdown('UNHANDLED_REJECTION', 1));
} catch (error) {
  // Config errors name variables only and contain no supplied values.
  console.error(error.message);
  process.exitCode = 1;
}
