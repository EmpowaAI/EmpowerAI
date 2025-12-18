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
        api_key = os.getenv("OPENAI_API_KEY")
        self.enabled = bool(api_key)
        self.max_retries = 3
        self.retry_delay = 2  # Initial delay in seconds
        
        if self.enabled:
            try:
                self.client = OpenAI(api_key=api_key)
                self.async_client = AsyncOpenAI(api_key=api_key)  # Async client
                self.model = os.getenv("MODEL_NAME", "gpt-4")
                self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
                logger.info("OpenAI client initialized successfully", extra={'model': self.model})
            except Exception as e:
                logger.error("OpenAI client initialization failed", extra={'error': str(e)})
                self.enabled = False
        else:
            logger.warning("OPENAI_API_KEY not set. AI features will use fallback methods.")
            self.enabled = False
    
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
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (2 ** attempt)
                    log.warning(f"Rate limit hit, retrying in {wait_time}s", extra={
                        'attempt': attempt + 1,
                        'max_retries': self.max_retries,
                        'wait_time': wait_time
                    })
                    await asyncio.sleep(wait_time)
                else:
                    log.error("Rate limit exceeded after all retries", extra={
                        'error': str(e),
                        'max_retries': self.max_retries
                    })
                    raise RateLimitExceeded(
                        "OpenAI API rate limit exceeded. Please try again later.",
                        retry_after=60
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

Text: {text}

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
        except RateLimitError:
            # Rate limit hit - return empty list, will use keyword-based fallback
            print("Rate limit reached for skill extraction. Using fallback method.")
            return []
        except Exception as e:
            print(f"Error extracting skills: {e}")
            # Fallback: split by common delimiters
            if result:
                return [s.strip() for s in result.replace("[", "").replace("]", "").replace('"', "").split(",") if s.strip()]
            return []

