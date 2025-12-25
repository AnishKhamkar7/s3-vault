import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request } from 'express';
import { BaseContext } from '@server/types';

export async function createContext(opts: CreateExpressContextOptions): Promise<BaseContext> {
  return {
    req: opts.req,
    res: opts.res,
    session: undefined,
  };
}
