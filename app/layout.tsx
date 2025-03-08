import { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

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
        url: "https://rules.fyi/logo.svg",
        type: "image/svg+xml",
        alt: "mohnishkalia"
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
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      },
    ],
    shortcut: [
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      }
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
