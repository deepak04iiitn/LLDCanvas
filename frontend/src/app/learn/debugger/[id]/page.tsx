import { DebuggerSessionLoader } from '@/components/learn/debugger/DebuggerSessionLoader'

const BREADCRUMB = [
  { label: 'Learn', href: '/learn' },
  { label: 'Code Bug Lab', href: '/learn/debugger' },
  { label: 'Problems', href: '/learn/debugger/problems' },
]

export default function DebuggerSessionPage() {
  return <DebuggerSessionLoader breadcrumb={BREADCRUMB} />
}
