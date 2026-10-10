'use client'

import { redirect } from 'next/navigation'

// Detective is now fully managed via the Features hub.
// Redirect to keep any bookmarked links working.
export default function AdminLearnDetectivePage() {
  redirect('/admin/features/detective')
}
