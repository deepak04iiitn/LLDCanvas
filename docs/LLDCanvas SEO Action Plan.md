# LLDCanvas SEO Action Plan
**Based on:** Google Search Console export `lldcanvas.in-Performance-on-Search-2026-08-11.xlsx`
**Data window:** 2026-07-25 → 2026-08-11 (17 days, matches "10–15 day old site")
**Analyzed:** 106 unique queries, 130 unique page rows (includes www/non-www duplicates — see §8)

---

## 1. Current SEO Performance

| Metric | Value |
|---|---|
| Total impressions | **168** |
| Total clicks | **3** |
| Average CTR | **1.79%** |
| Impression-weighted average position | **35.3** (simple average: 36.2) |
| Unique queries | **106** |
| Queries generating ≥1 click | **3** (system design practice, task management system lld, design patterns in coding) |
| Queries with impressions but 0 clicks | **103** (97% of all queries) |

**Verdict: This is a genuinely promising signal for a 17-day-old site, not a discouraging one — but the current CTR/click numbers are not yet meaningful in isolation.**

- Google is already crawling, indexing, and *ranking* the site for 106 distinct long-tail queries within ~2.5 weeks. For a brand-new domain with no backlink history, that breadth of query coverage means the on-page content and internal structure are already topically relevant to "LLD/system design interview" search intent — that's the hard part done.
- The average position (~35) is expected at this stage — new domains sit deep in results 1–3 months (the "Google sandbox" effect) before authority signals catch up.
- 3 clicks off 168 impressions is not a CTR problem yet — it's a **position problem**. 103 of 106 queries are ranking beyond position ~20 (page 2+), where CTR is structurally near-zero regardless of title/meta quality. Only 5 queries currently sit at position ≤10, and only 11 sit in the 8–20 "quick win" band.
- **What's genuinely encouraging:** several queries are already very close to page 1 (position 6.5–20) with zero backlink support — `lld-interview-roadmap` at position 18.5 (20 impressions), `interview-questions` hub concepts scoring positions 8–14 on pages like `task-management` (8.08) and `deck-of-cards` (7.9). That means the content itself is competitive; it just needs a push (internal links, freshness, title/meta refinement, a few external links) rather than a rebuild.

---

## 2. Quick-Win Keywords (Position 8–20)

All 11 queries currently in the 8–20 band — **every single one has 0 clicks**, meaning these are pure ranking-improvement plays, not CTR plays yet.

| Query | Impressions | Clicks | CTR | Position | Opportunity | Recommended Action |
|---|---|---|---|---|---|---|
| lld roadmap | 8 | 0 | 0% | 16.3 | **Highest** — highest impressions in this band, directly matches `/blog/lld-interview-roadmap` (already at 18.5 on the Pages report) | Rewrite title/H1 to exactly match intent, add a scannable step-by-step roadmap section, internal-link from homepage & interview-questions hub |
| inventory management lld | 4 | 0 | 0% | 18.3 | High — maps to existing `/features/interview-questions/inventory-management` page (also ranks separately at pos 27.8 on www and 13.7 on non-www — split signal, see §8) | Consolidate www/non-www duplicate, expand LLD write-up depth, add class diagram |
| notification service lld | 5 | 0 | 0% | 8.2 | High — very close to page 1, maps to existing `/features/interview-questions/notification-service` (18 impressions total) | Add more solution depth (classes, sequence diagram, code), get 1–2 internal links from roadmap/blog pages |
| lldmastery | 3 | 0 | 0% | 8.3 | Medium — branded/competitor-adjacent query, likely someone searching for a competing brand and landing near you | Don't optimize a page *for* this term — but check what page currently shows here; it's a sign of brand confusion, not a content gap |
| document editor lld | 2 | 0 | 0% | 11.5 | Medium — maps to `/features/interview-questions/collaborative-text-editor` (13 impressions) | Align title tag to say "Document Editor LLD" not just "Collaborative Text Editor," add Google Docs–style framing since "google docs hello interview" also appears in data |
| hld vs lld example | 2 | 0 | 0% | 12.0 | Medium — maps to `/blog/hld-vs-lld-explained` (82 impressions, but ranks at 33.8 for the broader term — this narrower "example" variant already ranks better) | Add a dedicated "HLD vs LLD Example" section with a worked example (e.g., URL shortener) inside the existing blog post |
| meeting room scheduler lld | 2 | 0 | 0% | 13.5 | Medium — maps to `/features/interview-questions/meeting-room-booking` | Add "scheduler" as a synonym in H1/intro copy, not just "booking" |
| payment gateway lld | 2 | 0 | 0% | 14.5 | Medium — maps to `/features/interview-questions/payment-gateway` (21 impressions, but position dragged down by www/non-www split — see §8) | Fix duplicate URL issue first; this single fix could merge signal and push position meaningfully |
| chess game lld | 1 | 0 | 0% | 10.0 | Medium — maps to `/features/interview-questions/chess-game` (18 impressions, 1 click already, pos 34.7 on the broader query) | Low competition term, page already converts on other queries — reinforce with more internal links |
| amazon locker lld | 1 | 0 | 0% | 15.0 | Medium — maps to `/features/interview-questions/amazon-locker` (39 impressions — the biggest zero-click page on the whole site) | This page has real traffic potential; see §4 for the title/meta rewrite |
| restaurant reservation system design interview | 1 | 0 | 0% | 16.0 | Lower — one-off phrasing, maps to `/features/interview-questions/restaurant-table-reservation` | Low priority; just ensure the phrase "system design interview" appears somewhere on-page |

