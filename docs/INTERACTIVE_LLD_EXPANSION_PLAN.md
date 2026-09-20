# Interactive LLD Expansion — Full Architecture & Implementation Plan

Companion to the interactive canvas overview. Spec source: `docs/LLDCanvas — Interactive LLD Feature Specification.md`.

**Per-feature step-by-step engineering guide:** `docs/INTERACTIVE_LLD_PER_FEATURE_IMPLEMENTATION.md` (phases, folders, backend→frontend→admin→seed→tests for every feature).

**Constraint:** These experiences must **not** become ordinary Dashboard modules. Dashboard remains a library/ownership hub.

**Product categories (from the spec):** interactive work is organized under three top-level experiences â€” **Design Studio**, **Learn & Practice**, and **Community** â€” plus the in-editor **Design Workspace** for tools that operate on the userâ€™s current design.

---

## Category map

| Category | Spec section | Features | Hub route |
|----------|--------------|----------|-----------|
| **Design Studio** | Â§3 (+ History tools Â§6â€“7) | Design Debugger, Refactoring Mode, Change One Thing, Architecture Evolution, Architecture Budget, Architecture Microscope, Dependency Web, UML Diff, Explain as Story, Design Replay, Design Decision Log | `/design-studio` |
| **Learn & Practice** | Â§4 | Design Pattern Detective, Daily Quiz + Leaderboard, Architecture Mashup, LLD Roguelike, UML â†” Code, Design Score | `/learn` |
| **Community** | Â§5 (+ Â§8) | Community Design Gallery, Watch Someone's Design, Design Forks, Alternative Solutions | `/community` |

> **Note:** Existing `/playground` stays the Draft Notation tryout. The new hub is **`/design-studio`** so the two are not confused.

**In-editor Design Workspace** (`/editor/[id]`): tabs Canvas | Analyze | Evolve | History | Share â€” hosts Design Studio tools that attach to the open design (Microscope, Dep Web, Score entry, Diff, Decisions, Replay, Publish). Standalone challenge runs still open from the Design Studio hub.

---

## A. Feature-by-feature technical analysis

### Shared premise

Every canvas-centric feature operates on a **Design Artifact** (evolved from todayâ€™s `Diagram` / `DiagramData`). Challenge modes (Debugger, Refactor, Change One Thing, Mashup, Roguelike) wrap that artifact in a **Challenge Session**. Community features wrap published artifacts with lineage (forks), replay, and social metadata.

**Reuse today:** React Flow editor, `useHistoryStack`, Draft Notation, CodePanel, Interview sessions, Collab sockets (later), problems API, `usePlan`, Feature SEO kit (`FeatureFaq`, `FeatureCrossLinks`, JsonLd), `useAnalytics`.

---

### A.1 Design Debugger â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **Problem** | Users can draw UML but cannot critically *read* flawed architecture. |
| **Journey** | SEO page â†’ Design Studio â†’ load authored broken design â†’ mark issues â†’ submit â†’ reveal. |
| **FE** | `/design-studio/debugger/[sessionId]` |
| **BE** | Challenge packs CRUD (admin), start/submit/grade attempt. |
| **Data** | `ChallengePack`, `ChallengeAttempt`. |
| **Risks** | Subjective grading â€” allow partial credit + valid-alternative flags. |
| **Analytics** | `debugger_session_start/complete/abandon`, `issue_marked`, `reveal_viewed`. |

### A.2 Refactoring Mode â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **Journey** | Split canvas: locked original \| editable copy â†’ submit â†’ explained before/after deltas. |
| **FE** | `/design-studio/refactor/[sessionId]` |
| **Deps** | Diff, Score, Challenge Session. |

### A.3 Change One Thing â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **FE** | `/design-studio/change/[sessionId]` |
| **Core** | Baseline + requirement card + semantic Diff + unnecessary-change detection. |

### A.4 Architecture Evolution â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **FE** | `/design-studio/evolution/[runId]` |
| **Data** | `EvolutionRun` â†’ ordered `ArtifactVersion[]`. |

