import rateLimit from 'express-rate-limit'

// Stricter limiter for auth endpoints — brute-force protection on sign-in/sign-up.
// Global limiter (index.ts) allows 500 req/15min; auth routes get 20/15min.
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
})
