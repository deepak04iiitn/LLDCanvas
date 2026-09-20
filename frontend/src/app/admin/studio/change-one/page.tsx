import { redirect } from 'next/navigation'

export default function AdminStudioChangeOnePage() {
  redirect('/admin/studio?type=change_one')
}
