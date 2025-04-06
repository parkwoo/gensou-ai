from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any
import json


class AIProvider(ABC):
    """Base class for AI providers"""
    
    @abstractmethod
    async def generate(self, prompt: str, api_key: str = None, **kwargs) -> AsyncGenerator[str, None]:
        """Generate text with streaming"""
        pass
    
    @abstractmethod
    def get_cost(self, tokens: int) -> float:
        """Calculate cost for given tokens"""
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        pass
