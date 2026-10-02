# Dummy Users & Profile Edit

## 1. Dummy users

Added **10 more** realistic Indian-student profiles to `backend/app/scripts/seed_users.py`
(same shape/style as the existing 4), and ran the seeder against the live DB. The script is
idempotent — re-running it skips any email that already exists.

```bash
cd backend && poetry run python -m app.scripts.seed_users
```

Total users in the DB after this: **18** (8 real/signed-up + 10 new seeded students), covering
every `proofOfWork` platform your Profile page renders (GitHub, Medium, Dribbble, Dev.to,
Kaggle) and a mix with/without `work_history` / `featuredPosts`, so you can see all states on
`/profile` and in Search results.

## 2. Profile edit (view + edit + persist)

You already had the right backend route — `POST /profile/onboard?user_id={id}` (in
`profile_route.py`, upserts via `ProfileRepository.create_or_update`) — it just wasn't wired
up from the frontend, and the page had no Edit button at all. Also found a real bug while
wiring it: `Profile.tsx` was reading `localStorage.getItem("user")`, but your `AuthProvider`
actually stores the logged-in user under the key `"user_profile"` — so the page was never
showing *your* profile, it was hardcoded to fall back to user id `5`.

### What changed
| File | Change |
|---|---|
| `frontend/src/types/profile.ts` | New `FullUserProfile` (display shape) and `RawProfile` (DB/edit shape) types. |
| `frontend/src/hooks/useProfile.ts` | `refresh()` → `GET /profile/full/{id}` for display; `fetchRaw()` → `GET /profile/{id}` to prefill the edit form; `save()` → `POST /profile/onboard?user_id={id}`, then auto-refreshes. |
| `frontend/src/components/profile/EditProfileModal.tsx` | New modal form: name, major/year/institution, location, about, study mode, Discord, LinkedIn, GitHub, skills (teach/learn), availability, learning approach. Preserves fields it doesn't edit (work history, featured posts, other proof-of-work platforms) by merging onto the raw profile it loaded. |
| `frontend/src/pages/Profile.tsx` | Now uses `useAuth()` for the real logged-in user id (fixing the bug above), added an **Edit Profile** button next to "Send Study Request", mounts the modal, typed the page properly (removed the blanket `any`). |

### How to use it
1. Log in as yourself (e.g. Nikhil).
2. Go to **Profile** (`/profile`) — it now loads *your* data via `GET /profile/full/{your_id}`,
   not a hardcoded user.
3. Click **Edit Profile** → fills the form from your current data (or blank defaults if you've
   never onboarded a profile yet).
4. Change anything, **Save Changes** → `POST /profile/onboard` → page refetches and the new
   data renders immediately.

### Verified live (via curl against the running backend + real DB)
- `GET /profile/{id}` → raw shape matches what the edit form expects.
- `POST /profile/onboard?user_id={id}` with an edited payload → `200`, DB updated.
- `GET /profile/full/{id}` immediately after → reflects the new location/bio/study mode/skills.
- Reverted the test edit back to the original seeded data afterward, so no seed data was left
  dirty.

### Known limitation (not blocking)
The edit modal covers the commonly-edited fields. **Work history** and **featured posts**
(arrays of objects) are preserved as-is but not editable from the UI yet — editing those needs
a small dynamic add/remove-row form, intentionally left out to keep this change scoped and fast.
