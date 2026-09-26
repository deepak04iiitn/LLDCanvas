# Interactive LLD — Per-Feature Implementation Guide

**Companion to:** `docs/INTERACTIVE_LLD_EXPANSION_PLAN.md` (architecture decisions)  
**Spec:** `docs/LLDCanvas — Interactive LLD Feature Specification.md`

This document is the **engineering execution guide**: phase-by-phase, step-by-step, **per feature**, covering backend → frontend → admin → seed → SEO → tests. Follow the architecture plan’s product decisions (Design Studio / Learn & Practice / Community; no Dashboard dump; admin CMS + seeds).

---

## 0. How to use this doc

1. Complete **Phase 0** and **Phase 1** once (shared foundation).  
2. Implement features in the **build order** listed in §0.2 — do not start Community or Roguelike before their dependencies.  
3. For each feature, follow its section top-to-bottom; check off DoD before marking the phase done.  
4. Keep files **small and focused** — see §0.3. Never grow a single controller/page into a god-file.

### 0.1 Product surfaces (locked)

| Surface | Route prefix | Role |
|---------|--------------|------|
| Design Studio | `/design-studio` | Critique / evolve / inspect challenges + hub |
| Learn & Practice | `/learn` | Quiz, detective, mashup, roguelike, score, UML↔code |
| Community | `/community` | Gallery, watch, forks, alternatives |
| Design Workspace | `/editor/[id]` | Analyze \| Evolve \| History \| Share panels |
| Draft Playground | `/playground` | **Unchanged** — Draft Notation only |
| Dashboard | `/dashboard` | Library only |
| Admin | `/admin/studio/*`, `/admin/learn/*`, `/admin/community/*` | CMS |

### 0.2 Global build order

```text
Phase 0  Shared foundation (artifact, hubs, registry, admin shell)
Phase 1  Graph kernel + versions + replay capture
Phase 2  Microscope, Dependency Web, Design Score
Phase 3  Design Debugger, Refactoring Mode, Architecture Budget
Phase 4  Change One Thing, Architecture Evolution
Phase 5  Design Replay player (+ enables Watch)
Phase 6  Daily Quiz, Pattern Detective, Mashup, Roguelike
Phase 7  Gallery, Forks, Watch, Alternative Solutions
```

### 0.3 File & folder conventions (mandatory)

**Do not** dump an entire feature into one `HugeFeature.tsx` or one `admin.controller.ts` mega-block.

#### Backend layout

```text
backend/src/
  models/
    studio/                 # challenge packs, attempts, budget, evolution
    learn/                  # quiz, detective, mashup, roguelike, score-config
    community/              # published design, report, alt-group
    artifact/               # design-artifact, artifact-version, replay-event
  services/
    studio/
    learn/
    community/
    artifact/
    graph/                  # analyze, diff, score heuristics, budget calc
  controllers/
    studio/
    learn/
    community/
    artifact/
    admin/
      studio/
      learn/
      community/
  routes/
    studio.route.ts
    learn.route.ts
    community.route.ts
    artifact.route.ts
    admin/
      studio.route.ts
      learn.route.ts
      community.route.ts
  scripts/
    seed-studio-debugger.ts
    seed-studio-refactor.ts
    seed-learn-quiz.ts
    …
  jobs/
    replay-retention.ts
```

**Rules**

- One Mongo model file ≈ one collection.  
- Controllers stay thin: validate → call service → respond.  
- Business logic lives in `services/`.  
- Admin routes are **separate files** under `routes/admin/` and `controllers/admin/` — do not append thousands of lines to `admin.controller.ts`.  
- Shared graph/diff/score math lives in `services/graph/` and is imported by features.

#### Frontend layout

