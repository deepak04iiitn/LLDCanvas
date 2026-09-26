import { DetectiveSession } from '@/components/learn/detective/DetectiveSession'

const BREADCRUMB = [
  { label: 'Learn', href: '/learn' },
  { label: 'Pattern Detective', href: '/learn/detective' },
  { label: 'Problems', href: '/learn/detective/problems' },
]

export default function LearnDetectiveIdPage() {
  return <DetectiveSession breadcrumb={BREADCRUMB} />
}