### A.5 Architecture Budget â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **FE** | Evolve tab overlay and/or `/design-studio/budget` on a design. |
| **Core** | Live cost model on graph ops; versioned cost tables. |

### A.6 Architecture Microscope â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **Impl** | Client graph kernel in Design Workspace **Analyze** panel (lowest-risk Design Studio win). |

### A.7 Dependency Web â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **Core** | Alternate graph layout; cycles, hubs, impact radius; virtualize large graphs. |

### A.8 UML Diff â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **Foundation** | Must ship early â€” Evolution, Change One, Refactor, Forks depend on it. |
| **Risk** | Stable `elementId` UUIDs required. |

### A.9 Explain This Design as a Story â€” *Design Studio*

| Area | Requirement |
|------|-------------|
| **Core** | Graph-walk narration + highlights; templates first, optional LLM polish later. |

### A.10 Design Score â€” *Learn & Practice*

| Area | Requirement |
|------|-------------|
| **FE** | `/learn` entry + Design Workspace Analyze (shared engine). |
| **Principle** | Feedback â‰  absolute quality. |

### A.11 Design Pattern Detective â€” *Learn & Practice*

| Area | Requirement |
|------|-------------|
| **FE** | `/learn/detective/[id]` |
| **Modes** | Identify / Detect / Explain / Pattern Trap. |

### A.12 Daily Quiz + Leaderboard â€” *Learn & Practice*

| Area | Requirement |
|------|-------------|
| **FE** | `/learn/quiz` |
| **Indep** | Can ship early in parallel. |

### A.13 Architecture Mashup â€” *Learn & Practice*

| Area | Requirement |
|------|-------------|
| **FE** | `/learn/mashup/[id]` |
| **Risk** | Curated combinator rules before full RNG. |

### A.14 LLD Roguelike â€” *Learn & Practice*

| Area | Requirement |
|------|-------------|
| **FE** | `/learn/roguelike/[runId]` |
| **Deps** | Session runtime + modifiers DSL â€” late phase. |

### A.15 UML â†” Code â€” *Learn & Practice*

| Area | Requirement |
|------|-------------|
| **FE** | `/learn/uml-code` and/or editor panel; TS/Java first. |

### A.16 Community Design Gallery â€” *Community*

| Area | Requirement |
|------|-------------|
| **FE** | `/community`, `/community/d/[slug]` |

### A.17 Watch Someone's Design â€” *Community*

| Area | Requirement |
|------|-------------|
| **Deps** | Design Replay (Design Studio History). |
| **FE** | `/community/d/[slug]/watch` |

### A.18 Design Forks â€” *Community*

| Area | Requirement |
|------|-------------|
| **Core** | Clone with `parentId`, Diff vs parent, fork tree. |

### A.19 Design Replay â€” *Design Studio (History)*

| Area | Requirement |
|------|-------------|
| **FE** | Design Workspace History tab; powers Community Watch. |

### A.20 Design Decision Log â€” *Design Studio (History)*

| Area | Requirement |
|------|-------------|
| **Core** | Annotate elements with why / alternatives / trade-offs. |

### A.21 Alternative Solutions â€” *Community*

| Area | Requirement |
|------|-------------|
| **Deps** | Gallery + Diff. |

---

## B. Product architecture

```text
Public SEO                         Authenticated product
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/features/* (grouped by category)
        â”‚
        â”œâ”€â–º /design-studio     Design Studio hub + challenge modes
        â”‚         â””â”€â–º /editor/[id] Design Workspace (Analyze|Evolve|History|Share)
        â”‚
        â”œâ”€â–º /learn                 Learn & Practice hub
        â”‚
        â””â”€â–º /community             Gallery / Watch / Forks / Alternatives
                  â””â”€â–º /community/d/[slug]

/dashboard                         Library only (My Diagrams, Sessions, Stats, â€¦)
/playground                        Existing Draft Notation tryout (unchanged)
```

**Three category hubs (replaces the earlier single â€œLabâ€ concept):**

