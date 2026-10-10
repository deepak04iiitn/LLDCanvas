# New Features Pricing Strategy

**Status:** Proposal for review — **not implemented**  
**Date:** 2026-04-10  
**Scope:** Plannr, LLD Roguelike, Debug Lab, Debug & Fix, Refactor, Change One Thing, Evolution, Budget Pressure  
**Explicit exclusion:** Daily Quiz remains **completely free** (no paywalls, no quotas)

---

## 1. Executive summary and monetization principles

### Verdict

Keep the existing three-tier price points (**Free / Pro ₹199·mo / Ultimate ₹399·mo**). For every new feature that already has **Easy / Medium / Hard** content, use the **same simple rule as Practice Problems** — no monthly attempt meters.

### Simple content rule (**Proposed** — applies to all difficulty-based features)

| Tier | Access |
|------|--------|
| **Free** | ~**10 curated Easy** challenges/scenarios (allowlist) |
| **Pro** | **All Easy** + **5 curated Medium** |
| **Ultimate** | **Everything** — all Easy, Medium, and Hard |

Features this rule covers: **Roguelike, Debug Lab, Debug & Fix, Refactor, Change One Thing, Evolution, Budget Pressure.**

**Plannr** has no Easy/Medium/Hard catalog — it keeps a separate, still-simple depth gate (section 5.1).  
**Daily Quiz** stays fully free with no limits.

### Principles

1. **One mental model.** Users who already understand Problems pricing should understand studio/learn pricing instantly.
2. **Taste, then pay.** Free gets ~10 real Easy items per feature — enough to learn the loop, not enough for a full prep sprint.
3. **Pro = breadth of Easy + a Medium set.** Enough to prep for typical interviews.
4. **Ultimate = full library including Hard.** The clear senior / mastery wedge — not “higher quotas.”
5. **Daily Quiz is the free habit engine.** Never paywall it.
6. **Gate at pack/scenario open**, never mid-run.
7. **Verified vs Proposed.** Marked clearly below.

---

## 2. Existing pricing model and constraints (**Verified**)

### Price points (`backend/src/config/plans.ts` → `PRICING`)

| Tier | Monthly INR | Yearly INR | Monthly USD | Yearly USD |
|------|-------------|------------|-------------|------------|
| Free | ₹0 | — | $0 | — |
| Pro | ₹199 | ₹1,999 | $10 | $100 |
| Ultimate | ₹399 | ₹3,999 | $20 | $200 |

### Current entitlements (`PLAN_LIMITS`)

| Capability | Free | Pro | Ultimate |
|------------|------|-----|----------|
| Code executions / day | 15 | 25 | 50 |
| Pattern templates | 16 (non–Pro-gated) | All 23 | All 23 |
| Export | None | PlantUML, Mermaid, Draft | + PNG, SVG, JSON |
| Practice problems | 10 curated Easy | All Easy + 10 curated Medium | All Easy/Medium/Hard |
| Hints / community / bookmarks | No | Yes | Yes |
| Interview Mode sessions / mo | 0 | 10 | Unlimited |
| Collaboration | 0 | 2 seats (incl. owner) · 3 invites / mo | Unlimited seats & invites |
| Activity timeline / version history | No | No | Yes |
| Analytics | None | Basic | Full |
| Beta features flag | No | No | Yes |

### Monetization plumbing that already exists

- **Plan resolution:** `usePlan()` (frontend) + `/billing/plan` → `getLimits(plan)`.
- **Upgrade UX:** `UpgradeGate` (inline / overlay / banner) → `/pricing`.
- **Studio content model:** `ChallengePack` already has `difficulty: easy|medium|hard` and `planMin: free|pro|ultimate` (**Verified:** field exists; **Verified:** default is `'free'`; **Verified:** session service currently selects `planMin` for listing but does **not** appear to enforce plan checks yet).
- **Problem access pattern:** `isProblemAccessible(plan, difficulty, slug)` — curated free Easy list, Pro medium allowlist, Ultimate unlocks Hard.

