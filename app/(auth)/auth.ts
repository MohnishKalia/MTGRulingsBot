import NextAuth, { type User, type Session } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import RedditProvider from 'next-auth/providers/reddit';
import ResendProvider from 'next-auth/providers/resend';


import { authConfig } from './auth.config';

import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    ...authConfig,
    adapter: NeonAdapter(pool),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        // allowDangerousEmailAccountLinking: true,
      }),
      DiscordProvider({
        clientId: process.env.DISCORD_ID,
        clientSecret: process.env.DISCORD_SECRET,
      }),
      RedditProvider({
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        authorization: {
          params: {
            duration: 'permanent',
          },
        },
      }),
      ResendProvider({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: 'rules.fyi <no-reply@rules.fyi>',
      }),
    ],
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    session: {
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }

        return token;
      },
      async session({
        session,
        token,
      }: {
        session: ExtendedSession;
        token: any;
      }) {
        if (session.user) {
          session.user.id = token.id as string;
        }

        return session;
      },
    },
  };
});
