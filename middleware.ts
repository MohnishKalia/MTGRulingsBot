import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export const middleware = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/', // Match the root path
    '/:id', // Match dynamic paths with an ID
    '/api/((?!auth).*)', // Match all API routes except those starting with "auth"
    '/((?!_next/static|_next/image|favicon.ico).*)', // All except static assets and favicon.ico
    '/login', // Match the login page
  ],
};
