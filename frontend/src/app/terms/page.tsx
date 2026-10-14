import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Scale, ShieldCheck, AlertTriangle, FileText, RefreshCw, Mail } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { Reveal } from '@/components/features/Reveal'

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Terms & Conditions | LLDCanvas',
  description:
    'Read the Terms and Conditions for using LLDCanvas — the Low-Level Design interview preparation platform. Understand your rights, responsibilities, acceptable use, subscriptions, and our content policies.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms & Conditions | LLDCanvas',
    description: 'Terms and Conditions for LLDCanvas — Low-Level Design interview preparation platform.',
    type: 'website',
    url: '/terms',
  },
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = {
  id: string
  title: string
  paragraphs: string[]
  list?: string[]
}

// ── Content ───────────────────────────────────────────────────────────────────

const LAST_UPDATED = 'October 4, 2026'

const SUMMARY_CARDS = [
  {
    Icon: FileText,
    title: 'Using LLDCanvas',
    body: 'LLDCanvas is a Low-Level Design interview preparation platform. You agree to use it only for lawful educational purposes.',
  },
  {
    Icon: ShieldCheck,
    title: 'Your account',
    body: 'You are responsible for keeping your credentials secure and for all activity that occurs under your account.',
  },
  {
    Icon: Scale,
    title: 'Subscriptions & billing',
    body: 'Paid plans are billed in advance. You may cancel at any time; cancellation takes effect at the end of the current billing period.',
  },
  {
    Icon: AlertTriangle,
    title: 'Limitation of liability',
    body: 'LLDCanvas is provided "as is". We are not liable for indirect, incidental, or consequential damages arising from your use of the platform.',
  },
]