```text
frontend/src/
  app/
    design-studio/
      page.tsx                         # hub
      layout.tsx
      debugger/[sessionId]/page.tsx
      refactor/[sessionId]/page.tsx
      change/[sessionId]/page.tsx
      evolution/[runId]/page.tsx
    learn/
      page.tsx
      layout.tsx
      quiz/page.tsx
      detective/[id]/page.tsx
      mashup/[id]/page.tsx
      roguelike/[runId]/page.tsx
    community/
      page.tsx
      layout.tsx
      d/[slug]/page.tsx
      d/[slug]/watch/page.tsx
      d/[slug]/forks/page.tsx
    features/
      design-debugger/page.tsx         # SEO (existing features kit)
      …
    admin/
      studio/
        debugger/page.tsx
        refactor/page.tsx
        …
      learn/
        quiz/page.tsx
        …
      community/
        gallery/page.tsx
        …
  components/
    studio/                            # Design Studio UI only
      hub/
      debugger/
      refactor/
      change/
      evolution/
      budget/
      microscope/
      dependency-web/
      shell/                           # CategoryShell, timers, panels
    learn/
      hub/
      quiz/
      detective/
      mashup/
      roguelike/
      score/
    community/
      hub/
      gallery/
      watch/
      forks/
      alternatives/
    editor/
      workspace/                       # Analyze/Evolve/History/Share tab hosts
        AnalyzePanel.tsx               # composes microscope, dep-web, score entry
        EvolvePanel.tsx
        HistoryPanel.tsx
        SharePanel.tsx
  lib/
    artifact/
    graph/                             # analyzeDiagram, structuralDiff, budget, score
    studio/
    learn/
    community/
    features/
      feature-registry.ts
  hooks/
    studio/
    learn/
    community/
    artifact/
```

**Rules**

- App Router `page.tsx` files stay thin: metadata + compose a `*PageClient` or feature root.  
- Split UI: `DebuggerCanvas.tsx`, `IssuesSidebar.tsx`, `RevealPanel.tsx` — not one 2k-line file.  
- Shared math in `lib/graph/` — never copy-paste coupling metrics.  
- Admin pages follow existing admin patterns (`AdminShell`, tables, `ConfirmModal`, `BulkActionBar`) in `components/admin/studio|learn|community/`.  
- API clients: extend `lib/api.ts` carefully **or** add `lib/studio-api.ts`, `lib/learn-api.ts`, `lib/community-api.ts`, `lib/admin-studio-api.ts` to avoid a single mega-api file.

#### Naming

- Routes/folders: kebab-case.  
- Components: PascalCase.  
- Analytics events: `{category}_{feature}_{action}` e.g. `studio_debugger_session_start`.  
- Feature registry ids: `debugger`, `refactor`, `change-one`, …

---

## Phase 0 — Shared foundation

**Objective:** Artifact model, three hubs, feature registry, CategoryShell, Admin Interactive nav scaffold, SEO template helper, flags.

### Steps

1. **Data model — DesignArtifact**  
   - File: `backend/src/models/artifact/design-artifact.model.ts`  
   - Extend or wrap existing `diagram` documents: add `elementId` on every node/edge, `forkParentId`, `publishedSlug`, `replayEnabled`.  
   - Migration script: `scripts/migrate-element-ids.ts` (backfill UUIDs).

2. **Artifact API**  
   - `controllers/artifact/artifact.controller.ts` + `services/artifact/artifact.service.ts`  
   - `routes/artifact.route.ts` → mount `/artifacts`  
   - Endpoints: `GET/PATCH /artifacts/:id`, `POST /artifacts/:id/versions`

3. **Feature registry (FE)**  
   - `frontend/src/lib/features/feature-registry.ts`  
   - Fields: `id`, `category: 'design-studio' | 'learn' | 'community'`, `href`, `adminHref`, `minPlan`, `flagKey`, `analyticsPrefix`

4. **CategoryShell**  
   - `components/studio/shell/CategoryShell.tsx` (reuse for Learn with props)  
   - Provides header, back-to-hub, plan gate slot, timer slot, children.

5. **Hub pages**  
   - `app/design-studio/page.tsx` + `components/studio/hub/StudioHub.tsx`  
   - `app/learn/page.tsx` + `components/learn/hub/LearnHub.tsx`  
   - `app/community/page.tsx` + `components/community/hub/CommunityHub.tsx`  
   - Wire AppShell **Experiences** group (3 links only).

