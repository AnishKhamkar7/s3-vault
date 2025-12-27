import { TRPCHandler } from '@server/lib/trpc';
import { S3ConfigInput } from './types';
import { S3Repo } from './repo';
import { encrypt } from '@server/utils/encryotion';
import { TRPCError } from '@trpc/server/unstable-core-do-not-import';
import requireSession from '@server/utils/requireSession';

export class S3handler {
  private s3Repo: S3Repo;
  constructor(s3Repo: S3Repo) {
    this.s3Repo = s3Repo;
  }

  addS3Config: TRPCHandler<S3ConfigInput> = async ({ input, ctx }) => {
    requireSession(ctx);
    const { user } = ctx.session;
    const { roleArn, externalId, region } = input;

    try {
      const encryptedRoleArn = encrypt(roleArn);
      const encryptedExternalId = encrypt(externalId);

      const result = await this.s3Repo.addConfig({
        roleArn: `${encryptedRoleArn.iv}:${encryptedRoleArn.tag}:${encryptedRoleArn.value}`,
        externalId: `${encryptedExternalId.iv}:${encryptedExternalId.tag}:${encryptedExternalId.value}`,
        region,
        userId: user.id,
      });

      //Get
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to store S3 configuration',
      });
    }
  };
}
