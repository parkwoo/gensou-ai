from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./novel-ai-jp.db"
    
    # AI API Keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    alibaba_cloud_api_key: Optional[str] = None
    zhipu_api_key: Optional[str] = None
    deepseek_api_key: Optional[str] = None
    
    # AI Endpoints
    qwen_endpoint: str = "https://dashscope.aliyuncs.com"
    glm_endpoint: str = "https://open.bigmodel.cn/api"
    
    # App
    app_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
