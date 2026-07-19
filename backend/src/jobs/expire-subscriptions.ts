import { Subscription } from '../models/subscription.model'
import { User } from '../models/user.model'

// Downgrades any subscription whose paid-for period has lapsed. This is the
// only expiry path for manually-onboarded subscriptions (no Razorpay webhook
// will ever fire for them), and it also acts as a safety net for real
// Razorpay subscriptions in case a `subscription.cancelled`/`expired` webhook
// was missed.
export async function expireLapsedSubscriptions(): Promise<number> {
  const now = new Date()
  const lapsed = await Subscription.find({
    status: 'active',
    currentPeriodEnd: { $ne: null, $lte: now },
  })

  for (const sub of lapsed) {
    sub.status = 'expired'
    sub.cancelledAt = now
    await sub.save()
    await User.findByIdAndUpdate(sub.userId, { plan: 'free' })
  }

  return lapsed.length
}

const CHECK_INTERVAL_MS = 60 * 60 * 1000 // hourly — subscription periods only ever change on a day scale

export function startSubscriptionExpiryJob(): void {
  const run = () => {
    expireLapsedSubscriptions()
      .then(count => { if (count > 0) console.log(`[subscriptions] expired ${count} lapsed subscription(s)`) })
      .catch(err => console.error('[subscriptions] expiry sweep failed:', err))
  }
  run()
  setInterval(run, CHECK_INTERVAL_MS)
}
