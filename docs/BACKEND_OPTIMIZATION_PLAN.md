# Backend Optimization Plan (MongoDB Atlas + Vercel)

Goal: use fewer database queries, fewer connections, and fewer/lighter Vercel function runs, without changing what the app does or what the API returns.

**How this was checked:** I read the real code on the busiest paths: `api/index.ts`, `config/db.ts`, `middleware/auth.ts`, the socket server, the jobs, and the diagrams, problems, stats, quiz, journey, learn, studio, analytics and admin controllers, plus the models' indexes. The backend is about 11,700 lines, and I did not read every line. Anything marked *check first* needs a quick look before changing.

**Already done earlier (not repeated below):** analytics heartbeat timer removed, blog view counter moved off the cached GET, `requireAuth` 15s user cache, `/auth/me` returns the plan, Mongo pool lowered to 3.

**Plain-English map of the problem:** Vercel runs your whole Express app as a function. Every cold start boots everything again (connect, indexes, jobs, socket server). Every request then does several small DB reads. M0 Atlas is tiny (500 connections, 512 MB storage), so wasted connections and ever-growing collections hurt first.

---

## Priority table

| # | Problem | Atlas saving | Vercel saving | Effort |
|---|---|---|---|---|
| 1 | Index checks run on every cold start | High | Medium | Tiny |
| 2 | Background jobs run on every cold start | High | High | Small |
| 3 | Socket.io inside the serverless function | High (connections) | High | Medium |
| 4 | Dashboard diagram list sends every thumbnail image | Medium | High (bandwidth) | Small |
| 5 | Autosave rewrites the whole diagram and adds a version row each time | High (writes + storage) | Medium | Small |
| 6 | Same catalogue lists re-read from DB on every request | High (reads) | Medium | Small |
| 7 | Plannr (journey) loads full lesson content just to draw lists | High | High (bandwidth) | Small-Medium |
| 8 | Problems list runs 3 queries and over-fetches | Medium | Low | Small |
| 9 | Quiz does one query per question | Medium | Low | Tiny |
| 10 | Advanced stats runs 24 queries in a row | Medium | Medium | Small |
| 11 | Analytics collection grows forever; admin page polls heavy queries | High (storage) | Medium | Small |
| 12 | Other collections grow forever (versions, replay, code logs) | High (storage) | None | Small |
| 13 | Opening one diagram does up to 5 queries in a row | Medium | Low | Small |
| 14 | Unbounded `find()` calls (detective history, etc.) | Low-Medium | Low | Tiny |
| 15 | Deploy bundle includes huge seed-data files | None | Medium (cold start) | Tiny |
| 16 | Small stuff (logging, missing compound indexes) | Low | Low | Tiny |

Do items 1, 2, 15, 9 first (tiny effort, solid savings), then 5, 4, 6, 11, 12, then the rest.

---

## 1. Index checks run on every cold start

**Where:** `config/db.ts` plus all models (`models/**`, about 60+ `.index()` calls and many `index: true` fields). `autoIndex` is never turned off.

**Problem (simple):** By default, Mongoose asks MongoDB to "make sure this index exists" for every model when it connects. On Vercel, every cold start does this again, for every collection. That is dozens of extra commands each time, and they can briefly block queries.

**Fix:**
- In `connectDB()` add `autoIndex: false` when `NODE_ENV === 'production'`.
- Keep a one-off script (`npm run sync-indexes`) that calls `Model.syncIndexes()` for all models. Run it once now, and again whenever you add an index.

**Impact:** Fewer commands on each cold start, faster first request, fewer connection spikes.
**Risk:** If you forget to run the script after adding an index, the new index won't exist. Run it once before deploying this.

---

## 2. Background jobs run on every cold start

**Where:** `api/index.ts` → `ensureOneTimeInit()`, `jobs/expire-subscriptions.ts`, `jobs/spaced-repetition.ts`, `config/admin.ts`.

**Problem (simple):** Each cold start does the following:
- `ensureAdminUser()` writes to the DB.
- `startSubscriptionExpiryJob()` runs a full sweep immediately and then every hour with `setInterval`.
- `startSpacedRepetitionJob()` scans **every active user profile**, and for each one runs `JourneyTopic.find(...)` (loading full topic documents) and several updates. That is a query pile that grows with your user count.
- `setInterval` on Vercel is unreliable (the function freezes when idle) and it keeps work running inside user-facing instances.

