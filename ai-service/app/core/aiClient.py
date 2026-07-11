from openai import AzureOpenAI
from app.config.config import settings
from app.core.exceptions import AIServiceError

# Fail fast instead of holding Node's connection open — the backend
# aborts at 25-45s, so anything slower than this is already lost.
REQUEST_TIMEOUT_SECONDS = 30.0


class AIClient:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_version="2024-02-01",  # stable default, no env var needed
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        self.model = settings.AZURE_OPENAI_MODEL

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
        """Cheap liveness probe for Azure OpenAI: a 1-token completion that
        validates key + endpoint + deployment without real cost. Never
        raises — returns False on any failure, and logs why so Azure
        misconfiguration is diagnosable from the service logs."""
        try:
            self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
                timeout=timeout,
            )
            return True
        except Exception as e:
            # Surface the reason: 401=bad key, 404=deployment/endpoint wrong,
            # DeploymentNotFound=AZURE_OPENAI_MODEL is not the deployment name.
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
            response = self.client.chat.completions.create(
                model=self.model,
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