6. **Admin shell stubs**  
   - Add nav groups in `AdminShell.tsx`  
   - Stub pages under `app/admin/studio|learn|community/*/page.tsx` (“Coming in Phase N”)  
   - Shared scaffold: `components/admin/interactive/ChallengePackTable.tsx`, `ChallengePackEditor.tsx`

7. **StudioChallengePack base model**  
   - `models/studio/challenge-pack.model.ts`  
   - `type: debugger | refactor | change_one | evolution`  
   - Fields: slug, title, difficulty, diagramSnapshot, payload, status, planMin, problemId?

8. **SEO helper**  
   - `components/features/createFeaturePage.tsx` or documented checklist copying `/features/editor` patterns  
   - Category-aware `FeatureCrossLinks`

9. **Flags + analytics constants**  
   - `lib/features/flags.ts`, `lib/features/analytics-events.ts`

10. **DoD Phase 0**  
    - Hubs render for auth users  
    - Registry drives hub cards  
    - Admin nav visible  
    - Migration runs clean on staging  

---

## Phase 1 — Shared analysis kernel

**Objective:** Graph analysis, structuralDiff kernel (internal grading), versions, replay event capture (write path).

### Steps

1. **Graph service (shared)**  
   - BE: `services/graph/analyze.ts` (deps in/out, cycles, hubs)  
   - FE mirror: `lib/graph/analyzeDiagram.ts` (same algorithms for instant UI)  
   - Unit tests: `analyzeDiagram.test.ts` with fixture diagrams  

2. **Structural Diff**  
   - `services/graph/structuralDiff.ts` + `lib/graph/structuralDiff.ts`  
   - Ignore x/y-only changes; diff by `elementId`  
   - Golden fixtures under `backend/src/services/graph/__fixtures__/`  

3. **Versions**  
   - `models/artifact/artifact-version.model.ts`  
   - Service: create snapshot, list, get pair  
   - API: `POST /artifacts/:id/versions`, `GET /artifacts/:id/versions`  

4. **Replay capture (write-only)**  
   - `models/artifact/replay-event.model.ts`  
   - Editor hook: `hooks/artifact/useReplayRecorder.ts`  
   - Emit semantic events only (create/update/delete/connect) behind flag  
   - Batch POST `/artifacts/:id/replay/events`  
   - Job stub: `jobs/replay-retention.ts`  

5. **DoD Phase 1**  
   - Diff unit tests green  
   - Version create works from API  
   - Recorder does not break editor when flag off  

---

# Per-feature plans

Each feature below: **Phase · Dependencies · Folders · Backend steps · Frontend steps · Admin · Seed · SEO · Analytics · Tests · DoD**

---

## F1. Architecture Microscope

| | |
|--|--|
| **Category** | Design Studio + Editor Analyze |
| **Phase** | 2 (+ full lenses / investigate) |
| **Depends on** | Graph kernel |
| **User route** | Editor Analyze (Microscope Mode); `/design-studio/microscope` |
| **Admin** | `/admin/studio/tools` |

### Product

Interactive instrument — not a static inspector. Core loop: **Select → Zoom → Trace → Investigate → Understand**.

Lenses: Dependencies, Blast Radius, Responsibilities/Cohesion, Flows, Abstractions, Consumers, Cycles, Layers, Encapsulation, Creation, X-Ray. Follow Me path bar. Authored investigate packs with soft grade.

### Folders

```text
components/studio/microscope/
  MicroscopeSession.tsx
  InvestigateSession.tsx
  LensSwitcher.tsx / ZoomBreadcrumb.tsx / FollowMeBar.tsx
  MicroscopeLensBody.tsx / OverviewCard.tsx / CohesionBars.tsx
lib/graph/microscope.ts
lib/graph/analyzeDiagram.ts
services/studio/microscopeVerify.ts
services/studio/microscopeGrade.ts
```

### DoD

- Editor Analyze: split canvas + microscope; fade/focus by lens.
- Studio: list/session investigate packs with soft narrative grade.
- Soft evidence only (no auto “god class” verdict).

