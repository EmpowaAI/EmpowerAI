
"""
OpenAI API client wrapper with rate limit handling
Principal Engineer Level: Robust error handling and async support
"""

import os
import time
import asyncio
from openai import OpenAI, RateLimitError, APIError, AsyncOpenAI
from typing import List, Dict, Any, Optional
from utils.logger import get_logger
from utils.exceptions import RateLimitExceeded, ModelError, ServiceUnavailableError

logger = get_logger()

class AIClient:
    """Wrapper for OpenAI API calls with retry logic"""
    
    def __init__(self):
        # Check for Azure OpenAI first, then fall back to regular OpenAI
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        self.max_retries = 3
        self.retry_delay = 2  # Initial delay in seconds
        self.use_azure = bool(azure_api_key and azure_endpoint)
        self.enabled = bool(azure_api_key and azure_endpoint) or bool(openai_api_key)
        
        if self.enabled:
            try:
                if self.use_azure:
                    # Azure OpenAI configuration
                    self.client = OpenAI(
                        api_key=azure_api_key,
                        base_url=azure_endpoint
                    )
                    self.async_client = AsyncOpenAI(
                        api_key=azure_api_key,
                        base_url=azure_endpoint
                    )
                    self.model = os.getenv("AZURE_OPENAI_MODEL", os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
                    logger.info("Azure OpenAI client initialized successfully", extra={
                        'model': self.model,
                        'endpoint': azure_endpoint
                    })
                else:
                    # Regular OpenAI configuration
                    self.client = OpenAI(api_key=openai_api_key)
                    self.async_client = AsyncOpenAI(api_key=openai_api_key)
                    self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                    logger.info("OpenAI client initialized successfully", extra={'model': self.model})
                
                self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
            except Exception as e:
                logger.error("OpenAI client initialization failed", extra={'error': str(e)})
                self.enabled = False
        else:
            logger.warning("Neither AZURE_OPENAI_API_KEY/AZURE_OPENAI_ENDPOINT nor OPENAI_API_KEY set. AI features will use fallback methods.")
            self.enabled = False
    
    def chat(self, message: str, system_prompt: str = None) -> str:
        """
        Send a chat message and get a response (sync method for simple chat)
        
        Args:
            message: The user's message
            system_prompt: Optional system prompt to set context
            
        Returns:
            The AI's response as a string
        """
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
                max_tokens=500
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
                    max_tokens=max_tokens
                )
                
                tokens_used = None
                if hasattr(response, 'usage') and response.usage:
                    tokens_used = response.usage.total_tokens
                
                log.info("OpenAI API call successful", extra={
                    'model': self.model,
                    'tokens_used': tokens_used
                })
                
                return response.choices[0].message.content
                
            except RateLimitError as e:
                # DO NOT retry on rate limits - this causes cascading requests
                # Extract retry_after from error if available
                retry_after = 60  # Default
                if hasattr(e, 'response') and e.response:
                    retry_after_header = e.response.headers.get('retry-after')
                    if retry_after_header:
                        try:
                            retry_after = int(retry_after_header)
                        except:
                            pass
                
                log.error("Rate limit exceeded - NOT retrying to prevent cascading requests", extra={
                    'error': str(e),
                    'retry_after': retry_after,
                    'note': 'Retries disabled to prevent rate limit cascades'
                })
                raise RateLimitExceeded(
                    "OpenAI API rate limit exceeded. Please try again later.",
                    retry_after=retry_after
                )
            
            except APIError as e:
                log.error("OpenAI API error", extra={
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'status_code': getattr(e, 'status_code', None)
                })
                if attempt == self.max_retries - 1:
                    raise ModelError(f"OpenAI API error: {str(e)}", model=self.model)
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
        """Generate text using GPT with retry logic for rate limits (sync wrapper)"""
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(
            self.generate_text_async(prompt, system_prompt, temperature, max_tokens, correlation_id)
        )

    def get_embeddings(self, text: str) -> List[float]:
        """Get text embeddings"""
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
        """Extract skills from text using AI with fallback on rate limit"""
        if not text or not text.strip():
            return []
        
        prompt = f"""Extract all skills, competencies, and abilities mentioned in the following text. 
Return only a JSON array of skill names, nothing else.

Text: {text[:2000]}  # Limit text length to reduce token usage

Skills:"""
        
        system_prompt = "You are a skill extraction assistant. Extract skills and return only a JSON array."
        
        try:
            result = self.generate_text(prompt, system_prompt, temperature=0.3, max_tokens=200)
            
            if not result:
                # Fallback: return empty list if AI fails
                return []
            
            # Try to parse JSON from response
            import json
            
            # Remove markdown code blocks if present
            result = result.strip()
            if result.startswith("```"):
                result = result.split("```")[1]
                if result.startswith("json"):
                    result = result[4:]
                result = result.strip()
            
            skills = json.loads(result)
            return skills if isinstance(skills, list) else []
            
        except RateLimitError as e:
            # Rate limit hit - DO NOT retry, re-raise so route can handle it properly
            # The route will return 429 with proper retry_after
            raise
        except Exception as e:
            print(f"Error extracting skills: {e}")
            # Fallback: return empty list, will use keyword-based fallback
            return []
