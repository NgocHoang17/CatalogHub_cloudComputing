const dotenv = require('dotenv');
dotenv.config({ quiet: true, path: process.env.DOTENV_CONFIG_PATH || '.env' });

function loadEnv(source = process.env) {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => typeof source[key] !== 'string' || !source[key].trim());
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  function integer(key, fallback, min, max) {
    const value = source[key] ?? String(fallback);
    if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
      throw new Error(`Invalid environment variable: ${key}`);
    }
    return Number(value);
  }
  const nodeEnv = source.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('Invalid NODE_ENV');
  const write = source.ENABLE_PRODUCT_WRITE ?? (nodeEnv === 'production' ? 'false' : 'true');
  if (!['true', 'false'].includes(write)) throw new Error('ENABLE_PRODUCT_WRITE must be true or false');
  return {
    nodeEnv, port: integer('PORT', 3000, 1, 65535), host: source.HOST || '0.0.0.0',
    writeEnabled: write === 'true', trustProxy: integer('TRUST_PROXY', 0, 0, 1),
    database: {
      host: source.DB_HOST, port: integer('DB_PORT', 3306, 1, 65535),
      user: source.DB_USER, password: source.DB_PASSWORD, database: source.DB_NAME,
      connectionLimit: integer('DB_CONNECTION_LIMIT', 10, 1, 100)
    }
  };
}
module.exports = { loadEnv };
