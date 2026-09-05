import type { ReactNode } from 'react'

// Completely isolated layout — no FAB, no auth providers, no analytics,
// no navbar/footer. Only the bare minimum to render the maintenance page.
export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
