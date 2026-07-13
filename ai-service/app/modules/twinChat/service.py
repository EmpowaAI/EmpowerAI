from app.core.aiClient import AIClient
from app.core.exceptions import InvalidInputError
from app.core.parser import extract_json
from app.modules.twinChat.prompts import build_twin_system_prompt, sanitize_messages
from app.utils.logger import logger


class TwinChatService:
    def __init__(self):
        self.client = AIClient()

    def chat(self, payload: dict) -> dict:
        messages = sanitize_messages(payload.get("messages"))
        cv_context = payload.get("cv_context") or {}
        focus = payload.get("focus") or "growth"

        if not messages:
            raise InvalidInputError("messages is required and must contain at least one user message")

        logger.info(f"TWIN_CHAT_REQUEST | messages={len(messages)} | focus={focus}")

        full_messages = [
            {"role": "system", "content": build_twin_system_prompt(cv_context, focus)},
            *messages,
        ]

        raw = self.client.chat(full_messages, temperature=0.7, max_tokens=1200)
        parsed = extract_json(raw)

        reply = str(parsed.get("reply") or "").strip()
        if not reply:
            # A model that returned JSON without a reply is a contract
            # violation - surface the raw text rather than empty silence.
            reply = raw.strip()[:2000]

        options = parsed.get("options")
        if not isinstance(options, list) or len(options) == 0:
            options = None
        else:
            options = [str(o) for o in options][:6]

        profile = parsed.get("profile")
        if not isinstance(profile, dict):
            profile = None

        return {
            "reply": reply,
            "options": options,
            "isComplete": bool(parsed.get("isComplete")),
            "profile": profile,
        }
