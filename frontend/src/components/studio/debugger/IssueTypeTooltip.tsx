'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface IssueTypeInfo {
  description: string
  interviewContext: string
  plannrTopic: string
}

export const ISSUE_TYPE_INFO: Record<string, IssueTypeInfo> = {
  'Tight Coupling': {
    description:
      'Classes depend directly on concrete implementations instead of abstractions — changes in one class ripple through its dependents.',
    interviewContext:
      'Identifying tight coupling shows you understand the Dependency Inversion Principle (DIP) and why concrete dependencies hurt extensibility.',
    plannrTopic: 'Design for Change',
  },
  'SRP Violation': {
    description:
      'A class has more than one reason to change — it handles multiple unrelated responsibilities in a single unit.',
    interviewContext:
      'Single Responsibility is always tested in interviews. Naming it and giving a concrete example (e.g. "the class both persists data and sends emails") scores highly.',
    plannrTopic: 'Think in Responsibilities',
  },
  'God Object': {
    description:
      'A class that knows about and controls too many things — a massive class that does everything in the system.',
    interviewContext:
      'God Objects are a red flag for poor encapsulation. Interviewers expect you to split them into focused, cohesive classes with clear boundaries.',
    plannrTopic: 'Think in Responsibilities',
  },
  'DIP Violation': {
    description:
      'High-level modules depend on low-level modules instead of both depending on shared abstractions (interfaces).',
    interviewContext:
      'DIP is the most commonly missed SOLID principle in LLD interviews. Naming it and explaining the direction of dependency flow impresses interviewers.',
    plannrTopic: 'Design for Change',
  },
  'Missing Abstraction': {
    description:
      'Concrete classes used where an interface or abstract class would allow extension without modifying existing code.',
    interviewContext:
      'Proposing abstractions unprompted is a sign of senior-level design thinking — it shows you are designing for the future.',
    plannrTopic: 'Speak OOP',
  },
  'Incorrect Inheritance': {
    description:
      'A subclass inherits from a parent not because it truly "is-a" that type, but for code reuse — violating the Liskov Substitution Principle.',
    interviewContext:
      'LSP violations are subtle but important. Showing you can distinguish real inheritance from convenience inheritance demonstrates depth.',
    plannrTopic: 'Speak OOP',
  },
  'Circular Dependency': {
    description:
      'Two or more classes depend on each other, creating a cycle that makes the system hard to compile, test, or reason about in isolation.',
    interviewContext:
      'Circular dependencies are a design smell that interviewers look for. Knowing how to break cycles with interfaces or events shows maturity.',
    plannrTopic: 'Design for Change',
  },
  'Unnecessary Abstraction': {
    description:
      'An interface or abstract class that has only one implementation and adds no real flexibility — over-engineering that adds complexity without benefit.',
    interviewContext:
      'Knowing when NOT to abstract is as important as knowing when to. Mentioning YAGNI ("you aren\'t gonna need it") shows balanced judgment.',
    plannrTopic: 'Speak OOP',
  },
  'Pattern Misuse': {
    description:
      'A design pattern applied in a context where it adds accidental complexity without solving a real problem.',
    interviewContext:
      'Pattern recognition is impressive, but knowing when a pattern is overkill shows senior-level judgment. Be specific about which pattern and why it\'s wrong here.',
    plannrTopic: 'Design for Change',
  },
  'Poor Encapsulation': {
    description:
      'Internal state or implementation details exposed publicly, allowing external classes to reach in and break invariants.',
    interviewContext:
      'Encapsulation is a core OOP pillar. Pointing to specific fields or methods that should be private shows attention to detail.',
    plannrTopic: 'Speak OOP',
  },
  'OCP Violation': {
    description:
      'Adding new behavior requires modifying existing, working code — the class is not open for extension without being opened for modification.',
    interviewContext:
      'OCP violations usually co-occur with tight coupling. Showing the connection to the Open-Closed Principle and proposing a strategy or factory scores well.',
    plannrTopic: 'Design for Change',
  },
  'Other': {
    description:
      'A design smell that does not fit a named category but still represents a meaningful structural problem.',
    interviewContext:
      'Use this only if you can clearly articulate the problem. Vague answers score low — be as specific as possible in your explanation.',
    plannrTopic: 'Think in Responsibilities',
  },
}

export interface IssueTypeTooltipProps {
  issueType: string
  children: React.ReactNode
  className?: string
  placement?: 'left' | 'right'
}

export function IssueTypeTooltip({ issueType, children, className, placement = 'right' }: IssueTypeTooltipProps) {
  const info = ISSUE_TYPE_INFO[issueType]
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!info) return <>{children}</>

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 120)
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute top-0 z-50 w-64 rounded-xl border border-hairline bg-paper shadow-lg',
            placement === 'right' ? 'left-full ml-3' : 'right-full mr-3',
          )}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div className="px-4 py-3.5">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
              Issue type
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">{issueType}</p>

            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{info.description}</p>

            <div className="mt-3 border-t border-hairline/60 pt-3">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-brand">
                In interviews
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {info.interviewContext}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1.5 rounded-md bg-brand-tint/50 px-2.5 py-1.5">
              <span className="text-[10px]">📖</span>
              <p className="text-[11px] text-brand">
                Study: <span className="font-medium">{info.plannrTopic}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
