import { TRPCHandler } from '@server/lib/trpc';
import { S3ConfigInput } from './types';
import { S3Repo } from './repo';
import { encrypt } from '@server/utils/encryption';
import { TRPCError } from '@trpc/server/unstable-core-do-not-import';
import requireSession from '@server/utils/requireSession';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { GetBucketLocationCommand, ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';

export class S3handler {
  private s3Repo: S3Repo;
  constructor(s3Repo: S3Repo) {
    this.s3Repo = s3Repo;
  }

  addConfig: TRPCHandler<S3ConfigInput> = async ({ input, ctx }) => {
    try {
      requireSession(ctx);
      const { user } = ctx.session;
      const { roleArn, externalId, region } = input;

      const sts = new STSClient({ region });

      const existingConfig = await this.s3Repo.verifyConfig({
        roleArn,
        externalId,
        region,
        userId: user.id,
      });

      if (existingConfig) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Configuration already exists for this role ARN and region',
        });
      }

      const assumed = await sts.send(
        new AssumeRoleCommand({
          RoleArn: roleArn,
          ExternalId: externalId,
          RoleSessionName: `s3-verify-${user.id}`,
        })
      );

      if (!assumed.Credentials) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Unable to assume role with provided ARN and External ID',
        });
      }

      if (
        !assumed.Credentials.AccessKeyId ||
        !assumed.Credentials.SecretAccessKey ||
        !assumed.Credentials.SessionToken
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Incomplete credentials received from STS',
        });
      }

      const { AccessKeyId, SecretAccessKey, SessionToken } = assumed.Credentials;

      const s3Init = new S3Client({
        region,
        credentials: {
          accessKeyId: AccessKeyId,
          secretAccessKey: SecretAccessKey,
          sessionToken: SessionToken,
        },
      });

      const encryptedRoleArn = encrypt(roleArn);
      const encryptedExternalId = encrypt(externalId);

      const s3Config = await this.s3Repo.addConfig({
        roleArn: `${encryptedRoleArn.iv}:${encryptedRoleArn.tag}:${encryptedRoleArn.value}`,
        externalId: `${encryptedExternalId.iv}:${encryptedExternalId.tag}:${encryptedExternalId.value}`,
        region,
        userId: user.id,
      });

      const s3Buckets = await s3Init.send(new ListBucketsCommand({}));

      const buckets = s3Buckets.Buckets ?? [];

      for (const bucket of buckets) {
        if (!bucket.Name) continue;

        let bucketRegion = region;
        try {
          const loc = await s3Init.send(new GetBucketLocationCommand({ Bucket: bucket.Name }));
          bucketRegion = !loc.LocationConstraint ? region : loc.LocationConstraint;
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Unable to get location for bucket ${bucket.Name}`,
          });
        }

        await this.s3Repo.addBucket({
          name: bucket.Name,
          region: bucketRegion,
          configId: s3Config.id,
        });
      }
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to store S3 configuration',
      });
    }
  };

  getBuckets: TRPCHandler = async ({ ctx }) => {
    try {
      requireSession(ctx);

      const { user } = ctx.session;

      const configs = await this.s3Repo.getConfigsByUserId(user.id);

      if (configs.length === 0) {
        return { configs: [] };
      }

      const data = await Promise.all(
        configs.map(async (config) => ({
          id: config.id,
          region: config.region,
          buckets: await this.s3Repo.getBucketsByConfigId(config.id),
        }))
      );

      return { configs: data };
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve S3 buckets',
      });
    }
  };
}
