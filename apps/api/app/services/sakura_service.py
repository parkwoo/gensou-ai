import os
from typing import AsyncGenerator, Dict, Any
from .base import AIProvider


class SakuraService(AIProvider):
    """SakuraLLM service (Japanese specialized model)"""
    
    def __init__(self):
        self.api_url = os.getenv('SAKURA_API_URL', 'http://localhost:11434/v1/chat/completions')
    
    async def generate(self, prompt: str, api_key: str = None, **kwargs) -> AsyncGenerator[str, None]:
        if not api_key:
            yield "Error: SakuraLLM API key not configured"
            return
        
        import httpx
        
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            
            data = {
                'model': kwargs.get('model', 'sakurallm-jp'),
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': kwargs.get('max_tokens', 4096),
                'temperature': kwargs.get('temperature', 0.7),
                'stream': True
            }
            
            async with httpx.AsyncClient() as client:
                async with client.stream('POST', self.api_url, headers=headers, json=data, timeout=60.0) as response:
                    if response.status_code != 200:
                        yield f"Error: SakuraLLM API returned status {response.status_code}"
                        return
                    
                    async for line in response.aiter_lines():
                        if line.startswith('data: '):
                            try:
                                import json
                                chunk_data = json.loads(line[6:])
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                pass
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_cost(self, tokens: int) -> float:
        return tokens * 0.001
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            'name': 'SakuraLLM',
            'defaultModel': 'sakurallm-jp',
            'costPer1K': 0.001,
            'features': ['日本語特化', '小説', '会話'],
            'recommended': ['日本語小説', '日本語会話'],
            'description': '日本語特化モデル。自然な日本語生成'
        }
