import type { PlanName } from './plans'

/**
 * Difficulty-catalog features gated like Practice Problems:
 * Free → curated Easy allowlist (~10)
 * Pro  → all Easy + curated Medium allowlist (5)
 * Ultimate → all Easy / Medium / Hard
 *
 * No monthly attempt meters — unlimited replays of anything you can open.
 */
export type ChallengeFeature =
  | 'roguelike'
  | 'debug-lab'
  | 'detective'
  | 'debugger'
  | 'refactor'
  | 'change_one'
  | 'evolution'
  | 'budget'

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'

type Allowlists = {
  freeEasy: readonly string[]
  proMedium: readonly string[]
}

/** ~10 Free Easy + 5 Pro Medium per feature. */
export const CHALLENGE_ALLOWLISTS: Record<ChallengeFeature, Allowlists> = {
  roguelike: {
    freeEasy: [
      'library-management',
      'parking-lot-system',
      'vending-machine',
      'atm-system',
      'task-manager',
      'movie-ticket-booking',
      'url-shortener',
      'chat-app-basic',
      'blog-platform',
      'online-quiz',
    ],
    proMedium: [
      'barbershop-booking',
      'auction-system',
      'content-management',
      'music-streaming',
      'warehouse-management',
    ],
  },

  // Pattern Detective
  detective: {
    freeEasy: [
      'observer-order-status',
      'factory-payment-gateway',
      'explain-when-none',
      'singleton-config-b2',
      'factory-shape-b2',
      'observer-newsletter-b2',
      'builder-pizza-b2',
      'decorator-coffee-b2',
      'strategy-sort-b2',
      'facade-home-theater-b2',
    ],
    proMedium: [
      'simple-dto-trap',
      'decorator-notifier',
      'abstract-factory-ui-b2',
      'strategy-payment-b2',
      'observer-event-b2',
    ],
  },

  // Debug Lab = code bugs + design bugs (~5+5 Free Easy, 5 Pro Medium)
  'debug-lab': {
    freeEasy: [
      'parking-compact-uses-large',
      'vending-dispense-without-coin',
      'atm-withdraw-skips-pin',
      'library-still-available',
      'elevator-ignores-request',
      'shopping-cart-inherits-user',
      'book-author-bidirectional',
      'employee-payroll-god-class',
      'hotel-no-room-abstraction',
      'product-inventory-mixed',
    ],
    proMedium: [
      'parking-unpark-leaks-spot',
      'movie-seat-double-book',
      'splitwise-wrong-direction',
      'hotel-checkout-blocks-next',
      'cart-discount-then-tax-wrong',
    ],
  },

  // Design Studio — Debug & Fix
  debugger: {
    freeEasy: [
      'dbg-cart-extends-user',
      'dbg-invoice-sends-email',
      'dbg-vehicle-no-interface',
      'dbg-todo-god-list',
      'dbg-payment-in-order',
      'dbg-comment-extends-post',
      'dbg-engine-concrete',
      'dbg-doctor-extends-patient',
      'dbg-playlist-song-cycle',
      'dbg-report-extends-user',
    ],
    proMedium: [
      'dbg-bookmyshow-seat-lock',
      'dbg-uber-no-user-base',
      'dbg-lru-hardcoded',
      'dbg-splitwise-expense-god',
      'dbg-chess-board-validates',
    ],
  },

  refactor: {
    freeEasy: [
      'ref-extract-invoice-email',
      'ref-decouple-stripe-checkout',
      'ref-extract-pricing-from-cart',
      'ref-split-user-profile',
      'ref-decouple-s3-uploader',
      'ref-extract-report-csv',
      'ref-cleanup-logger-calls',
      'ref-decouple-sendgrid',
      'ref-extract-validation',
      'ref-split-todo-reminders',
    ],
    proMedium: [
      'ref-split-bookmyshow-booking',
      'ref-decouple-ride-pricing',
      'ref-extract-expense-settle',
      'ref-redesign-chess-moves',
      'ref-split-tweet-pipeline',
    ],
  },

  change_one: {
    freeEasy: [
      'co-add-paypal-beside-stripe',
      'co-add-push-notify',
      'co-add-pdf-export',
      'co-add-sms-channel',
      'co-remove-fax-channel',
      'co-add-upi-payments',
      'co-add-s3-storage',
      'co-add-redis-cache',
      'co-add-slack-alerts',
      'co-remove-legacy-printer',
    ],
    proMedium: [
      'co-reserve-then-charge',
      'co-domain-no-razorpay',
      'co-add-surge-pricing',
      'co-otp-dont-touch-login',
      'co-split-notify-ownership',
    ],
  },

  evolution: {
    freeEasy: [
      'evo2-payment-checkout-growth-easy',
      'evo2-notification-multichannel-easy',
      'evo2-parking-reservation-easy',
      'evo2-auth-session-scale-easy',
      'evo2-food-delivery-order-easy',
      'evo2-chat-rooms-easy',
      'evo2-hotel-booking-easy',
      'evo2-cache-aside-catalog-easy',
      'evo2-subscription-lifecycle-easy',
      'evo2-config-and-feature-flags-easy',
    ],
    proMedium: [
      'evo2-marketplace-sellers-medium',
      'evo2-ride-dispatch-pricing-medium',
      'evo2-streaming-playback-medium',
      'notifier-to-orchestrator',
      'parking-to-smart-city',
    ],
  },

  budget: {
    freeEasy: [
      'bud2-checkout-payments-easy',
      'bud2-notification-delivery-easy',
      'bud2-auth-sessions-easy',
      'bud2-parking-reservations-easy',
      'bud2-food-delivery-ops-easy',
      'bud2-realtime-chat-easy',
      'bud2-hotel-booking-easy',
      'bud2-product-catalog-cache-easy',
      'bud2-subscription-billing-easy',
      'bud2-feature-flags-config-easy',
    ],
    proMedium: [
      'bud2-marketplace-trust-medium',
      'bud2-video-streaming-medium',
      'food-delivery-mvp-budget',
      'ecommerce-checkout-budget',
      'engineer-days-budget',
    ],
  },
}

