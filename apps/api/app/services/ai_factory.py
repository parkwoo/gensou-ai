from typing import AsyncGenerator, Dict, Any, Optional
from .base import AIProvider
from .gpt_service import GPTService
from .claude_service import ClaudeService
from .qwen_service import QwenService
from .hf_service import HFService
from .replicate_service import ReplicateService
from .sakura_service import SakuraService
from .matsuri_service import MatsuriService


class AIFactory:
    """Factory for AI providers"""
    
    _services: Dict[str, AIProvider] = {}
    
    @classmethod
    def initialize(cls):
        """Initialize all AI services"""
        cls._services = {
            "gpt-5": GPTService(),
            "gpt-4.1": GPTService(),
            "gpt-4o": GPTService(),
            "claude-4": ClaudeService(),
            "claude-3.5": ClaudeService(),
            "sakurallm": SakuraService(),
            "matsuri": MatsuriService(),
            "deepseek-v2": QwenService(),
            "qwen-jp": QwenService(),
            "qwen": QwenService(),
            "huggingface": HFService(),
            "replicate": ReplicateService(),
        }
    
    @classmethod
    def get_provider(cls, name: str) -> Optional[AIProvider]:
        """Get AI provider by name"""
        if not cls._services:
            cls.initialize()
        return cls._services.get(name)
    
    @classmethod
    async def generate(cls, provider_name: str, prompt: str, api_key: str = None, **kwargs) -> AsyncGenerator[str, None]:
        """Generate text using specified provider"""
        provider = cls.get_provider(provider_name)
        if not provider:
            yield f"Error: Provider '{provider_name}' not found"
            return
        
        async for chunk in provider.generate(prompt, api_key=api_key, **kwargs):
            yield chunk
    
    @classmethod
    def get_all_providers(cls) -> Dict[str, Dict[str, Any]]:
        """Get information about all providers"""
        if not cls._services:
            cls.initialize()
        
        return {
            name: service.get_model_info()
            for name, service in cls._services.items()
        }
    
    @classmethod
    def get_cost(cls, provider_name: str, tokens: int) -> float:
        """Get cost for specified provider and tokens"""
        provider = cls.get_provider(provider_name)
        if not provider:
            return 0.0
        return provider.get_cost(tokens)


# Initialize on import
AIFactory.initialize()
