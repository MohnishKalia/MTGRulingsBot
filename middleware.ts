import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export const middleware = NextAuth(authConfig).auth;

// Matcher patterns for route handling
const excludeStaticAssetsPattern = '/((?!_next/static|_next/image|favicon.ico).*)'; // Exclude static assets and favicon.ico

export const config = {
  matcher: [
    '/', // Match the root path
    '/:id', // Match dynamic paths with an ID
    '/api/((?!auth).*)', // Match all API routes except those starting with "auth"
    excludeStaticAssetsPattern, // All except static assets and favicon.ico
    '/login', // Match the login page
  ],
};
