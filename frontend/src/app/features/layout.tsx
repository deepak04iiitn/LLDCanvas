import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'

// Shared marketing shell for the whole /features/** tree — kept as its own
// nested layout (not the root layout) so /dashboard, /admin, /editor stay
// untouched. Every page under here is a server component for real SSR/SEO,
// unlike the client-only dashboard pages.
export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <SiteNavbar alwaysSolid />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
