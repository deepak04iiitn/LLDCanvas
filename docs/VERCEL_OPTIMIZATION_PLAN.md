# Vercel Usage Optimization Plan

Goal: lower **Function Invocations**, **Fluid Active CPU**, and **CDN Requests**.

## How the app is deployed (why numbers are high)

- `frontend/` is a Next.js app on Vercel.
- `backend/` is an Express app wrapped as **one Vercel serverless function** (`backend/api/index.ts`). Every API call, from any user, is one function invocation.
- Every API request first runs `connectDB()` + `ensureOneTimeInit()`, then Express middleware (helmet, morgan, rate limiter, JSON parser). `requireAuth` then does a MongoDB `User.findById` on every authenticated call.

Rule of thumb: **fewer API calls = fewer invocations = less CPU.** Most savings come from not calling the backend at all.

---

## What is wasting usage today (ranked by impact)

### 1. Analytics heartbeat every 30 seconds (BIGGEST)
File: `frontend/src/hooks/useAnalytics.ts`, mounted globally in `layout.tsx` through `AnalyticsProvider`.

- Every visitor, including anonymous ones and bots that run JS, sends `POST /analytics/heartbeat` every 30 s plus once per page change and once on tab hide.
- One person with a tab open for 1 hour = about 120 function invocations.
- It keeps firing in background tabs that nobody is looking at.
- Each heartbeat does 2 to 3 Mongo queries (`exists`, `findOneAndUpdate`, sometimes `updateOne`), which costs CPU.
- It also hits CORS: cross-origin POST with `Content-Type: application/json` triggers an `OPTIONS` preflight first, so **each heartbeat can count as 2 invocations**.

### 2. `proxy.ts` runs on every page request
File: `frontend/src/proxy.ts`.

- Its matcher covers every route except static files. So every page view and every prefetch runs this function, even when `MAINTENANCE_MODE` is off, which is almost always.
- This adds an invocation per navigation for no benefit.

### 3. Socket.io server on a serverless function
Files: `backend/api/index.ts` (`initSocketServer`), `frontend/src/lib/socket.ts`, `CollabContext.tsx`.

- Vercel functions cannot hold WebSocket connections. The client is set to `['websocket', 'polling']`, so it falls back to long polling.
- Long polling means a stream of repeated HTTP requests to the function for as long as a collab session is open. Each one is an invocation and it uses CPU and active time.
- Collab state also does not survive across function instances, so it is unreliable anyway.

### 4. Blog detail page is `cache: 'no-store'`
File: `frontend/src/app/blog/[slug]/page.tsx`.

- `getBlog()` is called in `generateMetadata` **and** in the page body, with no-store. That is 2 backend invocations per blog view, and the page can never be cached on the CDN. It also lets bots drive up the view counter and the invocations.

### 5. Public SEO pages depend on the function at request time
Files: `frontend/src/lib/public-api.ts` (`revalidate: 3600`), `features/interview-questions`, `features/revision-notes`, `sitemap.ts`.

- These are mostly fine (hourly revalidate), but `sitemap.ts` calls `/blog?limit=500` with no cache setting, and any page that is not pre-generated revalidates by calling the backend function.
- Data that almost never changes (problems, revision notes, patterns) still makes backend calls on the server.

### 6. Duplicate and chatty API calls from the client
- `AuthProvider` calls `/auth/me` on every full page load for signed-in users, and `usePlan` calls `/billing/plan`. Together that is 2+ invocations (each with a user DB lookup) before any real page data is loaded.
- The dashboard pages each fire their own list calls (diagrams, stats, learn, problems) on every visit with no client cache. Going back and forth between tabs re-fetches everything.
- Pages like `dashboard/learn/debugger/*` and `MiniExerciseGate` use raw `fetch` in `useEffect`, so there is no dedupe.

### 7. Editor writes too often
- `useAutosave`: saves after 3 s idle, then 8 s later makes a **second** `PUT` just to upload a thumbnail (a large base64 body each time, up to the 10 MB JSON limit). That doubles saves and burns CPU parsing big bodies.
- `useReplayRecorder`: flushes every 1.5 s while editing and has a periodic flush, so a continuous editor session produces a steady stream of `POST /artifacts/:id/replay/events`.

