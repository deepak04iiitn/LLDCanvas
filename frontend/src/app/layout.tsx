import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full bg-[#F8F8F8] text-gray-900">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
