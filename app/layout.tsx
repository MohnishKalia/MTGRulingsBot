import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'rules.fyi - Rules Bot',
  description: 'rules.fyi is a chatbot that helps answer ruling questions for the Magic: The Gathering card game.',
  metadataBase: new URL("https://rules.fyi"),
  openGraph: {
    siteName: "rules.fyi - Rules Bot",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: 'rules.fyi - Rules Bot',
    description: 'rules.fyi is a chatbot that helps answer ruling questions for the Magic: The Gathering card game.',
    creator: "@MohnishKalia",
    site: "@MohnishKalia",
    images: [
      {
        url: "/logo.png",
        type: "image/png",
        alt: "mohnishkalia",
        height: 600,
        width: 1000
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow"
  },
  applicationName: "rules.fyi - Rules Bot",
  appleWebApp: {
    title: "rules.fyi - Rules Bot",
    statusBarStyle: "default",
    capable: true
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32"
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16"
      },
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      }
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ],
    shortcut: [
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      }
    ]
  }
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