---

## F2. Dependency Web

| | |
|--|--|
| **Category** | Design Studio + Editor Analyze |
| **Phase** | 2 (+ full interactive web) |
| **Depends on** | Graph kernel |
| **User route** | Editor Analyze → Dependency Web; `/design-studio/depweb` |
| **Admin** | Studio Tools |

### Product

Interactive reasoning graph — not a static list. Core loop: **See → Select → Trace → Isolate → Simulate → Understand**.

Complement to Microscope (zoom out vs zoom in). Lenses: deps/dependents, blast, cycles, layers, external, paths, hotspots. Matrix toggle. Studio challenges with soft grade.

### Folders

```text
components/studio/dependency-web/
  DependencyWebSession.tsx
  DependencyGraphCanvas.tsx
  NodeInspector.tsx
  DependencyMatrix.tsx
  DepWebChallengeSession.tsx
lib/graph/dependencyWeb.ts
lib/graph/toDependencyGraph.ts
services/studio/depwebVerify.ts / depwebGrade.ts
```

### DoD

- Interactive React Flow web in Analyze with focus/fade.
- Blast / cycles / paths / filters / matrix.
- Studio challenges seeded; CTAs to Microscope + Change One Thing.

---

## F3. Explain This Design as a Story — REMOVED

Product UI, Analyze Story tab, studio challenges, and story APIs removed.

---

## F4. Design Decision Log — REMOVED

History Decisions tab and `/artifacts/:id/decisions` APIs removed. History tab keeps Design Replay only.

---

## F5. Design Score

| | |
|--|--|
| **Category** | Learn & Practice (+ Analyze entry) |
| **Phase** | 2 |
| **Depends on** | Graph kernel |
| **Admin** | `/admin/learn/score` |
| **Seed** | v1 heuristic weight set |

### Folders

```text
components/learn/score/
  ScoreOverview.tsx
  ScoreDimensionDetail.tsx
services/graph/scoreEngine.ts
lib/graph/scoreEngine.ts
models/learn/score-heuristic-config.model.ts
controllers/learn/score.controller.ts
controllers/admin/learn/score-config.controller.ts
app/admin/learn/score/page.tsx
app/features/design-score/page.tsx
```

### Backend steps

1. ScoreHeuristicConfig model (versioned weights).  
2. `POST /artifacts/:id/score` → dimensions + explanations + highlighted elementIds.  
3. Persist `ScoreHistory` optional.  
4. Admin GET/PATCH active config.  
5. Seed script: `seed-learn-score-config.ts`.

### Frontend steps

1. ScoreOverview in Learn hub + Analyze panel.  
2. Click dimension → highlight issues on canvas.  
3. Copy: “Feedback, not absolute truth.”  
4. Plan gate if needed for full breakdown.

### SEO / Analytics / DoD

- SEO: `/features/design-score` → CTA Learn / Editor  
- Events: `learn_score_run`, `learn_score_dimension_open`  
- DoD: admin can change weights without deploy; unit tests for each dimension.

---

## F6. UML Diff — REMOVED

Product UI and `/artifacts/:id/diff` endpoint removed. `structuralDiff` remains as an internal kernel for Change / Evolution / Refactor grading only.

---

## F7. Design Debugger

| | |
|--|--|
| **Category** | Design Studio |
| **Phase** | 3 |
| **Depends on** | Challenge pack model, canvas annotate |
| **Admin** | `/admin/studio/debugger` |
| **Seed** | 8–12 packs |

### Folders

```text
components/studio/debugger/
  DebuggerSession.tsx
  AnnotateLayer.tsx
  IssuesFoundList.tsx
  IssueExplainForm.tsx
  RevealPanel.tsx
app/design-studio/debugger/[sessionId]/page.tsx
services/studio/debugger.service.ts
controllers/studio/debugger.controller.ts
controllers/admin/studio/debugger.controller.ts
scripts/seed-studio-debugger.ts
app/admin/studio/debugger/page.tsx
app/features/design-debugger/page.tsx
```