### Critical gap (**Verified**)

Dashboard routes for Plannr, Design Studio (debugger/refactor/change/evolution/budget), Learn Roguelike, and Learn Debug Lab **do not currently call `usePlan` / UpgradeGate**. Until entitlements are implemented, all eight features behave as fully free.

### Cost profile (**Assumption → validate**)

| Feature family | Likely cost driver | Monetization implication |
|----------------|--------------------|--------------------------|
| Studio packs (Debug & Fix, Refactor, Change, Evolution, Budget) | Deterministic grading / storage | **Content allowlists by difficulty** (same as Problems) |
| Debug Lab (Learn annotate / code bugs) | Deterministic | Same |
| Roguelike | Procedural + grading | Same Easy / Medium / Hard allowlists |
| Plannr | Curriculum + profile storage | Feature-depth gate (no difficulty catalog) |
| Daily Quiz | Lightweight Q&A | Keep unlimited |
| Analyze & Score (editor) | Client-side heuristics today | Out of this doc’s eight features; treat separately if AI is added later |

---

## 3. Target users and value proposition per feature

| Feature | Who pays for it | Core job-to-be-done | Willingness-to-pay drivers |
|---------|-----------------|---------------------|----------------------------|
| **Plannr** | Candidates with an interview date | “Tell me what to study this week” | Fear of unfocused prep; timeline anxiety |
| **Roguelike** | Candidates who freeze under timers | Decision-making under irreversible pressure | Mock-interview realism |
| **Debug Lab** | Learners building critique skill | Spot smells on diagrams/code | Interview “find the bug” moments |
| **Debug & Fix** | Learners past critique | Restructure a broken design | Active remediation practice |
| **Refactor** | Mid/senior prep | Improve a working monolith under behavior lock | Legacy / refactor interview format |
| **Change One Thing** | Anyone drilling OCP | Absorb one new requirement with tiny blast radius | Classic interviewer twist |
| **Evolution** | Senior / staff aspirants | Multi-stage growth & debt | Long-horizon design judgment |
| **Budget Pressure** | Senior / practical interviews | Ship under story-point / headcount limits | Trade-off narration skill |
| **Daily Quiz** (*free forever*) | Everyone | Daily retention habit | Top-of-funnel trust |

**Positioning reminder (Proposed):**

- **Pro — Crack LLD Interviews:** Easy + curated Medium across studio/Roguelike; Plannr is **try-only** (see §5.1).
- **Ultimate — Master Software Design:** full Hard libraries + **full Plannr** (only tier that can use generated plans).

---

## 4. Feature × tier comparison matrix (**Proposed**)

| Feature | Free | Pro | Ultimate |
|---------|------|-----|----------|
| **Daily Quiz** | ✅ unlimited | ✅ | ✅ |
| **Roguelike** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Debug Lab** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Debug & Fix** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Refactor** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Change One Thing** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Evolution** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Budget Pressure** | ~10 Easy (allowlist) | All Easy + 5 Medium | All Easy/Medium/Hard |
| **Plannr** | ◐ **Try / preview only** | ◐ **Try / preview only** (same as Free) | ✅ **Full access — only tier that can use generated content** |

Unlimited **replays** of any difficulty-based challenge you can open — no monthly attempt counters on those features.

---

## 5. Concrete access rules (**Proposed**)

### 5.0 Shared rule for Easy / Medium / Hard catalogs

Exactly like Practice Problems (`isProblemAccessible` / `FREE_EASY_PROBLEM_SLUGS` / `PRO_MEDIUM_PROBLEM_SLUGS`):

| Tier | Rule |
|------|------|
| Free | Only slugs on that feature’s **Free Easy allowlist** (~10). Other Easy + all Medium/Hard locked. |
| Pro | **Every Easy** pack/scenario for that feature, plus that feature’s **Pro Medium allowlist** (5). Hard locked. |
| Ultimate | **All** published Easy, Medium, and Hard. |

