import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().optional(),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
