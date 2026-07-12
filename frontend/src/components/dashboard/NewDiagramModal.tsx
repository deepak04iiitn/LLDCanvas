'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  ParkingCircle, ArrowUpDown, CreditCard, Film,
  Crown, UtensilsCrossed, Car, Database,
  DollarSign, Gamepad2, BookOpen, FileText, Bell, Box,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { DiagramSummary } from '@/types'

// ─── Template definitions ──────────────────────────────────────────────────────

interface Template {
  id: string
  Icon: LucideIcon
  label: string
}

const TEMPLATES: Template[] = [
  { id: 'parking-lot',   Icon: ParkingCircle,    label: 'Parking Lot' },
  { id: 'elevator',      Icon: ArrowUpDown,       label: 'Elevator System' },
  { id: 'atm',           Icon: CreditCard,        label: 'ATM' },
  { id: 'bookmyshow',    Icon: Film,              label: 'BookMyShow' },
  { id: 'chess',         Icon: Crown,             label: 'Chess' },
  { id: 'food-delivery', Icon: UtensilsCrossed,   label: 'Food Delivery' },
  { id: 'ride-sharing',  Icon: Car,               label: 'Ride Sharing' },
  { id: 'lru-cache',     Icon: Database,          label: 'LRU/LFU Cache' },
  { id: 'splitwise',     Icon: DollarSign,        label: 'Splitwise' },
  { id: 'snake-ladder',  Icon: Gamepad2,          label: 'Snake & Ladder' },
  { id: 'library',       Icon: BookOpen,          label: 'Library System' },
  { id: 'logger',        Icon: FileText,          label: 'Logger' },
  { id: 'notification',  Icon: Bell,              label: 'Notification Service' },
]

interface NewDiagramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (d: DiagramSummary) => void
}

export function NewDiagramModal({ open, onOpenChange, onCreated }: NewDiagramModalProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(tab: 'blank' | 'template') {
    setLoading(true)
    try {
      const payload =
        tab === 'template' && selectedTemplate
          ? { fromTemplateId: selectedTemplate }
          : {}

      const { diagram } = await api.diagrams.create(payload)
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
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              New Diagram
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="blank" className="w-full">
            <TabsList className="w-full mb-5 rounded-lg bg-gray-100 p-1 h-10">
              <TabsTrigger
                value="blank"
                className="flex-1 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Blank Canvas
              </TabsTrigger>
              <TabsTrigger
                value="template"
                className="flex-1 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                From Template
              </TabsTrigger>
            </TabsList>

            {/* ── Blank canvas tab ── */}
            <TabsContent value="blank" className="mt-0">
              <div className="flex flex-col items-center justify-center py-10 px-6">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center mb-5">
                  <Box size={32} className="text-indigo-300" />
                </div>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Start with an empty canvas. Press{' '}
                  <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">C</kbd> to add a
                  class,{' '}
                  <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">I</kbd> for an
                  interface.
                </p>
              </div>
              <DialogFooter className="px-6 pb-6 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="transition-all active:scale-[0.97]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreate('blank')}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all"
                >
                  {loading ? 'Creating…' : 'Create Diagram'}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ── Template tab ── */}
            <TabsContent value="template" className="mt-0">
              <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1 pb-1 no-scrollbar">
                {TEMPLATES.map((t) => {
                  const selected = selectedTemplate === t.id
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      whileTap={{ scale: 0.96 }}
                      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all duration-150 ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          selected ? 'bg-indigo-100' : 'bg-white'
                        }`}
                      >
                        <t.Icon
                          size={17}
                          className={selected ? 'text-indigo-600' : 'text-gray-400'}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 leading-tight">
                        {t.label}
                      </span>

                      {/* Selection checkmark */}
                      {selected && (
                        <motion.span
                          className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                          <Check size={9} className="text-white" strokeWidth={3} />
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <DialogFooter className="px-6 pb-6 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="transition-all active:scale-[0.97]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreate('template')}
                  disabled={loading || !selectedTemplate}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all disabled:opacity-50"
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
