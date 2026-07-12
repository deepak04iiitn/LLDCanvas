# LLDCanvas — Detailed Implementation Plan
**Phase-by-phase, step-by-step build guide**
**Stack:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · React Flow · Node.js · Express · MongoDB · Better Auth

---

## Guiding Principles

1. **Canvas-first.** The infinite canvas is the product. Every UX decision should make the canvas feel faster and more native.
2. **Riskiest thing first.** Prove the core interaction (class box → drag connector → relationship picker → marker renders → auto-resize) before anything else.
3. **No premature abstraction.** Each phase ships something usable and testable before the next phase begins.
4. **UI philosophy:** Minimal chrome, maximum canvas. Think Figma — dark toolbar, floating panels, infinite white/dark canvas.

---

## UI Quality Standard — Non-Negotiable

> **The UI must feel soothing and frictionless at every pixel. Zero visual dissonance. Ever.**

This applies to every component, every state, every transition throughout the entire build. Treat this as a hard constraint, not a suggestion.

### What "soothing" means in practice

**Motion & transitions**
- Every element that appears, disappears, or changes state must transition — never snap instantly.
- Standard duration: `150ms` for micro-interactions (tooltips, button hover), `200ms` for panels opening, `250ms–300ms` for modals and dialogs.
- Easing: always `ease-out` for things entering the screen, `ease-in` for things leaving. Never linear.
- Use `transition-all duration-200 ease-out` as the baseline Tailwind class on interactive elements.
- Node appearing on canvas: scale from `0.92` → `1.0` + fade in (`opacity-0` → `opacity-100`) over `180ms`.
- Relationship picker popover: scale from `0.95` + fade over `150ms`.
- Panels (left sidebar open/close): slide in/out with `transform: translateX()` — never toggle `display`.

**Color harmony**
- No hard black (`#000000`) anywhere in the UI — use `#111827` (gray-900) or darker grays.
- No pure white (`#FFFFFF`) on backgrounds — use `#F8F8F8` (light) or `#FAFAFA`.
- Borders are always a single step lighter/darker than the background — never jarring.
- Shadows are soft: `shadow-sm` or `shadow-md` only. Never `shadow-xl` on UI chrome (only modals, max).
- Accent color (`#6366F1`) used sparingly — for selected state, active indicators, primary CTAs only.
- Secondary actions use neutral grays, never a competing accent.

**Typography**
- Line height on all body text: `1.5` minimum. Never cramped.
- Letter spacing on uppercase labels: `tracking-wide` or `tracking-wider`.
- No font size below `11px` anywhere in the product.
- Node attribute/method text: `12px` monospace — tight but readable.
- Headings, labels, and body text must come from the same font family — no mixing.

**Spacing & layout**
- Consistent 4px grid for all spacing (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, etc. — never odd values like `p-[5px]`).
- All interactive elements have at least `32px` hit area (even if visually smaller).
- Dividers between sections use `border-gray-100` (light) / `border-gray-800` (dark) — the lightest visible line.
- Empty states are never blank — always show a gentle illustration or a helpful nudge.

**Interactive feedback**
- Every clickable element has a `hover:` style — no element should feel inert.
- Every button has a `active:scale-[0.97]` press feel.
- Focus rings: `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` — visible for keyboard users, invisible otherwise.
- Loading states: use skeleton loaders (pulse animation), never spinners on page-level loads.
- Error states: soft red (`#FEF2F2` bg, `#EF4444` text) — not harsh, communicates clearly.

**Canvas-specific**
- Cursor changes contextually: `default` → `grab` (space held) → `grabbing` (panning) → `crosshair` (drawing connector) → `pointer` (hovering interactive element).
- Grid dots are subtle — visible enough to orient, invisible enough to not distract.
- Selection box (rubber-band): `bg-indigo-500/10 border border-indigo-500/40` — soft, not the jarring blue React Flow default.
- Node shadow on hover: `shadow-md` — lift effect, but gentle.
- Alignment guide lines: `1px dashed #6366F1` at `40%` opacity — noticeable but not obtrusive.
- Scroll/pan momentum: let the browser's native inertia work — do not override or cap it.

**No dissonance checklist** — before any component is considered done:
- [ ] Does it animate in and out?
- [ ] Does it have a hover state?
- [ ] Does it have an active/pressed state?
- [ ] Do its colors match the palette exactly?
- [ ] Does it look right in both light and dark theme?
- [ ] Does it have the right spacing (4px grid)?
- [ ] Does it feel native at 60fps on a normal laptop?

---

---

## Phase 0 — Project Scaffolding

**Goal:** Runnable skeleton with correct toolchain. No features, just foundations.

### Step 0.1 — Project structure

```
LLDCanvas/
├── frontend/                   ← Next.js app
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── types/              ← shared TypeScript types live here
│   │   └── data/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.local
│
├── backend/                    ← Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error.ts
│   │   ├── routes/
│   │   │   ├── auth.route.ts
│   │   │   ├── diagrams.route.ts
│   │   │   └── export.route.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       └── diagram.model.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── .gitignore
└── README.md
```

Two independent apps — no monorepo tooling required. Each has its own `package.json` and runs independently. Types are defined in `frontend/src/types/` and manually kept in sync with the backend (or copied as needed — fine for V1).

### Step 0.2 — Frontend (`/frontend`)

```bash
cd LLDCanvas
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
npm install @xyflow/react
npx shadcn@latest init   # choose "Default" style, CSS variables ON, neutral base color
```

Install shadcn components you will definitely need upfront:
```bash
npx shadcn@latest add button input textarea dialog dropdown-menu context-menu \
                         command tooltip separator scroll-area badge popover \
                         toast sonner sheet tabs
```

Frontend directory breakdown:
```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   ← Landing page
│   ├── dashboard/
│   │   └── page.tsx               ← Dashboard
│   ├── editor/
│   │   ├── [id]/
│   │   │   └── page.tsx           ← Cloud editor
│   │   └── local/
│   │       └── page.tsx           ← No-login local editor
│   └── settings/
│       └── page.tsx               ← Profile / account
├── components/
│   ├── canvas/
│   │   ├── nodes/
│   │   │   └── UMLClassNode.tsx
│   │   ├── edges/
│   │   │   ├── InheritanceEdge.tsx
│   │   │   ├── CompositionEdge.tsx
│   │   │   └── ...
│   │   ├── UMLMarkers.tsx
│   │   ├── RelationshipPicker.tsx
│   │   └── AlignmentGuides.tsx
│   ├── editor/
│   │   ├── Topbar.tsx
│   │   ├── LeftPanel.tsx
│   │   ├── Statusbar.tsx
│   │   ├── CommandPalette.tsx
│   │   └── ExportDialog.tsx
│   ├── dashboard/
│   │   ├── DiagramCard.tsx
│   │   └── NewDiagramModal.tsx
│   └── ui/                        ← shadcn auto-generated components
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useHistoryStack.ts
│   ├── useLocalDiagram.ts
│   └── useAutosave.ts
├── lib/
│   ├── auth-client.ts
│   ├── api.ts                     ← typed fetch wrappers for backend
│   ├── export/
│   │   ├── toPlantUML.ts
│   │   └── toPNG.ts
│   └── utils.ts
├── data/
│   └── patterns/
│       ├── strategy.json
│       ├── observer.json
│       └── ...
└── types/
    └── index.ts                   ← all shared TypeScript types
```

### Step 0.3 — Backend (`/backend`)

```bash
cd LLDCanvas
mkdir backend && cd backend
npm init -y
npm install express mongoose better-auth @better-auth/adapter-mongoose
npm install cors dotenv helmet morgan express-rate-limit zod
npm install -D typescript ts-node-dev @types/express @types/node @types/cors @types/morgan
npx tsc --init
```

Add to `backend/package.json` scripts:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Step 0.4 — Express app bootstrap (`backend/src/index.ts`)

Wire up all the middleware installed in Step 0.3 — otherwise `helmet`, `cors`, `morgan`, `express-rate-limit`, and `zod` sit in `package.json` unused.

```typescript
// backend/src/index.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db'
import { auth } from './config/auth'        // Better Auth instance (Step 1.3)
import diagramsRouter from './routes/diagrams.route'
import { errorHandler } from './middleware/error'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,             // required: Better Auth session cookie is cross-site (see Step 1.3a)
}))
app.use(morgan('dev'))
app.use(express.json())

// Generous global limit; auth endpoints get a stricter one in Step 1.3
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

app.get('/health', (_req, res) => res.json({ ok: true }))  // used by Railway/Fly.io uptime checks, Step 12

app.all('/api/auth/*', (req, res) => auth.handler(req, res))
app.use('/diagrams', diagramsRouter)

app.use(errorHandler)   // must be registered last

connectDB().then(() => {
  app.listen(process.env.PORT || 4000, () => console.log('API listening'))
})
```

