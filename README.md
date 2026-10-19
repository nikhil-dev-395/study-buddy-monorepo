<p align="center">
  <img alt="header" src="https://shieldcn.dev/header/gradient.svg?title=study+buddy&amp;subtitle=A+trusted+study+partner&amp;size=wide&amp;mode=dark&amp;image=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1451187580459-43490279c0fa%3Fw%3D1600%26q%3D70%26fit%3Dcrop%26fm%3Djpg" />
</p>

# StudyBuddy

StudyBuddy helps students find compatible study partners, connect, chat, meet in a video study
room, and learn faster with a built-in AI suite. Monorepo: a **FastAPI + SQLModel + Postgres
(Supabase)** API in `backend/` and a **React 19 + Vite + Tailwind v4** SPA in `frontend/`.

## Features

- **Google sign-in** — one click; the account is created on first login.
- **Profiles** — bio, academics, skills to teach / learn, availability, proof of work (GitHub,
  Medium, Dribbble, Dev.to, Kaggle), featured posts; editable in-app.
- **Search & buddy requests** — find peers by subject, skill or location; send, accept, reject,
  cancel requests.
- **Direct messages** — one-to-one chat between accepted buddies, unread badges, live updates
  (Supabase Realtime or polling).
- **Study sessions** — schedule, reschedule and cancel sessions with a buddy, then join an in-app
  Jitsi video room.
- **Home dashboard** — DMs, next session, pending requests and quick actions at a glance.
- **AI suite (Gemini)** — tutor with answer modes, practice quizzes with difficulty and
  explanations, notes → summary + flashcards, study plans with progress tracking.

## Quick start

Prerequisites: Python ≥ 3.14 with [Poetry](https://python-poetry.org/), Node.js with npm, a
PostgreSQL database (e.g. Supabase), a Google OAuth client ID, and a Gemini API key for AI features.

### Backend (http://localhost:8000)

```bash
cd backend
poetry install
# create backend/.env — required: POSTGRES_URL, JWT_SECRET_KEY, GOOGLE_CLIENT_ID, GEMINI_API_KEY
poetry run alembic upgrade head        # existing DB; see backend/ARCHITECTURE.md for a fresh DB
poetry run poe dev                     # uvicorn app.main:app --reload --port 8000  (same as startup.sh)
poetry run python -m app.scripts.seed_users   # optional demo users
```

### Frontend (http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_BASE_URL=http://localhost:8000, VITE_GOOGLE_CLIENT_ID, ...
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run knip`, `npm run preview` / `npm run deploy`
(Cloudflare Workers via wrangler).

The backend only allows CORS from `localhost:5173`/`5174`, and the login call targets
`http://localhost:8000`, so run both on those default ports locally. The full list of environment
variables is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#11-environment-variables).

## Documentation

Start with **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: system overview, auth flow, data model,
request flow, env vars, and an index of all feature docs. Status of the MVP checklist is in
[docs/ROADMAP.md](docs/ROADMAP.md); backend how-tos are in
[backend/ARCHITECTURE.md](backend/ARCHITECTURE.md).

<p align="center">
  <img alt="chart" src="https://shieldcn.dev/chart/github/commits/nikhil-dev-395.svg?theme=blue&amp;font=geist-mono" />
</p>