**Fix:**
- Delete the two `setInterval` jobs from boot.
- Make two small endpoints, `/cron/expire-subscriptions` and `/cron/spaced-repetition`, protected by `CRON_SECRET`, and schedule them in `vercel.json` (`crons`, once per day is enough; subscriptions can be hourly if you want).
- Rewrite the spaced-repetition job to load all published topics **once** (with only `slug title buildsSkills`), then process profiles in batches and use `bulkWrite` instead of one update per item.
- Expire subscriptions with one `updateMany` for the users and one for the subscriptions instead of `find` + `save` + `findByIdAndUpdate` per row in a loop.
- Run `ensureAdminUser()` from a seed script or only when `ADMIN_EMAIL` user isn't already flagged (one `findOne`, only update if needed), not as a write on every boot.

**Impact:** Removes the heaviest unpredictable load from cold starts. Scales with users instead of exploding.
**Risk:** Low. Vercel Cron needs the Pro plan for per-minute/hourly schedules; daily works on Hobby.

---

## 3. Socket.io inside the serverless function

**Where:** `api/index.ts` (`initSocketServer`), `socket/index.ts`, `socket/collab.handler.ts`.

**Problem (simple):**
- Vercel functions can't keep WebSocket connections open. Collab falls back to HTTP long-polling: constant short requests, each one a function invocation, each one possibly a new instance with its own DB pool. This is probably the biggest cause of the connection alert.
- The "who is in which room" list lives in memory (`const rooms = new Map()`), so users who land on different instances don't see each other. It is both costly and unreliable.
- Each socket connection runs `User.findById` (no cache), and `room:join` runs up to 4 queries (`Diagram`, `CollabInvite`, `User`, `CollabInvite.countDocuments`) plus `Comment.find`.

