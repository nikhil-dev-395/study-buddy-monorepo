# AI Suite (Gemini-powered)

Four study tools on `/ai`: **Ask Tutor**, **Practice Quiz**, **Notes → Flashcards**, **Study Plan**.
Each is a plain prompt → structured-JSON call to Google Gemini; no fine-tuning, embeddings or
persistence on the server.

| Layer | File |
|---|---|
| Gemini client | `backend/app/services/ai/gemini_service.py` — `generate_json(prompt)` |
| Routes | `backend/app/routes/ai_route.py` (prefix `/ai`) |
| Hook | `frontend/src/hooks/useAiSuite.ts` |
| Page | `frontend/src/pages/AiSuite.tsx` |
| Markdown renderer | `frontend/src/components/ai/Markdown.tsx` |

## Backend

### Gemini client

`generate_json(prompt)` POSTs to
`https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key=…` with
`generationConfig.responseMimeType = "application/json"`, then `json.loads` the first candidate's
text (no Markdown fence stripping needed). It makes up to **3 attempts** on `429`/`503`, waiting for
Google's `retryDelay` (+0.5 s) when present, otherwise `2 s × attempt`. Each request has a 30 s
timeout. Any other failure raises `RuntimeError`.

Config (backend `.env`, server-side only): `GEMINI_API_KEY`, `GEMINI_MODEL`
(default `gemini-3.1-flash-lite`). Changing the model needs no code change.

### Endpoints

All are `POST`, unauthenticated, and return the standard `ApiResponse` envelope. Any Gemini error
(including invalid JSON) becomes **502** `"AI generation failed. Please try again."`.

| Path | Body | `data` returned |
|---|---|---|
| `/ai/roadmap` | `{goal: str, days: int = 30}` | `{phases: [{phase, topics: [str], project}]}` — exactly 3 phases |
| `/ai/quiz` | `{topic: str, count: int = 5, difficulty: "easy"\|"medium"\|"hard" = "medium"}` | `{questions: [{id, question, options: [4 × str], correct: <0-based index>, explanation}]}` |
| `/ai/summarize` | `{notes: str}` (400 if blank) | `{overview, keyPoints: [str], actionItems: [str], flashcards: [{front, back}]}` — prompt asks for 4–8 flashcards |
| `/ai/tutor` | `{message: str, history: [{sender: "user"\|"ai", text}]}` | `{reply: str}` — Markdown allowed, ~180 words, may end with a check-your-understanding question |

The tutor prompt includes only the **last 10** history turns. The schema in each prompt is the
contract — the backend doesn't validate the model's output shape, so the frontend should tolerate
missing optional fields (it already treats `flashcards` as optional).

## Frontend

### `useAiSuite()`

Returns `{loading, errors, generateRoadmap, generateQuiz, summarizeNotes, askTutor}`.

- `loading` and `errors` are **per tool** (`Partial<Record<"roadmap"|"quiz"|"summarize"|"tutor", …>>`),
  so a running quiz doesn't disable the tutor and errors show on the right tab.
- Each function returns the parsed `data` or `null` on failure (the error message is put in
  `errors[tool]`, from the envelope's `message`).
- Signatures: `generateRoadmap(goal, days)`, `generateQuiz(topic, count = 5, difficulty = "medium")`,
  `summarizeNotes(notes)`, `askTutor(message, history)`.
- Requests go through `fetchWithAuth` (Bearer header attached, though the backend ignores it).

### Tabs and `?tab=` deep link

The active tab is stored in the URL: `/ai?tab=tutor|quiz|summarizer|roadmap` (default and fallback
`tutor`; switching tabs uses `setSearchParams(..., {replace: true})`). Home's quick actions link to
`/ai?tab=tutor` and `/ai?tab=quiz`.

### Ask Tutor (`tutor`)

- **Starters**: four example questions shown on an empty chat (`TUTOR_STARTERS`).
- **Modes** (`TUTOR_MODES`, toggle one): *Explain simply*, *Give an example*, *Step by step*,
  *Quiz me*. The selected mode's instruction is appended to the prompt sent to the API; the chat
  shows only what the student typed.
- AI replies are rendered with `components/ai/Markdown.tsx`, a small dependency-free renderer:
  paragraphs, `#`-headings (rendered bold), `-`/`*`/`•` and numbered lists, fenced code blocks, and
  inline `**bold**`, `*italic*`, `` `code` ``. No HTML/links, so no XSS surface.
- Each AI reply has **Practice this with a quiz**, which switches to the quiz tab and generates a
  quiz on the preceding question.
- History lives in component state only (lost on refresh).

### Practice Quiz (`quiz`)

- Inputs: topic (plus topic-idea chips), **difficulty** easy / medium / hard, **count** 5 / 10 / 15.
- After submitting, the score is shown and each question reveals its **explanation**.
- **Retry N wrong** clears answers only for the missed questions and un-submits, so the student
  re-attempts just those.

### Notes → Flashcards (`summarizer`)

Paste notes → overview, key points, action items, and a grid of **flashcards** that flip on click
(front/back). Flashcards render only when the response includes them.

### Study Plan (`roadmap`)

- Inputs: goal and duration (15 / 30 / 60 / 90 days) → three phases with topics and a project each.
- Topics are checkboxes with a progress count. Progress is saved in **localStorage** under
  `roadmap-progress:<goal lowercased>` as `{"<phaseIndex>-<topicIndex>": true}` and restored when
  the same goal is generated again. Because keys are positional, a regenerated plan with different
  topics reuses the old ticks by index.

## Running it

1. Backend: set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in `backend/.env`, then `poe dev`.
2. Frontend: `npm run dev`, open `/ai`.

## Limitations

- Free-tier Gemini keys have low requests-per-minute quotas; bursts produce 429s (retried up to
  3 attempts, then 502). There is no per-user rate limiting or caching.
- `/ai/*` is unauthenticated — anyone who can reach the API can spend the Gemini quota.
- User input is interpolated directly into prompts (prompt injection is possible; output is
  display-only, so impact is limited).
- Tutor history and quiz results are not persisted server-side.