**Priority order for the next 2–3 weeks (highest leverage first):**
1. `lld roadmap` (8 impr, pos 16.3)
2. `payment gateway lld` — fix duplicate URL, real impressions (21) hiding behind it
3. `notification service lld` (pos 8.2, closest to page 1)
4. `inventory management lld` — same duplicate-URL fix as #2
5. `amazon locker lld` / the broader `amazon locker system design` cluster (39 total impressions on that page)
6. `document editor lld`
7. `hld vs lld example`
8. `meeting room scheduler lld`
9. `chess game lld`
10. `restaurant reservation system design interview`

(Only 11 queries currently sit in this band — that is the full list, not a truncation.)

---

## 3. Page 1 Opportunities (Position 1–10)

Only **5 queries** currently rank on page 1 — small sample, but worth reviewing individually:

| Query | Position | Impr | Clicks | Assessment |
|---|---|---|---|---|
| system design practice | 4.0 | 1 | 1 | **Strong.** 100% CTR (1/1) — too small a sample to draw title/meta conclusions, but the ranking itself is a good early signal. No action needed yet beyond continuing to build out whatever page ranks here. |
| task management system lld | 6.5 | 2 | 1 | **Strong.** 50% CTR. Maps to `/features/interview-questions/task-management` (12 impressions overall, pos 8.08 on the aggregate Pages report). This page is already your best-performing feature page — study why (likely a strong, specific title) and replicate its pattern on other feature pages. |
| lldmastery | 8.33 | 3 | 0 | **Weak — 0% CTR on a page-1-adjacent term.** This looks like a branded/navigational query for a *different* product ("LLD Mastery"), not organic interest in your content. Do not build content around this term. |
| chess game lld | 10.0 | 1 | 0 | **Borderline, 0% CTR.** Single impression, too early to judge, but title should be checked against §4 recommendations. |
| notification service lld | 8.2 | 5 | 0 | **Weak — 0% CTR despite 5 impressions at position 8.** This is your clearest page-1-adjacent title/meta problem: enough impressions to expect at least 1 click, position good enough, zero clicks. See §4 for the exact title/meta rewrite. |

**Cross-cutting takeaways for page 1:**
- Titles/meta descriptions should be reviewed for `notification-service` and `chess-game` — impressions exist, position is good, clicks are zero.
- No page here needs more content depth yet — the ranking already proves relevance. This tier is a **title/meta/CTR** problem, not a content-depth problem.
- Internal linking won't move these — they're already close to the top; the lever here is snippet appeal, not authority.

---

## 4. High-Impression / Low-CTR Opportunities

These are queries with meaningful impression volume (≥3) and 0% CTR, at positions where a title/meta fix has genuine upside (position roughly ≤20, or feeding a page with a much better blended position):

### `lld roadmap` — 8 impressions, position 16.3, 0 clicks
Likely page: `/blog/lld-interview-roadmap`
- **Current problem:** position ~16–18 puts this on page 2 already — mostly a ranking issue, but the snippet needs to earn the click once it crosses to page 1.
- **Suggested title:** `LLD Interview Roadmap 2026: Step-by-Step Plan to Crack Low-Level Design`
- **Suggested meta description:** `A structured, week-by-week roadmap to prepare for LLD interviews — OOP, SOLID, design patterns, and 15+ practice problems like Parking Lot and Splitwise. Start free on LLDCanvas.`

### `notification service lld` — 5 impressions, position 8.2, 0 clicks
Likely page: `/features/interview-questions/notification-service`
- **Current problem:** ranking is *good* (top 10) but the title likely reads generically — searchers see it, don't click.
- **Suggested title:** `Notification Service LLD: Low-Level Design with Class Diagram & Code`
- **Suggested meta description:** `Design a scalable Notification Service for your next LLD interview — full class diagram, design patterns used (Observer, Strategy), and working code walkthrough.`

### `inventory management lld` — 4 impressions, position 18.3, 0 clicks
Likely page: `/features/interview-questions/inventory-management`
- **Suggested title:** `Inventory Management System LLD: Low-Level Design Explained`
- **Suggested meta description:** `Step-by-step low-level design for an Inventory Management System — entities, class diagram, and the design patterns interviewers expect you to use.`

