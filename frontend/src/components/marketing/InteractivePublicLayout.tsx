import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

/**
 * Public product shell for Interactive LLD hubs.
 * Not AppShell / Dashboard — discoverable from the marketing navbar.
 */
export default function InteractivePublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <SiteNavbar alwaysSolid />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
