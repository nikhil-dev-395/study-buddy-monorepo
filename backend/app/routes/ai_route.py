# app/routes/ai_route.py
from typing import List, Literal
from fastapi import APIRouter, status
from pydantic import BaseModel

from app.services.ai.gemini_service import generate_json
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse
from app.utils.logger import logger

router = APIRouter(prefix="/ai", tags=["AI Suite"])


def _call_ai(prompt: str) -> dict:
    try:
        return generate_json(prompt)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"AI generation failed: {exc}")
        raise ApiError(
            message="AI generation failed. Please try again.",
            status_code=status.HTTP_502_BAD_GATEWAY,
        ) from exc


# --- Roadmap -----------------------------------------------------------

class RoadmapRequest(BaseModel):
    goal: str
    days: int = 30


@router.post("/roadmap")
def generate_roadmap(payload: RoadmapRequest):
    prompt = f"""You are a study planning assistant.
Create a {payload.days}-day study roadmap for this learning goal: "{payload.goal}".
Split it into exactly 3 phases, roughly even in duration.
Respond with ONLY valid JSON matching this schema, no extra text:
{{
  "phases": [
    {{
      "phase": "string, e.g. 'Phase 1 (Days 1-10): <title>'",
      "topics": ["string", "string", "string"],
      "project": "string - one practical deliverable for this phase"
    }}
  ]
}}"""
    data = _call_ai(prompt)
    return ApiResponse.success(
        message="Roadmap generated successfully.",
        status_code=status.HTTP_200_OK,
        data=data,
    )


# --- Quiz ----------------------------------------------------------------

class QuizRequest(BaseModel):
    topic: str
    count: int = 5


@router.post("/quiz")
def generate_quiz(payload: QuizRequest):
    prompt = f"""You are a quiz generator for students.
Create {payload.count} multiple-choice questions about: "{payload.topic}".
Respond with ONLY valid JSON matching this schema, no extra text:
{{
  "questions": [
    {{
      "id": 1,
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct": 0,
      "explanation": "string - why the correct answer is right"
    }}
  ]
}}
"correct" is the 0-based index into "options"."""
    data = _call_ai(prompt)
    return ApiResponse.success(
        message="Quiz generated successfully.",
        status_code=status.HTTP_200_OK,
        data=data,
    )


# --- Notes Summarizer ------------------------------------------------------

class SummarizeRequest(BaseModel):
    notes: str


@router.post("/summarize")
def summarize_notes(payload: SummarizeRequest):
    if not payload.notes.strip():
        raise ApiError(
            message="Notes cannot be empty.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    prompt = f"""You are a study notes summarizer.
Summarize the following notes.
Respond with ONLY valid JSON matching this schema, no extra text:
{{
  "overview": "string - one paragraph executive summary",
  "keyPoints": ["string", "string"],
  "actionItems": ["string", "string"]
}}

Notes:
\"\"\"
{payload.notes}
\"\"\""""
    data = _call_ai(prompt)
    return ApiResponse.success(
        message="Summary generated successfully.",
        status_code=status.HTTP_200_OK,
        data=data,
    )


# --- AI Chat Tutor ----------------------------------------------------------

class TutorMessage(BaseModel):
    sender: Literal["user", "ai"]
    text: str


class TutorRequest(BaseModel):
    message: str
    history: List[TutorMessage] = []


@router.post("/tutor")
def tutor_reply(payload: TutorRequest):
    history_text = "\n".join(
        f"{'Student' if m.sender == 'user' else 'Tutor'}: {m.text}"
        for m in payload.history[-10:]
    )

    prompt = f"""You are StudyBuddy, a friendly and knowledgeable AI study tutor.
Explain concepts clearly and concisely for a student. Keep replies under 120 words
unless the question needs more detail.

Conversation so far:
{history_text or '(start of conversation)'}

Student: {payload.message}

Respond with ONLY valid JSON matching this schema, no extra text:
{{"reply": "string - your answer to the student"}}"""
    data = _call_ai(prompt)
    return ApiResponse.success(
        message="Tutor reply generated successfully.",
        status_code=status.HTTP_200_OK,
        data=data,
    )
