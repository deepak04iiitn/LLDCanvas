'use client'

import { motion } from 'framer-motion'
import { Check, Lock, Sparkles, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

const FREE_FEATURES = [
  'Unlimited diagrams',
  'All node types (class, interface, enum…)',
  'All relationship types',
  'PNG & SVG export',
  'PlantUML & Mermaid export',
  'Local mode (no login)',
]

const PRO_FEATURES = [
  'Everything in Free',
  '10 GoF design pattern skeletons',
  'LLD problem templates (Parking Lot, ATM…)',
  'More templates added regularly',
  'Priority support',
]

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>Unlock design pattern skeletons and LLD templates</DialogDescription>
        </DialogHeader>

        {/* Header gradient */}
        <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-500 to-violet-600 px-8 py-10 text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight">Upgrade to Pro</h2>
              <p className="text-sm text-indigo-200">Unlock pattern skeletons &amp; templates</p>
            </div>
          </motion.div>

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -right-4 h-48 w-48 rounded-full bg-white/5" />
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-4 p-6">
          {/* Free plan */}
          <div className="rounded-xl border border-gray-200 p-4 dark:border-[#2C2C2E]">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Free</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">$0</p>
              <p className="text-xs text-gray-400">forever</p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className="rounded-xl border-2 border-indigo-500 bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
            <div className="mb-3">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Pro</p>
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Best
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">$8</p>
              <p className="text-xs text-gray-400">per month</p>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 px-6 pb-6 pt-4 dark:border-[#2C2C2E]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600
                       py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200
                       transition-colors hover:bg-indigo-700 dark:shadow-none"
          >
            <Zap className="h-4 w-4" />
            Upgrade to Pro — Coming Soon
          </motion.button>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            Payment integration coming soon. Patterns will unlock for early supporters.
          </p>
        </div>

        {/* Already have lock icon to signal what was blocked */}
        <div className="flex items-center justify-center gap-1.5 pb-4 text-[11px] text-gray-400">
          <Lock className="h-3 w-3" />
          Design pattern skeletons require Pro
        </div>
      </DialogContent>
    </Dialog>
  )
}
