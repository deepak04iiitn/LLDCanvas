import { AppShell } from '@/components/dashboard/AppShell'
import { PlannrChrome } from '@/components/plannr/shared/PlannrChrome'

export default function PlannrLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <PlannrChrome>{children}</PlannrChrome>
    </AppShell>
  )
}
