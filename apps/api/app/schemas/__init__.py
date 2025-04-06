from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Novel Schemas
class NovelBase(BaseModel):
    title: str
    description: Optional[str] = None
    background: Optional[str] = None
    characters: Optional[str] = None
    relationships: Optional[str] = None
    style: Optional[str] = None
    outline: Optional[str] = None


class NovelCreate(NovelBase):
    content: str


class NovelUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    background: Optional[str] = None
    characters: Optional[str] = None
    relationships: Optional[str] = None
    style: Optional[str] = None
    outline: Optional[str] = None


class Novel(NovelBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Chapter Schemas
class ChapterBase(BaseModel):
    title: str
    content: Optional[str] = None
    outline: Optional[str] = None
    order: int = 0


class ChapterCreate(ChapterBase):
    pass


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    outline: Optional[str] = None
    order: Optional[int] = None


class Chapter(ChapterBase):
    id: str
    novel_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# AI Schemas
class AIGenerateRequest(BaseModel):
    task: str = Field(..., description="Task type: outline, chapter, content, refine, etc.")
    prompt: str
    provider: Optional[str] = "gpt-4o"
    model: Optional[str] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 4096
    context: Optional[dict] = None
    api_key: Optional[str] = None


class AIGenerateResponse(BaseModel):
    content: str
    provider: str
    model: str
    usage: Optional[dict] = None


class AIProvider(BaseModel):
    name: str
    provider: str
    default_model: str
    cost_per_1k: float
    features: List[str]
    recommended: List[str]
    description: str


# Settings Schemas
class SettingsUpdate(BaseModel):
    default_provider: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    auto_save: Optional[bool] = None
    stream_enabled: Optional[bool] = None


class Settings(BaseModel):
    default_provider: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 4096
    auto_save: bool = True
    stream_enabled: bool = True


# Fine-tuning Schemas
class TrainingDatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    genre: Optional[str] = None
    style: Optional[str] = None


class TrainingDataset(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    samples_count: int
    genre: Optional[str] = None
    style: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class FineTuneRequest(BaseModel):
    base_model: str = "qwen-7b"
    dataset_id: str
    epochs: int = 3
    batch_size: int = 4
    learning_rate: float = 1e-4


class FineTunedModel(BaseModel):
    id: str
    name: str
    base_model: str
    status: str
    metrics: Optional[dict] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
