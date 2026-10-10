import { DebuggerSessionLoader } from '@/components/learn/debugger/DebuggerSessionLoader'

const BREADCRUMB = [
  { label: 'Learn', href: '/learn' },
  { label: 'Code Bug Lab', href: '/dashboard/learn/debugger' },
  { label: 'Problems', href: '/dashboard/learn/debugger/problems' },
]

export default function DebuggerSessionPage() {
  return <DebuggerSessionLoader breadcrumb={BREADCRUMB} />
}
