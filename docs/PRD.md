# PRD: LLD-Aware UML Editor 
**Name:** LLDCanvas
**Tagline:** The fastest way to create UML diagrams for Low-Level Design interviews.

**Status:** Draft v1
**Owner:** Deepak
**Last updated:** July 2026

---

## 1. Problem Statement

Software engineers preparing for Low-Level Design (LLD) interviews (Amazon, Google, Microsoft, Flipkart, etc.) currently use generic diagramming tools like Draw.io or Lucidchart. These tools are shape-based, not design-based:

- Creating a class requires manually drawing a rectangle, adding text, resizing, and formatting.
- Relationships (inheritance, composition, aggregation) require manually picking arrow heads and rotating them.
- There is no concept of "class", "interface", "design pattern", or "multiplicity" — everything is a generic shape.
- Candidates spend a disproportionate amount of practice time fighting the tool instead of practicing the design.

**Core insight:** The editor should understand software design semantics (classes, interfaces, relationships, patterns), not just geometry.

---

## 2. Goals

- Reduce the time to draw a correct UML diagram from minutes to seconds.
- Make every common LLD construct (class, interface, enum, relationship, multiplicity, pattern skeleton) a single click or keystroke away.
- Build a focused V1 that is genuinely useful standalone (no AI dependency) — the editor itself is the product.
- Create a foundation that can later support AI-assisted design without re-architecting the core.

## 3. Non-Goals (V1)

- No AI-generated UML from text prompts.
- No real-time multiplayer collaboration.
- No code generation (UML → Java/C++).
- No built-in interview timer or interview simulation mode.
- No mobile app (web-first, desktop-first responsive).

---

## 4. Target Users / Personas

| Persona | Description | Needs |
|---|---|---|
| Interview candidate | SDE-1/2 preparing for LLD rounds | Fast diagramming, common problem templates, pattern skeletons |
| Interview prep content creator | Makes YouTube/blog content on LLD | Clean export (PNG/SVG), consistent visual style |
| Interviewer / mentor | Reviews candidate designs, does mock interviews | Shareable read-only links (later), quick annotation |

---

## 5. Positioning

> "The fastest way to create UML diagrams for Low-Level Design interviews."

Not "another diagram tool." Not "UML Editor" (too generic). The product competes with the **workflow** of every LLD candidate, not with Draw.io/Lucidchart as general-purpose tools.

Alternative taglines:
- "A UML canvas built for software engineers."
- "Create interview-ready UML diagrams in seconds, not minutes."

---

## 6. V1 Scope (MVP)

### 6.1 Screens

1. **Landing Page** — hero, features, login/signup.
2. **Authentication** — Google login (primary), email+password (optional).
3. **Dashboard** — "+ New Diagram", recent diagrams grid (title + thumbnail), search.
4. **UML Editor** — the core product.
5. **Account / Profile** — minimal settings (name, email, logout, delete account).

### 6.2 Editor: Core Building Blocks

**Class Types**
- Class
- Abstract Class
- Interface (`<<interface>>`)
- Enum
- Record (optional, stretch)
- Exception (stretch)

**Relationships**
- Association
- Aggregation (hollow diamond)
- Composition (filled diamond)
- Inheritance (hollow triangle arrow)
- Realization (dashed line + hollow triangle)
- Dependency (dashed arrow)
- Bidirectional association
- Self-association

**Multiplicity**
- Draggable labels: `1`, `0..1`, `1..*`, `0..*`, `m..n` — snap onto either end of a relationship line.

**Class Anatomy**
- Visibility markers: `+` public, `-` private, `#` protected, `~` package.
- Static members (underlined).
- Abstract methods (italicized).
- Constructors / destructors.
- Method signatures with params + return types.
- Generic/template class support (e.g., `Repository<T>`).
- Attributes and notes.
- Packages (grouping/containers).
- Stereotypes and constraints (e.g., `<<singleton>>`).

### 6.3 One-Click / One-Keystroke Interactions

