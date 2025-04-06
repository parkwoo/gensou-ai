import os
import httpx
from typing import AsyncGenerator, Dict, Any
from .base import AIProvider


class HFService(AIProvider):
    """Hugging Face Inference API service"""
    
    def __init__(self):
        self.api_key = os.getenv("HUGGING_FACE_TOKEN", "")
        self.model = os.getenv("HF_MODEL_ID", "parkwoo/qwen-7b-gensou-v1")
        self.endpoint = f"https://api-inference.huggingface.co/models/{self.model}"
    
    async def generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield "Error: Hugging Face token not configured"
            return
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": kwargs.get("max_tokens", 4096),
                    "temperature": kwargs.get("temperature", 0.7),
                    "return_full_text": False
                }
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.endpoint,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    error_text = await response.aread()
                    yield f"Error: API error {response.status_code} - {error_text.decode()}"
                    return
                
                result = response.json()
                
                if isinstance(result, list) and len(result) > 0:
                    yield result[0].get('generated_text', '')
                elif isinstance(result, dict):
                    yield result.get('generated_text', '')
                else:
                    yield "Error: Unexpected response format"
                    
        except httpx.TimeoutException:
            yield "Error: Request timeout (model may be loading)"
        except httpx.RequestError as e:
            yield f"Error: Request failed - {str(e)}"
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_cost(self, tokens: int) -> float:
        # Free tier: 300 sec/month, Pro: $9/month
        return 0.0  # Included in subscription
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": "Hugging Face Inference API",
            "provider": "huggingface",
            "default_model": self.model,
            "cost_per_1k": 0.0,
            "features": ["無料枠あり", "簡単デプロイ", "オープンソース"],
            "recommended": ["テスト", "開発", "プロトタイプ"],
            "description": "Hugging Face の推論 API。無料枠あり、カスタムモデル対応"
        }
