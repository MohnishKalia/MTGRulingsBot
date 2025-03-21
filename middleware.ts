import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export const middleware = NextAuth(authConfig).auth;

export const config = {
  matcher: ['/', '/:id', '/api/((?!auth).*)', '/login'],
};
