# Dodo Payments Setup Guide (LLDCanvas)

Step-by-step instructions to enable international billing via **Dodo Payments**, while keeping **Razorpay** for India.

Code is already integrated. You only need to configure the Dodo dashboard and fill env vars.

---

## Architecture (quick reminder)

| User country | Gateway | Prices |
|---|---|---|
| India (`IN`) | Razorpay | INR |
| Everywhere else | Dodo Checkout Sessions | USD list price → Adaptive Currency at checkout |

Webhook (Dodo): `POST https://<your-api-host>/billing/webhook/dodo`  
Return URL after checkout: `https://<your-frontend>/pricing/success`

---

## 1. Create a Dodo Payments account

1. Go to [https://dodopayments.com](https://dodopayments.com) and sign up.
2. Complete business / KYC verification as required by Dodo.
3. Open the **Dashboard**.

You will use **Test mode** first, then switch to **Live mode**.

---

## 2. Get your API key

1. In the Dodo Dashboard go to **Developer → API Keys** (or **Settings → API**).
2. Create / copy the **API key** for the current mode (Test or Live).
3. Put it in backend `.env`:

```env
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_ENV=test_mode
```

When going live, change to:

```env
DODO_PAYMENTS_ENV=live_mode
```

and use the **live** API key.

---

## 3. Enable Adaptive Currency (required)

Adaptive Currency lets one USD product catalog bill customers in any Dodo-supported currency (~150).

1. In the Dashboard open **Settings → Payments** (or **Features → Adaptive Currency / Adaptive Pricing**).
2. **Enable Adaptive Currency / Adaptive Pricing**.
3. Save.

Without this, `billing_currency` and currency selection at checkout are ignored.

Official docs: [Adaptive Currency](https://docs.dodopayments.com/features/adaptive-currency)

---

## 4. Create 4 **recurring** subscription products (USD base)

Create **four** products in **Test Mode** first. Use the exact values below so they match LLDCanvas pricing and recurring billing.

**Do not** choose One Time / Single Payment. Always choose **Subscription**.

### Master product table (fill every field like this)

| Field | Pro Monthly | Pro Yearly | Ultimate Monthly | Ultimate Yearly |
|---|---|---|---|---|
| **Product Name** | `LLDCanvas Pro — Monthly` | `LLDCanvas Pro — Yearly` | `LLDCanvas Ultimate — Monthly` | `LLDCanvas Ultimate — Yearly` |
| **Brand** | `LLDCanvas` | `LLDCanvas` | `LLDCanvas` | `LLDCanvas` |
| **Tax Category** | `Edtech` | `Edtech` | `Edtech` | `Edtech` |
| **Product Description** | See copy below | See copy below | See copy below | See copy below |
| **Pricing Type** | **Subscription** | **Subscription** | **Subscription** | **Subscription** |
| **Price** | `$10` | `$100` | `$20` | `$200` |
| **Currency** | `USD` | `USD` | `USD` | `USD` |
| **Repeat payment every** | `1` **Months** | `1` **Years** | `1` **Months** | `1` **Years** |
| **Tax Inclusive Pricing** | Off | Off | Off | Off |
| **Localized Pricing** | **On** → **By Currency** | **On** → **By Currency** | **On** → **By Currency** | **On** → **By Currency** |
| **Purchasing Power Parity** | Off | Off | Off | Off |
| **Trial Period (Days)** | Off / `0` | Off / `0` | Off / `0` | Off / `0` |
| **Default Discount (%)** | Off | Off | Off | Off |
| **Card-optional at $0 Price** | Off | Off | Off | Off |
| **Subscription Period** | **On** → `10` **Years** | **On** → `10` **Years** | **On** → `10` **Years** | **On** → `10` **Years** |
| **Associated Add-ons** | None | None | None | None |
| **Credits** | Skip / none | Skip / none | Skip / none | Skip / none |
| **Entitlements** (Discord, GitHub, License key, Feature Flag, Files, Notion, Framer, etc.) | **None** — access is granted by our app via webhooks | None | None | None |
| **Meta Data** | Optional (see below) | Optional | Optional | Optional |
| **Env var for Product ID** | `DODO_PRO_MONTHLY` | `DODO_PRO_YEARLY` | `DODO_ULT_MONTHLY` | `DODO_ULT_YEARLY` |

### Product descriptions (paste into the Description box)

**Pro Monthly / Pro Yearly**

```text
LLDCanvas Pro — practice Low-Level Design with more problems, hints, community discussion, interview mode (10 sessions/month), and collaboration for up to 3 people.
```

**Ultimate Monthly / Ultimate Yearly**

```text
LLDCanvas Ultimate — full problem library (Easy, Medium & Hard), unlimited interview sessions & collaboration, version history, activity timeline, full analytics, and priority support.
```

### Optional Meta Data (if you turn Meta Data On)

| Key | Pro Monthly | Pro Yearly | Ultimate Monthly | Ultimate Yearly |
|---|---|---|---|---|
| `tier` | `pro` | `pro` | `ultimate` | `ultimate` |
| `billing` | `monthly` | `yearly` | `monthly` | `yearly` |
| `app` | `lldcanvas` | `lldcanvas` | `lldcanvas` | `lldcanvas` |

### Why Subscription Period must be long

In Dodo:

- **Repeat payment every** = how often the card is charged (the recurring cadence).
- **Subscription Period** = total term the subscription is allowed to keep renewing.

If period equals frequency (e.g. period = 1 Month and repeat = 1 Month), Dodo expires after **one** cycle. That is wrong for SaaS.

Use:

- Monthly products → Repeat `1 Months` + Period `10 Years`
- Yearly products → Repeat `1 Years` + Period `10 Years`

(You can use `20 Years` if the UI allows.)

### Step-by-step in the Dodo UI

1. Go to **Products → Create / Add product** (stay in **Test Mode**).
2. **Basic Details**
   - Product Name → from table
   - Brand → `LLDCanvas`
   - Tax Category → `Edtech`
3. **Media & Description**
   - Paste the matching description above
   - Image optional (you can upload the LLDCanvas logo later)
4. **Pricing**
   - Pricing Type → **Subscription**
   - Price + currency → from table (`USD`)
   - Repeat payment every → from table
   - Turn **Localized Pricing** **On** → choose **By Currency** (not By Country)
   - Leave Trial / Discount / PPP / Tax Inclusive **Off**
   - Turn **Subscription Period** **On** → `10 Years`
5. **Credits / Entitlements / Add-ons**
   - Leave empty — LLDCanvas unlocks Pro/Ultimate itself after the `subscription.active` webhook
6. Click **Add product** (not just draft).
7. Copy the Product ID (`pdt_...`) into the matching env var.
8. Repeat until all **4** products exist.

### Env vars after creating products

```env
DODO_PRO_MONTHLY=pdt_xxxxxxxx
DODO_PRO_YEARLY=pdt_xxxxxxxx
DODO_ULT_MONTHLY=pdt_xxxxxxxx
DODO_ULT_YEARLY=pdt_xxxxxxxx
```

Our app already:

- Opens a Dodo Checkout Session with the correct subscription product
- Listens for `subscription.active` (first charge) and `subscription.renewed` + `payment.succeeded` (renewals)
- Cancels at next billing date when the user cancels (same UX as Razorpay)

Repeat the same 4 products in **Live mode** with live product IDs when you go production.

---

## 5. Create the webhook endpoint

1. Go to **Developer → Webhooks → Add endpoint**.
2. Endpoint URL:

```text
https://<your-backend-host>/billing/webhook/dodo
```

Examples:
- Production: `https://api.lldcanvas.com/billing/webhook/dodo`
- Local testing: use a tunnel (ngrok / Cloudflare Tunnel), e.g.  
  `https://abc123.ngrok-free.app/billing/webhook/dodo`

3. Subscribe to at least these events:

- `subscription.active`
- `subscription.renewed`
- `subscription.on_hold`
- `subscription.cancelled`
- `subscription.expired`
- `subscription.failed`
- `subscription.plan_changed`
- `payment.succeeded`

4. Click **Create endpoint**.
5. Open the endpoint → **Overview** and copy the **Signing secret**.
6. Put it in backend `.env`:

```env
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_xxxxxxxx
```

Official docs: [Webhooks](https://docs.dodopayments.com/developer-resources/webhooks)

---

## 6. Full backend `.env` checklist

```env
# Dodo Payments (international)
DODO_PAYMENTS_API_KEY=...
DODO_PAYMENTS_WEBHOOK_SECRET=...
DODO_PAYMENTS_ENV=test_mode
DODO_PRO_MONTHLY=pdt_...
DODO_PRO_YEARLY=pdt_...
DODO_ULT_MONTHLY=pdt_...
DODO_ULT_YEARLY=pdt_...

# Optional — force gateway while developing from India / localhost
# BILLING_GATEWAY_OVERRIDE=dodo
# BILLING_GATEWAY_OVERRIDE=razorpay
```

Also ensure:

```env
CLIENT_URL=https://your-frontend-domain
```

`CLIENT_URL` is used as the Dodo checkout `return_url` base (`/pricing/success`).

Restart the backend after changing env vars.

---

## 7. How routing works in the app

1. Frontend calls `GET /billing/geo`.
2. Backend returns `{ country, currency, gateway }`.
3. Pricing page:
   - `gateway === 'razorpay'` → existing Razorpay popup (India).
   - `gateway === 'dodo'` → `POST /billing/subscribe/dodo` → redirect to Dodo hosted checkout.
4. After payment, user lands on `/pricing/success`, which polls until the plan upgrades.
5. Entitlement is granted by the **Dodo webhook** (`subscription.active`), not by the browser alone.

### Testing Dodo from India / localhost

Geo defaults to India for local IPs. To force Dodo checkout while developing:

```env
BILLING_GATEWAY_OVERRIDE=dodo
```

Remove the override when done.

---

## 8. Test checklist

### India (Razorpay) — regression

- [ ] From an Indian IP (or `BILLING_GATEWAY_OVERRIDE=razorpay`), open `/pricing`.
- [ ] Upgrade to Pro → Razorpay popup opens.
- [ ] Complete test payment → plan becomes `pro`.
- [ ] Cancel from Settings → cancels at period end.

### International (Dodo)

- [ ] Set `BILLING_GATEWAY_OVERRIDE=dodo` (or use a non-IN IP / VPN).
- [ ] Open `/pricing` → USD prices + Adaptive Currency note.
- [ ] Click Upgrade → redirects to Dodo checkout.
- [ ] Pay with a Dodo test card.
- [ ] Return to `/pricing/success` → redirects to dashboard with upgraded plan.
- [ ] Admin → Subscriptions shows badge `dodo · <currency>`.
- [ ] Cancel from Settings → Dodo cancel-at-next-billing.

### Currencies

- [ ] In Dodo checkout, currency selector is available (`allow_currency_selection`).
- [ ] Try EUR / GBP / AED — Adaptive Pricing converts from USD base.
- [ ] After first successful charge, currency is locked for that subscription (Dodo behavior).

### Webhooks

- [ ] In Dodo Dashboard → Webhooks → Logs, deliveries to `/billing/webhook/dodo` are `2xx`.
- [ ] Replay a `subscription.active` event → still idempotent (no duplicate plan issues).
- [ ] Invalid signature → `400`.

### Failures / on hold

- [ ] Failed renewal → status `on_hold` (plan not wiped immediately).
- [ ] Cancelled / expired / failed → downgrade to free only if no other active sub.

---

## 9. Going live

1. Switch Dodo dashboard to **Live mode**.
2. Create the same 4 live products; copy live product IDs.
3. Create a **live** webhook pointing at your production API URL.
4. Update production env:

```env
DODO_PAYMENTS_ENV=live_mode
DODO_PAYMENTS_API_KEY=<live_key>
DODO_PAYMENTS_WEBHOOK_SECRET=<live_webhook_secret>
DODO_PRO_MONTHLY=<live_pdt>
DODO_PRO_YEARLY=<live_pdt>
DODO_ULT_MONTHLY=<live_pdt>
DODO_ULT_YEARLY=<live_pdt>
```

5. Remove `BILLING_GATEWAY_OVERRIDE` from production.
6. Run one real small test purchase from a non-IN location.

---

## 10. Useful links

- [Subscription integration guide](https://docs.dodopayments.com/developer-resources/subscription-integration-guide)
- [Checkout Sessions](https://docs.dodopayments.com/developer-resources/checkout-session)
- [Adaptive Currency](https://docs.dodopayments.com/features/adaptive-currency)
- [Webhooks](https://docs.dodopayments.com/developer-resources/webhooks)
- [Supported currencies](https://docs.dodopayments.com/features/adaptive-currency)

---

## Support

If a customer is charged but the plan does not unlock:

1. Check Dodo webhook logs for `subscription.active`.
2. Check MongoDB `subscriptions` for `paymentSource: 'dodo'` and status.
3. Manually onboard via Admin → Subscriptions → **Manually onboard** as a last resort.
4. Contact: `support.lldcanvas@gmail.com`
