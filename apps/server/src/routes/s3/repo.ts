import { db } from '@server/utils/db';

export class S3Repo {
  addConfig({
    roleArn,
    externalId,
    userId,
    region,
  }: {
    roleArn: string;
    externalId: string;
    userId: string;
    region: string;
  }) {
    return db.aws_Config.create({ data: { roleArn, externalId, userId, region } });
  }

  getConfigById(id: string) {
    return db.aws_Config.findUnique({ where: { id } });
  }

  getConfigsByUserId(userId: string) {
    return db.aws_Config.findMany({ where: { userId } });
  }

  addBucket({ name, region, configId }: { name: string; region: string; configId: string }) {
    return db.s3_Bucket.create({ data: { name, region, configId, status: 'ACTIVE' } });
  }
}
