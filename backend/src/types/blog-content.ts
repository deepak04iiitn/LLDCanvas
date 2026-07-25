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