### Step 0.4a — Error middleware (`backend/src/middleware/error.ts`)

```typescript
// backend/src/middleware/error.ts
import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() })
  }
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
}
```

### Step 0.4b — Typed API client (`frontend/src/lib/api.ts`)

Referenced in the directory layout (Step 0.2) but never filled in — every diagram CRUD call in later phases (autosave, dashboard, duplicate) goes through this instead of raw `fetch`.

```typescript
// frontend/src/lib/api.ts
import type { DiagramData } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...init })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

export const api = {
  listDiagrams: (q?: string) => request<DiagramSummary[]>(`/diagrams${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getDiagram: (id: string) => request<Diagram>(`/diagrams/${id}`),
  createDiagram: (body: { title?: string; templateId?: string }) =>
    request<Diagram>('/diagrams', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) }),
  updateDiagram: (id: string, diagramData: DiagramData) =>
    request<void>(`/diagrams/${id}`, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify({ diagramData }) }),
  duplicateDiagram: (id: string) => request<Diagram>(`/diagrams/${id}/duplicate`, { method: 'POST' }),
  deleteDiagram: (id: string) => request<void>(`/diagrams/${id}`, { method: 'DELETE' }),
  renameDiagram: (id: string, title: string) =>
    request<void>(`/diagrams/${id}/title`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ title }) }),
}
const jsonHeaders = { 'Content-Type': 'application/json' }
```

**Deliverable (added to Phase 0):** `/health` responds 200. Hitting a protected route with no session returns 401 via `errorHandler`, not an unhandled stack trace.

### Step 0.5 — Types (`frontend/src/types/index.ts`)

Define your canonical types once here:

```typescript
// frontend/src/types/index.ts

export type NodeType = 'class' | 'abstract-class' | 'interface' | 'enum'
  | 'record' | 'exception'   // stretch, PRD §6.2 — same box anatomy as 'class', different stereotype label
  | 'note' | 'package';      // 'note' = free-text annotation, not a UML classifier; 'package' = container, see Phase 6.7

export type Visibility = '+' | '-' | '#' | '~';

export interface UMLAttribute {
  id: string;
  visibility: Visibility;
  name: string;
  type: string;
  isStatic: boolean;
}

export interface UMLMethod {
  id: string;
  visibility: Visibility;
  name: string;
  params: string;
  returnType: string;
  isStatic: boolean;
  isAbstract: boolean;
  isConstructor?: boolean;   // no return type shown, name locked to class name — see Phase 4.1a
}

export interface UMLNodeData {
  nodeType: NodeType;
  name: string;
  stereotype?: string;          // e.g. "singleton", "repository"
  genericParam?: string;        // e.g. "T" for Repository<T> — rendered as `${name}<${genericParam}>` in the header, see Phase 4.1a
  constraints?: string[];       // e.g. ["readOnly", "ordered"] — rendered as `{constraint}` under the name, see Phase 4.1a
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  packageName?: string;
  noteText?: string;            // only used when nodeType === 'note'
}

export type RelationshipType =
  | 'association'
  | 'aggregation'
  | 'composition'
  | 'inheritance'
  | 'realization'
  | 'dependency'
  | 'bidirectional';

export interface UMLEdgeData {
  relationshipType: RelationshipType;
  sourceMultiplicity?: string;  // '1', '0..1', '1..*', '0..*'
  targetMultiplicity?: string;
  label?: string;
}

export interface DiagramMeta {
  theme: 'light' | 'dark' | 'whiteboard';
  zoom: number;
  panX: number;
  panY: number;
}

export interface DiagramData {
  version: number;
  nodes: any[];   // React Flow node array (UMLNodeData as data field)
  edges: any[];   // React Flow edge array (UMLEdgeData as data field)
  meta: DiagramMeta;
}
```

### Step 0.6 — Environment files

`backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/lldcanvas
BETTER_AUTH_SECRET=<generate-random-32-char-string>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLIENT_URL=http://localhost:3000
PORT=4000
```

`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
BETTER_AUTH_URL=http://localhost:4000
```

### Step 0.7 — ESLint / Prettier / Git

`.prettierrc` (root, applies to both):
```json
{ "semi": false, "singleQuote": true, "tabWidth": 2 }
```

`.gitignore` (root):
```
node_modules/
.env
.env.local
.next/
dist/
*.tsbuildinfo
```

Start commands:
```bash
# Terminal 1
cd frontend && npm run dev     # Next.js on :3000

# Terminal 2
cd backend && npm run dev      # Express on :4000
```

**Deliverable:** Both apps start independently, TypeScript compiles in both, no errors.

---

## Phase 1 — Authentication

**Goal:** Google login works. Users are persisted in MongoDB. Protected routes redirect to login.

### Step 1.1 — MongoDB connection

```typescript
// backend/src/config/db.ts
import mongoose from 'mongoose';

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('MongoDB connected');
}
```

### Step 1.2 — User model

```typescript
// backend/src/models/user.model.ts
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  authProvider: { type: String, default: 'google' },
}, { timestamps: true });

