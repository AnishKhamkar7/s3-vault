import { db } from '@server/utils/db';

export class S3Repo {
  addConfig({
    accessKeyId,
    secretAccessKey,
    region,
  }: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }) {
    return db.aws_Config.create({ data: { accessKeyId, secretAccessKey, region } });
  }
  addBucket(input: AddBucketInput) {}
}