### Backend steps

1. ChallengePack `type: debugger` payload: `expectedIssues[]`.  
2. Attempt model: marks, explanations, score, status.  
3. User API: `POST /studio/debugger/start`, `POST .../submit`, `GET .../reveal`.  
4. Grading service: match marks to expected (elementId + category); partial credit.  
5. Admin CRUD + publish + bulk-delete.  
6. Seed 8–12 published packs.

### Frontend steps

1. Hub card → start → session page with CategoryShell + timer.  
2. Click elements → mark issue + category + why.  
3. Submit → RevealPanel.  
4. Resume after refresh via attempt id.  
5. Loading/error/empty admin content states.

### Analytics / Tests / DoD

- Events: `studio_debugger_session_start|complete|abandon`, `issue_marked`, `reveal_viewed`  
- E2E: admin publish → user completes → reveal.  
- DoD: admin can add pack without deploy; seed idempotent by slug.

---

## F8. Refactoring Mode

| | |
|--|--|
| **Category** | Design Studio |
| **Phase** | 3 |
| **Depends on** | Diff, Score, challenge packs |
| **Admin** | `/admin/studio/refactor` |
| **Seed** | 6–8 |

### Folders

```text
components/studio/refactor/
  RefactorSession.tsx
  SplitCanvas.tsx          # original locked | editable
  ConstraintsBar.tsx
  RefactorResultNarrative.tsx
services/studio/refactor.service.ts
…
```

### Backend steps

1. Pack payload: baseline snapshot, constraints[], optional rubric.  
2. Submit: run Diff + Score delta + narrative builder (not binary pass/fail).  
3. Admin CRUD + seed.

### Frontend steps

1. Split view; original read-only.  
2. Submit → narrative result.  
3. Wire DiffChangeList.

### DoD

- E2E split edit + submit; admin seed visible in hub.

---

## F9. Architecture Budget

| | |
|--|--|
| **Category** | Design Studio |
| **Phase** | 3 (+ marketplace prioritization) |
| **Depends on** | Challenge packs, soft grading |
| **Admin** | `/admin/studio/budget` |
| **Seed** | Food Delivery MVP, E-Commerce Checkout (+ infra / engineer-days / expert auction / combo) |

### Product

Marketplace prioritization under scarce budgets — not a live complexity meter as the primary mode.
Players allocate investments (why + target), may reserve, defer debt, then face soft reports (coverage, opportunity cost, inflation via `budgetCalc`, Evolution handoff).

### Folders

```text
components/studio/budget/
  BudgetSession.tsx
  BudgetMeter.tsx
  InvestmentCatalog.tsx
  InvestmentWhyPanel.tsx
  TradeoffReveal.tsx
  PriorityBoard.tsx
  BudgetComplete.tsx
  BudgetReplay.tsx
lib/graph/budgetCalc.ts          # secondary inflation signal in report
services/studio/budgetVerify.ts
services/studio/budgetGrade.ts
```

### Routes

- `/design-studio/budget` — challenge list
- `/design-studio/budget/[slug]` — BudgetSession
- API: `/studio/budget/:id/save`, `/submit-stage`, `/report`

### DoD

- Soft grade (no hard fail) with coverage / opportunity cost / reserve / debt.
- Multi-stage future events + budget kinds (points, engineer-days, infra $, time).
- Evolution debt handoff + optional combo pack.
- `budgetCalc` appears as architecture inflation in the investment report.

---

## F10. Change One Thing

| | |
|--|--|
| **Category** | Design Studio |
| **Phase** | 4 |
| **Depends on** | Diff, challenge packs |
| **Admin** | `/admin/studio/change-one` |
| **Seed** | 6–8 |

### Folders

```text
components/studio/change/
  ChangeSession.tsx
  RequirementCard.tsx
  ChangeHighlighter.tsx
services/studio/change-one.service.ts
```

### Backend steps

1. Pack: baseline, requirement text, constraints.  
2. Submit: Diff vs baseline; flag modified existing elements; narrative.  
3. Admin CRUD + seed.

