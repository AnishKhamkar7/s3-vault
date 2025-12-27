import { BaseContext,AuthedContext } from "@server/types";
import { TRPCError } from "@trpc/server";

export default function requireSession(ctx: BaseContext): asserts ctx is AuthedContext {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
}
