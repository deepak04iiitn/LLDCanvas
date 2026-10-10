import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Brain, Lightbulb, Flame, Zap, BarChart2, ArrowRight, Check } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Daily LLD Quiz — Design Patterns & SOLID Practice | LLDCanvas',
  description:
    'A short daily quiz on design patterns and SOLID principles to keep your LLD knowledge sharp between full practice sessions. Ten rapid questions, instant explanations, and streak tracking.',
  keywords: [
    'daily LLD quiz',
    'design pattern quiz',
    'SOLID principles quiz',
    'daily design quiz',
    'LLD practice questions',
    'LLD online quiz',
    'keep LLD sharp',
  ],
  alternates: { canonical: '/features/daily-quiz' },
  openGraph: {
    title: 'Daily LLD Quiz — Design Patterns & SOLID Practice | LLDCanvas',
    description:
      'Ten rapid questions on design patterns and SOLID principles every day. Instant explanations and streak tracking.',
    type: 'website',
    url: '/features/daily-quiz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily LLD Quiz — Design Patterns & SOLID Practice | LLDCanvas',
    description:
      'Ten rapid questions on design patterns and SOLID principles every day. Instant explanations and streak tracking.',
  },
}

const FAQ = [
  {
    q: 'What topics does the daily quiz cover?',
    a: 'The quiz covers all 23 Gang-of-Four design patterns (Creational, Structural, Behavioral) and all five SOLID principles. Questions test identification, application, and trade-off reasoning — not just definitions. Future updates will include UML notation questions.',
  },
  {
    q: 'How many questions are in each daily quiz?',
    a: "Each day's quiz has 10 questions. This keeps the commitment manageable — most engineers complete a session in under ten minutes — while ensuring meaningful coverage.",
  },
  {
    q: 'Does the quiz repeat questions?',
    a: 'Questions from the same concept bank will recur over the long run, but the daily set is selected to avoid immediate repeats within a 7-day window. Repetition is intentional for spaced retrieval — you will see similar questions again after a gap, which is how retention builds.',
  },
  {
    q: 'Can I catch up on missed days?',
    a: "You can always take the current day's quiz. Missed days cannot be retroactively completed — the streak resets to zero. This is intentional: the point of the streak is to build daily discipline, and making catch-up trivial removes the incentive.",
  },
  {
    q: 'Is the Daily Quiz free?',
    a: 'Yes — the Daily Quiz is available on the free tier. All questions, explanations, and streak tracking are included at no cost. The quiz is part of the core LLDCanvas experience, not a paid add-on.',
  },
]

const FEATURES = [
  {
    icon: Calendar,
    label: 'Fresh questions daily',
    description:
      "A new set of questions every day. You'll never open the app and wonder what to study — the quiz sets the agenda.",
  },
  {
    icon: Brain,
    label: 'Patterns and SOLID coverage',
    description:
      'All 23 GoF patterns and every SOLID principle are in rotation. Questions span identification, application, and trade-off reasoning.',
  },
  {
    icon: Lightbulb,
    label: 'Instant explanations',
    description:
      'After submission, each question reveals a concise explanation — not just the right answer, but why the others are wrong.',
  },
  {
    icon: Flame,
    label: 'Streak tracking',
    description:
      'Your streak is your scoreboard. Miss a day and it resets. This mild pressure is what makes the habit stick.',
  },
  {
    icon: Zap,
    label: 'No setup needed',
    description:
      'Open, answer, done. No configuration, no category selection, no timer to set. The quiz is ready when you are.',
  },
  {
    icon: BarChart2,
    label: 'Topic accuracy tracking',
    description:
      "Over time, you'll see which patterns you consistently nail and which ones keep tripping you up. Focus your study accordingly.",
  },
]

const STREAK_DAYS = [
  { label: 'Mon', done: true },
  { label: 'Tue', done: true },
  { label: 'Wed', done: true },
  { label: 'Thu', done: true },
  { label: 'Fri', done: true },
  { label: 'Sat', done: false },
  { label: 'Sun', done: false },
]

const FOR_WHO = [
  'Engineers in active interview prep who want daily micro-practice between full sessions.',
  'Senior engineers keeping design pattern knowledge fresh without heavy time investment.',
  "Students who've read the patterns but need retrieval practice to make them stick.",
  'Anyone who learns better through testing than through passive reading.',
]

const ANSWER_OPTIONS = [
  { letter: 'A', text: 'Strategy Pattern', correct: false },
  { letter: 'B', text: 'Decorator Pattern', correct: true },
  { letter: 'C', text: 'Observer Pattern', correct: false },
  { letter: 'D', text: 'Command Pattern', correct: false },
]