export const User = model('User', userSchema);
```

### Step 1.3 — Better Auth setup (server)

Configure Better Auth with the Mongoose adapter, Google OAuth, and optionally email+password. Mount the auth handler at `/api/auth/*` on Express.

Key routes Better Auth exposes automatically:
- `POST /api/auth/sign-in/google`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-out`
- `GET  /api/auth/session`

### Step 1.3a — Cross-origin cookie config (critical, easy to miss)

Frontend (Vercel) and backend (Railway/Fly.io) live on **different domains** in production, so the Better Auth session cookie is a cross-site cookie by default browsers block. This must be configured correctly or login will silently appear to work locally (same-origin, `localhost:3000`/`localhost:4000` count as different ports but browsers are lenient there) and then fail in production.

```typescript
// backend/src/config/auth.ts
export const auth = betterAuth({
  // ...
  advanced: {
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      sameSite: 'none',   // required for cross-site cookie to be sent
      secure: true,       // required when sameSite: 'none' — HTTPS only, fine in prod, use a tunnel (ngrok) or same-port proxy if testing this locally
    },
  },
  trustedOrigins: [process.env.CLIENT_URL!],
})
```

Pair this with `cors({ origin: process.env.CLIENT_URL, credentials: true })` (Step 0.4) and `credentials: 'include'` on every frontend fetch (already the default in `lib/api.ts`, Step 0.4b). Test this specific path in staging before assuming auth "works" — it is the single most common silent-failure point in split frontend/backend deploys.

### Step 1.3b — Rate limiting & validation on auth routes

`express-rate-limit` and `zod` are installed (Step 0.3) but need to actually be applied:

```typescript
// backend/src/middleware/rateLimit.ts
export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })  // stricter than the global limiter, brute-force protection on sign-in/sign-up
```

Apply `authRateLimit` to `/api/auth/sign-in/*` and `/api/auth/sign-up/*` specifically. For any request body Better Auth doesn't already validate (e.g. custom profile-update fields in Phase 10), define a zod schema and parse in the route handler, letting a failed parse throw into `errorHandler` (Step 0.4a).

### Step 1.4 — Auth middleware

```typescript
// backend/src/middleware/auth.ts
export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.user = session.user;
  next();
}
```

Apply this middleware to all `/diagrams` routes.

### Step 1.5 — Frontend auth client

Use Better Auth's React client. Wrap the app in a session provider.

```typescript
// frontend/src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});
```

### Step 1.6 — Landing Page UI

**Design:** Full-viewport hero. Dark background (`#0A0A0A`). Large centered headline. Gradient accent. No clutter.

```
┌────────────────────────────────────────────────────────────┐
│  LLDCanvas                                  [Login] [Try →] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│         The fastest way to create UML diagrams             │
│           for Low-Level Design interviews.                 │
│                                                            │
│    [Start for free — no account needed]  [See examples]    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │     animated preview of canvas in action         │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│  ───── Features ─────                                      │
│  [One-click UML]  [Smart Connectors]  [Pattern Skeletons]  │
│                                                            │
│  ───── Social proof (later) ─────                          │
└────────────────────────────────────────────────────────────┘
```

- Use `next/font` for Inter or Geist.
- Animated canvas preview: a short CSS/Framer Motion loop showing a class box being drawn and a connector being dragged.
- The "Start for free" CTA goes directly into the editor with a blank local-storage canvas (no login required yet — resolves open decision #2 in PRD).

### Step 1.7 — Login / Auth modal

Use a shadcn `Dialog`. Do not create a separate `/login` route — the login modal overlays wherever the user is.

```
┌──────────────────────────────────┐
│  Sign in to LLDCanvas            │
│                                  │
│  [G Continue with Google]        │
│                                  │
│  ─── or ───                     │
│                                  │
│  Email ____________________      │
│  Password __________________     │
│  [Sign in]                       │
│                                  │
│  Don't have an account? Sign up  │
└──────────────────────────────────┘
```

**Deliverable:** Google login creates a user in MongoDB. Session cookie is set. `auth.api.getSession()` works in middleware.

---

## Phase 2 — Dashboard

**Goal:** Logged-in users see their diagrams. Can create new diagrams. Can delete/rename.

### Step 2.1 — Diagram model (MongoDB)

```typescript
// backend/src/models/diagram.model.ts
import { Schema, model } from 'mongoose';

const diagramSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Diagram' },
  thumbnail: String,       // base64 PNG or URL
  isTemplate: { type: Boolean, default: false },
  diagramData: {
    version: { type: Number, default: 1 },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    meta: {
      theme: { type: String, default: 'light' },
      zoom: { type: Number, default: 1 },
      panX: { type: Number, default: 0 },
      panY: { type: Number, default: 0 },
    },
  },
}, { timestamps: true });

export const Diagram = model('Diagram', diagramSchema);
```

### Step 2.2 — REST API routes

```
GET    /diagrams              → list user's diagrams (title, thumbnail, updatedAt), supports ?q= search
POST   /diagrams              → create new diagram (returns id)
POST   /diagrams/:id/duplicate → clone a diagram (new _id, title "Copy of X", same diagramData) — powers the dashboard card context menu's "Duplicate"
GET    /diagrams/:id          → get full diagram (including diagramData)
PUT    /diagrams/:id          → update diagram (autosave)
DELETE /diagrams/:id          → delete
PATCH  /diagrams/:id/title    → rename
GET    /diagrams/templates    → list template canvases (no auth required)
```

All routes except `GET /diagrams/templates` require `requireAuth` middleware.

**Ownership check (required on every `:id` route):** `requireAuth` only proves *a* user is logged in — it does not prove the diagram being accessed belongs to *them*. Without this check, any authenticated user can read/overwrite/delete another user's diagram by guessing or enumerating a Mongo `_id`. Every handler for `GET/PUT/DELETE/PATCH/POST(duplicate) /diagrams/:id*` must include:

```typescript
const diagram = await Diagram.findById(req.params.id)
if (!diagram) return res.status(404).json({ error: 'Not found' })
if (diagram.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
```

`GET /diagrams?q=` does a case-insensitive `title` regex match scoped to `userId` — simple `find({ userId, title: { $regex: q, $options: 'i' } })` is sufficient at V1 scale (no need for a text index yet).

### Step 2.3 — Dashboard UI

**Layout:** Two-column. Sidebar left (narrow), main content right.

```
┌──────────┬──────────────────────────────────────────────────┐
│ LLDCanvas│  My Diagrams                    [+ New Diagram]  │
│          │  🔍 Search...                                     │
│ My Diagrams │                                               │
│ Templates│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ Settings │  │[thumb] │ │[thumb] │ │[thumb] │ │[thumb] │   │
│          │  │Parking │ │Elevator│ │LRU Cache│ │Untitled│   │
│          │  │Lot     │ │System  │ │        │ │        │   │
│          │  │2d ago  │ │5d ago  │ │1w ago  │ │now     │   │
│          │  └────────┘ └────────┘ └────────┘ └────────┘   │
│          │                                                  │
│          │  ← Right-click on a card: Rename · Duplicate     │
│          │                           Export · Delete        │
└──────────┴──────────────────────────────────────────────────┘
```

- Cards use shadcn's `Card` component. Hover shows "Open" button overlay.
- Right-click on card opens shadcn `ContextMenu` with Rename/Duplicate/Export/Delete.
- Rename in-place: click card title → becomes an `Input`, save on blur/Enter.
- Search box: debounce input 300ms, call `api.listDiagrams(q)` (Step 0.4b), replace the grid with results. Client-side filtering is not used — this hits `GET /diagrams?q=` (Step 2.2) so it scales past what fits in one page load.
- "Duplicate" from the card menu calls `api.duplicateDiagram(id)` (Step 2.2) and the new card appears in the grid immediately (optimistic insert, then reconcile on response).
- "Export" from the card menu does **not** re-implement export server-side — it navigates to `/editor/[id]?export=png` (or `svg`/`plantuml`), and the editor (Phase 7.3–7.5) opens the Export dialog pre-selected to that format on mount, reusing the same client-side `toPng`/`toPlantUML` logic instead of duplicating it in a headless-render backend job.
- "+ New Diagram" opens a `Dialog` with:
  - **Blank Canvas** (default, selected)
  - **From Template** tab: grid of LLD problem thumbnails
  - Two-column grid of templates with illustrated icons

### Step 2.4 — New Diagram from Template dialog

```
┌─────────────────────────────────────────────────────────┐
│ New Diagram                                         [×] │
│                                                         │
│ [Blank Canvas]  [From Template]                         │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │🅿️ Parking│ │🔼Elevator│ │💳 ATM   │ │🎬BookMy..│  │
│  │Lot       │ │System    │ │         │ │Show      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │♟️ Chess  │ │🍕 Food   │ │🚗 Ride  │ │💾 Cache  │  │
│  │         │ │Delivery  │ │Sharing   │ │LRU/LFU  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│                              [Cancel]  [Create Diagram] │
└─────────────────────────────────────────────────────────┘
```

**Deliverable:** CRUD works for diagrams. Dashboard renders correctly. Navigating to `/editor/[id]` loads the diagram.

---

## Phase 3 — Infinite Canvas Foundation (React Flow Setup)

**Goal:** An infinite, pannable, zoomable canvas that feels premium. No UML content yet — just prove the canvas feel.

### Step 3.1 — Canvas page route

```
frontend/src/app/editor/[id]/page.tsx  ← the editor route
```

For the no-login local mode:
```
frontend/src/app/editor/local/page.tsx ← anonymous local-storage canvas
```

### Step 3.2 — React Flow base setup

```typescript
// frontend/src/app/editor/[id]/page.tsx (simplified)
'use client'
import { ReactFlow, Background, Controls, MiniMap,
         useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export default function EditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  return (
    <div className="h-screen w-screen bg-[#F8F8F8]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}       // custom UML nodes
        edgeTypes={edgeTypes}       // custom UML edges
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.1}
        maxZoom={4}
        fitView
      >
        <Background variant="dots" gap={16} size={1} color="#E2E2E2" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap position="bottom-left" pannable zoomable />
      </ReactFlow>
    </div>
  )
}
```

### Step 3.3 — Editor layout with chrome

The editor has four zones:

```
┌────────────────────────────────────────────────────────────────┐
│ TOPBAR (48px)  ← logo | diagram title | undo/redo | export     │
├──────────┬─────────────────────────────────────┬───────────────┤
│ LEFT     │                                     │  RIGHT        │
│ PANEL    │        INFINITE CANVAS              │  PANEL        │
│ (220px)  │        (React Flow fills)           │  (optional)   │
│          │                                     │               │
│ • Insert │                                     │               │
│   Class  │                                     │               │
│   Iface  │                                     │               │
│   Enum   │                                     │               │
│   Abstract│                                    │               │
│          │                                     │               │
│ • Pattern│                                     │               │
│   Sidebar│                                     │               │
│          │                                     │               │
│ • Export │                                     │               │
├──────────┴─────────────────────────────────────┴───────────────┤
│ STATUSBAR (24px)  ← zoom% | node count | theme toggle         │
└────────────────────────────────────────────────────────────────┘
```

**Key UI decisions:**
- Topbar background: `bg-white border-b` (light mode) / `bg-[#1C1C1E] border-b border-[#2C2C2E]` (dark mode).
- Left panel: collapsible. Default open. Toggle with `[` key.
- Canvas background: dot grid (`#F8F8F8` light / `#111111` dark / `#FFFFFF` whiteboard).
- No scrollbars visible — React Flow handles scroll natively.
- Canvas fills `100vw - sidebar_width` and `100vh - topbar_height`.
- React Flow's default blue selection box should be overridden with your brand color.

### Step 3.4 — Topbar component

```
[🔷 LLDCanvas] [Parking Lot ▾]  ──────────  [↩ ↪]  [🌙] [Export ▾] [Share] [avatar]
```

- Diagram title is editable in-place (click → `Input`).
- Undo/redo buttons mirror keyboard shortcuts; disabled state when stack is empty.
- Theme toggle switches between light / dark / whiteboard themes.
- Export dropdown: PNG · SVG · PlantUML.

### Step 3.5 — Keyboard shortcut system

Create a central `useKeyboardShortcuts` hook. Mount it at the editor root.

| Key | Action |
|-----|--------|
| `C` | Insert Class at canvas center |
| `I` | Insert Interface |
| `E` | Insert Enum |
| `A` | Insert Abstract Class |
| `Delete` / `Backspace` | Delete selected |
| `Ctrl+D` | Duplicate selected |
| `Ctrl+C` / `Ctrl+V` | Copy / Paste |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+K` | Open command palette |
| `[` | Toggle left panel |
| `Escape` | Deselect / close popups |
| `Space` (hold) | Pan mode (grab cursor) |
| `F` | Fit view (zoom to fit all nodes) |

**Deliverable:** Infinite canvas loads. Pan and zoom work. Chrome layout renders. Keyboard shortcut hook is in place (actions fire but nothing visible yet since no nodes).

---

## Phase 4 — UML Class Nodes

**Goal:** The class box — the most important UI element in the product.

### Step 4.1 — Custom UML node component

Create `frontend/src/components/canvas/nodes/UMLClassNode.tsx`.

**Visual anatomy:**

```
┌─────────────────────────┐   ← rounded border (1px, #CBD5E1)
│   <<interface>>          │   ← stereotype row (hidden if none)
│   ClassName              │   ← name section (bold, center)
├─────────────────────────┤   ← divider
│ + name: String           │   ← attribute row (left-aligned, monospace)
│ - count: int             │
│ # cache: Map<K,V>        │
├─────────────────────────┤   ← divider
│ + getName(): String      │   ← method row
│ - calculate(x: int): void│
└─────────────────────────┘
```

Styling rules:
- **Class:** white fill, solid border, black text.
- **Interface:** white fill, `<<interface>>` stereotype label in italic, dashed border.
- **Abstract Class:** white fill, class name in italic.
- **Enum:** white fill, `<<enum>>` stereotype label, list of enum constants in attributes section.
- **Record** (stretch): identical box to Class, `<<record>>` stereotype label — a value-holder shorthand, not a separate rendering path.
- **Exception** (stretch): identical box to Class, `<<exception>>` stereotype label.
- Minimum width: `180px`. No max-width (auto-expands).
- Font: `JetBrains Mono` or `Fira Code` for attribute/method rows (monospace for UML realism). Regular sans-serif for class name.
- Node is selected → border changes to accent color (`#6366F1` indigo) + 2px width + subtle outer glow.

### Step 4.1a — Anatomy rendering rules (PRD §6.2, easy to under-build)

These map directly onto `UMLAttribute`/`UMLMethod` fields already in the type (Step 0.5) but need explicit rendering rules or they get silently dropped:

- **Static members** (`isStatic: true`): render the row's text with `text-decoration: underline` — applies to both attribute and method rows, per standard UML notation.
- **Abstract methods** (`isAbstract: true`): render the method row in italic. (Abstract *class name* italics, per the Abstract Class rule above, is a separate flag — a concrete method inside an abstract class is not automatically italic.)
- **Constructors** (`isConstructor: true` on a `UMLMethod`): rendered in the methods section like any other method, but (a) no return type shown — `+ ClassName(param: Type)` not `+ ClassName(param: Type): void` — and (b) the name field is locked to the current class name and auto-renames if the class is renamed. "Add Constructor" from the context menu (Step 4.5) inserts one of these pre-filled rather than a blank method row.
- **Generic parameter** (`genericParam`, e.g. `"T"`): rendered in the name section header as `${name}<${genericParam}>`, e.g. `Repository<T>` — not a separate row.
- **Constraints** (`constraints: string[]`, e.g. `["readOnly"]`): rendered as a small centered row directly under the class name, in braces: `{readOnly}`. Multiple constraints join as `{readOnly, ordered}`. Editable via the same context menu that edits stereotype (Step 4.5).
- **Notes** (`nodeType: 'note'`): a distinct node type, not a class box — renders as a folded-corner rectangle (yellow-tinted fill, `#FFFBEB`) containing free-text `noteText`, no attribute/method sections, no stereotype. Connect a note to a class with a plain dashed line (no arrowhead) to "attach" it — reuses the Association edge component with `markerEnd: none`. Inserted via a "Note" entry in the left panel (Step 6.4) and the command palette (Step 6.3), not a keyboard shortcut (avoids collision with `C`/`I`/`E`/`A`).

### Step 4.2 — Inline editing

Every text element in the class box is double-click-to-edit:
- Double-click class name → `<input>` replaces the text span, auto-focused, sized to content.
- Double-click attribute row → inline `<input>` with UML format hint (`+ name: Type`).
- Double-click method row → inline `<input>` with method format hint.
- On blur or `Enter`: save to node data. On `Escape`: cancel edit.
- `Tab` while editing one row: move focus to next row's input (like a spreadsheet).

### Step 4.3 — Auto-resize

Attach a `ResizeObserver` to the node's outer `div`. On size change, call `updateNodeInternals(nodeId)` from React Flow so edges stay anchored.

```typescript
const ref = useRef<HTMLDivElement>(null)
const { updateNodeInternals } = useReactFlow()

useEffect(() => {
  const observer = new ResizeObserver(() => {
    updateNodeInternals(id)
  })
  if (ref.current) observer.observe(ref.current)
  return () => observer.disconnect()
}, [id, updateNodeInternals])
```

### Step 4.4 — Connection handles

Place invisible React Flow `Handle` components on all four sides of the box (top, right, bottom, left). On hover, show a subtle blue circle indicator:

```typescript
<Handle
  type="source"
  position={Position.Right}
  className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 hover:opacity-100 transition-opacity"
/>
```

### Step 4.5 — Right-click context menu

Using shadcn `ContextMenu` on the node wrapper:

```
┌──────────────────────────┐
│ Add Attribute      Ctrl+Shift+A │
│ Add Method         Ctrl+Shift+M │
│ Add Constructor             │
│ Add Generic Parameter       │
├──────────────────────────┤
│ Convert to Interface        │
│ Convert to Abstract Class   │
├──────────────────────────┤
│ Duplicate          Ctrl+D   │
│ Delete             Del      │
└──────────────────────────┘
```

### Step 4.6 — Node insertion

When the user presses `C` (or clicks "+ Class" in the left panel):
- A new class node appears at the center of the current viewport.
- The class name field is immediately focused and editable (`"ClassName"` selected text).
- The node has one default attribute row and one default method row.

```typescript
function addNode(type: NodeType) {
  const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const newNode = {
    id: nanoid(),
    type: 'umlClass',
    position: center,
    data: {
      nodeType: type,
      name: 'ClassName',
      attributes: [],
      methods: [],
    }
  }
  setNodes(prev => [...prev, newNode])
}
```

### Step 4.7 — Alignment guides (Figma-style)

During `onNodeDrag`, compare the dragged node's bounding box against every other node. When edges or centers align within ±4px:
- Render a temporary `<div>` absolute-positioned line over the canvas (not a React Flow edge — just a plain div with `pointer-events-none`).
- Snap the dragged node's position to the aligned value.

```typescript
// Pseudo-logic in onNodeDrag callback:
for (const otherNode of allOtherNodes) {
  if (Math.abs(dragged.x - other.x) < 4) {
    snapX = other.x
    showVerticalGuide(other.x)
  }
  if (Math.abs(dragged.y - other.y) < 4) {
    snapY = other.y
    showHorizontalGuide(other.y)
  }
}
```

**Deliverable:** Class, Interface, Abstract, Enum nodes render correctly with correct UML styling, including static-underline, abstract-italic, constructor, generic-parameter, and constraint rendering from Step 4.1a. Note nodes (Step 4.1a) can be added and attached. Inline editing works. Auto-resize works. Context menu works.

---

## Phase 5 — Relationships & Edges

**Goal:** Smart connectors. Correct UML arrowheads. Multiplicity labels.

### Step 5.1 — Custom SVG markers

Define global SVG `<defs>` with UML markers. Mount these in a hidden `<svg>` at the app root:

```typescript
// frontend/src/components/canvas/UMLMarkers.tsx
export function UMLMarkers() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Inheritance: hollow triangle at parent */}
        <marker id="inheritance" markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        {/* Realization: same triangle, dashed line handled by edge style */}
        <marker id="realization" markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        {/* Composition: filled diamond at whole end */}
        <marker id="composition" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto">
          <path d="M 0 5 L 6 0 L 12 5 L 6 10 Z" fill="currentColor" />
        </marker>
        {/* Aggregation: hollow diamond */}
        <marker id="aggregation" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto">
          <path d="M 0 5 L 6 0 L 12 5 L 6 10 Z" fill="white" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        {/* Dependency/association: open arrowhead */}
        <marker id="dependency" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
      </defs>
    </svg>
  )
}
```

### Step 5.2 — Custom edge components

One component per relationship type. All share `getSmoothStepPath` for orthogonal routing:

```typescript
// frontend/src/components/canvas/edges/InheritanceEdge.tsx
import { getSmoothStepPath, EdgeProps } from '@xyflow/react'