| Action | Input |
|---|---|
| Add Class | Click "+ Class" or press `C` |
| Add Interface | Press `I` |
| Add Enum | Press `E` |
| Add Abstract Class | Press `A` |
| Delete | `Delete` |
| Duplicate | `Ctrl+D` |
| Copy / Paste | `Ctrl+C` / `Ctrl+V` |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Shift+Z` |
| Command palette (quick insert) | `Ctrl+K` |

**Smart Connectors:** drag from one class to another, then pick the relationship type from a small radial/inline menu. The correct arrowhead, direction, and line style are drawn automatically — no manual arrow editing.

**Right-click context menu on a class:**
- Add Attribute
- Add Method
- Convert to Interface
- Convert to Abstract
- Add Constructor
- Add Generic Parameter
- Duplicate
- Delete

**Auto-behaviors:**
- Snap alignment (classes align to a grid / to each other automatically).
- Auto-resize (class box grows as attributes/methods are typed).
- Auto-formatted UML box (divider lines between name / attributes / methods) the instant a class is created — no manual formatting ever required.

### 6.4 Design Pattern Skeletons (Quick Insert) — 🔒 Premium (Pro plan)

Triggered via `Ctrl+K` command palette or a "Quick Templates" sidebar panel. Inserts a pre-wired, correctly-connected skeleton (not a solved interview problem):

- Singleton
- Factory
- Abstract Factory
- Strategy
- Observer
- Builder
- Decorator
- Adapter
- Proxy
- Facade

Example: typing `strategy` inserts an `<<interface>> Strategy` connected via realization to 2–3 concrete implementer stubs.

### 6.5 Common LLD Building Block Stereotypes

Pre-styled class variants (still just classes under the hood, but visually and semantically tagged):

`Repository`, `Service`, `Controller`, `DTO`, `Entity`, `Value Object`, `Factory`, `Builder`, `Singleton`, `Manager`, `Adapter`, `Proxy`, `Facade`.

### 6.6 LLD Problem Templates (New Diagram Screen)

Starter canvases for well-known interview problems (structure only, not full solutions — meant to save boilerplate, not solve the interview):

Parking Lot · Elevator System · Splitwise · Snake & Ladder · Chess · BookMyShow · ATM · Library Management System · Food Delivery · Ride Sharing · Cache (LRU/LFU) · Logger · Notification Service · Blank Canvas.

### 6.7 Canvas / UX

- Drag & drop (Figma-like feel).
- Zoom / pan.
- Light, Dark, and Whiteboard themes.
- Undo/redo history.

### 6.8 Export & Save

- Export: PNG, SVG.
- Export: PlantUML (high value — lets users paste into other tools/docs).
- Export: Mermaid (nice-to-have, not blocking V1).
- Autosave to cloud (per-user, tied to account).
- No-login local mode: allow trying the editor with browser local storage before requiring signup (reduces signup friction, converts on save/export).

---

## 7. Explicitly Out of Scope for V1

- ❌ AI diagram generation / AI review
- ❌ Interview timer / mock-interview mode
- ❌ Code generation from UML
- ❌ UML validity "checker" / linter
- ❌ Real-time multiplayer

---

## 8. Data Model

```
User
----
id
name
email
image
authProvider

Diagram
-------
id
userId (FK -> User.id)
title
thumbnail (generated PNG snapshot, for dashboard preview)
isTemplate (bool)   -- for LLD problem starter templates
createdAt
updatedAt

