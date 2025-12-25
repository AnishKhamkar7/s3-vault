import { z } from 'zod';

export const AddBucketInputSchema = z.object({
  bucketName: z.string().min(3).max(63),
  configId: z.string().uuid(),
});

const AddBucketOutputSchema = z.object({
  success: z.boolean(),
});

export type AddBucketInput = z.infer<typeof AddBucketInputSchema>;
export type AddBucketOutput = z.infer<typeof AddBucketOutputSchema>;

export const S3ConfigInputSchema = z.object({
  accessKeyId: z.string().min(16).max(128),
  secretAccessKey: z.string().min(16).max(128),
  region: z.string().min(3).max(50),
});

export type S3ConfigInput = z.infer<typeof S3ConfigInputSchema>;
