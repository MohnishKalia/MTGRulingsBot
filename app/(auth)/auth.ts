import NextAuth, { type NextAuthConfig, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import RedditProvider from 'next-auth/providers/reddit';
import ResendProvider from 'next-auth/providers/resend';
import { createGuestUser, getUser } from '@/lib/db/queries';
import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"
import { authConfig } from './auth.config';
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}


export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    ...authConfig,
    adapter: NeonAdapter(pool),
    providers: [
      Credentials({
        id: 'guest',
        credentials: {},
        async authorize() {
          const [guestUser] = await createGuestUser();
          return { ...guestUser, type: 'guest' };
        },
      }),
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
      }),
      ResendProvider({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: 'rules.fyi <no-reply@rules.fyi>',
      }),
    ],
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id as string;
          token.type = user.type;
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id;
          session.user.type = token.type;
        }

        return session;
      },
    },
  } satisfies NextAuthConfig;
});
