"""
OpenAI API client wrapper with rate limit handling
Principal Engineer Level: Robust error handling and async support
"""

import os
import asyncio
import json
import re
import time
from openai import OpenAI, RateLimitError, APIError, AsyncOpenAI, AzureOpenAI, AsyncAzureOpenAI
from typing import List, Dict, Any, Optional
from utils.logger import get_logger
from utils.exceptions import RateLimitExceeded, ModelError, ServiceUnavailableError

logger = get_logger()

_AI_CLIENT_INSTANCE = None

class AIClient:
    """Wrapper for OpenAI API calls with retry logic - Singleton pattern"""

    def __new__(cls):
        global _AI_CLIENT_INSTANCE
        if _AI_CLIENT_INSTANCE is None:
            _AI_CLIENT_INSTANCE = super().__new__(cls)
            _AI_CLIENT_INSTANCE._initialized = False
        return _AI_CLIENT_INSTANCE

    def __init__(self):
        if self._initialized:
            return

        self._initialized = True
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        openai_api_key = os.getenv("OPENAI_API_KEY")

        self.max_retries = 3
        self.retry_delay = 2
        self.use_azure = bool(azure_api_key and azure_endpoint)
        self.enabled = bool(azure_api_key and azure_endpoint) or bool(openai_api_key)

        if self.enabled:
            try:
                if self.use_azure:
                    if azure_endpoint and azure_endpoint.endswith('/'):
                        azure_endpoint = azure_endpoint[:-1]

                    self.model = os.getenv("AZURE_OPENAI_MODEL", "gpt-4o-mini")
                    logger.info(f"Initializing Azure OpenAI with endpoint: {azure_endpoint}, model: {self.model}")

                    # Explicitly initialize Azure clients to avoid any 'proxies' argument issues
                    self.client = AzureOpenAI(
                        api_key=azure_api_key,
                        api_version="2024-02-15-preview",
                        azure_endpoint=azure_endpoint,
                        timeout=60.0,
                        max_retries=3
                    )
                    self.async_client = AsyncAzureOpenAI(
                        api_key=azure_api_key,
                        api_version="2024-02-15-preview",
                        azure_endpoint=azure_endpoint,
                        timeout=60.0,
                        max_retries=3
                    )

                    # Test connection
                    try:
                        self.client.chat.completions.create(
                            model=self.model,
                            messages=[{"role": "user", "content": "test"}],
                            max_tokens=5,
                            timeout=30.0
                        )
                        logger.info("✅ Azure OpenAI test call successful")
                    except Exception as test_error:
                        logger.error(f"❌ Azure OpenAI test call failed: {test_error}")
                        self.enabled = False

                else:
                    # Explicitly initialize Standard OpenAI clients
                    self.client = OpenAI(
                        api_key=openai_api_key,
                        timeout=60.0,
                        max_retries=3
                    )
                    self.async_client = AsyncOpenAI(
                        api_key=openai_api_key,
                        timeout=60.0,
                        max_retries=3
                    )
                    self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                    logger.info("OpenAI client initialized successfully", extra={'model': self.model})

                self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
            except Exception as e:
                logger.error(f"❌ OpenAI client initialization failed: {str(e)}")
                self.enabled = False
        else:
            logger.warning("⚠️ No API keys found. AI features will use fallback methods.")
            self.enabled = False

    def chat(self, message: str, system_prompt: str = None) -> str:
        """Send a chat message and get a response (sync method for simple chat)"""
        if not self.enabled:
            return "AI service is not available. Please check your API key configuration."

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": message})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                timeout=60.0
            )

            return response.choices[0].message.content

        except RateLimitError as e:
            logger.error(f"Rate limit error in chat: {str(e)}")
            return "I'm experiencing high demand right now. Please try again in a moment."
        except APIError as e:
            logger.error(f"OpenAI API error in chat: {str(e)}")
            return "I'm having trouble connecting to the AI service. Please try again."
        except Exception as e:
            logger.error(f"Unexpected error in chat: {str(e)}")
            return "An unexpected error occurred. Please try again."

    async def generate_text_async(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        correlation_id: Optional[str] = None
    ) -> str:
        """Generate text using GPT with async support and retry logic"""
        if not self.enabled:
            logger.warning("OpenAI client not enabled, returning empty response", extra={'correlation_id': correlation_id})
            return ""

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        log = get_logger(correlation_id) if correlation_id else logger

        for attempt in range(self.max_retries):
            try:
                log.debug(f"OpenAI API call attempt {attempt + 1}/{self.max_retries}", extra={
                    'model': self.model,
                    'prompt_length': len(prompt),
                    'max_tokens': max_tokens
                })

                response = await self.async_client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=30.0  # Shorter timeout
                )

                tokens_used = None
                if hasattr(response, 'usage') and response.usage:
                    tokens_used = response.usage.total_tokens

                log.info("✅ OpenAI API call successful", extra={
                    'model': self.model,
                    'tokens_used': tokens_used
                })

                return response.choices[0].message.content

            except RateLimitError as e:
                retry_after = 60
                if hasattr(e, 'response') and e.response:
                    retry_after_header = e.response.headers.get('retry-after')
                    if retry_after_header:
                        try:
                            retry_after = int(retry_after_header)
                        except:
                            pass

                log.error("Rate limit exceeded", extra={
                    'error': str(e),
                    'retry_after': retry_after
                })

                if attempt == self.max_retries - 1:
                    raise RateLimitExceeded(
                        "OpenAI API rate limit exceeded. Please try again later.",
                        retry_after=retry_after
                    )
                await asyncio.sleep(self.retry_delay * (2 ** attempt))

            except APIError as e:
                log.error("OpenAI API error", extra={
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'status_code': getattr(e, 'status_code', None)
                })
                if attempt == self.max_retries - 1:
                    raise ModelError(f"OpenAI API error: {str(e)}", model=self.model)
                await asyncio.sleep(self.retry_delay * (2 ** attempt))

            except asyncio.TimeoutError:
                log.error("OpenAI API call timed out", extra={'attempt': attempt + 1})
                if attempt == self.max_retries - 1:
                    raise ServiceUnavailableError("OpenAI API call timed out after multiple retries")
                await asyncio.sleep(self.retry_delay * (2 ** attempt))

            except Exception as e:
                log.error("Unexpected error in OpenAI API call", extra={
                    'error': str(e),
                    'error_type': type(e).__name__
                })
                if attempt == self.max_retries - 1:
                    raise ServiceUnavailableError(f"AI service error: {str(e)}")
                await asyncio.sleep(self.retry_delay * (2 ** attempt))

        return ""

    def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        correlation_id: Optional[str] = None
    ) -> str:
        """Sync wrapper – use only when absolutely necessary; prefer async methods."""
        if not self.enabled:
            return ""

        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                future = asyncio.run_coroutine_threadsafe(
                    self.generate_text_async(prompt, system_prompt, temperature, max_tokens, correlation_id),
                    loop
                )
                return future.result(timeout=60)
            else:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                result = loop.run_until_complete(
                    self.generate_text_async(prompt, system_prompt, temperature, max_tokens, correlation_id)
                )
                loop.close()
                return result
        except Exception as e:
            logger.error(f"Error in generate_text: {e}")
            return ""

    async def generate_structured_response_async(
        self,
        prompt: str,
        system_prompt: str,
        response_schema: Dict[str, Any],
        temperature: float = 0.4,
        max_tokens: int = 1000,
        retry_on_fail: bool = True,
        correlation_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Async structured response with JSON parsing."""
        if not self.enabled:
            logger.warning("AI client disabled, cannot generate structured response")
            return None

        log = get_logger(correlation_id) if correlation_id else logger

        for attempt in range(2 if retry_on_fail else 1):
            try:
                full_system_prompt = f"""{system_prompt}

IMPORTANT: You must respond with valid JSON only. No markdown, no explanations, no additional text.
The response must be parseable by json.loads()."""

                full_prompt = f"""{prompt}

Return ONLY a valid JSON object with the exact structure described. Do not include any other text, markdown, or explanation."""

                response_text = await self.generate_text_async(
                    prompt=full_prompt,
                    system_prompt=full_system_prompt,
                    temperature=temperature if attempt == 0 else 0.2,
                    max_tokens=max_tokens,
                    correlation_id=correlation_id
                )

                if not response_text:
                    log.warning(f"Empty response from AI (attempt {attempt+1})")
                    continue

                # Clean the response
                cleaned = self._clean_json_response(response_text)

                try:
                    return json.loads(cleaned)
                except json.JSONDecodeError as e:
                    log.warning(f"JSON decode error (attempt {attempt+1}): {e}")
                    json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                    if json_match:
                        try:
                            return json.loads(json_match.group())
                        except:
                            pass
                    if attempt == 1:
                        log.error(f"Failed to parse JSON after retries. Response snippet: {response_text[:200]}")
                    continue

            except Exception as e:
                log.error(f"Error in generate_structured_response_async (attempt {attempt+1}): {e}")
                if attempt == 1:
                    return None

        return None

    def generate_structured_response(
        self,
        prompt: str,
        system_prompt: str,
        response_schema: Dict[str, Any],
        temperature: float = 0.4,
        max_tokens: int = 1000,
        retry_on_fail: bool = True
    ) -> Optional[Dict[str, Any]]:
        """Sync wrapper for structured response."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            future = asyncio.run_coroutine_threadsafe(
                self.generate_structured_response_async(
                    prompt, system_prompt, response_schema, temperature, max_tokens, retry_on_fail
                ),
                loop
            )
            return future.result(timeout=60)
        else:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                self.generate_structured_response_async(
                    prompt, system_prompt, response_schema, temperature, max_tokens, retry_on_fail
                )
            )
            loop.close()
            return result

    def get_embeddings(self, text: str) -> List[float]:
        if not self.enabled:
            return []
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding error: {e}")
            return []

    def extract_skills(self, text: str) -> List[str]:
        if not text or not text.strip():
            return []
        prompt = f"""Extract all skills, competencies, and abilities mentioned in the following text. 
Return only a JSON array of skill names, nothing else.

Text: {text[:2000]}

Skills:"""
        system_prompt = "You are a skill extraction assistant. Extract skills and return only a JSON array."
        try:
            result = self.generate_text(prompt, system_prompt, temperature=0.3, max_tokens=200)
            if not result:
                return []
            result = result.strip()
            if result.startswith("```"):
                result = result.split("```")[1]
                if result.startswith("json"):
                    result = result[4:]
                result = result.strip()
            skills = json.loads(result)
            return skills if isinstance(skills, list) else []
        except RateLimitError as e:
            raise
        except Exception as e:
            print(f"Error extracting skills: {e}")
            return []

    def _clean_json_response(self, text: str) -> str:
        """Principal Level JSON Extraction: Ignores surrounding conversation/markdown."""
        # Remove possible markdown code block wrappers
        cleaned = re.sub(r'```json\s*|\s*```', '', text).strip()
        # Extract only the content between the first { and last }
        match = re.search(r'(\{.*\}|\[.*\])', cleaned, re.DOTALL)
        if match:
            return match.group(0)
        return cleaned