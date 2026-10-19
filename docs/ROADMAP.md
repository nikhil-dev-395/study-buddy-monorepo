# StudyBuddy MVP Roadmap

The original MVP checklist (previously `backend/ARCHITECTURE.md`), with items ticked where the code
implements them as of this revision. Notes in *italics* qualify partial implementations.

## Core features

- [x] User Authentication
  - [x] Sign up — *automatic on first Google sign-in (`POST /users/google/auth`)*
  - [x] Login — *Google Identity only*
  - [x] JWT Authentication — *30-day access token issued and sent by the frontend, but only
        `GET /users/me` verifies it; other routes trust `user_id` params*
  - [ ] Refresh tokens

- [x] User Profiles
  - [x] View profile — *own (`/profile`) and peers (`/profile/:id`)*
  - [x] Edit profile — *`EditProfileModal` → `POST /profile/onboard`; work history and featured
        posts not editable in the UI yet*
  - [x] Add bio
  - [x] Add skills — *`study_specs.can_teach` / `wants_to_learn`*

- [ ] Skill Listings
  - [x] Teach a skill — *profile "can teach" list*
  - [x] Learn a skill — *profile "wants to learn" list*
  - [ ] Browse available skills — *no skill catalogue; skills are found through peer search*

- [x] Buddy Matching — see [connections-and-search.md](connections-and-search.md)
  - [x] Find users by skill — *`GET /search/peers`*
  - [x] Send buddy request
  - [x] Accept/Reject request — *plus cancel*

- [x] Chat — see [messaging.md](messaging.md)
  - [x] One-to-one messaging — *accepted buddies only*
  - [x] Real-time updates — *Supabase Realtime when configured, polling fallback*

- [x] Session Scheduling — see [study-sessions.md](study-sessions.md)
  - [x] Create session
  - [x] View upcoming sessions
  - [x] Cancel/Reschedule session
  - [x] In-app video room — *Jitsi embed at `/session/:id/room`*

---

## AI features — see [ai-suite.md](ai-suite.md)

- [x] AI Study Roadmap
  - [x] Enter learning goal
  - [x] Select duration — *15 / 30 / 60 / 90 days*
  - [x] Generate personalized roadmap — *3 phases, topic checklist with progress saved in localStorage*

- [x] AI Quiz Generator
  - [x] Enter topic
  - [x] Generate 5–10 questions — *5 / 10 / 15, easy / medium / hard*
  - [x] Show answers/explanations — *plus "retry wrong"*

- [ ] AI Notes Summarizer
  - [x] Paste notes
  - [ ] Upload text file
  - [x] Generate concise summary
  - [x] Highlight key points — *plus action items and flashcards*

- [x] AI Chat Tutor
  - [x] Ask subject-related questions
  - [x] AI responds with explanations — *Markdown rendering, answer modes*
  - [x] Maintain chat history — *in-memory for the page session, last 10 turns sent as context; not persisted*

---

## Tech stack

- [x] Frontend: React (19, Vite, Tailwind v4)
- [x] Backend: FastAPI
- [x] Database: Supabase (Postgres via SQLModel; Realtime for chat)
- [x] AI: Google Gemini API *(chosen instead of OpenAI)*

---

## Optional

- [ ] Notifications — *only unread-message badges; no push/email*
- [x] Dark mode — *dark-only theme*
- [x] Profile avatars — *Google profile picture*
- [x] Responsive UI — *Tailwind breakpoints across pages*
- [ ] Deployment — *SPA configs exist (Netlify, Cloudflare Workers); backend URL/CORS are still
      hardcoded to localhost*

---

## Next up (from the docs' known-issues lists)

- [ ] Enforce the JWT on all routes and derive the user from the token
- [ ] Set `GOOGLE_CLIENT_ID` on the backend and fix `backend/.env.example`
- [ ] Lock down Supabase RLS on `messages`
- [ ] Make API base URL (AuthProvider) and CORS origins configurable
- [ ] Persist AI tutor history
- [ ] Tests (none in the repo yet)

## Google auth architecture (original sketch)

```
Frontend (React)
      |  1. User clicks "Sign in with Google"
      ↓
Google OAuth
      |  2. Returns Google ID token
      ↓
Frontend sends token to FastAPI   (POST /users/google/auth)
      |  3. Verify token
      ↓
FastAPI creates/finds user
      |  4. Returns its own JWT access token
```