### `polling platform` — 5 impressions, position 46.6, 0 clicks
Likely page: `/features/interview-questions/online-polling-voting-platform`
- **Current problem:** position is too deep (46.6) for a title fix to matter yet — this is a *ranking* problem first (thin content or weak internal linking), not a CTR problem. Flagging here because impressions are surprisingly high for such a deep position — the query itself has demand.
- **Action:** grow the content (add real-time results handling, class diagram, a "voting vs polling" distinction) and add 2 internal links from the interview-questions hub before touching the title.

### `hld vs lld` / `lld vs hld` — 4+4 impressions combined, positions 41–44, 0 clicks
Likely page: `/blog/hld-vs-lld-explained` (82 total impressions, position 33.8 — your single biggest zero-click page)
- **Why no clicks despite 82 impressions:** position ~34 is deep page-3+ territory; no title fix will overcome that. This is the single highest-value ranking-improvement target on the site by impression volume.
- **Suggested title (for when position improves):** `HLD vs LLD: Key Differences Explained with Real Examples (2026)`
- **Suggested meta description:** `HLD vs LLD explained simply — what each covers, when interviewers ask which, and a side-by-side example so you never confuse the two again.`
- **Action:** this page needs the biggest content/internal-linking investment on the site (see §7).

### `top 10 lld interview questions` / `lld interview questions` — 3+3 impressions, positions 34.7/45.7
Likely page: `/blog/lld-interview-questions` (52 impressions total, position 22.8 blended — better than the specific long-tail variants)
- **Suggested title:** `Top 10 LLD Interview Questions (With Solutions) — 2026`
- **Suggested meta description:** `The 10 most-asked Low-Level Design interview questions — Parking Lot, Splitwise, Elevator, and more — each with a full solution and class diagram.`

---

## 5. Keyword Clusters

Computed directly from all 106 queries, grouped by topical intent:

| Cluster | Impressions | Clicks | Queries | Avg Position | Strongest Query | Biggest Opportunity |
|---|---|---|---|---|---|---|
| **HLD vs LLD** | 24 | 0 | 14 | 37.3 | `lld vs hld` (pos 41) | Consolidate into `/blog/hld-vs-lld-explained`; biggest cluster with zero clicks |
| **LLD Interview Questions** | 21 (incl. "low level design interview questions") | 0 | 11 | ~40 | `top 10 lld interview questions` | `/blog/lld-interview-questions` already at pos 22.8 blended — closest full cluster to page 1 |
| **Design Patterns** | 16 | 1 | 12 | 40.4 | `design patterns in software engineering` | `/blog/design-patterns-guide` (53 impr, pos 31.3) — needs depth + internal links from every problem page |
| **LLD Prep / Roadmap** | 15 | 0 | 4 | 20.6 | `lld roadmap` | Best-positioned cluster overall (avg pos 20.6) — highest-leverage quick win |
| **System Design Interview Prep** | 8 | 1 | 7 | 38.8 | `system design guidelines` | Low volume individually but reinforces topical authority |
| **Amazon Locker (problem)** | 7 (query-level) / 39 (page-level) | 0 | 4 | 40.6 | `amazon locker system design` | Page-level impressions (39) far exceed query-level (7) — strong latent demand, weak title match |
| **SOLID Principles** | 5 | 0 | 4 | 40.2 | `lsp principle` | `/features/revision-notes/solid-principles/solid-lsp` (13 impr) — LSP specifically has demand |
| **Parking Lot (problem)** | 5 | 0 | 5 | 41.2 | `amazon parking lot example design` | Page itself has 23 impressions (pos 38.7) — classic flagship LLD problem, underperforming for its fame |
| **Inventory Management (problem)** | 6 | 0 | 2 | 19.2 | `inventory management lld` | Second-best-positioned problem cluster |
| **Notification Service (problem)** | 5 | 0 | 1 | 8.2 | `notification service lld` | Best-positioned single problem query on the site |
| **Splitwise (problem)** | 3 | 0 | 2 | 40.7 | `design splitwise` | Iconic LLD problem, page exists, needs more content/links |
| **Payment Gateway / Meeting Room / Rate Limiter / Document Editor / Chess / File System / Tic-Tac-Toe / Snake & Ladder (problems)** | 2–4 each | 0 | 2–3 each | 20–41 | — | Long tail of individual problem pages, each already exists — see §6/§7 |
| **LLD Tools/Platforms** | 2 | 0 | 2 | 30.0 | `lld refactoring guru` | Signals users comparing LLDCanvas to reference/refactoring.guru-style resources |
| **System Design Concepts** | 2 | 0 | 1 | 46.0 | `cap theorem diagram` | Matches existing `/features/revision-notes/system-design-concepts/cap-theorem` |

**Note on methodology:** clusters are built from the 106-row Queries tab only (query text pattern-matched to intent). The CSV does not include a combined query×page crosstab, so "likely page" mappings above are inferred from URL/topic matching against the Pages tab, not from GSC's own attribution — flagged wherever used.

---

## 6. Content Gaps