### Frontend steps

1. Show requirement + locked baseline reference.  
2. Highlight changes as user edits.  
3. Result: change count + unnecessary-change warnings.

### DoD

- Semantic-only diff; admin-authored scenarios playable end-to-end.

---

## F11. Architecture Evolution

| | |
|--|--|
| **Category** | Design Studio |
| **Phase** | 4 |
| **Depends on** | Versions, Diff |
| **Admin** | `/admin/studio/evolution` |
| **Seed** | 3–4 tracks |

### Folders

```text
components/studio/evolution/
  EvolutionTimeline.tsx
  StageRequirement.tsx
  EvolutionSession.tsx
services/studio/evolution.service.ts
models/studio/evolution-run.model.ts
```

### Backend steps

1. Template pack: ordered stages `{ label, requirements }`.  
2. Run model: current stage, version ids per stage.  
3. Advance stage → force version snapshot.  
4. Diff any two stages.  
5. Admin CRUD templates + seed tracks (Parking Lot, Ride-share, …).

### Frontend steps

1. Timeline UI; navigate stages.  
2. Open Diff between stages.  
3. Persist long runs; resume.

### DoD

- Multi-stage run survives refresh; admin can add track.

---

## F12. Design Replay (catalog + player)

| | |
|--|--|
| **Category** | Design Studio |
| **Phase** | 5 (capture was Phase 1) |
| **Depends on** | Replay events + diagram snapshots |
| **Admin** | Studio Tools (retention) |
| **Enables** | Community Watch (shared player) |

### Product rules

- Catalog lists **all saved diagrams** (including interview) with ≥2 nodes and ≥2 edges (no public/private gate).
- Responses show **title only** — never author name / userId.
- No challenges or questions — browse → search → replay.
- Share `replayEnabled` remains Gallery-only; Design Replay ignores it.

### Folders

```text
components/studio/replay/
  ReplayCatalog.tsx
  ReplayPlayer.tsx
  ReplayTimeline.tsx
  ReplayControls.tsx
  ReplayCanvas.tsx
lib/graph/replayApply.ts
controllers/studio/replay.controller.ts
app/design-studio/replay/page.tsx
app/design-studio/replay/[id]/page.tsx
app/features/design-replay/page.tsx
```

### Backend steps

1. `GET /studio/replay/catalog?q=&page=&limit=` → title-only items + eventCount.  
2. `GET /studio/replay/:diagramId` → `{ title, diagramData, events }` (no owner fields).  
3. Owner write path unchanged: `POST /artifacts/:id/replay/events`.  
4. Capture payloads include position + node/edge data for reconstruction.

### Frontend steps

1. Catalog hub with search + pagination.  
2. Player: play/pause, scrub, speed, timeline, canvas reconstruction.  
3. Editor History tab reuses `ReplayPlayer`.  
4. Feature registry href → `/design-studio/replay`.

### SEO / DoD

- SEO: `/features/design-replay`  
- DoD: browse any saved design by title; replay reconstructs from semantic events (legacy events fall back to final snapshot on last step).

---

## F13. UML ↔ Code — REMOVED

Learn/admin routes, generate API, and workspace UI removed. Editor **Code** panel (run code) is unrelated and kept.

---

## F14. Daily Quiz + Leaderboard

| | |
|--|--|
| **Category** | Learn & Practice |
| **Phase** | 7 (can parallelize earlier after Phase 0) |
| **Depends on** | Auth, XP models |
| **Admin** | `/admin/learn/quiz` |
| **Seed** | 60–100 questions; 14+ daily sets |

### Folders

```text
components/learn/quiz/
  QuizRunner.tsx
  QuizQuestionCard.tsx
  LeaderboardTable.tsx
  StreakBadge.tsx
models/learn/quiz-question.model.ts
models/learn/daily-quiz-set.model.ts
models/learn/quiz-attempt.model.ts
services/learn/quiz.service.ts
controllers/admin/learn/quiz.controller.ts
scripts/seed-learn-quiz.ts
app/learn/quiz/page.tsx
app/admin/learn/quiz/page.tsx
app/features/daily-lld-quiz/page.tsx
```

