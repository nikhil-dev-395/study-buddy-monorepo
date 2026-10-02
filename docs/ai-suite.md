# AI Suite (Gemini-powered)

Wires all four AI Suite tabs — Roadmap, Quiz, Notes Summarizer, Chat Tutor — to real
Gemini API calls. No training, no fine-tuning, no vector DB — this is "moderate level":
plain prompt-in, structured-JSON-out, same pattern across all four features.

## What changed

| File | Purpose |
|---|---|
| `backend/.env` | Added `GEMINI_API_KEY` and `GEMINI_MODEL` (server-side only — never shipped to the frontend). |
| `backend/app/services/ai/gemini_service.py` | `generate_json(prompt)` — calls Gemini with `responseMimeType: application/json` so the model returns pure JSON, no markdown-fence parsing needed. Retries up to 3x on `429`/`503` (transient rate-limit/overload), respecting Google's suggested `retryDelay` when given. |
| `backend/app/routes/ai_route.py` | `POST /ai/roadmap`, `/ai/quiz`, `/ai/summarize`, `/ai/tutor` — each builds a schema-constrained prompt and returns the parsed JSON through the usual `ApiResponse` envelope. |
| `frontend/src/hooks/useAiSuite.ts` | `generateRoadmap`, `generateQuiz`, `summarizeNotes`, `askTutor` — shared `loading`/`error` state. |
| `frontend/src/pages/AiSuite.tsx` | All 4 tabs rewired to the hook; removed every mock array / `setTimeout` fake. Also fixed 3 pre-existing unused-variable lint errors as a side effect (the mock state is now actually used). |

## How to use it

1. Start the backend (`poe dev` or `uvicorn app.main:app --port 8000`) and frontend (`npm run dev`).
2. Go to `/ai`:
   - **AI Roadmap** — enter a goal + duration, click Generate → `POST /ai/roadmap`.
   - **Quiz Generator** — enter a topic, click Generate 5 Questions → `POST /ai/quiz`.
   - **Notes Summarizer** — paste notes, click Generate Structured Summary → `POST /ai/summarize`.
   - **AI Chat Tutor** — ask anything, it replies via `POST /ai/tutor` with the last 10
     turns of conversation as context.

## Important: free-tier rate limit

The API key you gave me is on **Gemini's free tier**, capped at a very low
requests-per-minute quota for the newest model (`gemini-3.8-flash` and its `-latest`
alias). I hit this immediately while testing — got `429`/`503` errors back to back.

I switched the default model to **`gemini-3.1-flash-lite`**, which responded cleanly and
consistently in testing (confirmed live: roadmap, quiz, summary, and tutor all returned
real, correctly-structured Gemini output). If you upgrade to a paid Gemini plan later, or
want higher-quality output over speed, change one line in `backend/.env`:
```
GEMINI_MODEL="gemini-3.8-flash"   # or whatever the current flagship model is
```
No code changes needed — the model name is the only thing that changes.

## Known limitations (not blocking)
- No conversation persistence for the tutor — history lives in frontend state only,
  lost on refresh. Fine for a demo; a fast-follow would save it like the chat feature.
- No per-user rate limiting on these endpoints yet — on the free tier, multiple people
  using AI Suite at once will hit `429`s. The retry logic smooths over brief spikes but
  won't fix sustained overuse; that needs either a paid tier or a request queue/cache.
