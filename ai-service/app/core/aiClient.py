from openai import AzureOpenAI, BadRequestError
from app.config.config import settings
from app.core.exceptions import AIServiceError

# GPT-5 generates large JSON completions slower than GPT-4o (~30s for a
# 6k-token CV analysis). 90s gives headroom without hanging forever, and
# max_retries=0 stops the SDK from silently tripling that on a timeout.
REQUEST_TIMEOUT_SECONDS = 90.0


class AIClient:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            timeout=REQUEST_TIMEOUT_SECONDS,
            max_retries=0,
        )
        self.model = settings.AZURE_OPENAI_MODEL

    def _create(self, messages, temperature=None, max_tokens=None, timeout=None):
        """Wrapper around chat.completions.create that speaks the current
        parameter contract:
        - GPT-5 / o-series models require `max_completion_tokens` (not
          `max_tokens`) - we always send the new name.
        - Some of those models also reject any non-default `temperature`;
          if the API complains, retry once without it.
        """
        kwargs = {
            "model": self.model,
            "messages": messages,
            "max_completion_tokens": max_tokens or 2000,
        }
        if temperature is not None:
            kwargs["temperature"] = temperature
        if timeout is not None:
            kwargs["timeout"] = timeout

        try:
            return self.client.chat.completions.create(**kwargs)
        except BadRequestError as e:
            if "temperature" in str(e).lower() and "temperature" in kwargs:
                kwargs.pop("temperature", None)
                return self.client.chat.completions.create(**kwargs)
            raise

    def complete(
        self,
        prompt: str,
        system: str = None,
        temperature: float = None,
        max_tokens: int = None,
    ) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return self.chat(messages, temperature=temperature, max_tokens=max_tokens)

    def ping(self, timeout: float = 6.0) -> bool:
        """Cheap liveness probe for Azure OpenAI: a tiny completion that
        validates key + endpoint + deployment + api-version without real
        cost. Never raises - returns False on any failure, and logs why so
        Azure misconfiguration is diagnosable from the service logs."""
        try:
            self._create(
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=16,
                timeout=timeout,
            )
            return True
        except Exception as e:
            # Surface the reason: 401=bad key, 404=deployment/endpoint wrong,
            # 400=unsupported param / api-version too old for the model.
            from app.utils.logger import logger
            logger.error(
                f"AZURE_PING_FAILED | model={self.model} | "
                f"endpoint={settings.AZURE_OPENAI_ENDPOINT} | {type(e).__name__}: {str(e)[:300]}"
            )
            return False

    def chat(
        self,
        messages: list,
        temperature: float = None,
        max_tokens: int = None,
    ) -> str:
        """Multi-turn completion. `messages` is a list of
        {"role": "system"|"user"|"assistant", "content": str} dicts."""
        try:
            response = self._create(
                messages=messages,
                temperature=temperature if temperature is not None else 0.7,
                max_tokens=max_tokens or 2000,
            )
            return response.choices[0].message.content

        except Exception as e:
            raise AIServiceError(
                message=f"AI completion failed: {str(e)}",
                status_code=502,
            )
