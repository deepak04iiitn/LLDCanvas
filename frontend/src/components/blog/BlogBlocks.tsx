'use client'

import { Fragment } from 'react'
import hljs from 'highlight.js'
import { Quote, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { type BlogBlock, parseInline, renderRuns } from '@/lib/blog-blocks'
import 'highlight.js/styles/github.css'

// Single source of truth for rendering blog content — used by the public
// article page and the admin editor's preview tab, so what an author sees
// while writing is exactly what ships. Blocks are explicit, typed data (no
// text parsing at the block level) — only inline emphasis within a block's
// text goes through the tiny parseInline() formatter.

function Heading({ block, chapterNumber }: { block: Extract<BlogBlock, { type: 'heading' }>; chapterNumber?: number }) {
  const { id, level, text } = block

  function copyLink() {
    if (!id) return
    navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#${id}`)
    toast.success('Section link copied')
  }

  if (level === 3) {
    return <h3 id={id} className="mt-7 scroll-mt-28 font-serif text-xl font-bold text-ink">{renderRuns(parseInline(text))}</h3>
  }

  return (
    <h2 id={id} className="group relative mt-14 mb-5 flex scroll-mt-28 items-start gap-4">
      {chapterNumber !== undefined && (
        <span className="mt-1 shrink-0 font-mono text-sm font-bold tabular-nums text-gold/70">
          {String(chapterNumber).padStart(2, '0')}
        </span>
      )}
      <span className="flex-1 font-serif text-2xl font-bold text-ink">{renderRuns(parseInline(text))}</span>
      <a
        href={id ? `#${id}` : undefined}
        aria-label="Copy link to section"
        onClick={e => { e.preventDefault(); copyLink() }}
        className="mt-2 shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-brand group-hover:opacity-100"
      >
        <Hash className="h-4 w-4" />
      </a>
    </h2>
  )
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  let html: string
  try {
    html = hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value
  } catch {
    html = code
  }
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
      <pre className="m-0 overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  const chapterNumbers: number[] = []
  let n = 0
  for (const block of blocks) chapterNumbers.push(block.type === 'heading' && block.level === 2 ? ++n : 0)
  const firstParagraphIndex = blocks.findIndex(b => b.type === 'paragraph')

  return (
    <div className="prose prose-neutral max-w-none
      prose-headings:font-serif prose-headings:font-bold prose-headings:text-ink
      prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-ink-muted
      prose-a:text-brand prose-a:no-underline hover:prose-a:underline
      prose-strong:font-semibold prose-strong:text-ink
      prose-code:rounded prose-code:bg-brand/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[13px] prose-code:text-brand prose-code:before:content-none prose-code:after:content-none
      prose-table:text-[14px] prose-th:bg-ink/5 prose-th:font-semibold prose-td:text-ink-muted
      prose-ul:list-disc prose-ol:list-decimal
      prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-ink-muted prose-li:marker:text-brand/50
      prose-hr:my-8 prose-hr:border-hairline
      prose-img:rounded-xl prose-img:border prose-img:border-hairline">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            return <Heading key={i} block={block} chapterNumber={block.level === 2 ? chapterNumbers[i] : undefined} />
          }
          case 'paragraph': {
            const isFirst = i === firstParagraphIndex
            return (
              <p
                key={i}
                className={isFirst
                  ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-brand'
                  : undefined}
              >
                {renderRuns(parseInline(block.text))}
              </p>
            )
          }
          case 'bullets':
            return (
              <ul key={i}>
                {block.items.map((item, j) => <li key={j}>{renderRuns(parseInline(item))}</li>)}
              </ul>
            )
          case 'numbered':
            return (
              <ol key={i}>
                {block.items.map((item, j) => <li key={j}>{renderRuns(parseInline(item))}</li>)}
              </ol>
            )
          case 'code':
            return <CodeBlock key={i} lang={block.lang} code={block.code} />
          case 'quote':
            return (
              <blockquote key={i} className="not-prose relative my-8 rounded-r-xl border-l-4 border-gold bg-gold-tint/50 py-5 pl-8 pr-5">
                <Quote className="absolute left-3 top-4 h-5 w-5 rotate-180 fill-gold/10 text-gold/40" />
                <div className="text-[15px] italic leading-relaxed text-ink-muted">
                  <p className="my-0">{renderRuns(parseInline(block.text))}</p>
                </div>
              </blockquote>
            )
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>{block.headers.map((h, j) => <th key={j}>{renderRuns(parseInline(h))}</th>)}</tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => <td key={k}>{renderRuns(parseInline(cell))}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'divider':
            return <hr key={i} />
          default:
            return <Fragment key={i} />
        }
      })}
    </div>
  )
}