1. **Design Studio (`/design-studio`)**
2. **Learn & Practice (`/learn`)**
3. **Community (`/community`)**

---

## C. User access & navigation

### Public discovery

| Surface | Action |
|---------|--------|
| Homepage | Three section cards: Design Studio / Learn & Practice / Community |
| `/features` | Ledger **grouped into the same three categories** |
| `/features/{slug}` | CTA into the matching hub |
| Navbar | Features, Learn, Community + existing Playground (Draft Notation), Pricing, Docs |
| Sitemap | `/features/*` + `/community` (+ published designs) |
| Robots | Disallow `/design-studio/`, `/learn/` session paths, `/dashboard/`, `/editor/` â€” allow public `/community` |

### Authenticated (AppShell)

| Group | Items |
|-------|-------|
| **Experiences** | Design Studio Â· Learn & Practice Â· Community |
| Workspace | My UML Diagrams |
| Practice (existing) | Interview Mode, Sessions, Stats, Collaborations |
| Library | Problems, Revision |

### Cross-discovery

Category hubs + contextual chips + FeatureCrossLinks â€” never a 21-item sidebar.

---

## D. SEO architecture

Reuse existing FeatureFaq / FeatureCrossLinks / JsonLd kit.

### Per-feature pages (by category)

**Design Studio:** `/features/design-debugger`, `refactoring-mode`, `change-one-thing`, `architecture-evolution`, `architecture-budget`, `architecture-microscope`, `dependency-web`, `uml-diff`, `explain-design`, `design-replay`, `design-decision-log`

**Learn & Practice:** `/features/design-score`, `uml-to-code`, `design-pattern-detective`, `daily-lld-quiz`, `architecture-mashup`, `lld-roguelike`

**Community:** `/features/design-gallery`, `alternative-solutions`, plus hub `/community`

**CTA copy:** â€œOpen in Design Studioâ€ / â€œTry in Learn & Practiceâ€ / â€œBrowse Communityâ€.

---


## E. Shared infrastructure (build once)

| System | Purpose |
|--------|---------|
| **DesignArtifact** + stable element IDs | Shared object model |
| **Graph Analysis Kernel** | Microscope, Dep Web, Score, Budget, Story |
| **Structural UML Diff** | Evolution, Change, Refactor, Forks |
| **Version / Snapshot store** | Evolution, Diff, Replay checkpoints |
| **Replay Event Bus** | Replay + Watch |
| **Challenge Session runtime** | Debugger, Refactor, Change, Mashup, Roguelike |
| **Content Pack schema** | Debugger, Detective, Quiz, Mashup |
| **Feature Registry** | id, **category**, routes, plan gate, flags |
| **Category Workspace Shell** | Shared chrome for `/design-studio/*` and `/learn/*` |
| **Admin CMS (Interactive)** | Full CRUD tabs per content-driven feature (same patterns as Problems/Blog/Revision) |
| **Seed scripts** | Bootstrap challenges/questions/configs; admin edits thereafter |
| **Publish + Moderation** | Community |
| **XP / Streak / Leaderboard** | Learn & Practice |
| **Plan gates + analytics** | Prefixed by category |

---

## E2. Admin dashboard — full control for every new feature

Mirror the existing admin model (`AdminShell` + pages like `/admin/problems`, `/admin/revision`, `/admin/blog`): list/filter/search, create/edit, bulk delete, ConfirmModal, draft/published/archived, and **seed scripts for day-one content**. After seeding, admins add or edit everything from these tabs — no code deploy required for new challenges.

**Principle:** Authored content → full Admin CRUD tab. Tool-only features (Microscope, Dep Web, Diff, Replay player) → **config + analytics + flags** tab.

### AdminShell nav (new groups)

