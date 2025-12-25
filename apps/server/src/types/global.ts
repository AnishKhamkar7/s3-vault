import { Collaboration, Role, Subscription, User } from '@prisma/client';
import { Request, Response } from 'express';

export type SessionUserType = User & {
  collaborations: (Collaboration & { role: Role })[];
  subscription?: Subscription;
};

export type BaseContext = {
  req: Request;
  res: Response;
  session?: {
    sid: string;
    user: SessionUserType;
  };
};

export type AuthedContext = BaseContext & {
  session: {
    sid: string;
    user: SessionUserType;
  };
};