const SECTIONS: Section[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    paragraphs: [
      'By accessing or using LLDCanvas (the "Platform"), whether as a registered user or a visitor, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform.',
      'These Terms apply to all users of the Platform, including visitors, registered users, and subscribers. We may update these Terms from time to time. Continued use of the Platform after any such changes constitutes your acceptance of the new Terms. We will notify registered users of material changes by email or via an in-platform notice.',
      'If you are accessing the Platform on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms.',
    ],
  },
  {
    id: 'description',
    title: '2. Description of Service',
    paragraphs: [
      'LLDCanvas is a Low-Level Design interview preparation platform that provides, among other things: a UML class diagram editor and canvas, design pattern templates and revision notes, curated LLD interview problems, timed Interview Mode sessions, code execution capabilities, real-time collaboration tools, daily quiz and practice modes, and a suite of applied challenge labs.',
      'We reserve the right to modify, suspend, or discontinue any part of the Platform at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Platform.',
      'Some features of the Platform are available only to registered users, and certain features are available only to paid subscribers. Feature availability may change without prior notice.',
    ],
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    paragraphs: [
      'To access certain features of the Platform you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date.',
      'You are solely responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately at support.lldcanvas@gmail.com if you become aware of any unauthorised access to or use of your account.',
      'We reserve the right to disable any account, at any time, if in our opinion you have failed to comply with these Terms, or if we suspect that your account has been compromised.',
    ],
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use',
    paragraphs: [
      'You agree to use the Platform only for lawful purposes and in accordance with these Terms. You must not use the Platform:',
    ],
    list: [
      'In any way that violates applicable local, national, or international law or regulation.',
      'To transmit any unsolicited or unauthorised advertising or promotional material.',
      'To impersonate any person or entity, or to falsely state or otherwise misrepresent your affiliation with a person or entity.',
      'To engage in any conduct that restricts or inhibits anyone\'s use or enjoyment of the Platform, or which may harm LLDCanvas or users of the Platform.',
      'To attempt to gain unauthorised access to any part of the Platform, the server on which the Platform is stored, or any server, computer, or database connected to the Platform.',
      'To use any automated means, including scrapers, bots, or crawlers, to access, monitor, or copy the Platform\'s content without our prior written consent.',
      'To reproduce, duplicate, copy, sell, resell, or exploit any portion of the Platform or its content for commercial purposes without our express written permission.',
      'To use the Platform to share, distribute, or store content that infringes the intellectual property rights of others.',
    ],
  },
  {
    id: 'subscriptions',
    title: '5. Subscriptions and Payments',
    paragraphs: [
      'LLDCanvas offers both a free tier and paid subscription plans ("Pro" and "Ultimate"). Paid subscriptions are billed in advance on a monthly or annual basis, depending on the plan you select. All fees are exclusive of taxes unless stated otherwise.',
      'By subscribing to a paid plan, you authorise us to charge your chosen payment method at the beginning of each billing period. We use third-party payment processors (Razorpay for Indian users, Dodo Payments for international users) to handle all payment transactions. We do not store your full payment card details on our servers.',
      'You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period; you will continue to have access to paid features until that date. We do not provide refunds for unused portions of a subscription period except where required by applicable law.',
      'We reserve the right to change our pricing at any time. We will give you reasonable notice of any price changes. If you do not agree to a price change, you may cancel your subscription before the change takes effect.',
    ],
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    paragraphs: [
      'The Platform and its entire contents, features, and functionality — including but not limited to the UML editor, design pattern content, problem descriptions, challenge lab modes, revision notes, code, text, graphics, and user interface — are owned by LLDCanvas and are protected by intellectual property laws.',
      'These Terms do not grant you any right, title, or interest in the Platform or its content. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any part of the Platform or its content without our express prior written permission.',
      'If you submit any feedback, suggestions, or ideas regarding the Platform ("Feedback"), you grant us a worldwide, royalty-free, irrevocable licence to use, reproduce, modify, and distribute that Feedback without restriction or compensation to you.',
    ],
  },
  {
    id: 'user-content',
    title: '7. User-Generated Content',
    paragraphs: [
      'The Platform may allow you to create, save, and share diagrams, notes, and other content ("User Content"). You retain ownership of your User Content. By posting or saving User Content on the Platform, you grant LLDCanvas a non-exclusive, worldwide, royalty-free licence to host, store, and display your User Content solely for the purpose of providing the Platform to you.',
      'You are solely responsible for your User Content and the consequences of sharing it. You represent and warrant that your User Content does not violate these Terms or any applicable law, and that you have all necessary rights to grant the licence described above.',
      'We reserve the right to remove any User Content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable, without notice.',
    ],
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimer of Warranties',
    paragraphs: [
      'The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the fullest extent permitted by applicable law, LLDCanvas disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      'We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant that the content on the Platform is accurate, complete, or current. The Platform is intended for educational and interview preparation purposes only and does not guarantee any particular interview outcome or employment result.',
    ],
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by applicable law, LLDCanvas shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising out of or in connection with your use of or inability to use the Platform, even if we have been advised of the possibility of such damages.',
      'In no event shall our total liability to you for all claims arising out of or related to the Platform exceed the greater of (a) the amount you paid to LLDCanvas in the twelve months preceding the claim, or (b) ₹500 (five hundred Indian rupees).',
      'Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability will be limited to the greatest extent permitted by law.',
    ],
  },
  {
    id: 'termination',
    title: '10. Termination',
    paragraphs: [
      'We reserve the right to terminate or suspend your account and your access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.',
      'Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms that by their nature should survive termination will survive, including provisions relating to intellectual property, disclaimer of warranties, indemnification, and limitations of liability.',
      'You may terminate your account at any time by contacting us at support.lldcanvas@gmail.com. If you have a paid subscription, you should cancel it before deleting your account to avoid further charges.',
    ],
  },
  {
    id: 'governing-law',
    title: '11. Governing Law and Disputes',
    paragraphs: [
      'These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any disputes arising out of or in connection with these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts located in India.',
      'Before initiating any legal proceeding, you agree to first attempt to resolve any dispute informally by contacting us at support.lldcanvas@gmail.com. We will attempt to resolve the dispute within thirty (30) days.',
    ],
  },
  {
    id: 'general',
    title: '12. General Provisions',
    paragraphs: [
      'These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and LLDCanvas regarding your use of the Platform and supersede all prior agreements and understandings.',
      'If any provision of these Terms is found to be invalid or unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full force and effect.',
      'Our failure to enforce any right or provision of these Terms will not constitute a waiver of those rights. Any waiver of any provision of these Terms will be effective only if in writing and signed by an authorised representative of LLDCanvas.',
    ],
  },
]

