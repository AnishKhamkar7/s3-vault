import { SessionUserType } from '@server/@types/express';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { Request, Response } from 'express';

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<{
  req: Request;
  res: Response;
  session?: { sid: string; user: SessionUserType };
}> {
  return { req, res, session: undefined }; // user will be injected by middleware
}

export type Context = Awaited<ReturnType<typeof createContext>>;
