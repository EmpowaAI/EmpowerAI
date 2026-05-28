from openai import AzureOpenAI
from app.config.config import settings
from app.core.exceptions import AIServiceError


class AIClient:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_version="2024-02-01",  # stable default, no env var needed
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