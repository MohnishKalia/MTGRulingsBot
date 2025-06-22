import { test, expect } from '@playwright/test';

import { config } from '../middleware';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';

const testCasesShouldMatch = [
  '/',
  '/chat/some-id',
  '/api/some/path',
  '/login',
  '/any-other-path',
];

for (const path of testCasesShouldMatch) {
  test(`should match path: ${path}`, () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: path,
      })
    ).toBe(true);
  });
}

const testCasesShouldNotMatch = [
  '/_next/static/css/main.css',
  '/_next/image/img.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/logo.png',
  '/logo.svg',
  '/robots.txt',
  '/site.webmanifest',
  '/sitemap-0.xml',
  '/sitemap.xml',
  '/fonts/myfont.woff2',
  '/api/auth/test',
];

for (const path of testCasesShouldNotMatch) {
  test(`should not match path: ${path}`, () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: path,
      })
    ).toBe(false);
  });
}
