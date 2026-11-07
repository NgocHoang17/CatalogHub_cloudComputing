import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_ORIGIN: z.string().default('*'),
  // Database connection
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('catalog_db'),
  // Railway standard overrides
  MYSQLHOST: z.string().optional(),
  MYSQLPORT: z.coerce.number().optional(),
  MYSQLUSER: z.string().optional(),
  MYSQLPASSWORD: z.string().optional(),
  MYSQLDATABASE: z.string().optional(),
  MYSQL_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export type EnvConfig = z.infer<typeof envSchema>;
export const env: EnvConfig = parsed.data;

