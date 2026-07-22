'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const LINKS = [
  { href: '/features/editor',              label: 'The Editor',          note: 'UML diagram canvas'   },
  { href: '/features/draft-notation',      label: 'Draft Notation',      note: 'Text → diagram'   },
  { href: '/features/interview-mode',      label: 'Interview Mode',      note: 'Timed practice'        },
  { href: '/features/interview-questions', label: 'Interview Questions', note: '100+ problems'         },
  { href: '/features/revision-notes',      label: 'Revision Notes',      note: 'Concept refreshers'    },
  { href: '/features/code-execution',      label: 'Code Execution',      note: '12 languages'          },
  { href: '/features/collaboration',       label: 'Collaboration',       note: 'Real-time sync'        },
  { href: '/pricing',                      label: 'Pricing',             note: 'Plans & billing'       },
  { href: '/docs',                         label: 'Docs',                note: 'Guides & API'          },
]

// Rendered near the bottom of every /features/** page — every page links to
// every other public section, satisfying the "strong internal linking"
// requirement everywhere, not just from a hub page. A numbered ledger-style
// grid (hairline-thin dividers via the gap-px/bg-hairline trick) rather than
// a flat wrapped link list, with a staggered fade-up as it scrolls into view.
export function FeatureCrossLinks({ exclude }: { exclude?: string }) {
  const links = LINKS.filter(l => l.href !== exclude)
  return (
    <div className="border-t border-hairline bg-paper-elevated/40 px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
          <span className="text-gold">&rarr;</span>&nbsp;&nbsp;Explore more
        </p>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-3">
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
            >
              <Link
                href={l.href}
                className="group flex h-full flex-col justify-between gap-4 bg-paper-elevated p-5 transition-colors hover:bg-paper"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] text-ink-faint/70">{String(i + 1).padStart(2, '0')}</span>
                  <ArrowUpRight className="h-4 w-4 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                </div>
                <div>
                  <p className="font-serif text-[15px] font-medium text-ink transition-colors group-hover:text-brand">{l.label}</p>
                  <p className="mt-1 text-[12.5px] text-ink-muted">{l.note}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
