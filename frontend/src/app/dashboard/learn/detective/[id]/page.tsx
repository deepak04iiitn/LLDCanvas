import { DetectiveSession } from '@/components/learn/detective/DetectiveSession'

const BREADCRUMB = [
  { label: 'Learn', href: '/learn' },
  { label: 'Pattern Detective', href: '/dashboard/learn/detective' },
  { label: 'Problems', href: '/dashboard/learn/detective/problems' },
]

export default function LearnDetectiveIdPage() {
  return <DetectiveSession breadcrumb={BREADCRUMB} />
}