export function InheritanceEdge({ sourceX, sourceY, targetX, targetY, ...props }: EdgeProps) {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY })
  return (
    <path
      d={edgePath}
      fill="none"
      stroke="#374151"
      strokeWidth={1.5}
      markerEnd="url(#inheritance)"
    />
  )
}
```

Edge type map:
| Relationship | Line style | Source marker | Target marker |
|---|---|---|---|
| Association | solid | none | none |
| Bidirectional | solid | open arrow | open arrow |
| Aggregation | solid | hollow diamond | none |
| Composition | solid | filled diamond | none |
| Inheritance | solid | none | hollow triangle |
| Realization | dashed | none | hollow triangle |
| Dependency | dashed | none | open arrow |

### Step 5.3 — Relationship picker (the key interaction)

When the user drags from one class handle to another, React Flow fires `onConnect`. **Do not create the edge immediately.** Instead:

1. Show a small floating picker popover near the mouse position.
2. User clicks the relationship type.
3. Edge is created with the correct type and markers.

```typescript
// In the ReactFlow onConnect handler:
function onConnect(params: Connection) {
  setPendingConnection(params)          // store source/target
  setPickerPosition({ x: mouseX, y: mouseY })
  setPickerOpen(true)
}

function onRelationshipPick(type: RelationshipType) {
  const edge = {
    ...pendingConnection,
    id: nanoid(),
    type: type,                        // maps to custom edge component
    data: { relationshipType: type },
  }
  setEdges(prev => addEdge(edge, prev))
  setPickerOpen(false)
}
```

**Relationship picker UI:**

```
┌─────────────────────────┐
│  ──→  Association       │
│  ◇──  Aggregation       │
│  ◆──  Composition       │
│  △──  Inheritance       │
│  △--  Realization       │
│  -->  Dependency        │
│  ←→   Bidirectional     │
└─────────────────────────┘
```

Render each option with a small inline SVG icon showing the actual arrowhead, so it's instantly recognizable.

### Step 5.4 — Multiplicity labels

Multiplicity labels are edge labels rendered via React Flow's `label`/`labelStyle` props, or custom foreignObject. They must be:
- Visible at small text size (`11px`, monospace).
- Draggable along the edge path (use React Flow's `EdgeLabelRenderer` + `labelX`/`labelY`).
- Editable on double-click.

Support values: `1`, `0..1`, `1..*`, `0..*`, and custom (`m..n`).

Add a quick-pick dropdown when the user clicks the edge label area:
```
[1]  [0..1]  [1..*]  [0..*]  [custom...]
```

### Step 5.5 — Self-association

A special edge where source === target. React Flow supports this. Route it as a loop using `getBezierPath` with a large curvature offset so it forms a visible loop on one side of the class box.

**Deliverable:** All 7 relationship types render with correct UML markers. Connection picker works. Multiplicity labels are editable.

---

## Phase 6 — Editor UX Polish

**Goal:** Command palette, undo/redo, copy/paste, themes, alignment, left panel.

### Step 6.1 — Undo / Redo

Implement a history stack using a custom `useHistoryStack` hook:

```typescript
interface HistoryEntry {
  nodes: Node[]
  edges: Edge[]
}