Because LLDCanvas already has feature pages for nearly every problem appearing in the query data (Parking Lot, Splitwise, Amazon Locker, Chess, Notification Service, Payment Gateway, Rate Limiter, Inventory Management, Meeting Room Booking, Tic-Tac-Toe, Snake & Ladder, LRU Cache, File System, Vending Machine, Document Editor/Collaborative Text Editor, Auction System, Uber, URL Shortener, Movie/Ticket Booking, Logging Framework, and more), **the primary content gap is not "missing pages" — it's under-optimized existing pages.** Section 6 below reflects that reality: the "create immediately" list is short and deliberate.

### A. Create immediately
1. **Design Patterns Cheat Sheet** (genuinely missing — query: `design pattern cheat sheet`, 1 impression at pos 58, but zero equivalent page exists; `/blog/design-patterns-guide` is a long-form guide, not a scannable reference)
   - Slug: `/blog/design-patterns-cheat-sheet` (or `/features/revision-notes/design-patterns-cheat-sheet`)
   - Primary keyword: `design pattern cheat sheet`
   - Secondary: `design patterns quick reference`, `gof design patterns list`
   - Search intent: quick-reference / bookmark-and-return
   - Suggested H1: `Design Patterns Cheat Sheet (All 23 GoF Patterns, One Page)`
   - Suggested title tag: `Design Patterns Cheat Sheet — All 23 Patterns Explained Simply`
   - Suggested meta description: `A one-page cheat sheet for all 23 Gang of Four design patterns — category, intent, and a one-line example for each. Bookmark this for interviews.`
   - Outline: table of all patterns by category (Creational/Structural/Behavioral) → one-line intent + code snippet per pattern → link to each existing individual pattern revision-note page
   - Internal links from: `/blog/design-patterns-guide`, `/features/revision-notes` hub, every individual pattern page (`iterator-pattern`, `bridge-pattern`, etc.)

2. **HLD vs LLD Example page** (as a *section*, not a new URL — see §3/§4: the existing `/blog/hld-vs-lld-explained` should absorb the `hld vs lld example` query rather than spawning a competing page — see §8 cannibalization risk)

### B. Create later
- **"System Design Canvas" / product-positioning page** — the query `system design canvas` (1 impression) suggests some searchers are looking for LLDCanvas itself by descriptive name. Low volume now, but worth a dedicated `/what-is-lldcanvas` or enhanced homepage section once volume grows — not urgent at 1 impression.
- **BookMyShow-style ticket booking page** — `lld of bookmyshow` (1 impression) is already substantially covered by the existing `movie-ticket-booking` and `event-ticketing-platform` pages. Later: add "BookMyShow" as an explicit named example inside `movie-ticket-booking` rather than a new page.
- **Cap Theorem diagram enhancement** — add a visual diagram to the existing `/features/revision-notes/system-design-concepts/cap-theorem` page rather than a new page.

### C. Do NOT create
- **"lldmastery"** — this is very likely a competitor/alternative product name, not a content topic. Building a page to target it would be targeting someone else's brand, not a search intent LLDCanvas should own.
- **"cracking faang" / "cracking high-scale design interviews"** — too broad/generic, 1 impression each, high competition from established brands (Educative, ByteByByte, Exponent). Not a good use of effort at this stage.
- **"operating system abstraction in interviews"** — 1 impression, off-topic for an LLD-focused product (this is OS-concepts territory, not LLD).
- **Any one-off, 1-impression, highly specific problem query not already covered** (e.g., `design a search engine interview question`, `traffic light system`-adjacent long tail) — these should be satisfied by *existing* pages with better internal linking, not new thin pages. Mass-producing a page per 1-impression query would create the thin-content problem the brief explicitly warns against.

---

## 7. Existing Page Optimization

Ranked by impression volume, the following existing pages already receive real search visibility and should be **improved, not replaced**:

