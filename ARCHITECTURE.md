# Momentum — Architecture & Data Flow

## Overview

Momentum is a personal developer productivity dashboard. It pulls data from external services (GitHub, WakaTime), processes it, and shows meaningful stats on a dashboard.

**Backend stack changed since the original plan**: this project is built on **Django + Django REST Framework**, not Express/Prisma. Auth uses **httpOnly-cookie JWT** (via `djangorestframework-simplejwt`, with a custom cookie-reading authentication class), not `localStorage`.

---

## The 6 Layers

```
┌─────────────────────────────────────────────────────┐
│           Layer 6 — Frontend (Next.js)              │
├─────────────────────────────────────────────────────┤
│           Layer 5 — Storage                         │
│     SQLite (dev)  |  Redis (planned)                │
├─────────────────────────────────────────────────────┤
│           Layer 4 — Core Backend Services           │
│   Dashboard API (GitHub repos/commits) | AI (planned)│
├─────────────────────────────────────────────────────┤
│           Layer 3 — Job Queue                       │
│         Celery + Redis (planned)                    │
├─────────────────────────────────────────────────────┤
│           Layer 2 — OAuth Token Manager              │
│         GitHub OAuth (done) | WakaTime (planned)     │
├─────────────────────────────────────────────────────┤
│           Layer 1 — Data Sources                    │
│       GitHub API  |  WakaTime API (planned)         │
└─────────────────────────────────────────────────────┘
```

---

## Layer 1 — Data Sources

External services you don't control. They expose APIs (URLs you call to get data).

| Source | What it provides | How | Status |
|---|---|---|---|
| **GitHub API** | Repos, commits | REST API via OAuth token | ✅ Done |
| **WakaTime API** | Coding time, languages, projects | REST API via OAuth token | ⬜ Planned |
| **VS Code** | Keystrokes, active file, time spent | WakaTime extension | ⬜ Planned |

---

## Layer 2 — OAuth Token Manager

### GitHub OAuth flow (as actually implemented)

```
User clicks "Continue with GitHub" (frontend)
        │
        ▼
GET /api/auth/github/   (accounts.views.GithubLoginView)
  → redirects browser to
    https://github.com/login/oauth/authorize
    ?client_id=...&redirect_uri=.../api/auth/github/callback/&scope=read:user user:email
        │
        ▼
User approves on GitHub
        │
        ▼
GitHub redirects browser to
  GET /api/auth/github/callback/?code=abc123   (accounts.views.GithubCallbackView)
        │
        ▼
Backend exchanges code for access_token
  POST https://github.com/login/oauth/access_token
  { client_id, client_secret, code }   (server-to-server, via `requests`)
        │
        ▼
Backend fetches GitHub profile
  GET https://api.github.com/user           (id, login, email)
  GET https://api.github.com/user/emails    (fallback if email is private)
        │
        ▼
Backend finds-or-creates a local User
  User.objects.get(github_id=...)  → found: update github_token, save()
  → not found: User.objects.create_user(username, email, github_id, github_token)
  (password is left unusable — this account can only log in via GitHub)
        │
        ▼
Backend issues its own JWT (access + refresh), sets as httpOnly cookies
        │
        ▼
Redirect browser to http://localhost:3000/dashboard
```

### Tokens stored per user (SQLite, via `accounts.User` model)

| Field | What it's for |
|---|---|
| `github_id` | Unique GitHub account identifier — links a GitHub login to a local `User` row |
| `github_token` | Calling GitHub API on behalf of the user (repos, commits) |
| `email` | Unique — used as the login identifier for email/password auth |

### Auth tokens — JWT in httpOnly cookies (not localStorage)

Login (`POST /api/auth/login/`), register, and the GitHub callback all funnel through a shared helper, `set_auth_cookies()` (`accounts/views.py`):

```python
def set_auth_cookies(response, user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    response.set_cookie(key='access_token', value=access, httponly=True, samesite='Lax', secure=False)
    response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, samesite='Lax', secure=False)
    return response
```

- **`access_token`** — short-lived (~5 min default), sent automatically on every request via cookie, read by a custom `CookieJWTAuthentication` class (`accounts/authentication.py`) instead of the default `Authorization: Bearer` header.
- **`refresh_token`** — longer-lived, used only by `POST /api/auth/refresh/` to mint a new `access_token` without forcing a full re-login.
- **`httponly=True`** — deliberate choice over `localStorage`: JavaScript can never read these cookies, closing the main XSS-token-theft vector that `localStorage`-based JWT has.

---

## Layer 3 — Job Queue (Celery + Redis)

*Planned — not yet built.*

Same motivation as the original plan (avoid calling GitHub/WakaTime live on every dashboard load), just Django's ecosystem equivalent of BullMQ:

| Tool | Role |
|---|---|
| **Celery** | Job queue — schedule and manage background jobs (Python/Django's BullMQ equivalent) |
| **Redis** | Broker — stores the jobs queue + cached API responses |
| **Worker** | Background process that picks up and runs jobs |

---

## Layer 4 — Core Backend Services

### Dashboard API — ✅ partially built (`integrations` app)

Two endpoints exist today, both requiring an authenticated user with a stored `github_token`:

**`GET /api/github/repos/`** (`GithubRepoViews`)
```python
def fetch_github_repos(github_token):
    response = requests.get(
        'https://api.github.com/user/repos',
        headers={"Authorization": f"Bearer {github_token}"},
    )
    return response.json()
```
Returns the user's GitHub repos directly (GitHub's response shape, unmodified).

