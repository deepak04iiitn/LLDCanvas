import type { ReactNode } from 'react'
import { createElement, Fragment } from 'react'

export type TextRun = { text: string; bold?: boolean; italic?: boolean; code?: boolean; href?: string }

export type BlogBlock =
  | { type: 'heading'; level: 2 | 3; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'quote'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'divider' }

export const BLOG_BLOCK_TYPES = [
  'heading', 'paragraph', 'bullets', 'numbered', 'code', 'quote', 'table', 'divider',
] as const

/**
 * Tiny, deterministic inline formatter — NOT Markdown. Only these 4 patterns,
 * no nesting, no block-level syntax. Scans left to right once.
 */
export function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = []
  const pattern = /\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((.+?)\)|\*(.+?)\*/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index) })
    if (match[1] !== undefined) runs.push({ text: match[1], bold: true })
    else if (match[2] !== undefined) runs.push({ text: match[2], code: true })
    else if (match[3] !== undefined) runs.push({ text: match[3], href: match[4] })
    else if (match[5] !== undefined) runs.push({ text: match[5], italic: true })
    last = pattern.lastIndex
  }
  if (last < text.length) runs.push({ text: text.slice(last) })
  return runs
}

export function renderRuns(runs: TextRun[]): ReactNode {
  return createElement(
    Fragment, null,
    ...runs.map((run, i) => {
      let node: ReactNode = run.text
      if (run.bold) node = createElement('strong', { key: i }, node)
      if (run.italic) node = createElement('em', { key: i }, node)
      if (run.code) node = createElement('code', { key: i }, node)
      if (run.href) node = createElement('a', { key: i, href: run.href }, node)
      return createElement(Fragment, { key: i }, node)
    }),
  )
}
