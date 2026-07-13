'use client'

import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'

/**
 * Detects viewport width < 768 px and renders a full-screen overlay that
 * politely informs the user the editor requires a desktop browser.
 * The overlay prevents interaction with the canvas on mobile.
 */
export function MobileEditorGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile) return <>{children}</>

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center
                    gap-5 bg-[#F8F8F8] px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
        <Monitor className="h-8 w-8 text-indigo-500" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Desktop required</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
          LLDCanvas is optimised for desktop browsers. Please open it on a
          laptop or desktop for the full experience.
        </p>
      </div>
      <a
        href="/dashboard"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                   transition-colors hover:bg-indigo-700"
      >
        Back to Dashboard
      </a>
    </div>
  )
}
