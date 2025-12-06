import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().optional(),
  NODE_ENV: z.string().default('development'),
  REDIS_URL: z.string().optional().default('redis://127.0.0.1:6379'),
  CLIENT_URL: z.string().url().optional().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NODEMAILER_EMAIL: z.string().email(),
  NODEMAILER_PASSWORD: z.string(),
  NODEMAILER_HOST: z.string(),
  NODEMAILER_PORT: z.string(),
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
