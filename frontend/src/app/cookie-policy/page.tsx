import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Cookie, BarChart3, Settings2, ShieldCheck, Mail, ToggleLeft } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { Reveal } from '@/components/features/Reveal'

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Cookie Policy | LLDCanvas',
  description:
    'Learn how LLDCanvas uses cookies and similar tracking technologies on its Low-Level Design interview preparation platform. Understand what cookies we set, why we use them, and how you can control them.',
  alternates: { canonical: '/cookie-policy' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Cookie Policy | LLDCanvas',
    description: 'How LLDCanvas uses cookies on its Low-Level Design interview preparation platform.',
    type: 'website',
    url: '/cookie-policy',
  },
}

// ── Data ─────────────────────────────────────────────────────────────────────

const LAST_UPDATED = 'October 4, 2026'

type CookieRow = {
  name: string
  provider: string
  purpose: string
  duration: string
  type: 'Essential' | 'Analytics' | 'Functional'
}

const COOKIE_TABLE: CookieRow[] = [
  {
    name: 'session_token',
    provider: 'LLDCanvas',
    purpose: 'Maintains your authenticated session so you stay logged in as you navigate the platform.',
    duration: 'Session / 30 days',
    type: 'Essential',
  },
  {
    name: 'csrf_token',
    provider: 'LLDCanvas',
    purpose: 'Protects against cross-site request forgery attacks on form submissions.',
    duration: 'Session',
    type: 'Essential',
  },
  {
    name: 'theme_pref',
    provider: 'LLDCanvas',
    purpose: 'Remembers your UI preferences (e.g. colour theme) between visits.',
    duration: '1 year',
    type: 'Functional',
  },
  {
    name: 'interview_state',
    provider: 'LLDCanvas',
    purpose: 'Preserves the state of an active Interview Mode session in case of page reload.',
    duration: 'Session',
    type: 'Functional',
  },
  {
    name: '_ahrefs_*',
    provider: 'Ahrefs',
    purpose: 'Measures anonymous site traffic and page performance to help us improve the platform. No personal data is linked to these cookies.',
    duration: '30 days',
    type: 'Analytics',
  },
]

const TYPE_COLORS: Record<CookieRow['type'], string> = {
  Essential: 'border-brand/25 bg-brand-tint text-brand',
  Analytics:  'border-amber-200 bg-amber-50 text-amber-700',
  Functional: 'border-purple-200 bg-purple-50 text-purple-700',
}

const CATEGORY_CARDS = [
  {
    Icon: ShieldCheck,
    title: 'Strictly necessary',
    color: 'border-brand/25 bg-brand-tint',
    iconColor: 'text-brand',
    body: 'These cookies are essential for the Platform to function. They enable core features such as authentication, security, and session persistence. You cannot opt out of these cookies while using LLDCanvas.',
    examples: ['Session authentication', 'CSRF protection', 'Security tokens'],
  },
  {
    Icon: Settings2,
    title: 'Functional',
    color: 'border-purple-200 bg-purple-50',
    iconColor: 'text-purple-600',
    body: 'These cookies remember your preferences and settings to provide a more personalised experience. They are not strictly required but improve your use of the Platform.',
    examples: ['UI preferences', 'Interview session state', 'Editor settings'],
  },
  {
    Icon: BarChart3,
    title: 'Analytics',
    color: 'border-amber-200 bg-amber-50',
    iconColor: 'text-amber-600',
    body: 'We use Ahrefs Analytics to understand how visitors interact with LLDCanvas. This helps us improve the platform. Analytics data is aggregated and anonymous — we cannot identify individual users from it.',
    examples: ['Page visit counts', 'Traffic sources', 'Feature usage patterns'],
  },
]

type Section = {
  id: string
  title: string
  content: React.ReactNode
}

