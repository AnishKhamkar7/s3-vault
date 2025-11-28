import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

const region = env.AWS_REGION || "us-east-1";

const client = new S3Client({
  region,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export { client as s3Client };