**Per feature:** maintain three constants (or one map), e.g.:

- `FREE_ROGUELIKE_EASY_SLUGS` (~10)
- `PRO_ROGUELIKE_MEDIUM_SLUGS` (5)
- same pattern for `debug-lab`, `debugger` (Debug & Fix), `refactor`, `change_one`, `evolution`, `budget`

**`planMin` on packs (optional helper):** Easy allowlisted → effectively free; other Easy still free for Pro+; Medium allowlisted → pro; remaining Medium + all Hard → ultimate. Or simply ignore `planMin` and evaluate via allowlists + difficulty like Problems do today.

**If a feature has fewer than 10 Easy items today:** put all current Easy on Free, and grow the allowlist to ~10 as content ships.  
**If fewer than 5 Medium:** put all current Medium on Pro until the library is larger.

### 5.1 Plannr (**Proposed** — Ultimate-only product · Free/Pro try mode)

Plannr is a **complete Ultimate feature**. Free and Pro may **try** the experience so they understand the value; they **cannot use** anything the planner generates as an ongoing prep system.

#### Try mode (Free + Pro — identical)

Goal: let users walk through **plan creation / generation** and see what Plannr looks like, then hit a clear Ultimate wall before they can act on the output.

| Allowed in try mode | Not allowed (requires Ultimate) |
|---------------------|----------------------------------|
| Open Plannr hub + onboarding / setup wizard | Persist a usable JourneyProfile beyond a **trial session** |
| Choose track, focus, pace, interview date (preview inputs) | Follow the day plan as real prep (complete topics for credit) |
| See a **generated sample / preview roadmap** and day-plan UI | Unlock topic modules, mark topics complete, earn skill evidence |
| Browse UI shells: skills, revise, experiences, tips, cheatsheet (read-only / blurred CTAs OK) | Use revise bookmarks, experiences/mocks, tips, or cheatsheet content |
| One-time “Generate my plan” preview | Re-generate, switch plans, multi-plan, gap analysis as living tools |

**Concrete try rules (Proposed):**

1. Free/Pro can run setup and generate a **preview plan** once (or once per session).
2. Preview is **read-only**: roadmap nodes show titles/structure but **Start topic / Complete / Practice** are gated.
3. No (or ephemeral) persistence — either discard after logout/session, or save a `trial: true` profile that APIs refuse to advance (`completeTopic`, bookmarks, experiences, skill updates → `PLAN_GATE` / Ultimate).
4. Persistent banner: “You’re previewing Plannr. Upgrade to Ultimate to use this plan.”
5. Marketing `/features/plannr` stays public; try mode is the in-product demo.

#### Ultimate — full access

| Capability | Ultimate |
|------------|----------|
| Active plans | Up to **3** |
| Tracks | **All** roles |
| Curriculum | **All topics** |
| Generate + **use** day plans | ✅ |
| Complete topics, skills evidence, revise | ✅ |
| Gap analysis | ✅ |
| Experiences / mocks, tips, cheatsheet | ✅ all |
| Re-generate / switch tracks for real | ✅ |

**Upgrade triggers**

- Free/Pro finishes generate-preview → CTA **Upgrade to Ultimate to use your plan**.
- Free/Pro clicks Start topic / Complete / any generated-content action → Ultimate gate.
- Free/Pro clicks tips, cheatsheet detail, experiences, revise → Ultimate gate.

### 5.2–5.8 Difficulty-based features

All seven (Roguelike, Debug Lab, Debug & Fix, Refactor, Change One Thing, Evolution, Budget Pressure) use **§5.0 only**.

No separate monthly run/attempt quotas. History and reveal/feedback stay available for any challenge the plan can open.

**Upgrade triggers:**

- Free user opens a non-allowlisted Easy, or any Medium → **Pro**
- Free/Pro user opens Hard → **Ultimate**

---

## 6. Upgrade triggers and paywall UX (**Proposed**)

### When to show gates

