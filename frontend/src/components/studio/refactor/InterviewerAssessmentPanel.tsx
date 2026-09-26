'use client'

import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GradeInfo {
  grade: string
  comment: string
  suggestion: string
}

// ─── Grade logic ──────────────────────────────────────────────────────────────

function getInterviewerComment(result: Record<string, unknown>): GradeInfo {
  // Prefer an explicit top-level score; fall back to architectureImprovement
  const overall =
    typeof result.score === 'number'
      ? result.score
      : typeof result.architectureImprovement === 'number'
      ? result.architectureImprovement
      : 50

  if (overall >= 80) {
    return {
      grade: 'Strong Pass',
      comment:
        'The refactoring shows clear understanding of SRP and coupling reduction. The behavior contract is preserved.',
      suggestion:
        'For extra credit, consider adding a diagram walkthrough explanation as you would in a real interview.',
    }
  }
  if (overall >= 60) {
    return {
      grade: 'Pass',
      comment:
        'Good structural improvement. The main responsibilities are better separated, though some coupling remains.',
      suggestion:
        'Practice explaining WHY you made each change. Interviewers want to hear your reasoning, not just see the result.',
    }
  }
  if (overall >= 40) {
    return {
      grade: 'Needs Work',
      comment:
        'Some improvements made but the core issue (God Class / tight coupling) is not fully resolved.',
      suggestion:
        'Focus on one class at a time. Ask: does this class have more than one reason to change?',
    }
  }
  return {
    grade: 'Try Again',
    comment:
      'The behavior contract was not fully preserved, or the structural issues remain.',
    suggestion:
      'Start fresh. Use the hints panel and begin by identifying the class with the most responsibilities.',
  }
}

// ─── Visual config per grade ──────────────────────────────────────────────────

const GRADE_STYLES: Record<
  string,
  { badge: string; border: string; bg: string }
> = {
  'Strong Pass': {
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-300/70',
    bg: 'bg-emerald-50/40',
  },
  Pass: {
    badge: 'bg-brand/10 text-brand',
    border: 'border-brand/30',
    bg: 'bg-brand/5',
  },
  'Needs Work': {
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-300/70',
    bg: 'bg-amber-50/40',
  },
  'Try Again': {
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-300/70',
    bg: 'bg-red-50/30',
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InterviewerAssessmentPanelProps {
  result: Record<string, unknown>
  scoreDeltas?: {
    coupling?: number
    cohesion?: number
    extensibility?: number
  }
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InterviewerAssessmentPanel({
  result,
  className,
}: InterviewerAssessmentPanelProps) {
  const { grade, comment, suggestion } = getInterviewerComment(result)
  const styles = GRADE_STYLES[grade] ?? GRADE_STYLES['Needs Work']

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        styles.border,
        styles.bg,
        className,
      )}
    >
      {/* Header row */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[18px] leading-none">🧑‍⚖️</span>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Interviewer Assessment
        </p>
        <span
          className={cn(
            'ml-auto rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide',
            styles.badge,
          )}
        >
          {grade}
        </span>
      </div>

      {/* Comment */}
      <p className="text-[13px] leading-relaxed text-ink">{comment}</p>

      {/* Tip box */}
      <div className="mt-3 rounded-lg border border-hairline bg-paper/70 px-3 py-2.5">
        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          💬 Tip for your next interview
        </p>
        <p className="text-[12px] leading-relaxed text-ink-muted">{suggestion}</p>
      </div>
    </div>
  )
}
