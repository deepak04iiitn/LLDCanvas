'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Box, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { DiagramSummary } from '@/types'

interface NewDiagramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (d: DiagramSummary) => void
}

export function NewDiagramModal({ open, onOpenChange, onCreated }: NewDiagramModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    try {
      const { diagram } = await api.diagrams.create()
      onCreated?.(diagram as unknown as DiagramSummary)
      onOpenChange(false)
      router.push(`/editor/${diagram._id}`)
    } catch {
      toast.error('Failed to create diagram')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated p-0 shadow-xl sm:max-w-sm">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-serif text-lg font-medium text-ink">
              New UML Diagram
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center px-4 py-6">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-hairline-strong bg-paper">
              {loading
                ? <Loader2 size={30} className="animate-spin text-brand" />
                : <Box size={30} className="text-brand" />}
            </div>
            <p className="max-w-xs text-center text-sm text-ink-muted">
              Start with an empty canvas. Press{' '}
              <kbd className="rounded border border-hairline-strong bg-paper px-1.5 py-0.5 text-xs">C</kbd>{' '}
              to add a class,{' '}
              <kbd className="rounded border border-hairline-strong bg-paper px-1.5 py-0.5 text-xs">I</kbd>{' '}
              for an interface.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-hairline-strong transition-all active:scale-[0.97]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-brand text-brand-foreground transition-all hover:bg-brand-hover active:scale-[0.97]"
            >
              {loading ? 'Creating…' : 'Create UML Diagram'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
