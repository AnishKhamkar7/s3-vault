import { z } from 'zod';

export const AddBucketInputSchema = z.object({
  bucketName: z.string().min(3).max(63),
  configId: z.string().uuid(),
});

export type AddBucketInput = z.infer<typeof AddBucketInputSchema>;

export const S3ConfigInputSchema = z.object({
  roleArn: z.string().min(1),
  externalId: z.string().min(1),
  region: z.string().min(3).max(50),
});

export type S3ConfigInput = z.infer<typeof S3ConfigInputSchema>;
