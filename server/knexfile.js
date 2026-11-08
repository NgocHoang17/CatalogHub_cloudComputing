import dotenv from 'dotenv';
dotenv.config();

function getDatabaseConnection() {
  // Support Railway connection URI
  if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
    return process.env.MYSQL_URL || process.env.DATABASE_URL;
  }

  // Support Railway discrete variables or local environment variables
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'catalog_db',
  };
}

/**
 * Knex Configuration (Database Migrations & Seeds)
 * Standard configuration used in enterprise Node.js environments.
 */
const config = {
  development: {
    client: 'mysql2',
    connection: getDatabaseConnection(),
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },

  production: {
    client: 'mysql2',
    connection: getDatabaseConnection(),
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },

  test: {
    client: 'mysql2',
    connection: getDatabaseConnection(),
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },
};

export default config;

