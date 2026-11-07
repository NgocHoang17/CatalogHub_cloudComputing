import app from './app.js';
import { env } from './config/env.js';
import { db, assertDatabaseConnection } from './config/database.js';

const PORT = env.PORT || 5000;
const HOST = '0.0.0.0';

async function bootstrap() {
  try {
    console.log('🚀 [Server] Initializing CatalogHub Backend...');

    // 1. Verify MySQL connection with retries
    await assertDatabaseConnection();

    // 2. Run Knex Migrations (Equivalent to Spring Flyway Migrate on Boot)
    console.log('🔄 [Database] Running Knex database migrations...');
    await db.migrate.latest();
    console.log('✅ [Database] Migrations are up to date.');

    // 3. Run Knex Seeds if table is empty
    console.log('🌱 [Database] Checking database seeds...');
    await db.seed.run();
    console.log('✅ [Database] Seed data verified.');

    // 4. Start HTTP Server
    const server = app.listen(PORT, HOST, () => {
      console.log(`✨ [Server] CatalogHub API listening on http://${HOST}:${PORT}`);
      console.log(`🩺 [Server] Healthcheck: http://${HOST}:${PORT}/api/health`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal) => {
      console.log(`\n🛑 [Server] Received ${signal}. Gracefully terminating...`);
      server.close(async () => {
        try {
          await db.destroy();
          console.log('🔒 [Database] Knex connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('❌ [Database] Error destroying Knex pool:', err);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error('⚠️ [Server] Force termination timeout exceeded.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('💥 [Server] Fatal Bootstrap Error:', err);
    process.exit(1);
  }
}

bootstrap();