// On every meaningful change (node added/removed/edited, edge added/removed):
// snapshot current nodes+edges → push to history stack
// Undo: pop from history stack, restore
// Redo: re-apply from redo stack
```

Use debouncing (500ms) so rapid typing doesn't flood the stack. Only snapshot on pause.

### Step 6.2 — Copy / Paste

```typescript
function onCopy() {
  const selected = nodes.filter(n => n.selected)
  setClipboard(selected)
}

function onPaste() {
  const offset = { x: 32, y: 32 }
  const pasted = clipboard.map(n => ({
    ...n,
    id: nanoid(),
    position: { x: n.position.x + offset.x, y: n.position.y + offset.y },
    selected: false,
  }))
  setNodes(prev => [...prev, ...pasted])
}
```

Also paste edges between pasted nodes (only if both source and target were selected and are in clipboard).

### Step 6.3 — Command Palette (`Ctrl+K`)

Use shadcn's `Command` component in a `Dialog`:

```
┌───────────────────────────────────────────┐
│ 🔍 Search commands...                     │
├───────────────────────────────────────────┤
│ Insert                                    │
│   C  Add Class                            │
│   I  Add Interface                        │
│   E  Add Enum                             │
│   A  Add Abstract Class                   │
│      Add Note                             │
│                                           │
│ Design Patterns  (Pro)                    │
│   ✦  Insert Singleton skeleton            │
│   ✦  Insert Factory skeleton              │
│   ✦  Insert Strategy skeleton             │
│   ✦  Insert Observer skeleton             │
│   ✦  Insert Builder skeleton              │
│   ✦  Insert Decorator skeleton            │
│   (... more)                              │
│                                           │
│ Canvas                                    │
│   F  Fit view                             │
│   [ Toggle left panel                     │
│                                           │
│ File                                      │
│   Export as PNG                           │
│   Export as SVG                           │
│   Export as PlantUML                      │
└───────────────────────────────────────────┘
```

Pattern entries show a lock icon if user is on free plan. Clicking them shows an upgrade modal.

### Step 6.4 — Left panel (insert sidebar)

```
┌─────────────────┐
│  Insert         │
│                 │
│  [📦 Class]     │  ← keyboard shortcut label: C
│  [🔷 Interface] │  ← I
│  [📋 Enum]      │  ← E
│  [〰️ Abstract]  │  ← A
│                 │
│  ─────────────  │
│  Stereotypes    │
│  [Repository]   │
│  [Service]      │
│  [Controller]   │
│  [Entity]       │
│  [DTO]          │
│  [Value Object] │
│  [Factory]      │
│  [Builder]      │
│  [Singleton]    │
│  [Manager]      │
│  [Adapter]      │
│  [Proxy]        │
│  [Facade]       │
│                 │
│  ─────────────  │
│  Patterns 🔒    │
│  (Pro feature)  │
└─────────────────┘
```

The full V1 stereotype list is all 13 from PRD §6.5 — `Repository`, `Service`, `Controller`, `DTO`, `Entity`, `Value Object`, `Factory`, `Builder`, `Singleton`, `Manager`, `Adapter`, `Proxy`, `Facade` — rendered as a fixed list (no "expandable"/pagination needed at this count). Clicking any of them inserts a Class node pre-tagged with the corresponding `<<stereotype>>`. The stereotype shows in italics in the node header.

### Step 6.5 — Themes

Three themes controlled by a CSS class on the root `<div>`:

| | Light | Dark | Whiteboard |
|---|---|---|---|
| Canvas bg | `#F8F8F8` | `#111111` | `#FFFFFF` |
| Grid | dot, `#E2E2E2` | dot, `#2A2A2A` | line, `#EBEBEB` |
| Node fill | white | `#1E1E1E` | white |
| Node border | `#CBD5E1` | `#374151` | `#AAAAAA` |
| Text | `#111827` | `#F9FAFB` | `#1A1A1A` |
| Topbar | white | `#1C1C1E` | white |

Use CSS variables + Tailwind's `dark:` prefix where applicable. The theme toggle button cycles: Light → Dark → Whiteboard → Light.

### Step 6.6 — Multi-select

React Flow supports rubber-band selection natively (`selectionOnDrag`). When multiple nodes are selected:
- Show a "Group selection" indicator in the topbar (`3 selected`).
- `Ctrl+D` duplicates all selected.
- `Delete` deletes all selected.
- Move all selected together.

### Step 6.7 — Package grouping (stretch for V1)

A special "Package" node type that renders as a large rounded rectangle with a tab at the top-left (UML package notation). Other nodes can be dragged inside it. The package node sits behind other nodes (`zIndex: -1`).

**Note on PRD alignment:** PRD §6.2 lists "Packages (grouping/containers)" under Class Anatomy without marking it stretch, while this plan treats it as stretch-for-V1 here. That's a deliberate scope call, not an oversight: a package-as-container (drag-to-group, auto z-index, resize-with-contents) is materially more engineering than every other §6.2 item, which are all per-node text/label features. If package grouping turns out to be load-bearing for early users, promote this step out of "stretch" before Phase 11; otherwise it ships in V1.1 alongside the trimmed pattern/template lists (Steps 8.1/8.3).

**Deliverable:** Undo/redo works (10-step buffer minimum). Copy/paste works. Command palette opens and all insertions work. Themes switch cleanly.

---

## Phase 7 — Autosave & Export

**Goal:** Diagrams save automatically. Users can export PNG, SVG, PlantUML.

### Step 7.1 — Autosave

```typescript
// In the editor, watch nodes+edges with useEffect + debounce:
useEffect(() => {
  const timer = setTimeout(() => {
    api.updateDiagram(id, { nodes, edges, meta, version: 1 })   // api.ts, Step 0.4b — not a raw fetch
  }, 1500)  // debounce 1.5s after last change
  return () => clearTimeout(timer)
}, [nodes, edges])
```

Show save status in the topbar:
- `● Saving...` (while in-flight, amber dot)
- `✓ Saved` (on success, green check)
- `! Save failed` (on error, red, with retry button)

### Step 7.2 — Thumbnail generation

On every save, generate a PNG thumbnail of the canvas:
```typescript
import { toPng } from 'html-to-image'

async function generateThumbnail() {
  const canvasEl = document.querySelector('.react-flow__renderer')
  const dataUrl = await toPng(canvasEl, { width: 400, height: 300 })
  return dataUrl  // base64 PNG, store in diagram.thumbnail
}
```

Run this after the main save completes (non-blocking — fire and forget on debounce).

Install: `pnpm add html-to-image`

### Step 7.3 — PNG export

Full-quality export (not just screenshot):
```typescript
import { toPng } from 'html-to-image'

async function exportPNG() {
  const el = document.querySelector('.react-flow__renderer')
  const dataUrl = await toPng(el, {
    backgroundColor: theme === 'dark' ? '#111111' : '#FFFFFF',
    pixelRatio: 2,   // 2x for retina
  })
  downloadDataUrl(dataUrl, `${diagramTitle}.png`)
}
```

### Step 7.4 — SVG export

React Flow's `getNodes()` / `getEdges()` gives positions. Walk the graph and build an SVG string:
- Render each class box as SVG `<rect>` + `<text>` elements.
- Render each edge as `<path>` with the correct markers.
- Embed the custom marker `<defs>` at the top of the SVG.

Alternatively use `toSvg` from `html-to-image` as a quick first pass — lower fidelity but ships faster.

### Step 7.5 — PlantUML export

Walk the diagram data and emit PlantUML syntax:

```typescript
function toPlantUML(nodes: UMLNode[], edges: UMLEdge[]): string {
  const lines: string[] = ['@startuml']

  for (const node of nodes) {
    if (node.data.nodeType === 'interface') {
      lines.push(`interface ${node.data.name} {`)
    } else if (node.data.nodeType === 'abstract-class') {
      lines.push(`abstract class ${node.data.name} {`)
    } else if (node.data.nodeType === 'enum') {
      lines.push(`enum ${node.data.name} {`)
    } else {
      lines.push(`class ${node.data.name} {`)
    }
    for (const attr of node.data.attributes) {
      lines.push(`  ${attr.visibility}${attr.name}: ${attr.type}`)
    }
    for (const method of node.data.methods) {
      lines.push(`  ${method.visibility}${method.name}(${method.params}): ${method.returnType}`)
    }
    lines.push('}')
  }

  for (const edge of edges) {
    const src = nodeMap[edge.source].data.name
    const tgt = nodeMap[edge.target].data.name
    const arrow = PLANTUML_ARROW[edge.data.relationshipType]
    lines.push(`${src} ${arrow} ${tgt}`)
  }

  lines.push('@enduml')
  return lines.join('\n')
}
```

PlantUML arrow map:
```typescript
const PLANTUML_ARROW = {
  association: '--',
  aggregation: 'o--',
  composition: '*--',
  inheritance: '--|>',
  realization: '..|>',
  dependency: '..>',
  bidirectional: '<-->',
}
```

### Step 7.6 — Mermaid export (stretch, PRD §6.8 "nice-to-have, not blocking V1")

Same walk-the-graph approach as `toPlantUML`, targeting Mermaid's `classDiagram` syntax instead. Lower priority than PNG/SVG/PlantUML — implement after Phase 7's other exports ship, and only if time remains before Phase 8:

```typescript
const MERMAID_ARROW: Record<RelationshipType, string> = {
  association: '--',
  aggregation: 'o--',
  composition: '*--',
  inheritance: '--|>',
  realization: '..|>',
  dependency: '..>',
  bidirectional: '<-->',
}

function toMermaid(nodes: UMLNode[], edges: UMLEdge[]): string {
  const lines = ['classDiagram']
  for (const node of nodes) {
    lines.push(`class ${node.data.name} {`)
    for (const attr of node.data.attributes) lines.push(`  ${attr.visibility}${attr.type} ${attr.name}`)
    for (const method of node.data.methods) lines.push(`  ${method.visibility}${method.name}(${method.params}) ${method.returnType}`)
    lines.push('}')
    if (node.data.nodeType === 'interface') lines.push(`<<interface>> ${node.data.name}`)
  }
  for (const edge of edges) {
    const src = nodeMap[edge.source].data.name
    const tgt = nodeMap[edge.target].data.name
    lines.push(`${src} ${MERMAID_ARROW[edge.data.relationshipType]} ${tgt}`)
  }
  return lines.join('\n')
}
```

Add "Mermaid" as a fourth option in the Export dropdown (Step 3.4) and export dialog (below) once built.

**Export UI:**

```
┌──────────────────────────────────────────┐
│ Export Diagram                           │
│                                          │
│ [📷 PNG] [🎨 SVG] [📄 PlantUML] [🧜 Mermaid] │
│                                          │
│ Options:                                 │
│ ○ Light background                       │
│ ● Transparent background                 │
│ Scale: [1x] [2x] [3x]                    │
│                                          │
│                        [Download]        │
└──────────────────────────────────────────┘
```

**Deliverable:** Autosave debounces correctly. PNG/SVG/PlantUML export all produce correct files (Mermaid if Step 7.6 was reached). Thumbnails appear on dashboard within seconds of saving.

---

## Phase 8 — Design Pattern Skeletons & LLD Templates

**Goal:** One-click pattern insertion. Pre-loaded problem template canvases.

### Step 8.1 — Pattern skeleton data

Each pattern is a static JSON file in `src/data/patterns/`:

```json
// frontend/src/data/patterns/strategy.json
{
  "name": "Strategy",
  "description": "Defines a family of algorithms, encapsulates each one, and makes them interchangeable.",
  "nodes": [
    {
      "id": "strategy-iface",
      "type": "umlClass",
      "position": { "x": 200, "y": 100 },
      "data": {
        "nodeType": "interface",
        "name": "Strategy",
        "methods": [{ "visibility": "+", "name": "execute", "params": "context: Context", "returnType": "void" }],
        "attributes": []
      }
    },
    {
      "id": "concrete-a",
      "type": "umlClass",
      "position": { "x": 50, "y": 280 },
      "data": {
        "nodeType": "class",
        "name": "ConcreteStrategyA",
        "methods": [{ "visibility": "+", "name": "execute", "params": "context: Context", "returnType": "void" }],
        "attributes": []
      }
    },
    {
      "id": "context",
      "type": "umlClass",
      "position": { "x": 450, "y": 180 },
      "data": {
        "nodeType": "class",
        "name": "Context",
        "attributes": [{ "visibility": "-", "name": "strategy", "type": "Strategy" }],
        "methods": [{ "visibility": "+", "name": "setStrategy", "params": "s: Strategy", "returnType": "void" }]
      }
    }
  ],
  "edges": [
    { "id": "e1", "source": "concrete-a", "target": "strategy-iface", "type": "realization", "data": { "relationshipType": "realization" } },
    { "id": "e2", "source": "context", "target": "strategy-iface", "type": "association", "data": { "relationshipType": "association" } }
  ]
}
```

Define JSON files for all 10 patterns: Singleton, Factory, Abstract Factory, Strategy, Observer, Builder, Decorator, Adapter, Proxy, Facade.

**Resolves PRD §14 Open Decision #3:** ship all 10, not the trimmed top-5. A pattern skeleton is a static JSON file plus an entry in the command palette — the marginal cost of the other 5 (Abstract Factory, Adapter, Proxy, Facade, Builder) is low compared to a class-box + relationship system that's already built for the top 5, and trimming them would leave visible gaps in a "Quick Templates" list that's supposed to read as complete.

### Step 8.2 — Pattern insertion

```typescript
function insertPattern(pattern: PatternData) {
  // 1. Offset all node positions to center around current viewport
  const center = getViewportCenter()
  const offsetNodes = pattern.nodes.map(n => ({
    ...n,
    id: `${n.id}-${nanoid()}`,          // new unique IDs
    position: {
      x: n.position.x + center.x - 200,
      y: n.position.y + center.y - 150,
    }
  }))
  // 2. Remap edge IDs to match new node IDs
  const idMap = buildIdMap(pattern.nodes, offsetNodes)
  const offsetEdges = pattern.edges.map(e => ({
    ...e,
    id: nanoid(),
    source: idMap[e.source],
    target: idMap[e.target],
  }))
  // 3. Add to canvas
  setNodes(prev => [...prev, ...offsetNodes])
  setEdges(prev => [...prev, ...offsetEdges])
}
```

### Step 8.3 — LLD problem templates

Templates are stored in MongoDB as documents with `isTemplate: true`. The server exposes `GET /diagrams/templates` (no auth required). Store a seeded set of templates by running a seed script on first deploy.

Template starters to build (structure only, not solutions):
1. **Parking Lot** — `ParkingLot`, `Level`, `ParkingSpot`, `Vehicle`, `Ticket`, `FeeStrategy`
2. **Elevator System** — `ElevatorController`, `Elevator`, `Request`, `Direction`
3. **ATM** — `ATM`, `Card`, `Account`, `Transaction`, `AuthService`, `CashDispenser`
4. **BookMyShow** — `Theater`, `Screen`, `Show`, `Seat`, `Booking`, `Payment`, `User`
5. **LRU Cache** — `LRUCache`, `Node`, `DoublyLinkedList`, `CacheInterface`

Add remaining 9 templates as stretch (post-V1 or quick follow-up).

**Resolves PRD §14 Open Decision #4:** ship the trimmed top-5 (Parking Lot, Elevator, ATM, BookMyShow, LRU Cache) for V1, unlike the pattern-skeleton decision above. The reasoning differs because templates carry real content cost per item (a handful of correctly-named, correctly-related classes per problem, not just a wiring diagram) rather than a fixed structural shape, so trimming genuinely saves build time here. Splitwise, Snake & Ladder, Chess, Library Management, Food Delivery, Ride Sharing, Logger, Notification Service round out the remaining 9 — pull from this list first for a V1.1 follow-up, ordered by interview frequency (Splitwise and Chess are the next most commonly asked).

### Step 8.4 — Pro paywall

For pattern skeletons, wrap insertion in a plan check:

```typescript
function onPatternInsert(pattern) {
  if (user.plan === 'free') {
    openUpgradeModal()
    return
  }
  insertPattern(pattern)
}
```

The `UpgradeModal` shows a simple pricing card (Free vs Pro) with a CTA. Actual payment integration is post-V1 (just show the modal for now).

**Scope note:** pattern-skeleton gating above is the *only* monetization enforcement in V1 (it's explicitly called out as V1 scope in PRD §6.4). The rest of PRD §9's monetization table — the 20-diagram free-tier cap, and gating PlantUML/Mermaid export behind Pro — is headed "Post-V1" there and is intentionally **not** implemented in Phases 0–12. Concretely: Phase 2's diagram creation has no count check, and Phase 7's export dialog is available to every user regardless of plan. Don't add these gates while implementing V1 phases; they belong to the Phase 2 roadmap item in PRD §10 once a payment provider is wired in — adding them now would gate a paid tier that doesn't exist yet.

**Deliverable:** All 10 pattern skeletons insert correctly with proper UML wiring. 5 problem templates load on the "New Diagram" screen. Free users see a Pro gate on pattern-skeleton insertion only.

---

## Phase 9 — Local (No-Login) Mode

**Goal:** Users can try the editor without signing up. Resolve PRD open decision #2.

### Step 9.1 — Local storage persistence

For `/editor/local`, use a `useLocalDiagram` hook instead of the API:

```typescript
function useLocalDiagram() {
  const [nodes, setNodes] = useNodesState(() =>
    JSON.parse(localStorage.getItem('lldcanvas-local-nodes') || '[]')
  )
  const [edges, setEdges] = useEdgesState(() =>
    JSON.parse(localStorage.getItem('lldcanvas-local-edges') || '[]')
  )

  // Auto-persist to localStorage
  useEffect(() => {
    localStorage.setItem('lldcanvas-local-nodes', JSON.stringify(nodes))
  }, [nodes])

  useEffect(() => {
    localStorage.setItem('lldcanvas-local-edges', JSON.stringify(edges))
  }, [edges])

  return { nodes, setNodes, edges, setEdges }
}
```

### Step 9.2 — Upgrade prompt

Show a persistent (non-blocking) banner at the bottom of the local editor:

```
┌─────────────────────────────────────────────────────────────────┐
│ 💾 Working locally — Sign in to save to cloud & access all     │
│    devices.                                    [Sign in to save] │
└─────────────────────────────────────────────────────────────────┘
```

On sign-in:
1. Copy the local diagram data from localStorage.
2. POST to `/diagrams` to create a new diagram with that data.
3. Redirect to `/editor/[newId]`.
4. Clear localStorage.

**Deliverable:** Anonymous users can fully use the editor. Login converts local work to cloud.

---

## Phase 10 — Profile, Settings & Misc

**Goal:** Account management, final polish.

### Step 10.1 — Profile page `/settings`

Simple page with:
- Display name (editable)
- Email (read-only, shown for reference)
- Profile picture (from Google OAuth, not editable in V1)
- Danger zone: Delete Account (with confirmation dialog)
- Logout button

### Step 10.2 — Delete Account

```typescript
// Server: DELETE /auth/account
// 1. Delete all user's diagrams
// 2. Delete user record
// 3. Sign out session
```

### Step 10.3 — 404 and error states

- `/editor/[id]` when diagram not found: show a centered message "Diagram not found" with "Back to Dashboard" button.
- Canvas disconnected (offline): show a small toast "Working offline — changes will sync when reconnected."
- Save error: red indicator with "Retry" button.

### Step 10.4 — Responsive considerations

The editor is explicitly desktop-first (PRD). But the landing page and dashboard should be responsive:
- Landing page: readable on tablet/mobile.
- Dashboard: 2-column grid on tablet, 1-column on mobile with a banner "LLDCanvas works best on desktop."
- Editor on mobile: show a banner "The editor requires a desktop browser" and disable the canvas.

### Step 10.5 — Favicon, OG image, SEO

- Favicon: a clean diamond/class-box icon.
- OG image: static 1200×630 with tagline (for sharing).
- Page titles: `LLDCanvas` / `Dashboard — LLDCanvas` / `Parking Lot — LLDCanvas`.
- `<meta name="description">` on landing.

### Step 10.6 — Analytics instrumentation (supports PRD §11 Success Metrics)

None of PRD §11's success metrics (activation, core-loop speed, retention, export usage, template adoption) can be measured without event tracking, and nothing in Phases 0–9 emits any — this needs to exist before "launch" is meaningful, not bolted on after. Use a lightweight drop-in provider (e.g. PostHog's free tier) rather than a custom events pipeline — it's one script include plus a thin wrapper, and building homegrown event storage/analysis is out of scope for a V1 editor.

```typescript
// frontend/src/lib/analytics.ts
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, props)
}
```

Minimum event set, each mapped to a §11 metric:
| Event | Fired where | Metric |
|---|---|---|
| `signup_completed` | Auth callback, Step 1.3 | Activation denominator |
| `diagram_created` | `POST /diagrams` success, Step 2.2 | Activation numerator ("≥1 diagram in first session") |
| `class_and_2_relationships_added` | Fired once per diagram, first time node count ≥1 and edge count ≥2 | Core loop speed (timestamp diff from `diagram_created`) |
| `diagram_opened` | Editor mount, Step 3.2, on a diagram created >24h ago | Retention (return to edit) |
| `export_completed` | Each of PNG/SVG/PlantUML/Mermaid export functions, Step 7.3–7.6 | Export usage, with `format` prop |
| `diagram_created_from_template` | `POST /diagrams` with `templateId` set, Step 8.3 | Template adoption, with `templateId` prop |

Fire these as fire-and-forget calls colocated with the action itself (not a separate audit layer) — e.g. `track('export_completed', { format: 'png' })` directly inside `exportPNG()` from Step 7.3.

---

## Phase 11 — Testing & Quality

**Goal:** Confidence to ship V1.

### Step 11.1 — Core interaction smoke tests (manual)

Run through this checklist before every release:

```
□ Add Class with keyboard shortcut C → box appears, name editable
□ Add Interface with I → <<interface>> shows, dashed border
□ Add Enum with E → <<enum>> shows
□ Drag connector from Class A to Class B → relationship picker appears
□ Pick Inheritance → hollow triangle marker renders correctly
□ Pick Composition → filled diamond renders correctly
□ Double-click attribute → edits inline
□ Type a method → node auto-resizes → edge stays attached
□ Ctrl+Z undoes last action
□ Ctrl+D duplicates selected node
□ Export PNG → file downloads, correct content
□ Export PlantUML → copy to plantuml.com → renders same diagram
□ Autosave → "Saved" indicator shows
□ Refresh page → diagram is restored
□ New diagram from template → Parking Lot skeleton loads
□ Ctrl+K → command palette opens, Insert Pattern works
□ Theme toggle → Light/Dark/Whiteboard all render correctly
□ Local mode → edit without login → sign in → diagram migrated
□ Static attribute/method → renders underlined; abstract method → renders italic
□ Add Constructor from context menu → no return type shown, name locked to class name
□ Add Note → attaches to a class with a dashed line, edits inline
□ Generic parameter set to "T" on Repository → header shows "Repository<T>"
□ Dashboard search box → filters to matching titles via GET /diagrams?q=
□ Dashboard card "Duplicate" → new card appears with cloned diagramData
□ Diagram A's owner cannot open Diagram B via direct /editor/[id] URL (403, not data leak)
□ Sign in from a deployed (not localhost) frontend/backend pair → session persists across reload (cross-origin cookie check, Step 1.3a)
□ export_completed / diagram_created / diagram_created_from_template events fire (check analytics provider dashboard)
```

### Step 11.2 — Unit tests (key utilities only)

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event
```

Test:
- `toPlantUML()` — given a known graph, verify output string exactly.
- `useHistoryStack` — push/undo/redo cycle.
- `insertPattern()` — nodes get new IDs, positions offset correctly.

### Step 11.3 — Performance

- React Flow with 50+ nodes should stay above 60fps. Test with a large diagram.
- If performance degrades, enable React Flow's `nodesDraggable={true}` lazy rendering.
- Autosave payload for 50 nodes should be < 100KB (MongoDB 16MB limit is not a concern).
- `toPng` for thumbnail generation: run in a `requestIdleCallback` to avoid blocking.

---

## Phase 12 — Deployment

**Goal:** V1 is live on the internet.

### Step 12.1 — Infrastructure

| Service | Folder | What |
|---|---|---|
| **Vercel** | `frontend/` | Next.js app — set root directory to `frontend` in Vercel project settings |
| **Railway / Fly.io** | `backend/` | Express API — set root directory to `backend`, build command `npm run build`, start `npm start` |
| **MongoDB Atlas** | — | Cloud MongoDB (free M0 tier for V1) |
| **Cloudflare R2 / S3** | — | Thumbnail storage (if moving off base64) |

Both `frontend/` and `backend/` are deployed independently from the same GitHub repo. Vercel detects the `frontend/` folder as a Next.js project; Railway detects `backend/` as a Node.js project. No monorepo tooling is needed.

### Step 12.2 — Environment variables (production)

Add to Vercel dashboard and Railway/Fly.io:
- `MONGODB_URI` — Atlas connection string
- `BETTER_AUTH_SECRET` — production secret (generate new, different from dev)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console (add prod redirect URI)
- `CLIENT_URL` — production frontend URL
- `NEXT_PUBLIC_API_URL` — production backend URL

### Step 12.3 — MongoDB Atlas setup

1. Create M0 cluster (free).
2. Add DB user with read/write access.
3. Whitelist Railway/Fly.io IP ranges (or `0.0.0.0/0` for V1, tighten later).
4. Run seed script to insert template diagrams.

Point Railway/Fly.io's health check config at `GET /health` (Step 0.4) so a deploy that boots but fails to connect to Mongo is caught before traffic routes to it, rather than surfacing as 500s to real users.

### Step 12.4 — Google OAuth production setup

In Google Cloud Console:
- Add `https://yourdomain.com` to Authorized JavaScript origins.
- Add `https://your-api-domain.com/api/auth/callback/google` to Authorized redirect URIs.

### Step 12.5 — CI/CD

- **Vercel:** auto-deploys `frontend/` on push to `main`. Set "Root Directory" to `frontend` in the Vercel project settings.
- **Railway:** auto-deploys `backend/` on push to `main`. Set "Root Directory" to `backend`, build command to `npm run build`, start command to `npm start`.

Optional GitHub Actions workflow on every PR:
```yaml
# .github/workflows/ci.yml
jobs:
  typecheck-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run build
  typecheck-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npx tsc --noEmit
```

---

## Build Order Summary

| Phase | What ships | Risk addressed |
|---|---|---|
| 0 | Monorepo, toolchain | Nothing works but nothing breaks |
| 1 | Auth + Landing | Login works |
| 2 | Dashboard | CRUD works |
| **3** | **Canvas foundation** | **Infinite canvas feels right** |
| **4** | **UML Class Nodes** | **Core node interaction proven** |
| **5** | **Relationships** | **Core connector interaction proven** ← most critical |
| 6 | Editor UX | Keyboard, palette, themes |
| 7 | Autosave + Export | Data doesn't get lost, shareable output |
| 8 | Patterns + Templates | Differentiation features |
| 9 | Local mode | Reduces signup friction |
| 10 | Settings + Polish | Ready for real users |
| 11 | Testing | Confidence to ship |
| 12 | Deployment | Live |

> **Phases 3–5 are the most important.** If the class box + smart connector interaction doesn't feel instant and delightful, nothing else matters. Build these first. Ship them to real users as soon as Phase 7 (export) is done — the rest is acceleration, not foundation.

---

## UI Design Reference

### Color palette

```
Primary accent:   #6366F1  (indigo-500)
Accent hover:     #4F46E5  (indigo-600)
Selection:        #6366F1 + 20% opacity fill

Canvas (light):   #F8F8F8
Canvas (dark):    #111111
Canvas (whiteboard): #FFFFFF

Node fill (light):  #FFFFFF
Node fill (dark):   #1E1E1E
Node border:        #CBD5E1 (light) / #374151 (dark)
Node selected:      #6366F1 border + shadow

Topbar (light):   #FFFFFF
Topbar (dark):    #1C1C1E
Sidebar:          same as topbar

Text primary:     #111827 / #F9FAFB
Text secondary:   #6B7280 / #9CA3AF
Text mono:        JetBrains Mono, monospace
```

### Typography

```
Heading:          Inter or Geist Sans, 600 weight
Body:             Inter, 400 weight
Node name:        Inter, 500, 14px
Attributes/methods: JetBrains Mono, 12px
Stereotype:       Inter, 11px, italic
Multiplicity:     JetBrains Mono, 11px
```

### Spacing / sizing

```
Topbar height:    48px
Sidebar width:    220px (collapsible)
Statusbar height: 24px
Grid snap:        16px
Min node width:   180px
Node padding:     12px horizontal, 8px vertical per section
Section divider:  1px solid border-color
Border radius:    6px (nodes), 4px (handles)
```

---

*End of Implementation Plan*
*Estimated total build time (solo developer): 6–10 weeks for Phases 0–12.*
*Minimum to ship something real users can try: Phases 0–7 (~3–4 weeks).*
