import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { InterviewProvider } from '@/contexts/InterviewContext'
import { AuthProvider } from '@/lib/auth'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Display serif for headings on marketing/dashboard/settings pages only —
// the editor's own chrome never references --font-serif.
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
})

// metadataBase anchors every relative URL used in openGraph/twitter metadata
// (across this file and every page's own metadata export) into an absolute
// URL. Without it, Next.js falls back to http://localhost:3000 for OG/Twitter
// image tags in production — silently breaking link-preview cards everywhere.
const SITE_URL = 'https://lldcanvas.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s — LLDCanvas',
    default: 'LLDCanvas — Free LLD & System Design Interview Preparation Platform',
  },
  description:
    'Practice Low-Level Design (LLD) and System Design interviews for free: a UML class diagram editor, 23 design patterns, SOLID principles notes, 100+ curated LLD interview questions, timed Interview Mode, and runnable code — all in one platform.',
  applicationName: 'LLDCanvas',
  keywords: [
    'LLD interview', 'Low-Level Design interview', 'LLD interview preparation', 'LLD interview practice',
    'LLD course', 'free LLD course', 'learn low-level design', 'low-level design tutorial',
    'low-level design examples', 'low-level design questions', 'low-level design problems',
    'system design interview', 'system design preparation', 'system design course',
    'object-oriented design', 'design patterns', 'SOLID principles', 'UML class diagram',
    'software design interview', 'SDE interview preparation',
  ],
  authors: [{ name: 'LLDCanvas' }],
  category: 'technology',
  openGraph: {
    title: 'LLDCanvas — Free LLD & System Design Interview Preparation Platform',
    description:
      'A UML class diagram editor, 23 design patterns, SOLID principles notes, 100+ curated LLD interview questions, timed practice with analytics, and runnable code — everything for your next LLD or system design interview.',
    type: 'website',
    siteName: 'LLDCanvas',
    locale: 'en_US',
    images: [{ url: '/LLDCanvas.png', width: 1774, height: 887, alt: 'LLDCanvas — Low-Level Design interview preparation platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lldcanvas',
    title: 'LLDCanvas — Free LLD & System Design Interview Prep',
    description: 'UML editor, 23 design patterns, SOLID principles notes, LLD interview questions, timed practice, and runnable code — all in one place.',
    images: ['/LLDCanvas.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/LLDCanvas_Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-x-hidden bg-paper text-ink">
        <AuthProvider>
          <InterviewProvider>
            <TooltipProvider>
              <AnalyticsProvider />
              {children}
              <FeedbackWidget />
            </TooltipProvider>
          </InterviewProvider>
        </AuthProvider>
        {/* Forced light: there's no dark-mode toggle anywhere in the app shell,
            so the Toaster must not fall back to next-themes' "system" default
            (which silently renders dark-styled toasts under a dark OS setting). */}
        <Toaster richColors position="bottom-right" theme="light" />
      </body>
    </html>
  )
}
