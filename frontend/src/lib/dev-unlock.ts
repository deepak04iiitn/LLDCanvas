/**
 * Dev unlock mode.
 *
 * Set NEXT_PUBLIC_DEV_UNLOCK=true in your .env.local to bypass ALL
 * plan gates and feature flags — every feature becomes accessible to
 * every user regardless of their subscription.
 *
 * When the variable is absent or falsy the platform works exactly as
 * in production.
 */
export const DEV_UNLOCK =
  process.env.NEXT_PUBLIC_DEV_UNLOCK === 'true' ||
  process.env.NEXT_PUBLIC_DEV_UNLOCK === '1'
