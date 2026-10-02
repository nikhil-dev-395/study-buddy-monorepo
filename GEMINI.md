# GEMINI.md - StudyBuddy Project Context & Development Guidelines

Welcome to the **StudyBuddy** repository. This document serves as the single source of truth for architecture, conventions, engineering standards, feature roadmaps, and instructions for developers and Gemini CLI agents working on this codebase.

---

## 1. Project Overview & Mission

**StudyBuddy** is a minimalist, high-trust peer-to-peer learning and study partner matching platform. It bridges the gap between students and working professionals looking to exchange knowledge, collaborate on skills, verify proof of work, and accelerate their learning journey with an integrated AI learning suite.

### Key Value Propositions
- 🤝 **Smart Matching**: Match peers based on complementary skills (skills offered vs. skills desired), availability, and study goals.
- 🔗 **Verified Proof of Work**: Showcase external footprints (GitHub, Medium, Dribbble, portfolios) to establish trust before connecting.
- ⚡ **AI Learning Suite**: Generate customized 30-day study roadmaps, interactive quizzes, note summaries, and real-time chat tutoring.
- 🌙 **Distraction-Free Dark Aesthetic**: High-contrast, glassmorphic UI designed specifically for focused, late-night study sessions.

---

## 2. System Architecture & Tech Stack

This project is organized as a monorepo containing distinct frontend and backend services:

```
study-buddy/
├── backend/               # FastAPI backend with PostgreSQL / Supabase & Alembic
│   ├── app/
│   │   ├── db/            # Database engine and session lifecycle
│   │   ├── models/        # SQLModel / SQLAlchemy database models
│   │   ├── repository/    # Data access layer (User, Profile, Connection)
│   │   ├── routes/        # API route controllers (users, profiles, connections, search)
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # Business logic & external services (Google OAuth, JWT)
│   │   └── utils/         # Unified API response/error handlers and structured logger
│   ├── migrations/        # Alembic database migration scripts
│   ├── pyproject.toml     # Poetry dependency definition
│   └── alembic.ini        # Alembic migration configuration
└── frontend/              # React 19 + TypeScript + Vite + Tailwind CSS v4
    ├── src/
    │   ├── api/           # API fetchers and HTTP client services
    │   ├── components/    # Reusable UI components (buddies, navbar, profile, search)
    │   ├── context/       # React Contexts (AuthProvider, SessionState)
    │   ├── hooks/         # Custom React hooks (useAuth, etc.)
    │   ├── pages/         # Route views (Home, Profile, Search, Buddies, Chat, Sessions, AI)
    │   ├── routes/        # Router configuration and ProtectedRoute guards
    │   ├── types/         # TypeScript definitions
    │   └── utils/         # Environment variables (Zod-validated) and Pino logger
    ├── docs/              # Frontend design guidelines (theme.md)
    └── package.json       # Frontend scripts and dependencies
```

### Technology Highlights
- **Backend**:
  - **Framework**: FastAPI (Python >= 3.14)
  - **ORM / Models**: SQLModel (SQLAlchemy + Pydantic)
  - **Database**: PostgreSQL (Supabase)
  - **Migrations**: Alembic
  - **Package & Task Management**: Poetry + PoeThePoet
  - **Authentication**: Google OAuth verification (`google-auth`) + Custom JWT (Access & Refresh tokens)
- **Frontend**:
  - **Framework**: React 19 + TypeScript
  - **Build Tool**: Vite 8
  - **Styling**: Tailwind CSS v4 (Glassmorphism & high-contrast dark theme)
  - **Routing**: React Router v7
  - **Validation**: Zod (environment and input validation)
  - **Logging**: Pino / Pino-pretty
  - **Deployments**: Netlify / Cloudflare Workers

---

## 3. Feature Status & Product Roadmap

### Implemented / In-Progress Features ✅
- [x] **Google OAuth Authentication**: Frontend Google login exchanging ID token with FastAPI backend for JWT access tokens.
- [x] **User Profiles & Proof of Work**: User bio, profile picture, social/portfolio links (GitHub, Medium, Dribbble), and skill listings.
- [x] **Skill Listings**: Support for adding and categorizing skills (skills to teach vs. skills to learn).
- [x] **Buddy Search**: Query users by name, skills, and learning interests.
- [x] **Connection Requests**: Send, accept, reject, and inspect connection statuses between study partners.
- [x] **Glassmorphic Dark UI**: Consistent responsive design with dark backgrounds, emerald accents, and micro-badges.

### Upcoming & Planned Features 🚀
- [ ] **Token Lifecycle Enhancement**: Refresh token rotation, silent re-authentication, and session expiration handling.
- [ ] **1-on-1 Direct Messaging (Chat)**: Real-time peer-to-peer messaging using WebSockets or Supabase Realtime.
- [ ] **Study Session Scheduling**:
  - Create, manage, and RSVP to study sessions.
  - Integration with calendar links (Google Calendar / ICS export).
  - Rescheduling and cancellation workflows.
