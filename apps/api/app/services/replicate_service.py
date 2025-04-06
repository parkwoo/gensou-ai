import os
from typing import AsyncGenerator, Dict, Any
from .base import AIProvider


class ReplicateService(AIProvider):
    """Replicate API service"""
    
    def __init__(self):
        self.api_key = os.getenv("REPLICATE_API_TOKEN", "")
        self.model = os.getenv("REPLICATE_MODEL", "parkwoo/qwen-7b-gensou-v1")
    
    async def generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield "Error: Replicate API token not configured"
            return
        
        try:
            import replicate
            
            # Set API token
            os.environ["REPLICATE_API_TOKEN"] = self.api_key
            
            output = replicate.run(
                self.model,
                input={
                    "prompt": prompt,
                    "max_new_tokens": kwargs.get("max_tokens", 4096),
                    "temperature": kwargs.get("temperature", 0.7),
                    "top_p": kwargs.get("top_p", 0.9),
                    "repetition_penalty": kwargs.get("repetition_penalty", 1.1)
                }
            )
            
            # Replicate returns a generator
            for chunk in output:
                yield str(chunk)
                    
        except ImportError:
            yield "Error: replicate package not installed. Run: pip install replicate"
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_cost(self, tokens: int) -> float:
        # Replicate charges per second of GPU time
        # Average: $0.0001 per second
        return tokens * 0.0001 / 1000
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": "Replicate API",
            "provider": "replicate",
            "default_model": self.model,
            "cost_per_1k": 0.0001,
            "features": ["従量課金", "GPU 自動スケーリング", "カスタムモデル対応"],
            "recommended": ["本番", "大量生成", "高負荷"],
            "description": "Replicate の GPU 推論サービス。従量課金、自動スケーリング"
        }
