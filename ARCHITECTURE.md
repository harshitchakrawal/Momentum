# Momentum — Architecture & Data Flow

## Overview

Momentum is a personal developer productivity dashboard. It pulls data from external services (GitHub, WakaTime), processes it, and shows meaningful stats on a dashboard.

---

## The 6 Layers

```
┌─────────────────────────────────────────────────────┐
│           Layer 6 — Frontend (Next.js)              │
├─────────────────────────────────────────────────────┤
│           Layer 5 — Storage                         │
│     PostgreSQL  |  TimescaleDB  |  Redis            │
├─────────────────────────────────────────────────────┤
│           Layer 4 — Core Backend Services           │
│   Activity Service | Metrics Service | AI Service   │
├─────────────────────────────────────────────────────┤
│           Layer 3 — Job Queue                       │
│              BullMQ + Redis                         │
├─────────────────────────────────────────────────────┤
│           Layer 2 — OAuth Token Manager             │
│         GitHub OAuth  |  WakaTime OAuth             │
├─────────────────────────────────────────────────────┤
│           Layer 1 — Data Sources                    │
│       GitHub API  |  WakaTime API  |  VS Code       │
└─────────────────────────────────────────────────────┘
```

---

## Layer 1 — Data Sources

External services you don't control. They expose APIs (URLs you call to get data).

| Source | What it provides | How |
|---|---|---|
| **GitHub API** | Commits, repos, PRs, activity | REST API via OAuth token |
| **WakaTime API** | Coding time, languages, projects | REST API via OAuth token |
| **VS Code** | Keystrokes, active file, time spent | WakaTime extension tracks and sends to WakaTime |

**Status:** GitHub + WakaTime connected. VS Code tracked via WakaTime extension.

---

## Layer 2 — OAuth Token Manager

Before calling any external API on behalf of a user, you need their permission. OAuth is the standard way this works.

### How OAuth works (same flow for GitHub and WakaTime):

```
User clicks "Connect GitHub"
        │
        ▼
Backend redirects to GitHub login page
  GET https://github.com/login/oauth/authorize
  ?client_id=xxx&scope=read:user repo
        │
        ▼
User approves on GitHub
        │
        ▼
GitHub sends one-time CODE to your callback URL
  GET /auth/github/callback?code=abc123
        │
        ▼
Backend exchanges code for real token
  POST https://github.com/login/oauth/access_token
  { client_id, client_secret, code }
        │
        ▼
GitHub returns access_token
        │
        ▼
Backend saves token in PostgreSQL
  user.githubToken = "gho_xxx..."
        │
        ▼
All future GitHub API calls use this token
```

### Tokens stored per user (PostgreSQL):

| Field | What it's for |
|---|---|
| `githubToken` | Calling GitHub API on behalf of user |
| `wakatimeToken` | Calling WakaTime API on behalf of user |

### JWT — your own auth token:

When a user logs in, your backend creates a JWT:
```
jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '7d' })
= "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abc123"
```

- Frontend stores JWT in `localStorage`
- Every API request sends it: `Authorization: Bearer <jwt>`
- `auth middleware` verifies it and extracts `userId`

---

## Layer 3 — Job Queue (BullMQ + Redis)

*Planned — not yet built.*

You cannot call GitHub/WakaTime API in real time on every dashboard load — too slow, and APIs rate-limit you. Instead, run background jobs.

```
User opens dashboard
        │
        ▼
Backend checks Redis cache
  → Cache hit: return cached data instantly
  → Cache miss: add job to BullMQ queue
        │
        ▼
Worker picks up job
  → Calls GitHub/WakaTime API
  → Saves result to PostgreSQL + Redis cache
        │
        ▼
Next time user opens dashboard → cache hit → instant
```

| Tool | Role |
|---|---|
| **BullMQ** | Job queue — schedule and manage background jobs |
| **Redis** | Stores the jobs queue + cached API responses |
| **Worker** | Background process that picks up and runs jobs |

---

## Layer 4 — Core Backend Services

*Planned — not yet built.*

Three services, each with one responsibility:

| Service | Input | Output |
|---|---|---|
| **Activity Service** | Raw GitHub events (commits, PRs) | Normalised activity feed |
| **Metrics Service** | Activity + WakaTime data | Useful numbers (hours coded, flow score) |
| **AI Insight Service** | Metrics | Human-readable insights via Claude API |

Example AI insight:
> "Your best focus window is 9–11am. You averaged 2.3 commits per session this week."

---

## Layer 5 — Storage

Three databases, each chosen for what it does best:

| Database | Best for | What Momentum stores |
|---|---|---|
| **PostgreSQL** | Structured, relational data | Users, OAuth tokens, goals |
| **TimescaleDB** | Time-series data at scale | Keystroke events, coding sessions |
| **Redis** | Fast temporary data | Sessions, job queue, API cache |