// ── Table of contents ────────────────────────────────────────────────────────

function TableOfContents() {
  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 font-mono text-[9px] font-bold tracking-widest text-ink-faint uppercase">
        On this page
      </p>
      <ul className="space-y-1.5">
        {SECTIONS.map(s => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-ink-faint/50" />
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  return (
    <div className="overflow-x-hidden">

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Terms & Conditions — LLDCanvas',
        description: 'Terms and Conditions for using the LLDCanvas Low-Level Design interview preparation platform.',
        url: 'https://www.lldcanvas.in/terms',
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
              Terms &amp; Conditions
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[10px] text-ink-muted">
                Last updated: {LAST_UPDATED}
              </span>
              <Link
                href="/cookie-policy"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-brand hover:underline"
              >
                Cookie Policy <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ink-muted">
              Please read these Terms carefully before using LLDCanvas. By using the
              Platform you agree to these Terms. If you have questions, contact us at{' '}
              <a href="mailto:support.lldcanvas@gmail.com" className="text-brand hover:underline">
                support.lldcanvas@gmail.com
              </a>.
            </p>
          </Reveal>

          {/* Summary cards */}
          <Reveal delay={0.08} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUMMARY_CARDS.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-hairline bg-paper-elevated p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper">
                  <Icon className="h-4 w-4 text-ink-faint" />
                </div>
                <p className="mb-1.5 font-serif text-sm font-semibold text-ink">{title}</p>
                <p className="text-xs leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">

            {/* Sticky sidebar TOC */}
            <aside className="hidden shrink-0 lg:block lg:w-56">
              <div className="sticky top-24 rounded-xl border border-hairline bg-paper-elevated p-5">
                <TableOfContents />
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 flex-1">
              {SECTIONS.map((section, i) => (
                <Reveal key={section.id} delay={i < 3 ? i * 0.04 : 0}>
                  <article
                    id={section.id}
                    className={`${i > 0 ? 'mt-12 border-t border-hairline pt-12' : ''}`}
                  >
                    <h2 className="mb-5 font-serif text-xl font-semibold tracking-tight text-ink">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((p, j) => (
                        <p key={j} className="text-[15px] leading-relaxed text-ink-muted">
                          {p}
                        </p>
                      ))}
                    </div>
                    {section.list && (
                      <ul className="mt-5 space-y-2.5">
                        {section.list.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-muted">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              ))}

              {/* Contact block */}
              <Reveal className="mt-12 border-t border-hairline pt-12">
                <div className="rounded-2xl border border-brand/20 bg-brand-tint px-6 py-6">
                  <div className="mb-3 flex items-center gap-2.5">
                    <Mail className="h-5 w-5 text-brand" />
                    <h2 className="font-serif text-lg font-semibold text-ink">Questions about these Terms?</h2>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-ink-muted">
                    If you have any questions about these Terms and Conditions, or if you need to
                    report a concern, please reach out to us directly.
                  </p>
                  <a
                    href="mailto:support.lldcanvas@gmail.com"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5"
                  >
                    support.lldcanvas@gmail.com
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </Reveal>

              {/* Related links */}
              <Reveal className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    Privacy Policy <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/cookie-policy"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    Cookie Policy <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    About LLDCanvas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    Pricing <ArrowRight className="h-3.5 w-3.5" />
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