- [ ] **AI Learning Suite**:
  - **AI Study Roadmap Generator**: Input goals and timeline (e.g., 30 days) to generate structured milestones and resource checklists.
  - **AI Quiz Generator**: Generate topic-based multiple-choice and conceptual quizzes with instant feedback and explanations.
  - **AI Notes Summarizer**: Upload text or paste notes to extract bullet points, definitions, and executive summaries.
  - **AI Chat Tutor**: Contextual study assistant answering technical questions and maintaining session memory.
- [ ] **In-App & Email Notifications**: Connection request alerts, scheduled session reminders, and chat pings.

---

## 4. Development Workflows & Useful Commands

### Backend Commands (run inside `/backend`)
```bash
# Install dependencies
poetry install

# Run backend development server (port 8000)
poetry run dev
# Or directly via uvicorn:
poetry run uvicorn app.main:app --reload --port 8000

# Create new Alembic migration after model updates
poetry run alembic revision --autogenerate -m "describe_changes"

# Apply pending migrations
poetry run alembic upgrade head

# Run linter
poetry run pylint app/
```

### Frontend Commands (run inside `/frontend`)
```bash
# Install dependencies
npm install

# Run frontend development server (Vite on port 5173)
npm run dev

# Run TypeScript check and production build
npm run build

# Run ESLint
npm run lint

# Preview build locally via Wrangler / Cloudflare simulator
npm run preview
```

---

## 5. Engineering Standards & Code Conventions

### Backend (FastAPI / SQLModel)
1. **Uniform API Responses**:
   - Always return responses using `ApiResponse.success()` and `ApiResponse.error()` from `app.utils.api.api_response`.
   - Never return raw dictionaries or unstandardized JSON responses from route handlers.
2. **Layered Architecture**:
   - `routes/`: Handles HTTP requests, parameter validation, and status codes.
   - `services/`: Encapsulates business logic, authentication workflows, and external API calls.
   - `repository/`: Contains database queries and data mutations using SQLModel/SQLAlchemy sessions.
   - `models/`: Database schema definitions.
   - `schemas/`: Request/response DTOs and validation models.
3. **Database Integrity & Migrations**:
   - Never modify production/shared database tables manually.
   - Always create and commit descriptive Alembic migration scripts for model changes.
4. **Structured Logging**:
   - Use the central logger (`from app.utils.logger import logger`).
   - Do not use `print()` statements for application logging. Log appropriate levels (`info`, `warning`, `error`, `critical`).
5. **Exception Handling**:
   - Raise explicit `HTTPException` or custom exceptions handled by the global exception handlers in `app/main.py`.

### Frontend (React / TypeScript / Tailwind)
1. **Strict Type Safety**:
   - TypeScript is configured strictly. Avoid using `any` or loose casts (`as any`).
   - Validate runtime external data and environment variables using `zod`.
2. **Design System & Styling**:
   - Follow the design system documented in `frontend/docs/theme.md`.
   - **Backgrounds**: Dark neutrals (`bg-black`, `bg-zinc-900/70`, `backdrop-blur-md`).
   - **Borders**: Subdued dividers (`border-zinc-800/80`, `hover:border-zinc-700`).
   - **Accents**: Emerald accents (`text-emerald-400`, `bg-emerald-500`) for active states, tags, and primary CTAs.
   - **Typography**: Clean hierarchy (`text-zinc-100` headings, `text-zinc-300` body, `text-zinc-400` metadata).
   - **Shapes & Feedback**: Large border radii (`rounded-2xl`, `rounded-full`), monospace ID chips (`text-[10px] font-mono`), subtle hover scale/glow transitions.
3. **Logging & Diagnostics**:
   - Use the Pino logger configured in `src/utils/logger.ts` rather than `console.log`.
4. **Routing & Auth Guarding**:
   - Protect private views by registering them under `<ProtectedRoute><Layout /></ProtectedRoute>` in `src/routes/router.tsx`.
   - Consume session state via the `useAuth()` hook.

---

## 6. Gemini CLI Operational Directives & Guardrails

When working on this repository, Gemini CLI must abide by the following operational directives:

1. **Verify Before Concluding**:
   - For backend changes, verify imports, models, and ensure `pylint` or syntax checks pass.
   - For frontend changes, run `npm run build` or `npm run lint` in `frontend/` to guarantee no broken TypeScript types or build regressions.
2. **Respect Data Contracts**:
   - Changes to backend endpoint response structures must be reflected in frontend API clients, types, and mock data.
   - Keep `backend/app/schemas/` aligned with `frontend/src/types/`.
3. **Database Safety**:
   - Never suggest dropping tables or destructive raw SQL in migration files without explicit confirmation.
   - Ensure migration scripts are clean, reversible, and tested with `alembic upgrade head`.
4. **Non-Destructive Git Actions**:
   - Do not stage (`git add`) or commit changes unless the user explicitly requests it.
   - Never force-push or alter git history.
5. **Follow the Research -> Strategy -> Execution Cycle**:
   - Inspect existing implementations and patterns before introducing new files or libraries.
   - Maintain the existing design aesthetic and architecture patterns rather than introducing conflicting paradigms.
