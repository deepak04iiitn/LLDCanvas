'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Box, Loader2 } from 'lucide-react'
import { AppShell } from '@/components/dashboard/AppShell'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { useSeededTemplates } from '@/hooks/useSeededTemplates'
import { TEMPLATES, TEMPLATE_CATEGORIES, type DiagramTemplate } from '@/lib/data/templates'

export default function TemplatesPage() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = useSession()
  const { idByTitle } = useSeededTemplates()
  const [creatingId, setCreatingId] = useState<string | null>(null)

  useEffect(() => { document.title = 'Templates — LLDCanvas' }, [])

  useEffect(() => {
    if (!sessionLoading && !session) router.replace('/')
  }, [session, sessionLoading, router])

  async function createFrom(template?: DiagramTemplate) {
    if (creatingId) return

    let fromTemplateId: string | undefined
    if (template) {
      fromTemplateId = template.seedTitle ? idByTitle.get(template.seedTitle) : undefined
      if (!fromTemplateId) {
        toast.error('That template isn’t available yet')
        return
      }
    }

    setCreatingId(template?.id ?? 'blank')
    try {
      const { diagram } = await api.diagrams.create(fromTemplateId ? { fromTemplateId } : {})
      router.push(`/editor/${diagram._id}`)
    } catch {
      toast.error('Failed to create diagram')
      setCreatingId(null)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }

  if (!session) return null

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <header className="shrink-0 border-b border-hairline px-5 py-5 sm:px-8">
          <h1 className="font-serif text-xl font-medium text-ink">Templates</h1>
          <p className="mt-0.5 text-sm text-ink-faint">
            Start from a well-known LLD interview problem — structure only, not a solved answer.
          </p>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {/* Blank canvas */}
          <button
            onClick={() => createFrom()}
            disabled={creatingId !== null}
            className="mb-10 flex w-full items-center gap-4 rounded-lg border border-dashed border-hairline-strong bg-paper-elevated p-5 text-left transition-all duration-150 hover:border-brand hover:bg-brand-tint/40 disabled:opacity-60 sm:max-w-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper">
              {creatingId === 'blank'
                ? <Loader2 size={18} className="animate-spin text-brand" />
                : <Box size={18} className="text-brand" />}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Blank canvas</p>
              <p className="text-xs text-ink-faint">Start from nothing — press C for your first class.</p>
            </div>
          </button>

          {/* Grouped templates */}
          <div className="space-y-10 pb-8">
            {TEMPLATE_CATEGORIES.map((category) => (
              <section key={category}>
                <h2 className="mb-4 text-xs font-semibold tracking-widest text-ink-faint uppercase">
                  {category}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TEMPLATES.filter((t) => t.category === category).map((t, i) => {
                    const available = !!(t.seedTitle && idByTitle.get(t.seedTitle))
                    const isCreating = creatingId === t.id
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        onClick={() => available && createFrom(t)}
                        disabled={!available || creatingId !== null}
                        title={available ? undefined : 'Coming soon'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        className={`group relative flex items-start gap-3.5 rounded-lg border border-hairline bg-paper-elevated p-4 text-left transition-all duration-150 ${
                          available
                            ? 'hover:border-hairline-strong hover:shadow-sm disabled:opacity-60'
                            : 'cursor-not-allowed opacity-45'
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline transition-colors group-hover:border-brand/40">
                          {isCreating
                            ? <Loader2 size={16} className="animate-spin text-brand" />
                            : <t.Icon size={16} className="text-brand" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">{t.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{t.description}</p>
                        </div>
                        {!available && (
                          <span className="absolute top-3 right-3 rounded-full bg-gold-tint px-1.5 py-0.5 text-[9px] font-medium text-gold">
                            Soon
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
