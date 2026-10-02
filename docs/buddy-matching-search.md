# Buddy Matching & Search

Wires `Search.tsx` and `Buddies.tsx` to the existing backend routes (`/search/peers`,
`/connections/*`). No new backend endpoints were needed — this was a frontend wiring task.

## What it does

- **Search** (`/search` route → `Search.tsx`): type a subject, skill, or location and hit
  Enter (or just keep typing) to query `GET /search/peers`. Each result shows a
  **Connect** button that calls `POST /connections/send`. Already-pending or already-accepted
  peers show **Requested** / **Connected** instead, disabled.
- **Buddies** (`/my-buddies` route → `Buddies.tsx`): three tabs backed by existing endpoints:
  - **My Buddies** — accepted connections (`GET /connections/my-buddies/connected/{id}`), each
    with a **Message** button that jumps to `/chat`.
  - **Sent Requests** — requests you sent (`GET /connections/my-buddies/sent/{id}`), with a
    **Cancel** button (`POST /connections/cancel`).
  - **Incoming** — requests waiting on you (`POST /connections/requested/{id}`), with
    **Accept** / **Reject** buttons (`POST /connections/accept` / `/reject`).

## New/changed files

| File | Purpose |
|---|---|
| `frontend/src/types/buddy.ts` | `BuddyCard` / `ConnectionRequestRecord` types matching the backend's `BuddyCardResponse` / `ConnectionResponseSchema`. |
| `frontend/src/hooks/useSearch.ts` | Runs `/search/peers`, holds query/results/loading/error. |
| `frontend/src/hooks/useConnections.ts` | `useConnectionActions` (send/accept/reject/cancel) + `useBuddies` (fetches the three lists for the Buddies page). |
| `frontend/src/components/search/User.tsx` | Generalized the hardcoded "Connect" button into `actionLabel` / `actionDisabled` / `actionLoading` / `onAction` props so it's reusable across Search and Buddies. |
| `frontend/src/components/search/Result.tsx` | Now a presentational component driven by props instead of a local mock JSON import. |
| `frontend/src/pages/Search.tsx`, `frontend/src/pages/Buddies.tsx` | Rewritten to use the hooks above; removed all mock/dummy data. |

## How to use it

1. **Run both servers** (from repo root):
   ```bash
   cd backend && poe dev        # http://localhost:8000
   cd frontend && npm run dev   # http://localhost:5173
   ```
2. **Seed some test users** (optional, if your DB is empty):
   ```bash
   cd backend && poetry run python -m app.scripts.seed_users
   ```
3. Log in, go to **Search**, type a skill/location (e.g. `React`, `Pune`) and press Enter.
4. Click **Connect** on a result — it moves to **Buddies → Sent Requests**.
5. Log in as the *other* user — their **Buddies → Incoming** tab shows the request;
   click **Accept**.
6. Back on the first account, **Buddies → My Buddies** now shows that person with a
   **Message** button that opens `/chat` (see `docs/` or the chat feature for the
   messaging flow — only accepted buddies can message each other).

## Known limitations (fast-follow, not blocking)

- The **Incoming** tab only has `GET /connections/requested/{id}` to work with, which
  returns the raw connection record (sender id, message, timestamps) — **no sender
  name/avatar**, since that endpoint wasn't built to join profile data. It currently
  renders as `User #<id>`. Fix: add profile joins to that backend route (same pattern
  already used in `get_connected_peers_with_profiles` / `get_sent_requests_with_profiles`
  in `connection_repo.py`), then switch the Incoming tab to the richer `UserResult` card.
- Search fires on every keystroke (no debounce) — fine for a small seeded dataset, but
  add a `setTimeout`/`useDeferredValue` debounce before pointing this at a large user base.
