"""Input sanitisation for user-supplied text that ends up inside AI prompts.

This does not try to "detect" prompt injection — it neutralises the
delivery mechanisms: control characters, fake chat-role markers, and
oversized payloads. Prompts built from this output must still place user
text inside clearly delimited blocks.
"""

import re

# C0/C1 control chars except \n and \t
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")

# Fake chat-transcript markers that try to smuggle a new role into context
_ROLE_MARKERS = re.compile(
    r"^\s*(system|assistant|user|tool)\s*:",
    re.IGNORECASE | re.MULTILINE,
)


def sanitize_for_prompt(text: str, max_chars: int = 15000) -> str:
    if not text or not isinstance(text, str):
        return ""

    cleaned = _CONTROL_CHARS.sub("", text)
    # Defuse role markers rather than deleting the line — CV content like
    # "System: Administrator" stays readable but can't open a fake turn.
    cleaned = _ROLE_MARKERS.sub(lambda m: m.group(0).replace(":", " -"), cleaned)

    return cleaned[:max_chars].strip()