| Moment | Pattern | Required plan |
|--------|---------|---------------|
| Click locked Medium (or non-free Easy) while Free | `UpgradeGate` on card | Pro |
| Click Hard while Free or Pro | `UpgradeGate` on card | Ultimate |
| Free/Pro finishes Plannr generate preview | Banner + Ultimate CTA | Ultimate |
| Free/Pro clicks Start topic / complete / revise / mock / tips | `UpgradeGate` on action | Ultimate |

### When **not** to gate

- Finishing a challenge the user already started.
- Marketing `/features/*` pages.
- Daily Quiz (always).
- Any challenge on the user’s allowlist / unlocked difficulty set.

### Copy principles

- Mirror Problems language: “Included on Free”, “Pro · Medium”, “Ultimate · Hard”.
- One CTA: `/pricing?from=refactor_medium`.

---

## 7. Rationale (founder lenses)

### Conversion

1. Finish ~10 Free Easy Debug Lab / Roguelike items → want Medium → **Pro**.
2. Free/Pro tries Plannr, loves the generated plan, cannot start topics → **Ultimate**.
3. Pro user sees Hard Evolution / Budget → **Ultimate**.

### Retention

- Daily Quiz (free) = daily habit.
- Full Easy libraries on Pro = weeks of practice without artificial run caps.
- Hard catalog on Ultimate = long-tail mastery content.

### Willingness to pay

Pay for **library depth** (Medium set, then Hard), same reason people upgrade Problems today — not for “extra attempts.”

### Perceived value vs price

- Pro: “All Easy + a real Medium set across every studio mode.”
- Ultimate: “Hard unlocked everywhere” — clear, non-quota story.

### Cannibalization risks

| Risk | Mitigation |
|------|------------|
| Free ~10 Easy feels like a full product | Cap at ~10 curated Easy; rest of Easy is Pro+ |
| Free/Pro get full Plannr without Ultimate | Try mode is preview-only; generated content unusable |
| Try mode feels broken/empty | Allow full generate + visible roadmap; gate only actions that *use* the plan |
| Daily Quiz paywall | Forbidden |

### Cost control

Deterministic graders → content allowlists are enough. Add AI metering later only if AI feedback ships.

### Long-term growth

New Easy packs: add to Free allowlist until ~10, then leave extras for Pro “all Easy.” New Medium: fill Pro allowlist to 5, then remainder Ultimate-only or expand Pro allowlist deliberately. New Hard: Ultimate.

---

## 8. Interactions with existing features

| Existing entitlement | Interaction with new features |
|----------------------|-------------------------------|
| Practice Problems Free/Pro/Ultimate | **Same rule** — reuse the mental model and ideally shared helper patterns |
| Interview Mode (Pro 10/mo, Ultimate ∞) | Unchanged; Roguelike stays content-gated, not session-metered |
| Pattern templates Pro-gated set | Unrelated; editor template locks stay as today |
| Bookmarks Pro+ | Plannr revise: Free 3 / Pro+ unlimited |
| Analytics Ultimate | Optional later: aggregate studio completion stats |
| `betaFeatures` Ultimate flag | Optional: launch brand-new modes Ultimate-first briefly |

**Analyze & Score (editor):** Not in the eight-feature list. **Proposal (separate decision):** keep basic deterministic report free (drives editor activation); if AI narrative is added later, gate AI generations.

---

## 9. Implementation considerations (**Proposed**; build after approval)

### Entitlement model

Reuse the Problems pattern — **allowlists + difficulty**, not monthly counters.

```ts
// Example shape in plans.ts (per feature key)
FREE_EASY_SLUGS: Record<StudioOrLearnFeature, readonly string[]>  // ~10 each
PRO_MEDIUM_SLUGS: Record<StudioOrLearnFeature, readonly string[]> // 5 each

function canAccessChallenge(
  plan: PlanName,
  feature: StudioOrLearnFeature,
  difficulty: 'easy' | 'medium' | 'hard',
  slug: string,
): boolean
```

Plannr config (separate from difficulty allowlists):

