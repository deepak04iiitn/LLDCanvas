import type { DiagramSummary } from '@/types'

export type RecencyBucket =
  | 'Today'
  | 'Yesterday'
  | 'This week'
  | 'Earlier this month'
  | 'Older'

export type LibrarySort = 'recent' | 'name'

export type FlatLibraryItem =
  | { kind: 'header'; key: string; label: RecencyBucket }
  | { kind: 'row'; key: string; diagram: DiagramSummary }

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function bucketFor(updatedAt: string, now = new Date()): RecencyBucket {
  const updated = new Date(updatedAt)
  const today = startOfDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dayMs = 86_400_000
  const weekAgo = new Date(today.getTime() - 6 * dayMs)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const u = startOfDay(updated)
  if (u.getTime() >= today.getTime()) return 'Today'
  if (u.getTime() >= yesterday.getTime()) return 'Yesterday'
  if (u.getTime() >= weekAgo.getTime()) return 'This week'
  if (u.getTime() >= monthStart.getTime()) return 'Earlier this month'
  return 'Older'
}

const BUCKET_ORDER: RecencyBucket[] = [
  'Today',
  'Yesterday',
  'This week',
  'Earlier this month',
  'Older',
]

/** Sort diagrams, then flatten into sticky section headers + rows. */
export function buildChronologyItems(
  diagrams: DiagramSummary[],
  sort: LibrarySort,
): FlatLibraryItem[] {
  const sorted = [...diagrams]
  if (sort === 'name') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
  } else {
    sorted.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  // Name sort: single flat list without date buckets (headers would be noise)
  if (sort === 'name') {
    return sorted.map(d => ({ kind: 'row' as const, key: d._id, diagram: d }))
  }

  const groups = new Map<RecencyBucket, DiagramSummary[]>()
  for (const d of sorted) {
    const b = bucketFor(d.updatedAt)
    const list = groups.get(b) ?? []
    list.push(d)
    groups.set(b, list)
  }

  const items: FlatLibraryItem[] = []
  for (const label of BUCKET_ORDER) {
    const list = groups.get(label)
    if (!list?.length) continue
    items.push({ kind: 'header', key: `h-${label}`, label })
    for (const d of list) {
      items.push({ kind: 'row', key: d._id, diagram: d })
    }
  }
  return items
}
