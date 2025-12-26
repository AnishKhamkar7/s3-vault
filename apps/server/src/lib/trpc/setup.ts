import { initTRPC, TRPCError } from '@trpc/server';
import { AuthedContext, BaseContext, SessionUserType } from '@server/types';
import { session } from '@server/utils/session';

const t = initTRPC.context<BaseContext>().create({});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure: typeof t.procedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    const token = ctx.req.cookies['Access-Token'];
    if (!token) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Access token missing' });

    const payload = await session.read(token);
    const user = payload.user as SessionUserType;

    return next({
      ctx: { ...ctx, session: { sid: payload.sid, user } } satisfies AuthedContext,
    });
  } catch (e) {
    if (e === 'Expired')
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Session expired - refresh token to continue!' });
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized access - login required' });
  }
});

export const middleware = t.middleware;

export type TRPCHandler<I = undefined> = (temp: { input: I; ctx: BaseContext }) => Promise<unknown>;
