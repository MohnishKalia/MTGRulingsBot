import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';

import { getUser } from '@/lib/db/queries';

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
      Credentials({
        credentials: {},
        async authorize({ email, password }: any) {
          const users = await getUser(email);
          if (users.length === 0) return null;
          // biome-ignore lint: Forbidden non-null assertion.
          const passwordsMatch = await compare(password, users[0].password!);
          if (!passwordsMatch) return null;
          return users[0] as any;
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      DiscordProvider({
        clientId: process.env.DISCORD_ID,
        clientSecret: process.env.DISCORD_SECRET,
      }),
    ],
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
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
