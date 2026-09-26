'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProtocolKey = 'coupling' | 'responsibility' | 'layer' | 'cycle' | 'custom'

interface ProtocolStep {
  instruction: string
  question: string
  lens?: string
}

interface Protocol {
  title: string
  steps: ProtocolStep[]
}

const PROTOCOLS: Record<ProtocolKey, Protocol> = {
  coupling: {
    title: 'Coupling Analysis Protocol',
    steps: [
      {
        instruction: 'Switch to the Coupling / Dependencies lens',
        question: 'Which class has the most incoming dependencies? Write its name.',
        lens: 'dependencies',
      },
      {
        instruction: 'Select that class and examine its connections',
        question:
          'How many classes does it depend on? Is any of those relationships avoidable?',
      },
      {
        instruction: 'Look for circular dependencies',
        question: 'Are there any cycles? Name them.',
      },
    ],
  },
  responsibility: {
    title: 'Responsibility Analysis Protocol',
    steps: [
      {
        instruction: 'Switch to the Responsibilities lens',
        question: 'Which class seems to have the most responsibilities?',
        lens: 'responsibilities',
      },
      {
        instruction: 'Click on that class and read its methods',
        question:
          'Count how many distinct responsibilities you see. List them.',
      },
      {
        instruction: 'Consider what could be extracted',
        question:
          'What class could you extract that would reduce this class to one responsibility?',
      },
    ],
  },
  layer: {
    title: 'Layer Violation Protocol',
    steps: [
      {
        instruction: 'Identify the architectural layers in the diagram',
        question:
          'List the layers you can see (e.g. Presentation, Service, Repository, Domain).',
        lens: 'layers',
      },
      {
        instruction: 'Trace the dependency direction between layers',
        question:
          'Are there any upward dependencies (lower layer depending on a higher layer)? Name them.',
      },
      {
        instruction: 'Consider the impact of a layer violation',
        question:
          'If you fix the worst violation, which classes change? What pattern would you introduce?',
      },
    ],
  },
  cycle: {
    title: 'Cycle Detection Protocol',
    steps: [
      {
        instruction: 'Switch to the Dependency Web or Coupling lens',
        question: 'Do you spot any cycle visually (a ring of arrows)? Name the classes involved.',
        lens: 'dependencies',
      },
      {
        instruction: 'Trace the cycle step by step',
        question:
          'Write the full cycle path: A → B → C → A. How many hops does it take?',
      },
      {
        instruction: 'Identify the weakest link to break',
        question:
          'Which dependency in the cycle is the easiest to invert or remove? What abstraction would you introduce?',
      },
    ],
  },
  custom: {
    title: 'Custom Investigation Protocol',
    steps: [
      {
        instruction: 'State your investigation goal',
        question: 'What smell or risk are you focusing on in this diagram?',
      },
      {
        instruction: 'Identify the suspects',
        question: 'Which classes or relationships are involved?',
      },
      {
        instruction: 'Propose a resolution',
        question:
          'What refactoring or pattern change would address the issue? What are the trade-offs?',
      },
    ],
  },
}

export interface InvestigationProtocolProps {
  protocol: ProtocolKey
  packType: 'microscope' | 'depweb'
  /** Called when the user submits all answers; receives answers keyed by step index. */
  onSubmit?: (answers: Record<number, string>) => void
}

export function InvestigationProtocol({
  protocol: protocolKey,
  onSubmit,
}: InvestigationProtocolProps) {
  const protocol = PROTOCOLS[protocolKey]
  const [open, setOpen] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function handleAnswerChange(idx: number, value: string) {
    setAnswers(prev => ({ ...prev, [idx]: value }))
  }

  function handleSubmit() {
    setSubmitted(true)
    onSubmit?.(answers)
  }

  const allAnswered = protocol.steps.every((_, i) => (answers[i] ?? '').trim().length > 0)

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left transition-colors hover:bg-hairline/40"
      >
        <ClipboardList size={15} className="shrink-0 text-brand" strokeWidth={1.75} />
        <span className="flex-1 font-serif text-[14px] font-medium text-ink">
          {protocol.title}
        </span>
        {open ? (
          <ChevronUp size={14} className="shrink-0 text-ink-faint" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-ink-faint" />
        )}
      </button>

      {open && (
        <div className="border-t border-hairline px-4 pb-4 pt-3">
          <ol className="space-y-5">
            {protocol.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                {/* Step number */}
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 font-mono text-[10px] font-bold text-brand">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-2">
                  {/* Instruction */}
                  <p className="text-[12px] font-medium text-ink">{step.instruction}</p>
                  {step.lens && (
                    <p className="font-mono text-[10px] text-ink-faint">
                      Lens:{' '}
                      <span className="rounded bg-hairline px-1 py-0.5 text-ink-muted">
                        {step.lens}
                      </span>
                    </p>
                  )}
                  {/* Question */}
                  <p className="text-[12px] italic text-ink-muted">{step.question}</p>
                  {/* Answer */}
                  <textarea
                    disabled={submitted}
                    value={answers[idx] ?? ''}
                    onChange={e => handleAnswerChange(idx, e.target.value)}
                    rows={2}
                    placeholder="Your answer…"
                    className={cn(
                      'w-full resize-none rounded-lg border border-hairline bg-paper px-3 py-2 text-[12px] leading-relaxed text-ink placeholder-ink-faint outline-none transition-colors focus:border-brand/50 focus:ring-1 focus:ring-brand/20',
                      submitted && 'cursor-not-allowed opacity-70',
                    )}
                  />
                </div>
              </li>
            ))}
          </ol>

          {!submitted ? (
            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="mt-4 w-full rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Append to investigation notes
            </button>
          ) : (
            <p className="mt-4 text-center text-[12px] text-emerald-600">
              ✓ Answers appended to your notes.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
