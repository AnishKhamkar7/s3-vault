import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  PORT: z.string().optional(),
  NODE_ENV: z.string().default("development"),

  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),

  MAX_FILE_SIZE: z
    .string()
    .transform((s) => parseInt(s, 10))
    .optional(),
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
