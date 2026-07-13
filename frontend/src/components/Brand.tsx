import Image from 'next/image'

// Shared brand lockup (icon + wordmark baked into one asset) — used across
// the landing page, dashboard/templates/settings sidebar, and the editor
// topbar so the real logo appears everywhere consistently.
const LOGO_SRC = '/LLDCanvas_Logo.png'
const LOGO_ASPECT = 707 / 353

interface WordmarkProps {
  className?: string
  /** Rendered height in px — width follows the source image's aspect ratio. */
  height?: number
  priority?: boolean
}

export function Wordmark({ className = '', height = 36, priority = false }: WordmarkProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="LLDCanvas"
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      className={`w-auto select-none ${className}`}
      priority={priority}
    />
  )
}
