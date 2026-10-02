# app/services/ai/gemini_service.py
import json
import time
import requests
from app.env import ENV
from app.utils.logger import logger

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
MAX_ATTEMPTS = 3
RETRYABLE_STATUS_CODES = {429, 503}


def _extract_retry_delay(resp: requests.Response) -> float | None:
    """Reads Google's suggested retry delay (e.g. "12s") out of a 429 body, if present."""
    try:
        details = resp.json().get("error", {}).get("details", [])
        for d in details:
            delay = d.get("retryDelay")
            if delay and delay.endswith("s"):
                return float(delay[:-1]) + 0.5
    except Exception:  # noqa: BLE001
        pass
    return None


def generate_json(prompt: str) -> dict:
    """Calls Gemini with a prompt and parses the response as JSON.

    Gemini is instructed (via responseMimeType) to return pure JSON, so no
    markdown-fence stripping is needed. Retries a couple of times on 429/503
    since Google's own error message for those says they're usually transient.
    """
    url = f"{GEMINI_BASE_URL}/{ENV.GEMINI_MODEL}:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"},
    }

    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        resp = requests.post(
            url,
            params={"key": ENV.GEMINI_API_KEY},
            json=body,
            timeout=30,
        )

        if resp.ok:
            data = resp.json()
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as exc:
                logger.error(f"Unexpected Gemini response shape: {data}")
                raise RuntimeError("Unexpected response from Gemini.") from exc
            return json.loads(text)

        last_error = f"Gemini API error {resp.status_code}: {resp.text}"
        if resp.status_code in RETRYABLE_STATUS_CODES and attempt < MAX_ATTEMPTS:
            wait_seconds = _extract_retry_delay(resp) or (2.0 * attempt)
            logger.warning(
                f"{last_error} (attempt {attempt}/{MAX_ATTEMPTS}, retrying in {wait_seconds}s)"
            )
            time.sleep(wait_seconds)
            continue

        logger.error(last_error)
        raise RuntimeError(last_error)

    raise RuntimeError(last_error)
