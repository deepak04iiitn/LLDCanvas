'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

type Lang = 'typescript' | 'java'
type SourceMode = 'artifact' | 'json'

export function UmlCodeWorkspace() {
  const [mode, setMode] = useState<SourceMode>('artifact')
  const [artifactId, setArtifactId] = useState('')
  const [jsonText, setJsonText] = useState(
    '{\n  "nodes": [\n    {\n      "id": "1",\n      "data": {\n        "name": "PaymentService",\n        "nodeType": "class",\n        "methods": ["charge", "refund"]\n      }\n    }\n  ],\n  "edges": []\n}',
  )
  const [language, setLanguage] = useState<Lang>('typescript')
  const [code, setCode] = useState('')
  const [generating, setGenerating] = useState(false)

  async function generate() {
    setGenerating(true)
    try {
      let payload: {
        artifactId?: string
        diagramData?: unknown
        language: string
      } = { language }

      if (mode === 'artifact') {
        if (!artifactId.trim()) {
          toast.error('Enter a diagram / artifact id')
          setGenerating(false)
          return
        }
        payload.artifactId = artifactId.trim()
      } else {
        try {
          payload.diagramData = JSON.parse(jsonText)
        } catch {
          toast.error('Invalid diagram JSON')
          setGenerating(false)
          return
        }
      }

      const res = await learnApi.umlCode.generate(payload)
      setCode(res.code)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <CategoryShell
      title="UML ↔ Code"
      subtitle="Generate TypeScript or Java class skeletons from diagram nodes"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(
              [
                ['artifact', 'Artifact ID'],
                ['json', 'Diagram JSON'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                  mode === key
                    ? 'border-brand/40 bg-brand-tint text-ink'
                    : 'border-hairline text-ink-muted hover:border-brand/25',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'artifact' ? (
            <label className="block">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Diagram id
              </span>
              <input
                value={artifactId}
                onChange={e => setArtifactId(e.target.value)}
                placeholder="Mongo ObjectId"
                className="mt-1.5 w-full rounded-lg border border-hairline bg-paper-elevated px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-brand/40"
              />
            </label>
          ) : (
            <label className="block">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                diagramData JSON
              </span>
              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                rows={14}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-paper-elevated px-3 py-2 font-mono text-[12px] text-ink outline-none focus:border-brand/40"
              />
            </label>
          )}

          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Language
            </p>
            <div className="mt-1.5 flex gap-2">
              {(['typescript', 'java'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-[12px] capitalize',
                    language === lang
                      ? 'border-brand/40 bg-brand-tint text-ink'
                      : 'border-hairline text-ink-muted',
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50"
          >
            {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Generate skeletons
          </button>
        </div>

        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Output
          </p>
          <pre className="mt-1.5 min-h-[280px] overflow-auto rounded-xl border border-hairline bg-paper-elevated p-4 font-mono text-[12px] leading-relaxed text-ink whitespace-pre-wrap">
            {code || '// Generated code appears here'}
          </pre>
          <p className="mt-2 text-[12px] italic text-ink-muted">
            Lossy / subset — methods and class names only; round-trip parse comes
            later.
          </p>
        </div>
      </div>
    </CategoryShell>
  )
}
