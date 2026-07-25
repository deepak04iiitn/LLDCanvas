import { BlogBlock } from '../types/blog-content'
import { IBlogToc } from '../models/blog.model'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case 'heading':  return block.text
    case 'paragraph': return block.text
    case 'quote':     return block.text
    case 'bullets':   return block.items.join(' ')
    case 'numbered':  return block.items.join(' ')
    case 'table':     return [...block.headers, ...block.rows.flat()].join(' ')
    case 'code':      return ''
    case 'divider':   return ''
  }
}

export function calcReadingTime(blocks: BlogBlock[]): number {
  const words = blocks.map(blockText).join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function buildTocAndIds(blocks: BlogBlock[]): { blocks: BlogBlock[]; toc: IBlogToc[] } {
  const seen: Record<string, number> = {}
  const toc: IBlogToc[] = []

  const nextBlocks = blocks.map(block => {
    if (block.type !== 'heading') return block
    let id = slugify(block.text)
    if (seen[id] !== undefined) {
      seen[id]++
      id = `${id}-${seen[id]}`
    } else {
      seen[id] = 0
    }
    toc.push({ id, text: block.text, level: block.level })
    return { ...block, id }
  })

  return { blocks: nextBlocks, toc }
}