DiagramData
-----------
diagramId (FK -> Diagram.id)
json         -- full editor state: nodes, edges, positions, styles
version      -- schema version, for future migrations
```

Editor state is stored as a single JSON blob keyed by `diagramId`, which keeps autosave simple (debounce + PUT whole document). Version history (later) can be layered on by snapshotting this JSON on save.

---

## 9. Monetization (Post-V1)

| Plan | Includes |
|---|---|
| Free | Up to 20 diagrams, PNG export |
| Pro | Unlimited diagrams, **design pattern skeletons (quick insert)**, PlantUML/Mermaid export, version history, team sharing, AI suggestions (once built), premium templates |

Login-gating is intentional from day one — not for its own sake, but because it unlocks: cloud save, cross-device access, organizing diagrams into folders (e.g., "LLD Practice", "Design Patterns", "Interview Prep"), rename/duplicate/delete, and (later) shareable links.

---

## 10. Roadmap (Post-V1)

**Phase 2 — AI-assisted design (premium)**
- "Generate UML from this LLD problem statement."
- "Suggest missing classes/relationships."
- "Review my design" (critique against SOLID, common LLD pitfalls).
- "Explain why composition is better than inheritance here."
- UML → Java/C++/TypeScript code scaffolding.

**Phase 3 — Collaboration & sharing**
- Read-only and editable share links.
- Version history UI (diff between saves).
- Team/organization workspaces.

**Phase 4 — Community**
- Public gallery of solved LLD problems (crowd-sourced, moderated).
- Mock-interview mode with a timer and a problem-statement panel side-by-side with the canvas.

---

## 11. Success Metrics

- **Activation:** % of signups that create at least 1 diagram within first session.
- **Core loop speed:** median time to add a class + 2 relationships (target: under 15 seconds after V1 polish).
- **Retention:** % of users who return to edit or create a 2nd diagram within 7 days.
- **Export usage:** % of diagrams exported (proxy for diagrams actually being "finished" and used, e.g. shared in resumes/notes).
- **Template adoption:** % of new diagrams started from an LLD problem template vs. blank canvas.

---

## 12. Risks / Open Questions

- **Scope creep risk:** the "LLD-aware" vision (stereotypes, pattern skeletons, problem templates) is large — must resist building all of it before validating the core editor loop (class/interface/enum + relationships + export) is actually fast and delightful.
- **Differentiation risk:** Draw.io/Lucidchart have UML shape libraries too. The bet is entirely on *speed of interaction* (1-click vs 5-click) and *LLD-specific vocabulary* — if the one-click flows aren't dramatically faster in practice, the differentiation collapses.
- **Login friction:** requiring signup before any use could hurt top-of-funnel conversion — mitigated by allowing a no-login local-storage trial mode.
- **Rendering choice:** need to decide early between a canvas-based renderer (e.g., custom SVG/Canvas engine) vs. an existing diagramming library (e.g., tldraw, React Flow) — this decision materially affects how easy "smart connectors" and "auto-resize" are to build. Recommend prototyping the class-box + smart-connector interaction first, before committing to a rendering approach.

---

## 13. Tech Stack

- **Frontend:** Next.js + TypeScript, Tailwind CSS, shadcn/ui for UI chrome (dialogs, dropdowns, sidebar panels, command palette). React Flow (or a custom SVG/Canvas layer) for the diagram surface itself — needs a spike (see Section 14) since shadcn/Tailwind cover chrome, not the canvas engine.
- **Backend:** Node.js + Express — REST API, roughly: `/auth/*` (via Better Auth), `/diagrams` (list/create), `/diagrams/:id` (get/update/delete), `/diagrams/:id/export`.
- **Database:** MongoDB. Maps naturally onto the JSON-document data model in Section 8 — a `Diagram` document can embed `diagramData` (nodes/edges/styles) directly instead of a separate table/join, simplifying autosave to a single `updateOne`.
- **Auth:** Better Auth, with Google OAuth as the primary provider and email+password as optional/secondary, per Section 6.1.
- **Thumbnails:** generate PNG snapshot client-side on save, upload to a blob store (e.g., S3-compatible) or just store as base64 in Mongo initially if size stays small, and move out later if needed.

### 13.1 Updated Data Model (Mongo-shaped)

```
users (collection)
-----------------
_id
name
email
image
authProvider

diagrams (collection)
----------------------
_id
userId          -- ref -> users._id
title
thumbnail       -- URL or base64
isTemplate      -- bool, for LLD problem starter templates
diagramData: {
  version,
  nodes: [...],
  edges: [...],
  meta: { theme, zoom, ... }
}
createdAt
updatedAt
```

Embedding `diagramData` inside the `diagrams` document (rather than a separate `DiagramData` collection) fits Mongo's strengths and keeps autosave a single write. Only split it out into its own collection later if diagram documents start approaching Mongo's 16MB document size limit (unlikely for UML diagrams, but worth a note if diagrams grow very large).

---

## 13.2 Rendering & Canvas Engine (Decided)

**Engine:** React Flow (`@xyflow/react`) as the core canvas — not a custom-built SVG/Canvas layer from scratch. It already handles pan/zoom, drag, hit-testing, connection-dragging, and selection; the only things worth custom-building are the UML-specific node and edge types.

**Class boxes (nodes):**
- Custom node component styled with Tailwind/shadcn — a `div` with three stacked sections (name / attributes / methods), divided by borders, matching real UML notation.
- Inline editing via shadcn `Input`/`Textarea`.
- Auto-resize: attach a `ResizeObserver` to the node's content; on resize, call `useUpdateNodeInternals()` so edges stay correctly anchored as the box grows.
- Invisible connection handles on all 4 sides of the box; dragging between two classes triggers React Flow's `onConnect`, which is where the Association/Aggregation/Composition/Inheritance picker appears before the edge is actually created.

**Connectors (edges):**
- Custom SVG markers defined globally for UML notation not covered by React Flow defaults: hollow triangle (inheritance/realization), filled diamond (composition), hollow diamond (aggregation).
- One custom edge component per relationship type, built on React Flow's `getSmoothStepPath` (orthogonal routing — reads closer to real UML tools than a bezier curve):
  - Association → plain line, no marker
  - Aggregation → hollow diamond at the "whole" end
  - Composition → filled diamond at the "whole" end
  - Inheritance → hollow triangle at the parent end
  - Realization → hollow triangle + dashed line
  - Dependency → thin dashed line, open arrowhead
- Multiplicity labels rendered via edge `label` (foreignObject), draggable along the path.

**Smoothness / feel:**
- `snapToGrid` + `snapGrid` turned on for basic alignment.
- Figma-style alignment guides: during `onNodeDrag`, compare dragged node's x/y/edges against other nodes within a few px tolerance; render temporary dashed guide lines and snap when close. Not built into React Flow — custom, but high value for the "premium" feel.
- Command palette (`Ctrl+K`) via shadcn's `Command` component.
- Undo/redo: React Flow state is just `nodes`/`edges` arrays — implement as a debounced history stack of snapshots.
- Copy/paste: clone selected nodes/edges with new IDs and a position offset.

**Build-order recommendation:** before building out the rest of the editor, spend ~1 day proving the riskiest interaction end-to-end: class box → drag connector → pick relationship type → correct marker renders → box auto-resizes on new method → edge stays attached. If this feels smooth, the remaining editor work is largely assembly of established patterns on top of it.

## 14. Open Decisions Before Build

1. ~~Confirm rendering engine~~ — **Resolved:** React Flow, see Section 13.2.
2. ~~Confirm whether no-login trial mode is in V1 or deferred to V1.1.~~ — **Resolved:** in V1, as Phase 9 of the Implementation Plan (`/editor/local` with localStorage persistence, converting to a cloud diagram on sign-in). This is what the Landing Page CTA ("Start for free — no account needed") in Section 6.1/Step 1.6 depends on, so it can't be deferred without also changing the landing page flow.
3. ~~Decide final list of pattern skeletons for Pro launch~~ — **Resolved:** ship all 10 (not trimmed to 5). See Implementation Plan Phase 8.1 for rationale — a pattern skeleton is a fixed-shape JSON file plus a command-palette entry, so the marginal cost of the other 5 is low once the insertion mechanism exists.
4. ~~Decide final list of V1 LLD problem templates~~ — **Resolved:** trim to top 5 (Parking Lot, Elevator, ATM, BookMyShow, LRU Cache) for V1; remaining 9 (Splitwise, Snake & Ladder, Chess, Library Management, Food Delivery, Ride Sharing, Cache/LFU variant, Logger, Notification Service) are V1.1 follow-up. See Implementation Plan Phase 8.3 — unlike pattern skeletons, each template carries real per-problem content cost (correctly-named, correctly-related classes), so trimming here actually saves build time.