from typing import AsyncGenerator, Dict, Any
from anthropic import AsyncAnthropic
from app.config import settings
from .base import AIProvider


class ClaudeService(AIProvider):
    """Claude 3.5 service"""
    
    def __init__(self):
        self.api_key = settings.anthropic_api_key or ""
        self.client = AsyncAnthropic(api_key=self.api_key) if self.api_key else None
        self.model = "claude-3-5-sonnet-20241022"
    
    async def generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        if not self.client:
            yield "Error: Anthropic API key not configured"
            return
        
        try:
            async with self.client.messages.stream(
                model=kwargs.get("model", self.model),
                max_tokens=kwargs.get("max_tokens", 4096),
                messages=[{"role": "user", "content": prompt}],
            ) as stream:
                async for text in stream.text_stream:
                    yield text
                    
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_cost(self, tokens: int) -> float:
        # $0.0045 per 1K tokens
        return tokens * 0.0045 / 1000
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": "Claude 3.5 Sonnet",
            "provider": "claude-3.5",
            "default_model": "claude-3-5-sonnet-20241022",
            "cost_per_1k": 0.0045,
            "features": ["推敲", "AIらしさ除去", "最終チェック"],
            "recommended": ["推敲", "AIらしさ除去", "最終チェック"],
            "description": "Anthropic の最新モデル。文学的表現、自然な日本語"
        }
