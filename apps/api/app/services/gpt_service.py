from typing import AsyncGenerator, Dict, Any
from openai import AsyncOpenAI
from app.config import settings
from .base import AIProvider


class GPTService(AIProvider):
    """GPT-4o service"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key or ""
        self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4o"
    
    async def generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        if not self.client:
            yield "Error: OpenAI API key not configured"
            return
        
        try:
            stream = await self.client.chat.completions.create(
                model=kwargs.get("model", self.model),
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                max_tokens=kwargs.get("max_tokens", 4096),
                temperature=kwargs.get("temperature", 0.7),
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_cost(self, tokens: int) -> float:
        # $0.003 per 1K tokens
        return tokens * 0.003 / 1000
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": "GPT-4o",
            "provider": "gpt-4o",
            "default_model": "gpt-4o",
            "cost_per_1k": 0.003,
            "features": ["大綱", "章", "本文", "推敲", "評価"],
            "recommended": ["大綱", "章", "本文", "評価", "マインドマップ"],
            "description": "OpenAI の最新モデル。日本語品質最高、プロンプト追従性◎"
        }
