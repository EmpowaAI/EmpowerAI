"""
OpenAI API client wrapper with rate limit handling
"""

import os
import time
from openai import OpenAI, RateLimitError
from typing import List, Dict, Any, Optional

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
                self.model = os.getenv("MODEL_NAME", "gpt-4")
                self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
            except Exception as e:
                print(f"Warning: OpenAI client initialization failed: {e}")
                self.enabled = False
        else:
            print("Warning: OPENAI_API_KEY not set. AI features will use fallback methods.")
            self.enabled = False
    
    def generate_text(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """Generate text using GPT with retry logic for rate limits"""
        if not self.enabled:
            return ""  # Return empty for fallback handling
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        last_error = None
        for attempt in range(self.max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content
            except RateLimitError as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    # Exponential backoff: 2s, 4s, 8s
                    wait_time = self.retry_delay * (2 ** attempt)
                    print(f"Rate limit hit. Retrying in {wait_time}s (attempt {attempt + 1}/{self.max_retries})...")
                    time.sleep(wait_time)
                else:
                    print(f"Rate limit error after {self.max_retries} attempts: {e}")
                    raise
            except Exception as e:
                print(f"OpenAI API error: {e}")
                return ""  # Return empty for fallback handling
        
        # If we exhausted retries, return empty for fallback
        return ""
    
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

