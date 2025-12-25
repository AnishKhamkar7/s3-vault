import { TRPCHandler } from '@server/lib/trpc';
import { AddBucketInput, AddBucketOutput, S3ConfigInput } from './types';
import { S3Repo } from './repo';

export class S3handler {

  private s3Repo: S3Repo;
  constructor( s3Repo : S3Repo) {
    this.s3Repo = s3Repo;
  }

  addS3Config: TRPCHandler<S3ConfigInput> = async ({ input, ctx }) => {
    const {} = ctx
    const { accessKeyId, secretAccessKey, region } = input; 
  
    
  };
}