```text
… existing (Users, Diagrams, Sessions, Problems, Revision, Collab, Code, Billing, CMS …)

── Interactive · Design Studio ──
Debugger                 /admin/studio/debugger
Refactoring              /admin/studio/refactor
Change One Thing         /admin/studio/change-one
Evolution                /admin/studio/evolution
Budget Config            /admin/studio/budget
Studio Tools             /admin/studio/tools          (Microscope / Dep Web / Diff / Story / Replay flags + usage)

── Interactive · Learn ──
Design Score Config      /admin/learn/score
Quiz                     /admin/learn/quiz
Pattern Detective        /admin/learn/detective
Mashup                   /admin/learn/mashup
Roguelike                /admin/learn/roguelike
UML ↔ Code Config        /admin/learn/uml-code

── Interactive · Community ──
Gallery Moderation       /admin/community/gallery
Reports                  /admin/community/reports
Alternative Solutions    /admin/community/alternatives
```

### Admin routes, capabilities, and seed volumes

| Admin route | What admin controls | Seed at launch (minimum) |
|-------------|---------------------|--------------------------|
| `/admin/studio/debugger` | CRUD packs: title, difficulty, UML snapshot, expected issues (element + category + explanation), hints, plan gate, publish | **8–12** challenges |
| `/admin/studio/refactor` | Broken baseline UML, constraints, optional rubric checklists | **6–8** challenges |
| `/admin/studio/change-one` | Baseline UML, new requirement, constraints, optional golden hints | **6–8** scenarios |
| `/admin/studio/evolution` | Multi-stage templates (year labels, requirements, starter UML) | **3–4** tracks |
| `/admin/studio/budget` | Cost tables (interface/pattern/dependency), activate version | **1** default table |
| `/admin/studio/tools` | Flags, limits, usage metrics for tool features | Config only |
| `/admin/learn/score` | Heuristic weights, dimension copy, version | **v1** weight set |
| `/admin/learn/quiz` | Questions, daily sets, leaderboard tools | **60–100** Qs; **14+** days of 5Q sets |
| `/admin/learn/detective` | Scenarios + modes (incl. “no pattern”) | **15–20** scenarios |
| `/admin/learn/mashup` | Curated problem pairs + brief templates | **10** mashups |
| `/admin/learn/roguelike` | Modifiers, base problems, level curves | **1** run config + **8–12** modifiers |
| `/admin/learn/uml-code` | Languages, skeleton templates | **TS + Java** templates |
| `/admin/community/gallery` | Unpublish / hide / feature published designs | Tools ready |
| `/admin/community/reports` | Abuse/spam queue | Tools ready |
| `/admin/community/alternatives` | Groups of approaches per problem + trade-off blurbs | **3** problems × **2–3** alts |

### Shared admin UX (reuse existing)

- AdminShell, responsive tables, BulkActionBar, ConfirmModal  
- `admin-api.ts` + `requireAdmin` backend routes  
- Status: `draft` | `published` | `archived`  
- Preview: “Open as user” deep link into Design Studio / Learn  
- Optional link to existing `Problem` via `problemId`

### Content models (admin-editable)

```text
StudioChallengePack   type: debugger | refactor | change_one | evolution
QuizQuestion / DailyQuizSet
DetectiveScenario
MashupRecipe
RoguelikeConfig + RoguelikeModifier
BudgetCostTable
ScoreHeuristicConfig
CommunityReport / moderation actions
AlternativeSolutionGroup
```

### Seeding strategy

1. Scripts under `backend/src/scripts/seed-studio-*.ts`, `seed-learn-quiz.ts`, etc. (same style as `seed-problems.ts`).  
2. Seeds upsert by **slug** (idempotent).  
3. Seeded items ship **published** so hubs are not empty on day one.  
4. Ongoing content = **Admin only**.

### Admin API pattern

```text
GET/POST     /admin/studio/debugger
GET/PATCH/DELETE /admin/studio/debugger/:id
POST         /admin/studio/debugger/:id/publish
POST         /admin/studio/debugger/bulk-delete
… same for refactor, change-one, evolution, quiz, detective, mashup, roguelike …
GET/PATCH    /admin/studio/budget/active
GET/PATCH    /admin/learn/score/config
GET          /admin/community/gallery
POST         /admin/community/gallery/:id/feature|unpublish
```

### Ship admin with the feature

