from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.schemas import Settings, SettingsUpdate

router = APIRouter()

# In-memory settings (in production, use database)
app_settings = Settings()


@router.get("", response_model=Settings)
async def get_settings():
    """Get application settings"""
    return app_settings


@router.put("", response_model=Settings)
async def update_settings(settings: SettingsUpdate):
    """Update application settings"""
    global app_settings
    
    update_data = settings.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(app_settings, key, value)
    
    return app_settings


@router.get("/usage")
async def get_usage():
    """Get AI usage statistics"""
    # In production, query from database
    return {
        "daily_tokens": 0,
        "monthly_cost": 0,
        "total_generations": 0
    }
