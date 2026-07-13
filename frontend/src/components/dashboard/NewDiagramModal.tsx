'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Check, Box } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { TEMPLATES } from '@/lib/data/templates'
import { useSeededTemplates } from '@/hooks/useSeededTemplates'
import { DiagramSummary } from '@/types'

interface NewDiagramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (d: DiagramSummary) => void
}

export function NewDiagramModal({ open, onOpenChange, onCreated }: NewDiagramModalProps) {
  const router = useRouter()
  const { idByTitle } = useSeededTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(tab: 'blank' | 'template') {
    let fromTemplateId: string | undefined
    if (tab === 'template') {
      const template = TEMPLATES.find((t) => t.id === selectedTemplate)
      fromTemplateId = template?.seedTitle ? idByTitle.get(template.seedTitle) : undefined
      if (!fromTemplateId) {
        toast.error('That template isn’t available yet')
        return
      }
    }

    setLoading(true)
    try {
      const { diagram } = await api.diagrams.create(fromTemplateId ? { fromTemplateId } : {})
      onCreated?.(diagram as unknown as DiagramSummary)
      onOpenChange(false)
      setSelectedTemplate(null)
      router.push(`/editor/${diagram._id}`)
    } catch {
      toast.error('Failed to create diagram')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { onOpenChange(v); if (!v) setSelectedTemplate(null) }}
    >
      <DialogContent className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated p-0 shadow-xl sm:max-w-[620px]">
        <div className="p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-lg font-medium text-ink">
              New Diagram
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="blank" className="w-full">
            <TabsList className="mb-5 h-10 w-full rounded-md bg-paper p-1">
              <TabsTrigger
                value="blank"
                className="flex-1 rounded-md text-sm transition-all data-[state=active]:bg-paper-elevated data-[state=active]:shadow-sm"
              >
                Blank Canvas
              </TabsTrigger>
              <TabsTrigger
                value="template"
                className="flex-1 rounded-md text-sm transition-all data-[state=active]:bg-paper-elevated data-[state=active]:shadow-sm"
              >
                From Template
              </TabsTrigger>
            </TabsList>

            {/* ── Blank canvas tab ── */}
            <TabsContent value="blank" className="mt-0">
              <div className="flex flex-col items-center justify-center px-6 py-10">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-hairline-strong bg-paper">
                  <Box size={30} className="text-brand" />
                </div>
                <p className="max-w-xs text-center text-sm text-ink-muted">
                  Start with an empty canvas. Press{' '}
                  <kbd className="rounded border border-hairline-strong bg-paper px-1.5 py-0.5 text-xs">C</kbd> to add a
                  class,{' '}
                  <kbd className="rounded border border-hairline-strong bg-paper px-1.5 py-0.5 text-xs">I</kbd> for an
                  interface.
                </p>
              </div>
              <DialogFooter className="px-6 pt-2 pb-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-hairline-strong transition-all active:scale-[0.97]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreate('blank')}
                  disabled={loading}
                  className="bg-brand text-brand-foreground transition-all hover:bg-brand-hover active:scale-[0.97]"
                >
                  {loading ? 'Creating…' : 'Create Diagram'}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ── Template tab ── */}
            <TabsContent value="template" className="mt-0">
              <div className="no-scrollbar grid max-h-64 grid-cols-3 gap-3 overflow-y-auto pr-1 pb-1 sm:grid-cols-4">
                {TEMPLATES.map((t) => {
                  const available = !!(t.seedTitle && idByTitle.get(t.seedTitle))
                  const selected = available && selectedTemplate === t.id
                  return (
                    <motion.button
                      key={t.id}
                      type="button"
                      onClick={() => available && setSelectedTemplate(t.id)}
                      whileTap={available ? { scale: 0.96 } : undefined}
                      disabled={!available}
                      title={available ? undefined : 'Coming soon'}
                      className={`relative flex flex-col items-center gap-2.5 rounded-lg border p-4 text-center transition-all duration-150 ${
                        !available
                          ? 'cursor-not-allowed border-hairline bg-paper opacity-45'
                          : selected
                            ? 'border-brand bg-brand-tint shadow-sm'
                            : 'border-hairline bg-paper hover:border-hairline-strong hover:bg-paper-elevated'
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-elevated">
                        <t.Icon
                          size={17}
                          className={selected ? 'text-brand' : 'text-ink-faint'}
                        />
                      </div>
                      <span className="text-[11px] leading-tight font-medium text-ink">
                        {t.label}
                      </span>

                      {/* Selection checkmark */}
                      {selected && (
                        <motion.span
                          className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                          <Check size={9} className="text-brand-foreground" strokeWidth={3} />
                        </motion.span>
                      )}

                      {/* Not-yet-available badge */}
                      {!available && (
                        <span className="absolute top-1.5 right-1.5 rounded-full bg-gold-tint px-1.5 py-0.5 text-[9px] font-medium text-gold">
                          Soon
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <DialogFooter className="px-6 pt-4 pb-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-hairline-strong transition-all active:scale-[0.97]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreate('template')}
                  disabled={loading || !selectedTemplate}
                  className="bg-brand text-brand-foreground transition-all hover:bg-brand-hover active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? 'Creating…' : 'Create Diagram'}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
