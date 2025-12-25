import { router as trpcRouter } from '@server/lib/trpc';
import s3Router from './s3';

const appRouter = trpcRouter({
  s3: s3Router,
});

export default appRouter;
