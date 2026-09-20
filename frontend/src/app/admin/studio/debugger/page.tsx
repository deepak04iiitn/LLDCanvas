import { redirect } from 'next/navigation'

export default function AdminStudioDebuggerPage() {
  redirect('/admin/studio?type=debugger')
}
