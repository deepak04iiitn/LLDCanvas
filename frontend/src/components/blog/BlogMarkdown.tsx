'use client'

import { useMemo, isValidElement } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { Quote, Hash } from 'lucide-react'
import { toast } from 'sonner'
import 'highlight.js/styles/github.css'

// Single source of truth for rendering blog markdown — used by the public
// article page and the admin editor's preview tab, so what an author sees
// while writing is exactly what ships.

function buildChapterNumbers(md: string) {
  const map: Record<string, number> = {}
  let n = 0
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{1,4})\s+(.+)/)
    if (!m) continue
    if (m[1].length !== 2) continue
    const text = m[2].replace(/\*\*/g, '').replace(/`/g, '').trim()
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    n++
    map[id] = n
  }
  return map
}

export function BlogMarkdown({ content }: { content: string }) {
  const chapterNumbers = useMemo(() => buildChapterNumbers(content), [content])

  const components: Components = {
    h2: ({ id, children }) => {
      const num = chapterNumbers[id ?? '']
      return (
        <h2 id={id} className="group relative mt-14 mb-5 flex scroll-mt-28 items-start gap-4">
          {num !== undefined && (
            <span className="mt-1 shrink-0 font-mono text-sm font-bold tabular-nums text-gold/70">
              {String(num).padStart(2, '0')}
            </span>
          )}
          <span className="flex-1 font-serif text-2xl font-bold text-ink">{children}</span>
          <a
            href={`#${id}`}
            aria-label="Copy link to section"
            onClick={e => {
              e.preventDefault()
              navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#${id}`)
              toast.success('Section link copied')
            }}
            className="mt-2 shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-brand group-hover:opacity-100"
          >
            <Hash className="h-4 w-4" />
          </a>
        </h2>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="not-prose relative my-8 rounded-r-xl border-l-4 border-gold bg-gold-tint/50 py-5 pl-8 pr-5">
        <Quote className="absolute left-3 top-4 h-5 w-5 rotate-180 fill-gold/10 text-gold/40" />
        <div className="text-[15px] italic leading-relaxed text-ink-muted [&>p]:my-0">{children}</div>
      </blockquote>
    ),
    pre: ({ children, ...props }) => {
      const codeEl = Array.isArray(children) ? children[0] : children
      const codeClassName = (isValidElement(codeEl) ? (codeEl.props as { className?: string }).className : '') ?? ''
      const lang = /language-(\w+)/.exec(codeClassName)?.[1] ?? 'text'
      return (
        <div className="not-prose my-6 overflow-hidden rounded-xl border border-hairline bg-[#fbfaf7] shadow-sm">
          <div className="flex items-center justify-between border-b border-hairline bg-hairline/40 px-4 py-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{lang}</span>
          </div>
          <pre className="m-0 overflow-x-auto p-4 text-[13px] leading-relaxed" {...props}>{children}</pre>
        </div>
      )
    },
  }

  return (
    <div className="prose prose-neutral max-w-none
      prose-headings:font-serif prose-headings:font-bold prose-headings:text-ink
      prose-h1:text-3xl
      prose-h3:mt-7 prose-h3:text-xl
      prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-ink-muted
      prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:mr-3 prose-p:first-of-type:first-letter:mt-1 prose-p:first-of-type:first-letter:font-serif prose-p:first-of-type:first-letter:text-6xl prose-p:first-of-type:first-letter:font-black prose-p:first-of-type:first-letter:leading-[0.8] prose-p:first-of-type:first-letter:text-brand
      prose-a:text-brand prose-a:no-underline hover:prose-a:underline
      prose-strong:font-semibold prose-strong:text-ink
      prose-code:rounded prose-code:bg-brand/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px] prose-code:text-brand prose-code:before:content-none prose-code:after:content-none
      prose-table:text-[14px] prose-th:bg-ink/5 prose-th:font-semibold prose-td:text-ink-muted
      prose-ul:list-disc prose-ol:list-decimal
      prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-ink-muted prose-li:marker:text-brand/50
      prose-hr:my-8 prose-hr:border-hairline
      prose-img:rounded-xl prose-img:border prose-img:border-hairline">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
