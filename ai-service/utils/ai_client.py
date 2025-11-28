"""
OpenAI API client wrapper
"""

import os
from openai import OpenAI
from typing import List, Dict, Any, Optional

class AIClient:
    """Wrapper for OpenAI API calls"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.enabled = bool(api_key)
        
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
        """Generate text using GPT"""
        if not self.enabled:
            return ""  # Return empty for fallback handling
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
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
        """Extract skills from text using AI"""
        prompt = f"""Extract all skills, competencies, and abilities mentioned in the following text. 
Return only a JSON array of skill names, nothing else.

Text: {text}

Skills:"""
        
        system_prompt = "You are a skill extraction assistant. Extract skills and return only a JSON array."
        
        result = self.generate_text(prompt, system_prompt, temperature=0.3, max_tokens=200)
        
        # Try to parse JSON from response
        try:
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
        except:
            # Fallback: split by common delimiters
            return [s.strip() for s in result.replace("[", "").replace("]", "").replace('"', "").split(",") if s.strip()]