export default function DailyQuizPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Daily LLD Quiz — Design Patterns & SOLID Practice',
          url: 'https://www.lldcanvas.in/features/daily-quiz',
          description:
            'A short daily quiz on design patterns and SOLID principles to keep your LLD knowledge sharp.',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Features',
              item: 'https://www.lldcanvas.in/features',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Daily Quiz',
              item: 'https://www.lldcanvas.in/features/daily-quiz',
            },
          ],
        }}
      />

      <main>
        {/* ── Section 1: HERO ──────────────────────────────────────────── */}
        <section
          aria-label="Daily Quiz hero"
          className="relative overflow-hidden border-b border-hairline bg-paper"
        >
          {/* Dot grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(166,159,140,0.28) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-14">
            {/* LEFT: text */}
            <div className="flex flex-col justify-center">
              {/* Eyebrow */}
              <p className="mb-5 font-mono text-[11px] font-bold tracking-[0.22em] text-gold uppercase">
                09 · DAILY QUIZ
              </p>

              {/* H1 */}
              <h1 className="font-serif text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
                Five questions a day keeps the design patterns sharp.
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
                A daily quiz on patterns and SOLID principles — new every day,
                explained on submission, tracked by streak.
              </p>

              {/* Streak display */}
              <div className="mt-8">
                <div className="flex items-center gap-2">
                  {STREAK_DAYS.map((day) => (
                    <div key={day.label} className="flex flex-col items-center gap-1.5">
                      <div
                        className={[
                          'flex h-9 w-9 items-center justify-center rounded-full',
                          day.done
                            ? 'bg-orange-500'
                            : 'border border-hairline bg-paper-elevated',
                        ].join(' ')}
                      >
                        {day.done ? (
                          <Flame className="h-4 w-4 text-white" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-ink-faint">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-mono text-sm font-semibold text-orange-600">
                    5-day streak
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-9">
                <Link
                  href="/dashboard/learn/quiz"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-mono text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
                >
                  Take today&apos;s quiz
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT: quiz card mockup */}
            <div className="flex items-center justify-center lg:justify-end">
              <div
                className="w-full max-w-md rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-sm"
                role="img"
                aria-label="Quiz card mockup showing a sample design patterns question"
              >
                {/* Card header */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-ink-muted">
                    Today&apos;s Question
                  </span>
                  <span className="rounded-full border border-hairline px-3 py-0.5 font-mono text-xs text-ink-faint">
                    Q3 / 10
                  </span>
                </div>

                {/* Timer bar */}
                <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: '42%' }}
                    role="progressbar"
                    aria-valuenow={42}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Quiz progress"
                  />
                </div>

                {/* Question */}
                <p className="mb-5 text-[15px] font-medium leading-snug text-ink">
                  Which design pattern allows adding responsibilities to objects
                  dynamically without subclassing?
                </p>

                {/* Answer options */}
                <div className="flex flex-col gap-2.5">
                  {ANSWER_OPTIONS.map((opt) => (
                    <div
                      key={opt.letter}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                        opt.correct
                          ? 'border-brand bg-brand-tint'
                          : 'border-hairline bg-paper hover:border-hairline-strong',
                      ].join(' ')}
                    >
                      {/* Letter badge */}
                      <span
                        className={[
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold',
                          opt.correct
                            ? 'bg-brand text-brand-foreground'
                            : 'bg-hairline text-ink-muted',
                        ].join(' ')}
                      >
                        {opt.letter}
                      </span>

                      {/* Option text */}
                      <span
                        className={[
                          'flex-1 text-[13px] font-medium',
                          opt.correct ? 'text-brand' : 'text-ink-muted',
                        ].join(' ')}
                      >
                        {opt.text}
                      </span>

                      {/* Check or empty indicator */}
                      <div
                        className={[
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                          opt.correct
                            ? 'border-brand bg-brand'
                            : 'border-hairline',
                        ].join(' ')}
                      >
                        {opt.correct && (
                          <Check className="h-3 w-3 text-brand-foreground" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="mt-5">
                  <button
                    className="w-full rounded-xl bg-brand py-2.5 font-mono text-[13px] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                    aria-label="Submit answer"
                  >
                    Submit Answer
                  </button>
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] text-ink-faint">
                  <Zap className="h-3 w-3" />
                  No setup — just answer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: STATS BAR ─────────────────────────────────────── */}
        <section
          aria-label="Key statistics"
          className="border-y border-[#E7E2D6] bg-[#FBF9F4]"
        >
          <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
            <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: '10', label: 'questions per day' },
                { value: '23', label: 'GoF patterns covered' },
                { value: '5', label: 'SOLID principles' },
                { value: '∞', label: 'topic accuracy tracking' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="font-serif text-3xl font-medium text-[#201F1C]">
                    {stat.value}
                  </dt>
                  <dd className="font-mono text-[11px] uppercase tracking-wide text-[#A69F8C]">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Section 3: FEATURE CARDS ─────────────────────────────────── */}
        <section aria-labelledby="features-heading" className="bg-[#FBF9F4] py-16">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <h2
              id="features-heading"
              className="mb-10 font-serif text-2xl font-medium text-[#201F1C]"
            >
              What you get, every day.
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, label, description }) => (
                <div
                  key={label}
                  className="flex gap-5 rounded-2xl border border-[#E7E2D6] bg-white p-6 transition-shadow hover:shadow-sm"
                >
                  {/* Icon badge */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F0EB]">
                    <Icon className="h-6 w-6 text-[#234E3F]" />
                  </div>

                  {/* Content */}
                  <div>
                    <p className="font-mono text-[12px] font-bold uppercase tracking-wide text-[#201F1C]">
                      {label}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#74705F]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: HOW STREAK WORKS ──────────────────────────────── */}
        <section
          aria-labelledby="streak-heading"
          className="bg-[#E7F0EB] py-16"
        >
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#234E3F]">
              Streak mechanics
            </div>
            <h2
              id="streak-heading"
              className="mb-3 font-serif text-2xl font-medium text-[#201F1C]"
            >
              Show up every day. That's the whole system.
            </h2>
            <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-[#74705F]">
              Consistency compounds faster than intensity. Ten minutes of daily
              recall practice outperforms a four-hour weekend cram — and a
              streak makes consistency visible.
            </p>

            {/* 7-day streak visualization */}
            <div className="mb-8 flex items-end gap-3 overflow-x-auto pb-2 sm:gap-5">
              {STREAK_DAYS.map((day, i) => (
                <div key={day.label} className="flex flex-col items-center gap-2">
                  {/* Flame / placeholder */}
                  <div
                    className={[
                      'flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all',
                      day.done
                        ? 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/30'
                        : 'border-dashed border-[#B8CFC5] bg-[#D4E8DC]',
                    ].join(' ')}
                    aria-label={day.done ? `${day.label}: completed` : `${day.label}: upcoming`}
                  >
                    {day.done ? (
                      <Flame className="h-7 w-7 text-white" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border-2 border-[#B8CFC5]" />
                    )}
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#234E3F]">
                    {day.label}
                  </span>
                  {i < 4 && (
                    <span className="font-mono text-[9px] text-orange-500">✓</span>
                  )}
                </div>
              ))}
            </div>

            {/* Editorial callout */}
            <blockquote className="border-l-4 border-[#234E3F] pl-5">
              <p className="font-serif text-xl font-medium leading-snug text-[#201F1C] sm:text-2xl">
                "Miss a day, the streak resets. That's the point."
              </p>
            </blockquote>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#74705F]">
              The reset is not a punishment — it's the mechanic. Knowing the
              streak breaks keeps you honest. Most users report the streak
              itself becoming the motivation after the first week.
            </p>
          </div>
        </section>

        {/* ── Section 5: WHO IT'S FOR ───────────────────────────────────── */}
        <section aria-labelledby="who-heading" className="bg-[#FBF9F4] py-16">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <h2
                  id="who-heading"
                  className="font-serif text-2xl font-medium text-[#201F1C]"
                >
                  Who it's for.
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#74705F]">
                  The Daily Quiz is designed for engineers who want to maintain
                  and sharpen their LLD knowledge through consistent, low-friction
                  practice.
                </p>
              </div>

              <ul className="flex flex-col gap-4" role="list">
                {FOR_WHO.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#234E3F]">
                      <Check className="h-3 w-3 text-[#FBF9F4]" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-[#74705F]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Section 6: FAQ ───────────────────────────────────────────── */}
        <section aria-label="Frequently asked questions" className="bg-[#FBF9F4]">
          <FeatureFaq items={FAQ} />
        </section>

        {/* ── Cross-links ──────────────────────────────────────────────── */}
        <FeatureCrossLinks exclude="/features/daily-quiz" />
      </main>
    </>
  )
}