| Page | Impr | Pos | Clicks | Queries it's likely appearing for | Intent match? | Action |
|---|---|---|---|---|---|---|
| `/blog/hld-vs-lld-explained` | 82 | 33.8 | 0 | hld vs lld, lld vs hld, hld and lld example, difference between hld and lld | Yes — strong match | **Improve.** Biggest zero-click asset on the site. Add a labeled comparison table, a worked example section, and FAQ schema for "what is the difference between HLD and LLD." Internally link from homepage, roadmap, and every problem page's intro ("this is an LLD problem — see HLD vs LLD if you're new"). |
| `/blog/system-design-interview-guide` | 69 | 41.8 | 0 | system design interview, system design guidelines, design interview | Partial — very competitive generic term | **Improve, don't expect to win the head term.** Narrow the on-page focus toward "system design interview *for LLD roles*" to reduce competition from giant generic system-design sites, and cross-link heavily to problem pages. |
| `/blog/design-patterns-guide` | 53 | 31.3 | 1 | design patterns, design patterns in software engineering, different design patterns | Yes | **Improve.** Already converting once — add the cheat-sheet table (§6A) directly into this page as a subsection, and link out to each individual pattern revision-note page. |
| `/blog/lld-interview-questions` | 52 | 22.8 | 0 | lld interview questions, top 10 lld interview questions, lld questions | Yes — best-positioned high-impression page | **Improve — highest ROI content edit on the site.** Already close to page 1 blended. Add explicit "Top 10" numbered structure matching the exact query phrasing, and link to each problem page as the "solution" for each numbered question. |
| `/features/interview-questions` (hub) | 52 | 43.3 | 0 | lld interview questions, lld questions (broad) | Yes, as a hub | **Improve internal structure.** A hub page ranking at 43 for broad terms is normal, but it should aggressively link out to every problem page with descriptive anchor text (see §10) to pass authority down. |
| `/features/interview-questions/uber-full` | 40 | 31.1 | 0 | uber hld (1 impr query-level; page-level demand far higher) | Yes | **Improve.** Large gap between page-level impressions (40) and matched query-level impressions (~1) suggests it's ranking for many unlogged/rare query variants — add more explicit H2s for common sub-questions ("Uber LLD interview question," "design Uber backend"). |
| `/features/interview-questions/amazon-locker` | 39 | 31.5 | 0 | amazon locker system design, amazon locker lld, hello interview amazon locker, design amazon locker system | Yes | **Improve — second-highest ROI target.** 4 distinct query variants all point here. Standardize title to `Amazon Locker System LLD: Low-Level Design (Class Diagram + Code)` and add a section explicitly addressing "Hello Interview"-style framing since that phrase appears in your own data (competitor/reference site users are searching). |
| `/` (homepage) | 37 | 14.0 | 5 | system design practice, lld design tool, system design canvas | Yes | **Best-performing page on the site (5 clicks).** Keep monitoring; don't disturb what's working. Minor: ensure title includes both "LLD" and "practice"/"interview prep" since those are the terms bringing clicks. |
| `/features/interview-questions/parking-lot` | 23 | 38.7 | 0 | design a parking lot lld, parking lot lld, parking lot system design interview, parking lot lld question | Yes | **Improve — flagship problem underperforming.** Parking Lot is the single most iconic LLD interview question industry-wide; a page this important should not sit at position 38+. Needs the deepest content investment of any single problem page: full requirements gathering, class diagram, extensibility discussion (multi-floor, EV charging), and heavy internal linking from the interview-questions hub and roadmap. |
| `/features/interview-questions/payment-gateway` | 21+6 (split, see §8) | 26.2 / 20.8 | 1 | payment gateway lld, payment gateway system design interview | Yes | **Fix duplicate URL first (§8), then improve.** Combined signal (~27 impressions) is being split across two URLs. |
| `/blog/lld-interview-roadmap` | 20 | 18.5 | 0 | lld roadmap | Yes | **Improve — best-positioned page on the whole site.** See §4 for exact title/meta. |
| `/features/interview-questions/in-memory-file-system` | 20 | 31.0 | 0 | file system lld, design an in memory file system | Yes | **Improve.** Consolidate title around "in-memory file system," which is the more specific/matching phrase versus generic "file system." |

**General rule applied throughout:** every query in the dataset that maps to an existing page above is treated as an *optimize*, not a *create-new*, per the brief's explicit instruction.

---

## 8. Keyword Cannibalization

Two distinct cannibalization risks are visible in the data:

### A. True content cannibalization (same intent, competing pages)
- **`hld vs lld` topic:** `/blog/hld-vs-lld-explained` is the clear primary page (82 impressions). No second page currently competes for this — but §6A flags a risk: do **not** create a separate `/hld-vs-lld-example` page. Keep it as one section inside the existing post. **Decision: single primary page, expand in place.**
- **Payment Gateway / Inventory Management / Food Delivery / Airline Management / Netflix / Coupon System / Multiplayer Matchmaking / Loyalty Points / Restaurant Management / Restaurant POS / Ludo / Distributed Task Queue** — these aren't two *different* pages competing; see §8B below, it's the same page indexed twice under two URLs.

### B. Technical/URL-level cannibalization — www vs non-www duplicates (higher priority than A)
The Pages tab shows **13 URLs indexed under both `https://www.lldcanvas.in/...` and `https://lldcanvas.in/...`**, splitting ranking signal for the same content:

| Path | www impressions/pos | non-www impressions/pos |
|---|---|---|
| `/` (homepage) | 37 / 14.0 | 5 / 2.6 |
| `/features/interview-questions/payment-gateway` | 21 / 26.2 | 6 / 20.8 |
| `/features/interview-questions/food-delivery` | 2 / 16.0 | 10 / 18.4 |
| `/features/interview-questions/airline-management` | 2 / 16.0 | 8 / 14.4 |
| `/features/interview-questions/netflix` | 1 / 10.0 | 6 / 8.3 |
| `/features/interview-questions/inventory-management` | 6 / 27.8 | 3 / 13.7 |
| `/features/interview-questions/multiplayer-game-matchmaking` | 6 / 28.5 | 1 / 36.0 |
| `/features/interview-questions/coupon-system` | 4 / 7.3 | 3 / 10.0 |
| `/features/interview-questions/loyalty-points-rewards-program` | 4 / 9.0 | 1 / 1.0 |
| `/features/interview-questions/restaurant-management` | 4 / 28.5 | 1 / 7.0 |
| `/features/interview-questions/restaurant-pos-kitchen-display` | 3 / 31.0 | 2 / 22.0 |
| `/features/interview-questions/ludo-board-game` | 2 / 23.0 | 1 / 24.0 |
| `/features/interview-questions/distributed-task-queue` | 2 / 28.0 | 1 / 5.0 |