```ts
plannr: {
  access: 'try' | 'full'   // free+pro → try; ultimate → full
  maxPlans: number         // try: 0 persistent (or 1 trial flag); full: 3
  canUseGeneratedContent: boolean  // false in try; true on Ultimate
  // try: setup + generate preview + read-only UI
  // full: complete topics, skills, revise, experiences, tips, cheatsheet, gap analysis
}
```

### Enforcement points

1. **List endpoints:** badge locked items with `requiredPlan: 'pro' | 'ultimate'`.
2. **Start session / run:** call `canAccessChallenge`; 403 + `PLAN_GATE` if locked.
3. **Frontend:** `UpgradeGate` on locked cards (same as Problems).
4. **Admin:** manage allowlists (or derive: first N Easy by `order`, curated Medium set).

### Usage tracking

**Not required** for gating under this model. Optional analytics only (opens, completes) for product insights.

### Migration

1. Inventory published packs/scenarios by type × difficulty.
2. Curate Free Easy (~10) and Pro Medium (5) allowlists per feature.
3. Ship `canAccessChallenge` + UI badges behind a flag.
4. Add rows to the pricing comparison table.

---

## 10. Launch and experimentation plan

### Phase 0 — Inventory & dogfood (1 week)

- Count published items by type × difficulty.
- Lock Free Easy (~10) and Pro Medium (5) allowlists per feature.
- Verify locked cards show the right plan badge.

### Phase 1 — Soft launch (2 weeks)

- Enforce `canAccessChallenge`; update pricing page.
- Watch: Free→Pro conversion, Hard-gate → Ultimate, Daily Quiz DAU (must hold).

### Phase 2 — Tune

| Signal | Adjustment |
|--------|------------|
| Free feels empty | Improve which 10 Easy are on the allowlist (quality), don’t remove the cap |
| Pro users stall | Expand Pro Medium allowlist toward 10 |
| Weak Ultimate upgrades | Ship / promote more Hard packs |

### North-star checks

- Same story as Problems: Free tastes Easy, Pro covers Medium set, Ultimate opens Hard.
- Daily Quiz stays unrestricted.

---

## Appendix A — Allowlist curation

**Free Easy (~10):** short, clear teaching moments; strong reveal; not the hardest “hero” content.

**Pro Medium (5):** representative interview-style challenges; leave some Medium for later expansion or Ultimate if the library is huge.

**Hard:** Ultimate only.

---

## Appendix B — Pricing page copy sketch (**Proposed**)

**Free:** Unlimited Daily Quiz, UML canvas, ~10 Easy challenges per mode. Plannr **try/preview only**.

**Pro — Crack LLD Interviews:** All Easy + 5 Medium per mode, Interview Mode, problem sets. Plannr **try/preview only** (same as Free).

**Ultimate — Master Software Design:** All Hard challenges + **full Plannr** (use your generated plan, all tracks, mocks, tips, cheatsheet).

---

## Appendix C — Decision log (to fill after review)

| Decision | Owner | Date | Notes |
|----------|-------|------|-------|
| Confirm ~10 Free Easy / 5 Pro Medium per feature | | | **Preferred simple model** |
| Approve concrete allowlist slugs | | | |
| Plannr = Ultimate-only to *use*; Free/Pro try/preview | | | **Agreed direction** |
| Try: allow generate + read-only roadmap; block Start/Complete | | | |
| Trial profile ephemeral vs `trial: true` persisted | | | Pick one at implement |
| Ultimate maxPlans = 3 | | | |
| Analyze & Score gating (separate) | | | |

---

## Summary

**Verified today:** Free/Pro/Ultimate prices exist; packs have `difficulty` + `planMin`; new features are **not yet gated**.

**Proposed (simple):** Difficulty features → **~10 Easy free · all Easy + 5 Medium on Pro · all on Ultimate**. **Plannr → Ultimate-only to use; Free/Pro get try/preview (generate & view, cannot use generated content).** Daily Quiz stays fully free.