### Current PostgreSQL schema:

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String?   @unique
  passwordHash  String?
  name          String?
  githubId      String?   @unique
  githubToken   String?
  avatarUrl     String?
  wakatimeToken String?
  createdAt     DateTime  @default(now())
}
```

---

## Layer 6 — Frontend (Next.js)

Next.js app that calls the Express API and renders data.

| Tool | Role |
|---|---|
| **Next.js** | React framework, routing, SSR |
| **Tailwind CSS** | Styling |
| **Recharts** | Charts (planned) |
| **Zustand** | Global state management (planned) |

### Pages:

| Route | What it shows |
|---|---|
| `/` | Login page — "Continue with GitHub" |
| `/dashboard` | Main dashboard — commits, repos, coding time |
| `/auth/callback` | Handles GitHub OAuth redirect, saves JWT |

---

## Full Data Flow — Dashboard Load

What happens when you open the dashboard:

```
Browser (localhost:3000/dashboard)
        │
        │ 1. Check localStorage for JWT token
        │    → No token → redirect to login
        │    → Has token → continue
        │
        ▼
Frontend makes 3 parallel API calls
        │
        ├── GET /user/me
        │     → auth middleware verifies JWT → userId = 1
        │     → prisma.user.findUnique({ id: 1 })
        │     → returns { name, email, avatarUrl }
        │
        ├── GET /github/repos
        │     → auth middleware → userId = 1
        │     → fetch user.githubToken from DB
        │     → call GitHub API: GET /user/repos
        │     → return top 10 repos
        │
        ├── GET /github/commits
        │     → auth middleware → userId = 1
        │     → fetch user.githubToken from DB
        │     → call GitHub API: GET /search/commits
        │     → return last 7 days commits
        │
        └── GET /auth/wakatime/stats
              → auth middleware → userId = 1
              → fetch user.wakatimeToken from DB
              → call WakaTime API: GET /users/current/stats/last_7_days
              → return { totalSeconds, languages, projects }
        │
        ▼
Frontend renders:
  ┌──────────────────────────────────────┐
  │  Hey, Harshit 👋                     │
  │                                      │
  │  Commits: 9  Repos: 7  Time: 5h 30m  │
  │                                      │
  │  Recent Commits  │  Recent Repos     │
  │                  │                   │
  │  Top Languages   │  Top Projects     │
  └──────────────────────────────────────┘
```

---

## GitHub OAuth Flow (Detailed)

```
Frontend                Backend              GitHub
   │                       │                   │
   │  click "Connect GitHub"│                   │
   │──────────────────────▶│                   │
   │                       │  redirect to       │
   │◀──────────────────────│──────────────────▶│
   │                       │                   │
   │         GitHub shows permission screen     │
   │                       │                   │
   │  user clicks Authorize │                   │
   │                       │◀──────────────────│
   │                       │  ?code=abc123      │
   │                       │                   │
   │                       │  POST /access_token│
   │                       │──────────────────▶│
   │                       │◀──────────────────│
   │                       │  githubToken       │
   │                       │                   │
   │                       │  save to DB        │
   │                       │  create JWT        │
   │◀──────────────────────│                   │
   │  redirect + JWT token  │                   │
```

---

## WakaTime OAuth Flow (Detailed)

```
Frontend              Backend            WakaTime
   │                     │                  │
   │  click "Connect      │                  │
   │   WakaTime"          │                  │
   │────────────────────▶│                  │
   │  ?token=<JWT>        │                  │
   │                     │  redirect +       │
   │◀────────────────────│  state=<JWT>     │
   │                     │─────────────────▶│
   │                     │                  │
   │       WakaTime shows permission screen  │
   │                     │                  │
   │  user approves       │                  │
   │                     │◀─────────────────│
   │                     │  ?code=xxx        │
   │                     │  &state=<JWT>     │
   │                     │                  │
   │                     │  verify JWT       │
   │                     │  → userId = 1     │
   │                     │                  │
   │                     │  POST /token      │
   │                     │─────────────────▶│
   │                     │◀─────────────────│
   │                     │  wakatimeToken    │
   │                     │                  │
   │                     │  save to DB       │
   │◀────────────────────│                  │
   │  redirect /dashboard │                  │
   │  ?wakatime=connected │                  │
```

---

## Current Project Structure

```
momentum/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← DB models
│   │   └── migrations/            ← DB version history
│   └── src/
│       ├── index.js               ← Express app entry point
│       ├── db.js                  ← Prisma client
│       ├── middleware/
│       │   └── auth.js            ← JWT verification
│       ├── routes/
│       │   ├── auth.js            ← register / login
│       │   ├── github.js          ← GitHub OAuth
│       │   ├── githubData.js      ← repos / commits
│       │   ├── user.js            ← user profile
│       │   └── wakatime.js        ← WakaTime OAuth + stats
│       └── services/
│           ├── github.js          ← GitHub API calls
│           └── wakatime.js        ← WakaTime API calls
│
└── frontend/
    └── app/
        ├── page.tsx               ← Login page
        ├── dashboard/
        │   └── page.tsx           ← Main dashboard
        └── auth/callback/
            └── page.tsx           ← GitHub OAuth callback
```

---

## What's Built vs Planned

| Layer | Status | What |
|---|---|---|
| Layer 1 — Data Sources | ✅ Done | GitHub API, WakaTime API |
| Layer 2 — OAuth | ✅ Done | GitHub OAuth, WakaTime OAuth, JWT auth |
| Layer 3 — Job Queue | ⬜ Planned | BullMQ + Redis background sync |
| Layer 4 — Services | ⬜ Planned | Activity, Metrics, AI Insight |
| Layer 5 — Storage | 🔶 Partial | PostgreSQL done, TimescaleDB planned |
| Layer 6 — Frontend | 🔶 Partial | Basic dashboard done, charts planned |
