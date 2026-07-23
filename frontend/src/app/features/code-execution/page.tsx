import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { CodeExecutionPageClient } from '@/components/features/CodeExecutionPageClient'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Run Code in 12 Languages - Online Code Execution | LLDCanvas',
  description:
    "Don't just design it — run it. LLDCanvas lets you write and execute real code in 12 languages (Python, Java, Go, Rust, C++, TypeScript, and more) in the same workspace as your UML class diagram. No tab-switching, no local setup, no waiting. Integrated code execution for Low-Level Design practice.",
  keywords: [
    'online code execution',
    'run code online',
    'LLD coding practice',
    'code editor online',
    'Java Python Go code runner',
    'design and code',
    'LLD implementation',
    'online compiler',
    'multi-language code runner',
    'software design implementation',
    'UML to code',
    'low level design code',
    'code execution sandbox',
    'run python java go online',
  ],
  alternates: { canonical: '/features/code-execution' },
  openGraph: {
    title: 'Code Execution in 12 Languages - LLDCanvas',
    description:
      'Write and run real code next to your UML diagram. Python, Java, Go, Rust, TypeScript, and 7 more — all in one workspace.',
    type: 'website',
    url: '/features/code-execution',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Run Code in 12 Languages | LLDCanvas',
    description:
      'Execute real code in a sandboxed environment right inside your LLD diagram workspace. No local setup needed.',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CodeExecutionFeaturePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Code Execution - Run Code in 12 Languages | LLDCanvas',
        url: 'https://lldcanvas.com/features/code-execution',
        description:
          'Write and execute real code in 12 programming languages within the LLDCanvas workspace — no local setup required.',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Features', item: 'https://lldcanvas.com/features' },
          { '@type': 'ListItem', position: 2, name: 'Code Execution', item: 'https://lldcanvas.com/features/code-execution' },
        ],
      }} />

      <CodeExecutionPageClient />
    </>
  )
}