// ── Prose section helper ─────────────────────────────────────────────────────

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 text-[15px] leading-relaxed text-ink-muted">{children}</div>
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CookiePolicyPage() {
  return (
    <div className="overflow-x-hidden">

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Cookie Policy — LLDCanvas',
        description: 'How LLDCanvas uses cookies and similar technologies on its Low-Level Design interview preparation platform.',
        url: 'https://www.lldcanvas.in/cookie-policy',
        isPartOf: { '@type': 'WebSite', name: 'LLDCanvas', url: 'https://www.lldcanvas.in' },
      }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative border-b border-hairline bg-paper">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(166,159,140,0.22) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-10 sm:px-8 sm:pt-14">
          <Reveal>
            <p className="mb-4 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶00</span>&nbsp;&nbsp;·&nbsp;&nbsp;Legal
            </p>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">
              Cookie Policy
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[10px] text-ink-muted">
                Last updated: {LAST_UPDATED}
              </span>
              <Link
                href="/terms"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-brand hover:underline"
              >
                Terms &amp; Conditions <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ink-muted">
              LLDCanvas uses a small number of cookies to keep the platform working,
              remember your preferences, and understand how people use the site.
              This page explains exactly what we use and why.
            </p>
          </Reveal>

          {/* Cookie category summary */}
          <Reveal delay={0.08} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORY_CARDS.map(({ Icon, title, color, iconColor, body, examples }) => (
              <div key={title} className={`rounded-xl border p-5 ${color}`}>
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <p className="font-serif text-sm font-semibold text-ink">{title}</p>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-ink-muted">{body}</p>
                <ul className="space-y-1">
                  {examples.map(ex => (
                    <li key={ex} className="flex items-center gap-1.5 font-mono text-[9px] text-ink-faint">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-ink-faint/50" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">

            {/* Sticky sidebar */}
            <aside className="hidden shrink-0 lg:block lg:w-56">
              <div className="sticky top-24 rounded-xl border border-hairline bg-paper-elevated p-5">
                <p className="mb-3 font-mono text-[9px] font-bold tracking-widest text-ink-faint uppercase">
                  On this page
                </p>
                <ul className="space-y-1.5">
                  {[
                    { id: 'what-are-cookies',  label: '1. What are cookies?' },
                    { id: 'how-we-use',        label: '2. How we use cookies' },
                    { id: 'cookie-list',       label: '3. Cookies we set' },
                    { id: 'third-party',       label: '4. Third-party cookies' },
                    { id: 'your-choices',      label: '5. Your choices' },
                    { id: 'updates',           label: '6. Updates to this policy' },
                    { id: 'contact',           label: '7. Contact us' },
                  ].map(item => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-ink-faint/50" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-12">

              {/* 1 */}
              <Reveal>
                <article id="what-are-cookies">
                  <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                    1. What are cookies?
                  </h2>
                  <Prose>
                    <p>
                      Cookies are small text files placed on your device when you visit a website.
                      They are widely used to make websites work efficiently, to remember your
                      preferences, and to provide information to site owners about how their site
                      is being used.
                    </p>
                    <p>
                      Cookies can be "session cookies" — which are deleted when you close your
                      browser — or "persistent cookies", which remain on your device for a set
                      period or until you delete them. Cookies set by the website you are visiting
                      are called "first-party cookies"; cookies set by other parties are called
                      "third-party cookies".
                    </p>
                  </Prose>
                </article>
              </Reveal>

              {/* 2 */}
              <Reveal>
                <article id="how-we-use" className="border-t border-hairline pt-12">
                  <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                    2. How we use cookies
                  </h2>
                  <Prose>
                    <p>
                      LLDCanvas uses cookies for three purposes: to keep the platform functioning
                      securely (strictly necessary), to remember your settings between sessions
                      (functional), and to understand how visitors use the platform so we can
                      improve it (analytics).
                    </p>
                    <p>
                      We keep our cookie use minimal and purposeful. We do not use cookies for
                      advertising, remarketing, or to build personal profiles for third parties.
                      We do not sell or share cookie data with advertisers.
                    </p>
                  </Prose>
                </article>
              </Reveal>

              {/* 3 — cookie table */}
              <Reveal>
                <article id="cookie-list" className="border-t border-hairline pt-12">
                  <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                    3. Cookies we set
                  </h2>
                  <p className="mb-6 text-[15px] leading-relaxed text-ink-muted">
                    The table below lists the specific cookies currently in use on LLDCanvas.
                    This list may be updated as the platform evolves; please check back for the
                    latest version.
                  </p>

                  {/* Mobile-friendly card list */}
                  <div className="space-y-3 lg:hidden">
                    {COOKIE_TABLE.map(row => (
                      <div key={row.name} className="rounded-xl border border-hairline bg-paper-elevated p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="font-mono text-[11px] font-semibold text-ink">{row.name}</p>
                          <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${TYPE_COLORS[row.type]}`}>
                            {row.type}
                          </span>
                        </div>
                        <p className="mb-1 text-xs text-ink-muted">{row.purpose}</p>
                        <div className="flex items-center gap-3 font-mono text-[10px] text-ink-faint">
                          <span>{row.provider}</span>
                          <span>·</span>
                          <span>{row.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-hidden rounded-xl border border-hairline lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-hairline bg-paper-elevated">
                          <th className="px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">Cookie</th>
                          <th className="px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">Provider</th>
                          <th className="px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">Purpose</th>
                          <th className="px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">Duration</th>
                          <th className="px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-ink-faint uppercase">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COOKIE_TABLE.map((row, i) => (
                          <tr
                            key={row.name}
                            className={`${i < COOKIE_TABLE.length - 1 ? 'border-b border-hairline' : ''} hover:bg-paper-elevated/60 transition-colors`}
                          >
                            <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-ink">{row.name}</td>
                            <td className="px-4 py-3.5 text-[13px] text-ink-muted">{row.provider}</td>
                            <td className="px-4 py-3.5 text-[13px] leading-relaxed text-ink-muted">{row.purpose}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-ink-muted">{row.duration}</td>
                            <td className="px-4 py-3.5">
                              <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${TYPE_COLORS[row.type]}`}>
                                {row.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </Reveal>

              {/* 4 */}
              <Reveal>
                <article id="third-party" className="border-t border-hairline pt-12">
                  <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                    4. Third-party cookies
                  </h2>
                  <Prose>
                    <p>
                      LLDCanvas uses Ahrefs Analytics to measure site traffic. Ahrefs sets a
                      small number of cookies for this purpose. The data collected is aggregated
                      and anonymous — it tells us which pages are popular and where traffic comes
                      from, but cannot be used to identify individual visitors.
                    </p>
                    <p>
                      When you make a payment through LLDCanvas, you will interact with our
                      payment processors (Razorpay or Dodo Payments). These providers may set
                      their own cookies during the checkout process. We recommend reviewing their
                      respective privacy and cookie policies for details.
                    </p>
                    <p>
                      We do not embed social media pixels, advertising networks, or other
                      third-party tracking scripts beyond those described above.
                    </p>
                  </Prose>
                </article>
              </Reveal>

              {/* 5 — choices */}
              <Reveal>
                <article id="your-choices" className="border-t border-hairline pt-12">
                  <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                    5. Your choices
                  </h2>
                  <Prose>
                    <p>
                      You have control over how cookies are used on your device. The options
                      available to you include:
                    </p>
                  </Prose>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        Icon: ToggleLeft,
                        title: 'Browser settings',
                        body: 'Most browsers allow you to refuse or delete cookies through their settings. Blocking strictly necessary cookies will prevent LLDCanvas from functioning correctly — you will not be able to log in or maintain a session.',
                      },
                      {
                        Icon: BarChart3,
                        title: 'Analytics opt-out',
                        body: 'If you prefer not to be counted in our anonymous site analytics, you can block the Ahrefs Analytics script using a browser extension such as uBlock Origin or Privacy Badger. This will not affect your ability to use the platform.',
                      },
                      {
                        Icon: Cookie,
                        title: 'Do Not Track',
                        body: 'We respect the Do Not Track (DNT) signal. If your browser has DNT enabled, we do not load any analytics scripts during your visit.',
                      },
                    ].map(({ Icon, title, body }) => (
                      <div key={title} className="flex gap-4 rounded-xl border border-hairline bg-paper-elevated p-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline bg-paper">
                          <Icon className="h-4 w-4 text-ink-faint" />
                        </div>
                        <div>
                          <p className="mb-1.5 font-serif text-sm font-semibold text-ink">{title}</p>
                          <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>

              {/* 6 */}
              <Reveal>
                <article id="updates" className="border-t border-hairline pt-12">
                  <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                    6. Updates to this policy
                  </h2>
                  <Prose>
                    <p>
                      We may update this Cookie Policy from time to time to reflect changes in
                      our practices or for other operational, legal, or regulatory reasons. When
                      we make material changes, we will update the "Last updated" date at the top
                      of this page.
                    </p>
                    <p>
                      We encourage you to review this page periodically to stay informed about
                      how we use cookies. Your continued use of LLDCanvas after any change
                      constitutes your acceptance of the updated policy.
                    </p>
                  </Prose>
                </article>
              </Reveal>

              {/* 7 — contact */}
              <Reveal>
                <article id="contact" className="border-t border-hairline pt-12">
                  <div className="rounded-2xl border border-brand/20 bg-brand-tint px-6 py-6">
                    <div className="mb-3 flex items-center gap-2.5">
                      <Mail className="h-5 w-5 text-brand" />
                      <h2 className="font-serif text-lg font-semibold text-ink">7. Questions about cookies?</h2>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-ink-muted">
                      If you have questions or concerns about how LLDCanvas uses cookies, or if
                      you would like to exercise any of your rights regarding your data, please
                      contact us directly.
                    </p>
                    <a
                      href="mailto:support.lldcanvas@gmail.com"
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5"
                    >
                      support.lldcanvas@gmail.com
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              </Reveal>

              {/* Related links */}
              <Reveal>
                <div className="flex flex-wrap gap-3 border-t border-hairline pt-8">
                  <Link
                    href="/terms"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    Terms &amp; Conditions <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    About LLDCanvas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
