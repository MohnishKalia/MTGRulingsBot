import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export const middleware = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/', // Match the root path
    '/:id', // Match dynamic paths with an ID
    '/api/((?!auth).*)', // Match all API routes except those starting with "auth"
    '/((?!_next/static|_next/image|favicon.ico|android-chrome-192x192.png|android-chrome-512x512.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png|favicon.ico|logo.png|logo.svg|robots.txt|site.webmanifest|sitemap-0.xml|sitemap.xml|fonts/).*)', // Exclude static assets and all public files
    '/login', // Match the login page
  ],
};