### Backend steps

1. Question CRUD fields: topic, difficulty, choices, correctIndex, explanation.  
2. Daily set: date → questionIds (5).  
3. Attempt + score + streak update on PracticeStats or new XP collection.  
4. Leaderboard weekly/monthly aggregations (cached).  
5. Admin CRUD + schedule + seed.  
6. Rate limits.

### Frontend steps

1. Quiz runner with timer.  
2. Results + explanations.  
3. Leaderboard tab.  
4. Hub card with streak.

### DoD

- Admin adds question → appears in future daily set; E2E complete quiz.

---

## F15. Design Pattern Detective

| | |
|--|--|
| **Category** | Learn & Practice |
| **Phase** | 7 |
| **Depends on** | Challenge session patterns |
| **Admin** | `/admin/learn/detective` |
| **Seed** | 15–20 scenarios (incl. traps / “none”) |

### Folders

```text
components/learn/detective/
  DetectiveSession.tsx
  ScenarioPrompt.tsx
  PatternChoices.tsx
services/learn/detective.service.ts
scripts/seed-learn-detective.ts
```

### Backend steps

1. Scenario model: mode, stem, answer (pattern key or `none`), explanation, optional UML.  
2. Start/submit/grade.  
3. Admin CRUD + seed.

### Frontend steps

1. Modes UX; optional mini-canvas.  
2. Feedback screen emphasizing trade-offs.

### DoD

- At least 3 “no pattern needed” traps in seed.

---

## F16. Architecture Mashup

| | |
|--|--|
| **Category** | Learn & Practice |
| **Phase** | 7 |
| **Depends on** | Problems seeds / packs |
| **Admin** | `/admin/learn/mashup` |
| **Seed** | 10 curated mashups |

### Folders

```text
components/learn/mashup/
  MashupPicker.tsx
  MashupBrief.tsx
  MashupSession.tsx
services/learn/mashup.service.ts
scripts/seed-learn-mashup.ts
```

### Backend steps

1. MashupRecipe: problemA, problemB, briefTemplate.  
2. Start → create attempt + optional blank artifact.  
3. Admin CRUD; disable randomizer until recipes mature.

### Frontend steps

1. Show A + B → generated brief → Start Challenge → editor/studio session.  
2. Submit optional (design save).

### DoD

- Curated mashups only at GA; admin can add pair.

---

## F17. LLD Roguelike

| | |
|--|--|
| **Category** | Learn & Practice |
| **Phase** | 7 (late in phase) |
| **Depends on** | Session runtime, modifiers DSL |
| **Admin** | `/admin/learn/roguelike` |
| **Seed** | 1 run config + 8–12 modifiers |

### Folders

```text
components/learn/roguelike/
  RoguelikeRun.tsx
  ModifierChips.tsx
  LevelProgress.tsx
lib/learn/roguelike/
  seedRng.ts
  applyModifiers.ts
services/learn/roguelike.service.ts
scripts/seed-learn-roguelike.ts
```

### Backend steps

1. Models: RoguelikeConfig, Modifier, Run (seed, level, state).  
2. Start run with seed; advance level; boss.  
3. Admin CRUD modifiers + config.  
4. Seed baseline.

### Frontend steps

1. Run UI with levels; show active modifiers.  
2. Share seed link.  
3. Fail/retry states.

### DoD

- Same seed → same modifier sequence; admin can add modifier.

---

## F18. Community Design Gallery

| | |
|--|--|
| **Category** | Community |
| **Phase** | 8 |
| **Depends on** | Publish pipeline, Artifact |
| **Admin** | `/admin/community/gallery` |
| **Seed** | optional staff designs |

### Folders

```text
components/community/gallery/
  GalleryGrid.tsx
  GalleryFilters.tsx
  DesignCard.tsx
app/community/page.tsx
app/community/d/[slug]/page.tsx
services/community/publish.service.ts
models/community/published-design.model.ts
controllers/admin/community/gallery.controller.ts
```