**This is a real technical SEO issue, not a content issue.** Note: the repo's recent commit history shows a redirect fix was already merged (`fix: fixed the re-direct issue on public pages`) — this GSC export covers the 17 days *up to and including* that fix, so some of this duplication may already be resolved going forward. **Action: verify in Search Console's URL Inspection tool that `https://lldcanvas.in/*` now 301-redirects to `https://www.lldcanvas.in/*` (or vice versa, pick one canonical host) with a matching `rel=canonical` tag, and confirm the fix is live in production**, not just merged. If it's already deployed, no further action is needed beyond waiting for Google to re-crawl and consolidate signal (typically 2–6 weeks).

- **Which host should be primary?** The www version has dramatically higher aggregate impressions (it appears to be the one Google has crawled more), so **www should be the canonical/primary host**, with non-www 301-redirecting into it — consistent with what the recent fix commit likely already implemented.
- **Should pages be merged, redirected, or differentiated?** Redirected (301) — these are truly the same content, not a case for differentiation.

---

## 9. LLDCanvas Content Strategy — Prioritized Roadmap

### Priority 1 — Work on first (existing near-page-1 assets)
1. Confirm/verify the www canonicalization fix is fully live (§8) — this is infrastructure, but it's blocking accurate measurement of everything else.
2. Rewrite title + meta + add roadmap structure to `/blog/lld-interview-roadmap` (pos 18.5 — closest to page 1).
3. Expand and re-title `/features/interview-questions/notification-service` (pos 8.2).
4. Expand and re-title `/features/interview-questions/amazon-locker` (39 impressions, 4 matching query variants).
5. Deepen `/features/interview-questions/parking-lot` (flagship problem, underperforming at pos 38.7).
6. Restructure `/blog/lld-interview-questions` into an explicit "Top 10" format (pos 22.8, 52 impressions — biggest quick-win content page).