**Fix (pick one):**
1. **Best:** run the Socket.io server as its own small always-on service (Railway, Render, Fly). One long-lived process = one DB pool, zero polling invocations. Remove `initSocketServer` from the Vercel app.
2. Use a managed realtime service (Ably, Pusher, Liveblocks).
3. Stopgap: client `transports: ['websocket']` only, so it fails fast instead of polling (collab won't work until 1 or 2).

Also, in the socket server (wherever it runs): reuse the 15s auth cache for the user lookup, and load the owner's plan in the same query as the diagram (`populate` or a single aggregate) instead of 3 sequential queries.

**Impact:** Biggest single drop in invocations and connections.
**Risk:** Medium (infra change), but the handlers themselves don't need rewriting.

---

## 4. Diagram list sends every thumbnail

**Where:** `controllers/diagrams.controller.ts` → `list`; `controllers/collab.controller.ts` (dashboard collaborations list also returns thumbnails, *check first*); frontend dashboard.

**Problem (simple):** `GET /diagrams` returns all of the user's diagrams, each with its `thumbnail` (a base64 image string, can be 50–300 KB). One dashboard visit with 30 diagrams can send several MB, and it is not paginated. Thumbnails are also stored inside the diagram document, so every full read of a diagram drags the thumbnail along.

**Fix:**
- Add `GET /diagrams/:id/thumbnail` that returns the image with `Cache-Control: private, max-age=86400` (use `updatedAt` as a version in the URL). The list returns only `thumbnailUrl`. (Keep returning `thumbnail` too until the frontend is switched, so nothing breaks.)
- Shrink the thumbnail when it is generated: about 400 px wide JPEG/WebP, not full-size PNG.
- Add `limit`/`skip` (default 24) to the list.

**Impact:** Large bandwidth and function execution-time drop on the most visited page.
**Risk:** Low if the old `thumbnail` field is kept during the transition.

---

## 5. Autosave rewrites the whole diagram and logs a version every save

**Where:** `controllers/diagrams.controller.ts` → `save`.

**Problem (simple):**
- It loads the full diagram document (including `diagramData`), changes it, and saves the whole thing back. One read plus one big write per autosave.
- Every save also inserts a `DiagramVersion` row ("fire and forget"). That adds a write per save, the collection grows forever, and on Vercel a fire-and-forget promise can be cut off when the response ends.
- Extra lookups for non-owners (invite, share).

**Fix:**
- For the owner, check ownership with `findById(id).select('userId').lean()`, then `updateOne({ _id }, { $set: { diagramData, thumbnail } })`. It avoids loading and re-serializing the big document.
- Only create a `DiagramVersion` if the last one is older than about 5 minutes (keep `lastVersionAt` on the diagram, or compare in one query), and `await` it so it is not lost.
- Cap versions per diagram (keep latest ~50, see item 12).

**Impact:** About half the autosave DB cost and a large drop in version-row growth.
**Risk:** Low. Version history gets coarser (one entry per few minutes instead of per save). Confirm that's acceptable.

---

## 6. Same catalogue lists re-read on every request

**Where:** `controllers/learn/detective.controller.ts` (`listDetective`), `learn/debugger.controller.ts` (`listChallenges`, `listDesignBugs`), `learn/roguelike.controller.ts` (`listScenarios`), `services/studio/challenge-session.service.ts` (`listPublishedPacks`, used by `/studio/packs`), `blog.controller.ts` (`list`, `categories`, `tags`), `testimonial.controller`, `pattern.controller`, `problems.controller.ts` (`list`'s problem query), journey topic/tip/experience lists.

**Problem (simple):** Content like "all published detective scenarios" changes when an admin edits it, not per user. Yet every request, from every user, re-reads it from Mongo. Then only the "locked" flag differs per user.

**Fix:**
- Add a tiny in-memory cache helper: `cached(key, ttlMs, loader)`, one entry per key, 5-minute TTL, and clear the key from the admin create/update/publish/delete handlers. Load the raw list from the cache, then apply `withChallengeLocks(feature, plan, list)` per request (cheap, in memory).
- For lists that are not personal (blog list, categories, tags, testimonials, public routes), also send `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`, so Vercel's CDN serves them without running the function at all.
- Detective list: stop sending `diagramSnapshot` and `codeSnippet` in the list response if the list UI doesn't use them (*check first*); load them in the single-scenario call.

**Impact:** Most catalogue reads go to zero DB queries. Frontend + CDN caching already added now removes repeat calls from the same user; this removes them across users.
**Risk:** Low. Worst case an admin edit takes up to 5 minutes to show on a warm instance unless the key is cleared (it should be).

---

## 7. Plannr (journey) loads full lesson content just to draw lists

**Where:** `controllers/journey/journey.controller.ts` → `getRoadmap`, `getPlan`, `getRevisePack`, `listPracticeHub`, `completeTopic` (`JourneyTopic.find(...)`), `computeProgress`, `getDailyPractice` / `computeRecommendation`.

**Problem (simple):** `JourneyTopic` documents contain `modules` (lesson blocks) and `practiceSet`, which are big. These endpoints do `JourneyTopic.find({ status: 'published' })` with no `select` and no `lean`, so Mongo sends every full lesson and Mongoose builds full document objects. `getRoadmap` then returns `...topic.toObject()`, which sends all the lesson content to the browser just to draw the roadmap. `computeProgress` also counts topics again on each call.

**Fix:**
- `getRoadmap`, `getPlan`, `getRevisePack`: use `.select('-modules -practiceSet -<other big fields>').lean()`. *Check first:* make sure the frontend roadmap/plan screens don't read those fields (they should load them from `getTopic`).
- `listPracticeHub` genuinely needs `practiceSet`, so select only `slug title stage practiceSet` and use `.lean()`.
- Put the published topic list (light fields) in the item 6 in-memory cache, since it changes only when an admin publishes. Then `computeProgress`'s count becomes `cache.length`.
- `getDashboard` already runs in parallel; reuse the cached topic list so it doesn't query again.
- Add a compound index `{ status: 1, stage: 1, order: 1 }` on `JourneyTopic` for the sort.

**Impact:** Large drop in Mongo data transferred and function memory/time on the whole Plannr feature, which is one of the largest parts of the app.
**Risk:** Low-medium: needs the field check above to keep the response shape the frontend relies on.

---

## 8. Problems list: three queries, over-fetching

**Where:** `controllers/problems.controller.ts` → `list`, `getOne`.

**Problem (simple):** Every list call runs: (a) all active problems, (b) a `UserSolution.aggregate` that counts submissions across **all users** for those problems, (c) `UserSolution.find({ problemId in all, userId }).lean()` that returns the user's full solution documents when only `problemId` and `status` are used. Also `category`/`title` use unindexed `$regex` searches.

**Fix:**
- (c): add `.select('problemId status')`.
- (b): cache submission counts for 5 minutes (item 6 helper), or keep a `submissionCount` counter on `Problem` that is incremented when a solution is submitted.
- (a): cache the problem list (without per-user fields) as in item 6, filter/sort in memory for `q`, `difficulty`, `category` (there are only about 110 problems).

**Impact:** The list page drops from 3 DB operations to 1 small one. The count aggregate no longer scans all users' solutions each time.
**Risk:** Low. Counts may be up to 5 minutes behind.

---

## 9. Quiz: one query per question

**Where:** `controllers/learn/quiz.controller.ts`: `getTodayQuiz` (loop with `QuizQuestion.findById`), `submitQuiz` (two separate loops, each doing `findById` per answer, so each submit queries every question twice), the review branch around line 238.

**Problem (simple):** For N questions it makes N queries, sometimes 2N (once to grade, once more to add the explanation to the response).

**Fix:** Do one query: `QuizQuestion.find({ _id: { $in: ids } }).lean()`, put the results in a `Map`, and use it for both grading and the response. Do the same in the other two loops.

**Impact:** A submit goes from about 10–20 queries to 1.
**Risk:** None, same output.

---

## 10. Advanced stats: 24 queries one after another

**Where:** `controllers/stats.controller.ts` → `getAdvancedStats`.

**Problem (simple):** For Ultimate users it loops 12 weeks and 12 months, and each pass does `await UserSolution.countDocuments(...)`. That is 24 queries in a row for one page load. `PracticeStats.dailyActivity` is also an array inside one document that grows forever.

**Fix:**
- Replace the loops with one query: `UserSolution.find({ userId, createdAt: { $gte: 12-months-ago } }).select('createdAt').lean()` and bucket by week/month in JS. (Or one `$group` aggregate.)
- Cap `dailyActivity` with `$push` + `$slice: -400`.
- Cache the result per user for 5 minutes (item 6 helper).

**Impact:** 24 queries become 1. Keeps `PracticeStats` documents from growing without limit.
**Risk:** None for output.

---

## 11. Analytics collection grows forever; admin dashboard polls heavy queries

**Where:** `models/analytics-session.model.ts`, `controllers/analytics.controller.ts` (`heartbeat`, `getLiveMetrics`), `frontend/src/app/admin/page.tsx` (30s poll).

**Problem (simple):**
- Every visit creates an `AnalyticsSession` document and nothing ever deletes it. On M0 (512 MB) this will eventually fill the disk.
- `pages` is an array that grows with each page visited, and has no cap.
- `heartbeat` runs an `exists()` query every time even though it only matters for the first call of a session.
- When the admin page is open, it calls `getLiveMetrics` every 30 s. That is 8 queries: 3 `distinct` calls over a month of data, and aggregates with `$unwind` over all pages.

**Fix:**
- Add a TTL index: `schema.index({ startedAt: 1 }, { expireAfterSeconds: 60*60*24*90 })` (90 days; pick what you need).
- Cap pages: `$push: { pages: { $each: [page], $slice: -50 } }`.
- Run the `isReturning` lookup only when the session is new (`$setOnInsert` path), or compute it lazily.
- Cache `getLiveMetrics` for 60 s in memory and poll from the admin page every 2–5 minutes. Replace the three `distinct` calls with one aggregate (`$group` by day/week/month sets) or `$count` on `$addToSet`.

**Impact:** Stops unbounded storage growth, and cuts the admin polling cost by 80–90%.
**Risk:** Low. Old sessions older than the TTL disappear (they are only used for charts).

---

## 12. Other collections that grow forever

**Where:** `models/diagram-version.model.ts`, `models/artifact/replay-event.model.ts`, `models/code-execution-log.model.ts`, `models/learn/diagram-score-record.model.ts`, `models/interview-session.model.ts`, `models/journey/journey-activity.model.ts`.

**Problem (simple):** None of these have a TTL or cap. Replay events can be hundreds of rows per editing session, versions are one per save, and code logs store up to 8 KB of source each. On a 512 MB cluster these will become the storage problem.

**Fix (decide retention for each):**
- `ReplayEvent`: TTL 60–90 days (or delete when a diagram is deleted, *check that account/diagram delete does this*).
- `DiagramVersion`: keep the latest 50 per diagram (delete older ones in the same call that creates a new one) and/or TTL 90 days.
- `CodeExecutionLog`: TTL 30–60 days; the daily-limit check only needs today's rows.
- Make sure `account.controller` delete and diagram delete also remove child rows (versions, replay events, comments, shares, invites).

**Impact:** Predictable storage, smaller indexes, faster queries.
**Risk:** Low, but it is a product decision. Confirm retention periods before applying.

---

## 13. Opening one diagram does up to 5 queries in a row

**Where:** `controllers/diagrams.controller.ts` → `getOne`.

**Problem (simple):** It loads the diagram, then `UserSolution.findOne`, then possibly `InterviewSession.findOne`, then `Problem.findById`, then for non-owners `UserSolution.exists`, `CollabInvite.findOne`, `DiagramShare.findOne`. All are sequential and run on every editor open.

**Fix:**
- Run the independent lookups with `Promise.all`.
- Better: store `problemSlug` on the `Diagram` when it's created from a problem/interview, so reading it costs nothing.
- Only run the problem-slug lookups for the owner path or after access has been verified.

**Impact:** Faster editor open, fewer DB round trips.
**Risk:** Low.

---

## 14. Unbounded `find()` calls

**Where:** `controllers/learn/detective.controller.ts` (history: `DetectiveAttempt.find({ userId }).populate(...)` with no limit), `learn/debugger.controller.ts` (solve history), `collab.controller.ts` lists, `interview.controller.ts` (`listSessions` is paginated, good), `controllers/problem-posts.controller.ts` (*check first*).

**Problem (simple):** A heavy user's history grows with time, and `populate` adds one more query on top.

**Fix:** Add `.limit()` (e.g. 200) or pagination, use `.select()` for only the fields the UI reads, and replace `populate` with a single `$lookup` aggregate if needed.

**Impact:** Keeps response size and query time flat as data grows.
**Risk:** Low. Choose limits that don't change what the UI shows today.

---

## 15. Deploy bundle includes huge seed-data files

**Where:** `backend/vercel.json` → `"includeFiles": "src/**"`; `backend/src/scripts/data/**` (dozens of large `.ts` and `.json` files such as `evolution-packs-dump.json`, `studio-debugger-packs.json`).

**Problem (simple):** Everything under `src/` is packaged into the function, including the one-off seed scripts and their big data files. A bigger bundle means slower cold starts and more memory to load. The app never runs those at request time.

**Fix:** Change to `"includeFiles": "src/**"` plus `"excludeFiles": "src/scripts/**"` (or just include what's needed, e.g. `src/data/**`). Also keep `dist/` and the stray `Main$Circle.class` out of the repo/deploy.

**Impact:** Smaller function, faster cold starts (which are also the moments when item 1 and 2 work happens).
**Risk:** Check that nothing in the request path imports from `src/scripts/` (the seed scripts should be run locally only).

---

## 16. Small stuff

- **Logging:** `morgan('combined')` writes a log line per request and the lines are long. Use `morgan('tiny')`, or skip it in production and rely on Vercel's own request logs.
- **Rate limiters:** `express-rate-limit` uses in-memory storage, which resets per instance on Vercel, so it protects less than it looks. If abuse matters, move limits to Vercel Firewall / WAF rules (no function run needed).
- **JSON limit:** `express.json({ limit: '10mb' })` applies to every route. Keep 10 MB only for `PUT /diagrams/:id` and use about 100 KB elsewhere.
- **Compound indexes to add (check in Atlas Performance Advisor first):**
  - `JourneyTopic`: `{ status: 1, stage: 1, order: 1 }`
  - `DetectiveAttempt`: `{ userId: 1, timestamp: -1 }`
  - `ChallengeAttempt`: `{ userId: 1, status: 1, updatedAt: -1 }` (if you list by these)
  - `CollabInvite`: `{ diagramId: 1, email: 1, status: 1 }` (used in socket `resolveRole`)
- **Check the Atlas Performance Advisor** (Atlas → cluster → Performance Advisor) for the slowest queries and suggested indexes. It shows real data, which beats guessing.

---

## Suggested rollout

1. **Day 1 (tiny, safe):** items 1, 9, 15, 16 (logging, JSON limit), TTL on analytics (11).
2. **Day 2:** item 2 (move jobs to Cron), item 5 (autosave), item 8 and item 10 query fixes.
3. **Day 3:** item 6 caching helper + apply it to catalogue lists; item 7 (Plannr select/lean + cache); item 4 (thumbnails).
4. **Then:** item 3 (move Socket.io out), item 12 retention, items 13 and 14.

## How to confirm it worked

- Atlas → Metrics: **Connections**, **Operations (commands/sec)**, **Network**, **Storage size**. Compare before/after each day.
- Vercel → Usage: **Function Invocations**, **Active CPU**, **Fast Data Transfer**.
- Atlas → Performance Advisor / Query Profiler: slow queries should drop.

## Things deliberately not changed

- No API response shapes are removed. Anywhere a field is dropped from a list (thumbnail, detective snapshot, topic modules) is marked *check first* and should be done only after the frontend is confirmed not to read it, or by keeping the old field during a transition.