### 8. Static assets hit the CDN more than needed
- `LLDCanvas.png` is 810 KB and is used as the OG/Twitter image and likely on the landing page. Large files do not raise the *request count* but they raise bandwidth, and they get re-requested when cache headers are weak.
- Public assets in `frontend/public` get default cache headers (`max-age=0, must-revalidate`), so browsers revalidate them often. Each revalidation is a **CDN request**.
- Raw `<img>` is used across the app (no `next/image`). That is okay for cost (no image optimization usage), but it means no resizing.
- Three Google fonts (Geist, Geist Mono, Fraunces with 3 variable axes) add several font requests on every cold visit.
- No `Cache-Control` headers are set on any backend response.

### 9. Smaller backend CPU wastes
- `morgan('combined')` logs every request (cheap, but it is on for every call).
- `helmet`, rate limiter, and `express.json({ limit: '10mb' })` run on every request, including `/health`-like trivial ones.
- `ensureOneTimeInit` starts two `setInterval` jobs (hourly subscription expiry, spaced repetition). On serverless these only run while an instance is warm, so they are unreliable, and they keep the instance doing work each time it cold starts (`run()` fires immediately on start, scanning the whole subscription and journey collections).
- The spaced-repetition job loops over **all** active profiles with per-profile queries (N+1), which is heavy CPU on each cold start.

---

## The Plan (simple steps, in order of payoff)

### Phase 1: Quick wins (about 1 hour, saves the most)

1. **Make analytics cheap.** In `useAnalytics.ts`:
   - Change the heartbeat interval from 30 s to **120 s** (or drop the timer entirely and only send on page change + tab hide).
   - Skip the timer when `document.visibilityState === 'hidden'`.
   - Skip heartbeats for the admin and for sessions idle more than a few minutes.
   - Use `navigator.sendBeacon` with `text/plain` or a `Blob` so there is **no CORS preflight** (halves invocations).
   - Backend: remove the separate `exists()` query unless the session is brand new; combine the page-push into the single update using `$addToSet`/`$push` with a pipeline.
   - Optional: swap to a free hosted analytics tool (Vercel Web Analytics, Plausible, etc.) and delete the custom heartbeat.

2. **Turn off the proxy when not needed.** `proxy.ts`:
   - Best: delete `proxy.ts` and flip maintenance with a redirect rule in `next.config.ts` (`redirects()` with an env check) or Vercel's maintenance/firewall settings. Redirects in config are handled at the edge without a function.
   - Otherwise narrow the matcher so it does not match normal pages.

3. **Cache the blog page.** In `blog/[slug]/page.tsx`:
   - Use `next: { revalidate: 300 }` for content.
   - Move the view-count increment to one small client-side call (or `sendBeacon`) that fires once per session per blog, and add `React.cache()` so `generateMetadata` and the page share one fetch.
   - Add `generateStaticParams` for existing blogs so they are pre-rendered and served from the CDN.

4. **Add long cache headers to static files.** In `next.config.ts`, add `headers()` for `/:path*.(png|jpg|svg|ico|webp|woff2)` with `Cache-Control: public, max-age=31536000, immutable`. Rename a file when it changes. This cuts repeat CDN requests.

### Phase 2: Remove the collab polling problem (about half a day)

5. Choose one:
   - **Best:** move the Socket.io server (`backend/src/socket`) to a small always-on host (Railway, Render, Fly) and point `NEXT_PUBLIC_SOCKET_URL` at it. Remove `initSocketServer` and the two `setInterval` jobs from `backend/api/index.ts`.
   - **Cheaper:** use a managed realtime service (Ably, Pusher, Liveblocks) that is free at low volume.
   - **Minimum:** set the client to `transports: ['websocket']` only and connect only when the user actually opens a collab session (already lazy), so it fails fast instead of polling. Collab then breaks until option 1 or 2 is done, so only use this as a stopgap.

6. **Move cron-style jobs to Vercel Cron.** Create `/api/cron/expire-subscriptions` and `/api/cron/spaced-repetition` and schedule them once per day in `vercel.json` (`crons`). Remove `startSubscriptionExpiryJob()` and `startSpacedRepetitionJob()` from boot so cold starts do no extra work. Rewrite the spaced-repetition loop with bulk queries (no per-user loop).

