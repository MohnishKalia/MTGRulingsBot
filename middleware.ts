import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export const middleware = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, etc. (metadata files)
     */
    '/((?!api/auth|_next/static|_next/image|static|fonts|android-chrome-192x192.png|android-chrome-512x512.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png|favicon.ico|logo.png|logo.svg|robots.txt|site.webmanifest|sitemap-0.xml|sitemap.xml).*)', // Exclude static assets and all public files
  ],
};
