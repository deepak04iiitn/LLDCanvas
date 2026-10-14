import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <SiteNavbar alwaysSolid />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
