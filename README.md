# LLDCanvas

> The fastest way to create UML diagrams for Low-Level Design interviews.

## Project Structure

```
LLDCanvas/
├── frontend/    Next.js + TypeScript + Tailwind + React Flow
└── backend/     Express + TypeScript + MongoDB + Better Auth
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI in `.env`)

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### Backend

```bash
cd backend
npm install
# Copy .env and fill in your values
npm run dev        # http://localhost:4000
```

### Environment Variables

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
BETTER_AUTH_URL=http://localhost:4000
```

**`backend/.env`**
```
MONGODB_URI=mongodb://localhost:27017/lldcanvas
BETTER_AUTH_SECRET=<random-32-char-string>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
CLIENT_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui |
| Canvas | React Flow (`@xyflow/react`) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | Better Auth (Google OAuth + email/password) |
| Export | html-to-image (PNG/SVG), custom PlantUML serializer |

## Implementation Phases

See [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the full phase-by-phase build plan.
