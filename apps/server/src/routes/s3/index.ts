import { router as trpcRouter, protectedProcedure } from '@server/lib/trpc';
import { S3Repo } from './repo';
import { S3handler } from './handler';
import { S3ConfigInputSchema } from './types';

const s3Repo = new S3Repo();
const s3Handler = new S3handler(s3Repo);

const appRouter = trpcRouter({
  addConfig: protectedProcedure.input(S3ConfigInputSchema).mutation(s3Handler.addS3Config),
});

export default appRouter;
