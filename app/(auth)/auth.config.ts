import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl, cookies } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAbout = nextUrl.pathname.startsWith('/about');
      const isOnChat = nextUrl.pathname.startsWith('/') && !isOnLogin && !isOnAbout;

      // Check for first-time visit
      const isFirstTime = !cookies.get('first_time_visit');
      
      // If it's first time and not going to /about, redirect to /about
      if (isFirstTime && nextUrl.pathname === '/') {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': new URL('/about', nextUrl).toString(),
            'Set-Cookie': 'first_time_visit=true; Path=/; Max-Age=31536000; SameSite=Lax'
          }
        });
      }

      // console.log("middleware:", {isLoggedIn, isOnChat, isOnLogin});

      if (isLoggedIn && (isOnLogin)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnLogin || isOnAbout) {
        return true; // Always allow access to login and about pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
