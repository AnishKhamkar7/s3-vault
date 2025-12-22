import { COOKIE_CONFIG, session } from '@server/utils/session';
import { db } from '@server/utils/db';
import { env } from '@server/utils/env';
import { Context } from '@server/lib/trpc';
import { TRPCError } from '@trpc/server';
import z from 'zod';
import types from './types';
import { TEMPLATES } from '@server/ejs-templates';
import { renderFile } from 'ejs';
import { Strategy, Verification } from '@prisma/client';
import { sendEmail } from '@server/utils/nodemailer';

export const auth = async ({ input }: { input: z.infer<typeof types.Auth> }) => {
  const { email, type, name } = input;

  const exists = await db.user.findUnique({ where: { email }, select: { id: true, name: true, strategy: true } });
  if (exists && type === 'SIGN_UP') throw new TRPCError({ code: 'BAD_REQUEST', message: 'User already exists!' });
  if (!exists && type === 'SIGN_IN')
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'User does not exist! Signup needed!' });
  if (type === 'SIGN_UP' && !name) throw new TRPCError({ code: 'BAD_REQUEST', message: "User's name is required!" });
  if (exists && exists.strategy !== 'EMAIL')
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Account already exists with another login strategy!' });

  const verification = await db.verification.findFirst({ where: { email } });
  if (verification) throw new TRPCError({ code: 'CONFLICT', message: 'Verification link already sent!!' });

  const _name = type === 'SIGN_IN' ? exists!.name : name!;
  let _verification: Verification | undefined = undefined;

  if (env.NODE_ENV === 'development' && email === 'root@gmail.com') {
    _verification = await db.verification.create({ data: { id: 'randomuuid', email, name: _name, type: type } });
  } else {
    _verification = await db.verification.create({ data: { email, name: _name, type: type } });
  }

  const template = await renderFile(TEMPLATES.verification, {
    name: input.email,
    to: encodeURIComponent(input.email),
    code: _verification.id,
  });
  await sendEmail(input.email, { subject: 'Complete Your Authentication', html: template });

  return { success: true, message: 'Code sent successfully!' };
};

export const verify = async ({ input, ctx }: { input: z.infer<typeof types.Verify>; ctx: Context }) => {
  const { email, code } = input;

  const verification = await db.verification.findFirst({ where: { email, id: code } });
  if (!verification) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials!!' });

  let user = await db.user.findFirst({
    where: { email },
    include: { collaborations: { include: { role: true } }, groups: true, subscriptions: true },
  });

  if (verification.type === 'SIGN_IN') {
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found!' });
  } else
    user = await db.user.create({
      data: { name: verification.name, email: verification.email, strategy: Strategy.EMAIL },
      include: { collaborations: { include: { role: true } }, groups: true, subscriptions: true },
    });

  const { accessToken, refreshToken } = await session.create({ ...user });
  await db.verification.delete({ where: { id: verification.id } });

  ctx.res.cookie('Access-Token', accessToken, COOKIE_CONFIG.access);
  ctx.res.cookie('Refresh-Token', refreshToken, COOKIE_CONFIG.refresh);

  //to change the response type and return user details
  return { accessToken, refreshToken, success: true, message: 'Logged in successfully!!' };
};

export const refresh = async ({ ctx }: { ctx: Context }) => {
  const token = ctx.req.cookies['Refresh-Token'];
  if (!token) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Refresh token missing!!' });

  const { accessToken, refreshToken } = await session.refresh(token);

  ctx.res.cookie('Access-Token', accessToken ?? '', {
    ...COOKIE_CONFIG.access,
    maxAge: accessToken ? COOKIE_CONFIG.access.maxAge : 1,
  });
  ctx.res.cookie('Refresh-Token', refreshToken ?? '', {
    ...COOKIE_CONFIG.refresh,
    maxAge: refreshToken ? COOKIE_CONFIG.refresh.maxAge : 1,
  });

  if (!accessToken || !refreshToken) return { success: false, message: 'Invalid request!' };

  return { success: true, message: 'Token refreshed successfully!!', accessToken, refreshToken };
};

export const signOut = async ({ ctx }: { ctx: Context }) => {
  const token = ctx.req.cookies['Refresh-Token'];
  if (!token) throw new TRPCError({ code: 'FORBIDDEN', message: 'Refresh token missing!!' });

  const { accessToken, refreshToken } = await session.destroy(token);

  // Expire cookies
  ctx.res.cookie('Access-Token', accessToken ?? '', { ...COOKIE_CONFIG.access, maxAge: 1 });
  ctx.res.cookie('Refresh-Token', refreshToken ?? '', { ...COOKIE_CONFIG.refresh, maxAge: 1 });

  return { success: true, message: 'Logged out successfully!!' };
};

export const profile = async ({ ctx }: { ctx: Context }) => {
  const user = ctx.session?.user;
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
  return user;
};

export const getCode = async ({ input }: { input: { email: string } }) => {
  const { email } = input;
  const verification = await db.verification.findFirst({ where: { email } });
  if (!verification) throw new TRPCError({ code: 'NOT_FOUND', message: 'No verification code found for this user' });

  return { code: verification.id };
};