export function isChallengeAccessible(
  feature: ChallengeFeature,
  plan: PlanName,
  difficulty: ChallengeDifficulty | string,
  slug: string,
): boolean {
  const d = normalizeDifficulty(difficulty)
  if (!d) return false

  if (plan === 'ultimate') return true

  const lists = CHALLENGE_ALLOWLISTS[feature]
  if (!lists) return false

  if (plan === 'pro') {
    if (d === 'easy') return true
    if (d === 'medium') return lists.proMedium.includes(slug)
    return false // hard → Ultimate
  }

  // free
  if (d === 'easy') return lists.freeEasy.includes(slug)
  return false
}

/** Minimum plan needed to open this challenge. */
export function requiredPlanForChallenge(
  feature: ChallengeFeature,
  difficulty: ChallengeDifficulty | string,
  slug: string,
): 'free' | 'pro' | 'ultimate' {
  const d = normalizeDifficulty(difficulty)
  if (!d) return 'ultimate'

  if (isChallengeAccessible(feature, 'free', d, slug)) return 'free'
  if (isChallengeAccessible(feature, 'pro', d, slug)) return 'pro'
  return 'ultimate'
}

export function annotateChallengeAccess<T extends { slug: string; difficulty?: string }>(
  feature: ChallengeFeature,
  plan: PlanName,
  items: T[],
): Array<T & { locked: boolean; requiredPlan: 'free' | 'pro' | 'ultimate' }> {
  return items.map((item) => {
    const difficulty = item.difficulty ?? 'easy'
    const requiredPlan = requiredPlanForChallenge(feature, difficulty, item.slug)
    const locked = !isChallengeAccessible(feature, plan, difficulty, item.slug)
    return { ...item, locked, requiredPlan }
  })
}

/** Map ChallengePack.type → feature key (studio packs only). */
export function studioTypeToFeature(type: string): ChallengeFeature | null {
  switch (type) {
    case 'debugger':
    case 'refactor':
    case 'change_one':
    case 'evolution':
    case 'budget':
      return type
    default:
      return null
  }
}

function normalizeDifficulty(d: string): ChallengeDifficulty | null {
  const v = String(d || '').toLowerCase()
  if (v === 'easy' || v === 'medium' || v === 'hard') return v
  if (v === 'hardcore') return 'hard'
  return null
}
