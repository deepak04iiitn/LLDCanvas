'use client'

import { useEffect } from 'react'
import { Mail, CalendarClock } from 'lucide-react'
import { getCalApi } from '@calcom/embed-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

const SUPPORT_EMAIL = 'support.lldcanvas@gmail.com'
const CAL_LINK = 'deepak-yadav-04/lld-canvas'
const CAL_NAMESPACE = 'lld-canvas'

interface InternationalUpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
}

export function InternationalUpgradeModal({ open, onOpenChange, planName }: InternationalUpgradeModalProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE })
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' })
    })()
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated p-0 shadow-xl sm:max-w-sm">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-lg font-medium text-ink">
              International payments
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-paper">
              <CalendarClock className="h-5 w-5 text-brand" />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              International payments are not supported through our payment gateway yet.
              To upgrade to <span className="font-medium text-ink">{planName}</span>, please
              contact our support team or schedule a quick call — we&apos;ll manually onboard
              you and activate your subscription.
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Upgrade to ${planName} — international payment`)}`}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-hairline-strong bg-paper py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hairline/30"
            >
              <Mail className="h-4 w-4" />
              Email {SUPPORT_EMAIL}
            </a>

            <button
              data-cal-namespace={CAL_NAMESPACE}
              data-cal-link={CAL_LINK}
              data-cal-config={JSON.stringify({ layout: 'month_view', useSlotsViewOnSmallScreen: 'true' })}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              <CalendarClock className="h-4 w-4" />
              Schedule a call
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