### Priority 2 — Expand topical authority
7. Add the Design Patterns Cheat Sheet (§6A) and cross-link it into `/blog/design-patterns-guide`.
8. Deepen `/blog/hld-vs-lld-explained` with a worked comparison example (82 impressions, your single biggest zero-click page).
9. Build out internal linking across all individual problem pages (Splitwise, Chess, Rate Limiter, Meeting Room Booking, Inventory Management, Document Editor, Tic-Tac-Toe, Snake & Ladder) — none need new content yet, all need links (§10).
10. Add a comparison/FAQ block to `/blog/system-design-interview-guide` narrowing focus toward LLD-specific interview prep to reduce competition from generic system-design content.
11. Strengthen `/features/revision-notes/solid-principles/solid-lsp` (13 impressions — SOLID's best-performing sub-page) and use it as the template for the other SOLID pages.

### Priority 3 — Long-term
12. Monitor `system design canvas` and `lld design tool` queries — if impressions grow, build a dedicated product-positioning/comparison page (§6B).
13. Revisit low-impression problem pages (Vending Machine, Auction System, LRU Cache, Logging Framework, URL Shortener) once Priority 1–2 pages show ranking improvement — apply the same title/content pattern that worked.
14. Consider a genuinely new page only after 60–90 days of data show sustained demand for a query not covered by any existing page — do not create speculative pages now.

**Ranking logic used:** existing impressions and position first, then intent/relevance, then conversion potential (does the page plausibly lead to a signup/trial) — new-page creation is deliberately deprioritized below optimizing what already ranks, per the brief.

---

## 10. Internal Linking Strategy

Current signal (§7) shows large hub pages (`/features/interview-questions`, `/blog`) with high impressions but weak positions — classic sign of insufficient internal link equity flowing to child pages. Recommended structure:

**Hub → Problem pages (from `/features/interview-questions`):**
- Anchor text should be the *exact problem name + "LLD"*, not generic "learn more": e.g., `Parking Lot LLD →`, `Splitwise LLD →`, `Amazon Locker LLD →`.

**Roadmap → Everything (from `/blog/lld-interview-roadmap`):**
- This page should be the site's central "connector" — link to `hld-vs-lld-explained`, `design-patterns-guide`, `solid-principles-explained`, and the top 5–8 problem pages, using anchor text like `understand HLD vs LLD first` and `practice the Parking Lot problem`.

**LLD Interview Questions (blog) → Individual problem pages:**
- Each numbered question in the "Top 10" restructure (§9, Priority 1.6) should link directly to its matching feature page with anchor text `see the full solution`.

**Design Patterns guide ↔ Individual pattern revision notes ↔ Cheat sheet:**
- Three-way linking: the guide introduces each pattern and links to its dedicated revision-note page (`iterator-pattern`, `bridge-pattern`, etc.); each pattern page links back to the guide and to the new cheat sheet; the cheat sheet links to all of them. Anchor text: pattern name only (`Iterator Pattern`, `Bridge Pattern`).

**SOLID principles pages ↔ each other ↔ `/blog/solid-principles-explained`:**
- Hub-and-spoke: the explainer blog post links to each principle page (`solid-lsp`, `solid-ocp`, `solid-dip`, and the two not yet showing impressions — SRP, ISP), and each principle page links back with anchor text `back to all SOLID principles`.

**Problem pages → HLD vs LLD explainer:**
- Every individual problem page should open with one sentence — `This is a Low-Level Design (LLD) problem — if you're new to the LLD vs HLD distinction, start here` — linking to `/blog/hld-vs-lld-explained`. This is the single highest-leverage internal link on the site given that page's 82 impressions and zero clicks.

**Interview prep guide → Roadmap → Problem pages (funnel):**
- `/blog/system-design-interview-guide` → `/blog/lld-interview-roadmap` → individual problem pages, using anchor text `follow the LLD roadmap` and then problem-specific anchors.

---

## 11. Top 20 SEO Actions

| # | Action | Target Page/Keyword | Impact | Effort | Why |
|---|---|---|---|---|---|
| 1 | Verify www-canonicalization fix is fully live + submit affected URLs for re-crawl | Site-wide (13 duplicate URL pairs) | HIGH | LOW | Split ranking signal is suppressing position on payment-gateway, food-delivery, airline-management, netflix, and 9 others |
| 2 | Rewrite title/meta + add step structure | `/blog/lld-interview-roadmap` (lld roadmap, pos 16.3) | HIGH | LOW | Best-positioned query on the site, 8 impressions with zero clicks |
| 3 | Restructure into "Top 10" format with direct links to solutions | `/blog/lld-interview-questions` (pos 22.8, 52 impr) | HIGH | MEDIUM | Highest-impression page closest to page 1 |
| 4 | Expand content depth + retitle | `/features/interview-questions/amazon-locker` (39 impr) | HIGH | MEDIUM | 4 distinct query variants converge here, all zero-click |
| 5 | Deepen flagship content (diagrams, extensibility discussion) | `/features/interview-questions/parking-lot` (pos 38.7) | HIGH | MEDIUM | Most iconic LLD problem industry-wide, underperforming |
| 6 | Add worked comparison example + FAQ schema | `/blog/hld-vs-lld-explained` (82 impr, pos 33.8) | HIGH | MEDIUM | Single largest zero-click page on the site |
| 7 | Add "This is a Low-Level Design (LLD) problem" intro link to HLD-vs-LLD post | All problem pages | HIGH | LOW | Cheapest, highest-leverage internal link on the site |
| 8 | Retitle + expand | `/features/interview-questions/notification-service` (pos 8.2) | MEDIUM | LOW | Closest query to page 1 with zero clicks |
| 9 | Build Design Patterns Cheat Sheet page | New page, linked from design-patterns-guide | MEDIUM | MEDIUM | Only genuine content gap identified in the data |
| 10 | Hub-page internal linking overhaul with descriptive anchors | `/features/interview-questions` (52 impr, pos 43.3) | MEDIUM | LOW | Passes authority to 70+ child problem pages |
| 11 | Retitle + fix duplicate URL | `/features/interview-questions/payment-gateway` | MEDIUM | LOW | Combines ~27 impressions currently split across 2 URLs |
| 12 | Retitle + fix duplicate URL | `/features/interview-questions/inventory-management` | MEDIUM | LOW | Same duplicate-URL pattern as payment-gateway |
| 13 | Narrow focus toward LLD-specific interview prep | `/blog/system-design-interview-guide` (pos 41.8) | MEDIUM | MEDIUM | Reduces competition from generic system-design content |
| 14 | Add cheat-sheet subsection + pattern cross-links | `/blog/design-patterns-guide` (pos 31.3, 1 click) | MEDIUM | MEDIUM | Already converting once; most linkable hub for the cluster |
| 15 | Add "document editor" / "Google Docs" framing to title & intro | `/features/interview-questions/collaborative-text-editor` | LOW | LOW | Query mismatch between page name and search phrasing |
| 16 | Add "scheduler" synonym to title/intro | `/features/interview-questions/meeting-room-booking` | LOW | LOW | Same synonym-mismatch pattern |
| 17 | Cross-link all SOLID principle pages + explainer | `/blog/solid-principles-explained` + 5 principle pages | LOW | LOW | LSP page already has 13 impressions; consolidate cluster |
| 18 | Add visual diagram | `/features/revision-notes/system-design-concepts/cap-theorem` | LOW | LOW | Query specifically says "diagram" — page currently likely text-only |
| 19 | Add BookMyShow as a named example | `/features/interview-questions/movie-ticket-booking` | LOW | LOW | Captures a real (if tiny) query without a new page |
| 20 | Monitor "lld design tool" / "system design canvas" queries monthly | Homepage | LOW | LOW | Too early to act on, but signals brand-search emergence — track, don't build yet |

---

## 12. Most Important Insight

**1. What are the 10 biggest SEO opportunities visible in this data?**
`lld roadmap` (pos 16.3) · `notification service lld` (pos 8.2) · `amazon locker` cluster (39 impr) · `hld vs lld` cluster (24 impr, pos 37) · `lld interview questions` cluster (pos 22.8, 52 impr on the page) · `design patterns` cluster (53 impr) · `parking lot` (23 impr, flagship problem underperforming) · the 13-URL www/non-www duplication fix · `payment gateway lld` (split signal) · `inventory management lld` (pos 18.3).

**2. Which keywords can realistically reach page 1 first?**
`notification service lld` (already pos 8.2), `lld roadmap` (pos 16.3), `document editor lld` (pos 11.5), `hld vs lld example` (pos 12.0), `meeting room scheduler lld` (pos 13.5) — all currently within 1–2 ranking-factor improvements of page 1.

**3. Which pages should I optimize immediately?**
`/blog/lld-interview-roadmap`, `/features/interview-questions/notification-service`, `/features/interview-questions/amazon-locker`, `/features/interview-questions/parking-lot`, `/blog/lld-interview-questions`, `/blog/hld-vs-lld-explained` — in that order.

**4. Which new pages should I create?**
Only one is justified by the data right now: a **Design Patterns Cheat Sheet**. Almost everything else searchers are looking for already has a page — the gap is optimization, not creation.

**5. What should I NOT waste time on?**
`lldmastery` (likely a competitor brand name), `cracking faang` / generic system-design head terms (too competitive, 1 impression each), any new page for a single 1-impression long-tail query, and don't build a second HLD-vs-LLD page — expand the existing one.

**6. What should my SEO strategy for the next 30 days be?**
Do not chase new keywords or new pages. Spend the full 30 days on: (a) confirming the canonicalization fix is live and consolidating the 13 duplicate URLs, (b) rewriting titles/meta for the 5 quick-win queries in §2, (c) deepening content on the 3 highest-impression zero-click pages (`hld-vs-lld-explained`, `system-design-interview-guide`, `parking-lot`), and (d) executing the internal linking plan in §10. Re-pull this report in 30 days — with a 17-day-old site, position movement from these fixes should already be visible by then.

---

# Phase-by-Phase Action Plan

## Phase 0 (Days 1–3): Technical Foundation
- [ ] Verify in GSC's URL Inspection tool that `lldcanvas.in` → `www.lldcanvas.in` 301 redirect is live for all 13 flagged duplicate paths (§8)
- [ ] Confirm `rel=canonical` tags point to the www version site-wide
- [ ] Request re-indexing for the homepage and the 2 highest-duplication pages (`payment-gateway`, `inventory-management`)

## Phase 1 (Days 4–10): Quick-Win Title/Meta Rewrites
- [ ] `/blog/lld-interview-roadmap` — new title/meta (§4)
- [ ] `/features/interview-questions/notification-service` — new title/meta (§4)
- [ ] `/features/interview-questions/amazon-locker` — new title/meta (§7)
- [ ] `/features/interview-questions/collaborative-text-editor` — add "document editor" framing
- [ ] `/features/interview-questions/meeting-room-booking` — add "scheduler" synonym

## Phase 2 (Days 11–20): Content Depth on High-Impression Zero-Click Pages
- [ ] Expand `/blog/hld-vs-lld-explained` with worked example + FAQ schema
- [ ] Restructure `/blog/lld-interview-questions` into numbered "Top 10" format with direct solution links
- [ ] Deepen `/features/interview-questions/parking-lot` (diagram, extensibility section)
- [ ] Narrow `/blog/system-design-interview-guide` toward LLD-specific framing

## Phase 3 (Days 21–27): Internal Linking Overhaul
- [ ] Add "this is an LLD problem" intro link (→ HLD vs LLD page) to every problem page
- [ ] Rebuild `/features/interview-questions` hub with descriptive per-problem anchor text
- [ ] Cross-link Design Patterns guide ↔ individual pattern pages
- [ ] Cross-link SOLID explainer ↔ individual principle pages
- [ ] Turn `/blog/lld-interview-roadmap` into the site's central connector page

## Phase 4 (Days 28–30): One New Page + Measurement
- [ ] Publish Design Patterns Cheat Sheet, link it into the guide and every pattern page
- [ ] Re-pull GSC export, re-run this analysis, compare position deltas on the 11 quick-win queries and the 13 previously-duplicated URLs
