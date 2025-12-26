import { TRPCHandler } from '@server/lib/trpc';
import { AddBucketInput, AddBucketOutput, S3ConfigInput } from './types';
import { S3Repo } from './repo';
import { encrypt } from '@server/utils/encryotion';
import { TRPCError } from '@trpc/server/unstable-core-do-not-import';

export class S3handler {
  private s3Repo: S3Repo;
  constructor(s3Repo: S3Repo) {
    this.s3Repo = s3Repo;
  }

  addS3Config: TRPCHandler<S3ConfigInput> = async ({ input, ctx }) => {
    const {} = ctx;
    const { accessKeyId, secretAccessKey, region } = input;

    try {
      const encryptedSecret = encrypt(secretAccessKey);
      const encryptedAccess = encrypt(accessKeyId);

      const result = await this.s3Repo.addConfig({
        accessKeyId: `${encryptedAccess.iv}:${encryptedAccess.tag}:${encryptedAccess.value}`,
        secretAccessKey: `${encryptedSecret.iv}:${encryptedSecret.tag}:${encryptedSecret.value}`,
        region,
      });

      return result;
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to store S3 configuration',
      });
    }
  };
}
