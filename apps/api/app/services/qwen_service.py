import os
import httpx
from typing import AsyncGenerator, Dict, Any
from .base import AIProvider


class QwenService(AIProvider):
    """Qwen service (Alibaba Cloud Model Studio)"""
    
    def __init__(self):
        self.endpoint = os.getenv("ALIBABA_ENDPOINT", "https://dashscope.aliyuncs.com/api/v1")
        self.model = os.getenv("ALIBABA_MODEL_ID", "qwen-jp")
    
    async def generate(self, prompt: str, api_key: str = None, **kwargs) -> AsyncGenerator[str, None]:
        # 渡されたAPIキーを使用、なければ環境変数から取得
        key = api_key or os.getenv("ALIBABA_CLOUD_API_KEY", "")
        if not key:
            yield "Error: Alibaba Cloud API key not configured"
            return
        
        try:
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": kwargs.get("model", self.model),
                "input": {"messages": [{"role": "user", "content": prompt}]},
                "parameters": {
                    "max_tokens": kwargs.get("max_tokens", 4096),
                    "temperature": kwargs.get("temperature", 0.7),
                    "stream": True
                }
            }
            
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{self.endpoint}/services/aigc/text-generation/generation",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        yield f"Error: API error {response.status_code} - {error_text.decode()}"
                        return
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data:"):
                            data = line[5:].strip()
                            if data and data != "[DONE]":
                                try:
                                    import json
                                    result = json.loads(data)
                                    if "output" in result:
                                        yield result["output"].get("text", "")
                                    elif "choices" in result:
                                        content = result["choices"][0].get("delta", {}).get("content", "")
                                        if content:
                                            yield content
                                except Exception as e:
                                    yield f"Error parsing response: {str(e)}"
                                    
        except httpx.TimeoutException:
            yield "Error: Request timeout"
        except httpx.RequestError as e:
            yield f"Error: Request failed - {str(e)}"
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_cost(self, tokens: int) -> float:
        # ¥0.0004 per 1K tokens (Qwen Plus)
        return tokens * 0.0004 / 1000
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": "Qwen-JP (Alibaba Cloud)",
            "provider": "qwen-jp",
            "default_model": self.model,
            "cost_per_1k": 0.0004,
            "features": ["日本語特化", "知識ベース", "低成本"],
            "recommended": ["日本語知識", "拡張"],
            "description": "日本語特化Qwenモデル。コストパフォーマンス良"
        }
