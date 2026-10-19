# Home Dashboard

`frontend/src/pages/Home.tsx`, route `/` (protected). A single-screen summary of what needs the
student's attention: unread messages, the next study session, pending buddy requests, and shortcuts.

## Data sources

All data comes from existing domain hooks; Home adds no endpoints of its own.

| Hook | Backend call | Used for |
|---|---|---|
| `useAuth()` | — (localStorage) | `user.id`, fallback name |
| `useProfile(userId)` → `refresh()` | `GET /profile/full/{id}` | First name in the greeting (`profile.name`, else `user.username`) |
| `useMessages(userId)` → `conversations` | `GET /messages/conversations/{id}` on mount + every 8 s | DM strip, recent chats, unread totals |
| `useSessions(userId)` → `sessions`, `refresh()` | `GET /sessions/user/{id}` | Next session, today count, stats |
| `useBuddies(userId)` → `connected`, `incoming`, `refresh()` | `/connections/my-buddies/connected/{id}`, `/connections/my-buddies/sent/{id}`, `/connections/requested/{id}` | Buddy count, request list |
| `useConnectionActions(userId)` → `acceptRequest`, `rejectRequest`, `busyId` | `/connections/accept`, `/connections/reject` | Accept / Decline buttons |
| `useNow()` | — | Re-renders every 30 s so countdowns and live status stay current |

Profile, buddies and sessions are fetched once on mount; conversations keep polling via
`useMessages`. Session and connection semantics are documented in
[study-sessions.md](../../docs/study-sessions.md) and
[connections-and-search.md](../../docs/connections-and-search.md).

## Layout

```
┌ Hero ───────────────────────────────────────────────┐
│ date · "Good evening, Asha 👋" · status line   [Buddies][Upcoming][Hrs this week] │
├ Direct messages ────────────────────────────────────┤
│ (avatar strip, horizontally scrollable)  … recent chats (top 4) │
├ Next session (2/3) ─────────────┬ Buddy requests (1/3) ┤
├ Quick actions (4 cards) ────────────────────────────┤
```

### 1. Hero

- Greeting from `greetingForNow()` (morning < 12h, afternoon < 17h, evening) + first name.
- Status line, in priority order: sessions today (`formatDayLabel(starts_at) === "Today"`), else
  unread message total, else "Nothing scheduled today".
- Stats: **Buddies** = `connected.length`; **Upcoming** = sessions whose `liveStatus` is
  `upcoming` or `live`; **Hrs this week** = summed duration of `completed` sessions that ended in the
  last 7 days (1 decimal).

### 2. Direct messages (WhatsApp-style)

- Conversations are sorted **unread first, then by most recent `last_message_time`**.
- **Avatar strip**: one round avatar per buddy with first name below. Unread chats get an emerald
  ring and a count badge (`9+` cap). Avatars fall back to an initial if the image is missing or fails
  to load.
- Below it, the top 4 chats as rows: name (bold if unread), last message preview (or "Say hello 👋"),
  and time (`formatClock` for today, otherwise the day label).
- Clicking any avatar/row → `/chat?peer=<peer_id>`, which opens that thread directly
  (see [messaging.md](../../docs/messaging.md)). Header badge = total unread; "Open chats" → `/chat`.
- Empty state links to `/search` to find buddies.

### 3. Next session

- `nextSession` = first of the upcoming/live sessions (order as returned by `/sessions/user/{id}`).
- Shows title, partner avatar/name, day and time range, and a badge: `● LIVE NOW` (pulsing) or
  `starts in 2h 15m` (`formatRelative`).
- Button → `/session/<id>/room`: **Join now** when live, **Open room** otherwise.
- Up to two further sessions are listed underneath. Empty state links to `/session`.

### 4. Buddy requests

- Up to 3 incoming requests with sender name/avatar (falls back to `User #<sender_id>`) and their
  subjects or headline.
- **Accept** / **Decline** call the connection actions, then refresh buddies; buttons are disabled
  while that request is `busyId`.
- "See all N requests" → `/my-buddies` when there are more than 3.

### 5. Quick actions

| Card | Link |
|---|---|
| Find a partner | `/search` |
| Book a session | `/session` |
| Ask the AI tutor | `/ai?tab=tutor` |
| Quiz yourself | `/ai?tab=quiz` |

The `?tab=` deep link is described in [ai-suite.md](../../docs/ai-suite.md).

## Notes

- Home mounts its own `useMessages` instance, so it polls conversations independently of the
  Chat page; it does not open a thread or mark anything read.
- Styling follows [theme.md](theme.md): zinc glass cards, emerald accent, rose for "live".