### Backend steps

1. Publish from artifact → slug, visibility, thumbnail, metadata.  
2. List/filter public designs.  
3. Design detail payload (UML, decisions, versions summary).  
4. Admin: feature, unpublish, hide.  
5. Sitemap entries for public slugs.

### Frontend steps

1. Community hub + filters.  
2. Design page with CTAs: Watch, Fork, Open.  
3. SEO metadata on design pages.

### DoD

- Publish → appears in gallery; admin can unpublish.

---

## F19. Design Forks

| | |
|--|--|
| **Category** | Community |
| **Phase** | 8 |
| **Depends on** | Publish, Diff, Artifact clone |
| **Admin** | metrics in gallery admin |

### Folders

```text
components/community/forks/
  ForkButton.tsx
  ForkTree.tsx
  ForkCompare.tsx
services/community/fork.service.ts
```

### Backend steps

1. `POST /community/d/:slug/fork` → clone artifact with `forkParentId`.  
2. Fork tree query.  
3. Compare via Diff API.

### Frontend steps

1. Fork → open Design Workspace.  
2. Forks tab on design page.  
3. Compare to parent.

### DoD

- Lineage preserved; Diff vs parent works.

---

## F20. Watch Someone's Design

| | |
|--|--|
| **Category** | Community |
| **Phase** | 8 |
| **Depends on** | Replay player (Phase 5), published design with replay |
| **Admin** | gallery tools |

### Folders

```text
components/community/watch/
  WatchPageClient.tsx
app/community/d/[slug]/watch/page.tsx
```

### Backend steps

1. Allow replay read when design is public and `replayEnabled`.  
2. Reuse replay GET with published auth rules.

### Frontend steps

1. Embed ReplayPlayer in watch route.  
2. Author attribution + fork CTA.

### DoD

- Public watch works logged-out; private designs 404.

---

## F21. Alternative Solutions

| | |
|--|--|
| **Category** | Community |
| **Phase** | 8 |
| **Depends on** | Gallery, Diff |
| **Admin** | `/admin/community/alternatives` |
| **Seed** | 3 problems × 2–3 curated alts |

### Folders

```text
components/community/alternatives/
  AlternativesCompare.tsx
  ApproachCard.tsx
models/community/alternative-group.model.ts
scripts/seed-community-alternatives.ts
app/admin/community/alternatives/page.tsx
app/features/alternative-solutions/page.tsx
```

### Backend steps

1. Group model: problemId, approaches[{ publishedDesignId, label, blurb }].  
2. Public GET by problem.  
3. Admin CRUD + seed staff designs + groups.

### Frontend steps

1. Compare matrix (classes, complexity, extensibility — editorial fields).  
2. Link into gallery designs.  
3. No “winner” language.

### DoD

- Admin can attach a new published design to a group without deploy.

---

## Cross-cutting checklist (every feature)

Copy into PR description:

- [ ] Files under correct `studio|learn|community|artifact|graph` folders (no god-files)  
- [ ] Thin `page.tsx` + focused components  
- [ ] Service layer for business logic  
- [ ] Admin tab or explicit “tools-only” note  
- [ ] Seed script if content-driven (idempotent slug upsert)  
- [ ] SEO page under `/features/...` + CrossLinks in category  
- [ ] Analytics events registered  
- [ ] Plan gate wired via feature-registry  
- [ ] Loading / empty / error / resume  
- [ ] Unit + API + one E2E path  
- [ ] Mobile: sheet/panel or MobileEditorGuard behavior defined  

---

## Suggested first vertical slice (ship)

1. Phase 0 + 1  
2. F1 Microscope + F2 Dependency Web + F5 Design Score  
3. SEO pages for those four  
4. Admin Score + Studio Tools tabs  

Then Phase 3 Debugger (proves admin challenge CMS end-to-end).

---

*End of per-feature implementation guide. Architecture decisions remain in `INTERACTIVE_LLD_EXPANSION_PLAN.md`.*