### Phase 3: Fewer calls from the app (1 to 2 days)

7. **Use a client cache** such as TanStack Query or SWR (`staleTime` 2 to 5 minutes, no refetch on window focus) for: diagrams list, stats, plan, problems list, learn lists. Revisiting a tab then costs 0 invocations.

8. **Merge `/auth/me` and `/billing/plan`** into one response (return `plan` inside `/auth/me`), and cache it in `localStorage` for the session so most page loads do only one call.

9. **Save less in the editor.**
   - Autosave delay 3 s to 8 s; also save on tab hide/close.
   - Send the thumbnail only on explicit exit / every few minutes, not after every save, and compress it (smaller size).
   - Replay events: flush every 10 to 15 s or 100 events, not 1.5 s.

10. **Add a short token-lookup cache in `requireAuth`** (in-memory, 30 to 60 s, keyed by user id) so each request does not hit Mongo for the user. This lowers CPU and DB time on every authenticated call.

### Phase 4: Serve public content without the backend

11. **Make public pages fully static.** For revision notes, problems, patterns, and blog list: pre-render at build with `generateStaticParams` and a long `revalidate` (1 day), or use on-demand revalidation (`revalidateTag`) triggered when admin edits content. Visitors and bots then hit the CDN cache and **0 functions**.

12. **Cache the public API at the CDN.** In `backend/src/controllers/public.controller.ts` and blog list routes, send `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. Repeated calls are then served from Vercel's edge, not the function.

13. **Cache the sitemap and `robots`** with `export const revalidate = 86400` and a fetch `revalidate`.

### Phase 5: Cleanup and housekeeping

14. Shrink images: convert `LLDCanvas.png` (810 KB) to a 1200x630 WebP/JPG under 150 KB for OG; use `next/image` or pre-sized files for landing page images. Reuse one logo file instead of five.
15. Fonts: drop unused weights/axes of Fraunces (remove `WONK`, `SOFT`), and only load Geist Mono on pages that need it.
16. Lazy-load heavy libraries (`recharts`, `@xyflow/react`, `firebase`, CodeMirror, `html-to-image`) with `next/dynamic` so first loads request fewer/lighter chunks.
17. Backend: in production, use `morgan('tiny')` or disable it; skip the rate limiter and logging on `/health`; lower the JSON limit from 10 MB to what is really needed (thumbnails separated).
18. Bots: add `Disallow` for `/dashboard`, `/editor`, `/admin`, `/collab`, `/settings` in `robots.ts`, and enable Vercel's Bot Protection / rate limit rules on `/analytics/*` to stop scrapers burning invocations.
19. Add `Cache-Control` and `minimumCacheTTL`-style defaults for any `next/image` use, and set `prefetch={false}` on `<Link>` items in large lists (dashboard sidebars, feature grids, blog lists). Link prefetch fires many CDN/function requests per page view.

---

## Expected impact

| Change | Function invocations | Active CPU | CDN requests |
|---|---|---|---|
| Analytics: 30 s to 120 s, no preflight | Very high drop (about 75 to 85% of idle-tab traffic) | High drop | Small |
| Remove proxy on normal pages | High drop (1 per page view) | Medium | Small |
| Move Socket.io off Vercel | High drop for collab users | High drop | None |
| Cache blog and public pages | Medium to high drop | Medium | Small rise on CDN but cheaper |
| Cron instead of boot-time jobs | Medium | Medium to high (cold starts) | None |
| Client cache (SWR/Query) + merge `/auth/me` | Medium | Medium | Small |
| Fewer editor saves | Medium | Medium to high (big bodies) | None |
| Long cache headers + smaller images + `prefetch={false}` | None | None | High drop |

## How to measure

1. Before starting, note the last 7 days of the three metrics in Vercel, **Usage** tab.
2. In Vercel **Observability / Logs**, group requests by path and sort by count. Expect `/analytics/heartbeat` at the top today. Re-check after each phase.
3. Re-check after 3 days of each deployment; compare against the baseline.

## Order to do it

Phase 1 steps 1, 2, 3, 4 first (they are small and safe), then step 6 and step 5, then Phase 4 and 3, then Phase 5.