| User-facing ship | Admin must ship same phase |
|------------------|----------------------------|
| Debugger / Refactor / Change / Evolution | Matching `/admin/studio/*` + seeds |
| Quiz / Detective / Mashup / Roguelike | Matching `/admin/learn/*` + seeds |
| Budget / Score | Config tabs |
| Gallery / Alts | Moderation + Alternatives |
| Microscope / Diff / Replay | `/admin/studio/tools` only |

---

## F. Phase roadmap

| Phase | Objective |
|-------|-----------|
| **0** | Artifact, three hubs, registry, SEO template, flags, **AdminShell Interactive nav + challenge-pack scaffold** |
| **1** | Graph kernel, UML Diff, versions, replay capture |
| **2** | Studio Understand + Design Score + **admin Score / Budget / Tools tabs** |
| **3** | Debugger, Refactor + **admin CRUD + seeds** |
| **4** | Change One Thing, Evolution + **admin CRUD + seeds** |
| **5** | Replay polish → Watch; studio tools analytics |
| **6** | UML ↔ Code + **admin uml-code config** |
| **7** | Quiz, Detective, Mashup, Roguelike + **admin CRUD + large seeds** |
| **8** | Community + **gallery / reports / alternatives admin** |

**First shippable slice:** Phases 0–2 with admin config tabs; each content feature ships with its admin tab + seeds.

---

## G. Phase 0 concrete steps

1. `DesignArtifact` schema + `elementId` backfill  
2. Artifact APIs  
3. `feature-registry.ts` with categories  
4. Hub pages + AppShell Experiences  
5. `CategoryShell` layout  
6. SEO template  
7. Analytics prefixes + flags  
8. **AdminShell Interactive nav groups** (stub pages OK)  
9. **Shared `StudioChallengePack` model** + generic admin list/edit scaffold  

---

## H. Dependency graph & build order

```text
Canvas → Artifact → Graph → Score/Microscope/DepWeb/Budget/Story
                 → Versions → Diff → Evolution/Change/Refactor/Forks
                 → Replay → Watch/Gallery
Sessions + Content → Debugger/Detective/Mashup/Roguelike
Admin CMS ⟷ Content (same phase as each content feature)
Publish → Gallery/Alts
```

**Order:** Artifact → Graph+Diff → hubs + SEO + **admin shell** → Studio Understand → Improve/Evolve (**+ admin + seeds**) → Learn (**+ admin + seeds**) → Community (**+ moderation admin**).

---

## I. Testing strategy

Unit · API (incl. **admin AuthZ**) · Component (hubs + **admin tables**) · E2E including **admin create → publish → user sees challenge** · Perf · A11y · Security · Visual.

---

## J. Definition of Done (per feature)

- [ ] Deep-linkable under the correct category hub  
- [ ] Empty / loading / error / resume  
- [ ] Plan gate + paywall analytics  
- [ ] Public SEO page + CrossLinks + CTA  
- [ ] Sitemap / robots  
- [ ] Analytics + Sentry (`featureId`, `category`)  
- [ ] Unit + API + one E2E  
- [ ] Design system consistency  
- [ ] Flagged rollout  
- [ ] **Admin tab live** (CRUD or config)  
- [ ] **Seed content** at volumes in §E2 (content features)  
- [ ] Admin can add/edit/publish **without a code deploy**  

---

## Design system note

Preserve `paper` / `ink` / `brand` / `hairline`. Hubs use product chrome. Admin stays on existing admin patterns (ConfirmModal, BulkActionBar, responsive tables). `/playground` = Draft Notation only; interactive category hub = **Design Studio**.

---

## Free vs paid (initial)

| Free | Pro+ | Ultimate / caps |
|------|------|-----------------|
| Microscope, Dep Web, Score lite, Decision Log, Daily Quiz | Debugger, Refactor, Change One, Evolution, Budget, Detective | Higher publish limits, Roguelike, more codegen languages |

---

*End of plan. Interactive overview: Cursor canvas `interactive-lld-expansion.canvas.tsx`.*
