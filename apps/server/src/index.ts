import express, { Express, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { env } from './utils/env';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { createContext } from './lib/trpc/context';

const app: Express = express();

import corsOptions from './cors';

app.use(corsOptions);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.listen(4000, async () => console.log(`[server]: Server is running at http://localhost:${env.PORT}`));

interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    givenName: string;
    familyName: string;
  };
  email: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
  picture: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/callback',
      passReqToCallback: true,
    },
    async (req: Request, _accessToken: string, _refreshToken: string, profile: GoogleProfile, done: any) => {
      try {
        const res = req.res!;
        let user = await db.user.findUnique({
          where: { email: profile.email },
          include: { collaborations: { include: { role: true } }, groups: true, subscriptions: true },
        });

        if (user && user.strategy === 'EMAIL')
          return res.status(400).json({ success: false, message: 'User already exist with another strategy!' });
        if (!user)
          user = await db.user.create({
            data: { email: profile.email, name: profile.displayName, strategy: 'GOOGLE' },
            include: { collaborations: { include: { role: true } }, groups: true, subscriptions: true },
          });

        const { accessToken, refreshToken } = await session.create(user);

        res.cookie('Access-Token', accessToken, COOKIE_CONFIG.access);
        res.cookie('Refresh-Token', refreshToken, COOKIE_CONFIG.refresh);

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.CLIENT_URL}/login?error=auth_failed` }),
  (req: Request, res: Response) => {
    // On success, redirect to dashboard
    res.redirect(`${env.CLIENT_URL}/dashboard`);
  }
);

import router from './routes';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { TRPCError } from '@trpc/server';
import { db } from './utils/db';
import { COOKIE_CONFIG, session } from './utils/session';

app.use('/trpc', createExpressMiddleware({ router, createContext }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new TRPCError({ code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found.` });
  next(error);
});
