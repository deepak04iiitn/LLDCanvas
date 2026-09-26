import { AppShell } from '@/components/dashboard/AppShell'

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
