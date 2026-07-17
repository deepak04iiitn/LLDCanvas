export const EASE = 'easeOut' as const

// Fade + rise on mount — used for above-the-fold content that should animate
// in immediately (hero copy, page headers).
export function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  }
}

// Fade + rise on scroll-into-view — used for below-the-fold sections so the
// page doesn't animate everything at once on load.
export function inViewProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4, ease: EASE, delay },
  }
}
