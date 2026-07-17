'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Code2, FileInput, Sparkles } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { parse } from '@/lib/draft'
import type { DraftAST, ParseError } from '@/lib/draft'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onImport: (ast: DraftAST) => void
}

const PLACEHOLDER = `User
User knows id, name: String, email: String
User can login(), getProfile(): Profile

Post
Post knows id, content: String, createdAt: Date

User has many Post
`

// ─── Main component ───────────────────────────────────────────────────────────
// A one-shot importer, not a live editing panel — write or paste Draft
// Notation once, review the parse, then drop it onto the canvas. Authoring
// Draft Notation live (with a running diagram preview) lives in the
// standalone Playground, kept out of the editor so the two don't compete for
// the same screen real estate or mental model.
export function ImportDraftModal({ open, onOpenChange, onImport }: Props) {
  const [code, setCode]     = useState('')
  const [ast, setAst]       = useState<DraftAST | null>(null)
  const [errors, setErrors] = useState<ParseError[]>([])

  useEffect(() => {
    if (open) { setCode(''); setAst(null); setErrors([]) }
  }, [open])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setCode(v)
    if (!v.trim()) { setAst(null); setErrors([]); return }
    const result = parse(v)
    setErrors(result.errors)
    setAst(result.errors.length === 0 ? result.ast : null)
  }

  const classCount = ast?.nodes.length ?? 0
  const relCount   = ast?.relationships.length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ width: 'min(34rem, calc(100vw - 2rem))', maxWidth: 'min(34rem, calc(100vw - 2rem))' }}
        className="overflow-hidden rounded-2xl border border-hairline bg-paper p-0 shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="min-w-0 border-b border-hairline px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
              <FileInput className="h-4.5 w-4.5 text-brand" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-ink">Import from Draft Notation</DialogTitle>
              <p className="truncate text-xs text-ink-faint">Paste code, review the parse, drop it onto the canvas</p>
            </div>
          </div>
        </DialogHeader>

        <div className="min-w-0 space-y-4 px-6 py-5">
          <div className="overflow-hidden rounded-xl border border-hairline bg-[#14130f]">
            <textarea
              value={code}
              onChange={handleChange}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              autoFocus
              className="no-scrollbar h-56 w-full resize-none bg-transparent p-4 font-mono text-xs
                         leading-5 text-white/85 outline-none placeholder:text-white/20 caret-emerald-400"
              style={{ tabSize: 2 }}
            />
          </div>

          {errors.length > 0 ? (
            <div className="max-h-24 space-y-1 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3">
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span>Line {e.line}: {e.message}</span>
                </div>
              ))}
            </div>
          ) : ast && classCount > 0 ? (
            <p className="text-xs text-ink-faint">
              Ready to import <span className="font-medium text-ink">{classCount}</span> class{classCount === 1 ? '' : 'es'}
              {relCount > 0 && <> and <span className="font-medium text-ink">{relCount}</span> relationship{relCount === 1 ? '' : 's'}</>}.
            </p>
          ) : (
            <p className="text-xs text-ink-faint">
              New here? Read the{' '}
              <Link href="/docs" target="_blank" className="text-brand underline underline-offset-2">syntax guide</Link>
              {' '}or try it first in the{' '}
              <Link href="/playground" target="_blank" className="text-brand underline underline-offset-2">Playground</Link>.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-hairline pt-4">
            <div className="flex items-center gap-3 text-xs text-ink-faint">
              <Link href="/playground" target="_blank" className="flex items-center gap-1.5 hover:text-ink">
                <Sparkles className="h-3.5 w-3.5" /> Open Playground
              </Link>
              <Link href="/docs" target="_blank" className="flex items-center gap-1.5 hover:text-ink">
                <Code2 className="h-3.5 w-3.5" /> Docs
              </Link>
            </div>
            <button
              type="button"
              onClick={() => ast && onImport(ast)}
              disabled={!ast || classCount === 0}
              className={cn(
                'rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition-all',
                'hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40',
              )}
            >
              Import
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
