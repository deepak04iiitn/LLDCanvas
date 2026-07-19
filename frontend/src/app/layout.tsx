import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { InterviewProvider } from '@/contexts/InterviewContext'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { OAuthTokenBridge } from '@/components/OAuthTokenBridge'
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

export const metadata: Metadata = {
  title: {
    template: '%s — LLDCanvas',
    default: 'LLDCanvas',
  },
  description: 'The fastest way to create UML diagrams for Low-Level Design interviews. Draw class diagrams, relationships, and design patterns in seconds.',
  keywords: ['UML', 'Low-Level Design', 'LLD', 'class diagram', 'interview prep', 'software design'],
  openGraph: {
    title: 'LLDCanvas — UML diagrams for LLD interviews',
    description: 'The fastest way to create UML class diagrams for Low-Level Design interviews.',
    type: 'website',
    siteName: 'LLDCanvas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLDCanvas — UML diagrams for LLD interviews',
    description: 'Draw class diagrams, design patterns, and LLD skeletons instantly.',
  },
  icons: {
    icon: '/favicon.svg',
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
        <InterviewProvider>
          <TooltipProvider>
            <AnalyticsProvider />
            <OAuthTokenBridge />
            {children}
            <FeedbackWidget />
          </TooltipProvider>
        </InterviewProvider>
        {/* Forced light: there's no dark-mode toggle anywhere in the app shell,
            so the Toaster must not fall back to next-themes' "system" default
            (which silently renders dark-styled toasts under a dark OS setting). */}
        <Toaster richColors position="bottom-right" theme="light" />
      </body>
    </html>
  )
}
