import knex, { Knex } from 'knex';
// @ts-ignore
import knexConfig from '../../knexfile.js';
import { env } from './env.js';

const environment = env.NODE_ENV || 'development';
const config = (knexConfig as Record<string, Knex.Config>)[environment];

export const db: Knex = knex(config);

/**
 * Health check helper with retries (for Docker & Railway cold starts)
 */
export async function assertDatabaseConnection(maxRetries = 5, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.raw('SELECT 1 + 1 AS check_status');
      console.log('✅ [Database] Knex connection established successfully.');
      return;
    } catch (err: any) {
      console.warn(`⚠️ [Database] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw new Error(`Failed to connect to MySQL after ${maxRetries} attempts: ${err.message}`);
      }
    }
  }
}