**`GET /api/github/commits/`** (`GithubCommitViews`)
GitHub has no single "all my commits across all repos" endpoint, so this aggregates:
1. Fetch the user's repos (reuses `fetch_github_repos`), take the top 5 (GitHub returns most-recently-updated first)
2. For each of those repos, `GET /repos/{full_name}/commits`
3. Combine all commits into one list, sort by author date (newest first), return the top 15

### Metrics / AI Insight services

*Planned — not yet built.* Same idea as originally scoped: crunch activity into numbers, then optionally summarize via an LLM.

---

## Layer 5 — Storage

| Database | Best for | What Momentum stores | Status |
|---|---|---|---|
| **SQLite** | Dev-time relational storage | Users, GitHub tokens/id, auth | ✅ In use (dev) |
| **PostgreSQL** | Same, at production scale | Would replace SQLite for deployment | ⬜ Planned |
| **Redis** | Fast temporary data | Job queue, API cache (once Celery is added) | ⬜ Planned |

### Current schema — `accounts.User` (extends Django's `AbstractUser`)

```python
class User(AbstractUser):
    github_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    email = models.EmailField(unique=True)          # overrides AbstractUser's non-unique email
    github_token = models.CharField(max_length=255, null=True, blank=True)
```
Plus everything `AbstractUser` already provides: `id`, `username` (unique), `password` (hashed; unusable for GitHub-only accounts), `first_name`, `last_name`, `is_staff`, `is_active`, `is_superuser`, `date_joined`, `last_login`.

---

## Layer 6 — Frontend (Next.js)

| Tool | Role |
|---|---|
| **Next.js (App Router)** | React framework, routing |
| **Tailwind CSS** | Styling |
| **Recharts** | Charts (planned) |

### Pages

| Route | What it does |
|---|---|
| `/login` | Email/password login form + "Continue with GitHub" button — calls `POST /api/auth/login/`, `credentials: 'include'` |
| `/signup` | Email/password register form + "Continue with GitHub" — calls `POST /api/auth/register/` |
| `/dashboard` | Fetches `/api/auth/me/`, `/api/github/repos/`, `/api/github/commits/` on mount; redirects to `/login` if not authenticated |

All requests to the backend use `credentials: 'include'` so the httpOnly auth cookies are sent automatically.

---

## Full Data Flow — Dashboard Load (as built)

```
Browser (localhost:3000/dashboard)
        │
        │ useEffect #1: GET http://localhost:8000/api/auth/me/  (credentials: include)
        │    → CookieJWTAuthentication reads access_token cookie
        │    → not authenticated → redirect to /login
        │    → authenticated → returns { id, username, email }
        │
        ├── useEffect #2: GET /api/github/repos/
        │     → request.user.github_token → GitHub /user/repos → JSON list
        │     → not connected to GitHub → show "Connect GitHub" card
        │
        └── useEffect #3: GET /api/github/commits/
              → fetch top 5 repos → per-repo /commits → combine → sort → top 15
        │
        ▼
Frontend renders: user greeting, repo cards, commit cards
```

---

## Refresh Token Flow (Layer 2, `POST /api/auth/refresh/`)

```
Access token expires (~5 min)
        │
        ▼
Any protected request → 401 (CookieJWTAuthentication can't validate expired access_token)
        │
        ▼
POST /api/auth/refresh/   (RefreshView, AllowAny — access token isn't required here)
  → reads refresh_token cookie
  → RefreshToken(refresh_token) validates signature + expiry
  → valid: mint new access_token, set as cookie, return 200
  → invalid/expired: 401 "please login again" — refresh_token itself is the root of
    trust; nothing can renew it once it's expired
```

*Not yet wired into the frontend* — currently the frontend doesn't auto-detect a `401` and call this endpoint; that "retry the failed request after refreshing" logic is a planned improvement.

---

## WakaTime OAuth Flow

*Planned — not yet built.* Same shape as the GitHub flow will apply once implemented: redirect → callback → code-for-token exchange → store `wakatime_token` on `User` → reuse the existing `set_auth_cookies` session mechanism (no new auth system needed, just a new token field + new OAuth app).

---

## Current Project Structure

```
momentum/
├── backend/
│   ├── config/
│   │   ├── settings.py            ← env-driven config (django-environ), CORS, JWT, GitHub OAuth keys
│   │   └── urls.py                ← includes accounts.urls, integrations.urls
│   ├── accounts/                  ← auth + GitHub OAuth
│   │   ├── models.py              ← User (AbstractUser + github_id, github_token, unique email)
│   │   ├── serializers.py         ← RegisterSerializer, UserSerializer
│   │   ├── authentication.py      ← CookieJWTAuthentication (reads JWT from cookie, not header)
│   │   ├── views.py               ← Register/Login/Me/Logout/GithubLogin/GithubCallback/Refresh
│   │   └── urls.py
│   └── integrations/              ← GitHub data endpoints
│       ├── views.py                ← GithubRepoViews, GithubCommitViews
│       └── urls.py
│
└── frontend/
    └── app/
        ├── login/page.tsx
        ├── signup/page.tsx
        └── dashboard/page.tsx
```

---

## What's Built vs Planned

| Layer | Status | What |
|---|---|---|
| Layer 1 — Data Sources | 🔶 Partial | GitHub API done, WakaTime planned |
| Layer 2 — OAuth | 🔶 Partial | GitHub OAuth + cookie-JWT auth done, WakaTime planned |
| Layer 3 — Job Queue | ⬜ Planned | Celery + Redis background sync |
| Layer 4 — Services | 🔶 Partial | Dashboard API (repos + commits) done; Metrics/AI Insight planned |
| Layer 5 — Storage | 🔶 Partial | SQLite (dev) done; Postgres + Redis planned |
| Layer 6 — Frontend | 🔶 Partial | Login/signup/dashboard wired to real backend; charts planned |
