from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json
from typing import AsyncGenerator

from app.services.ai_factory import AIFactory
from app.schemas import AIGenerateRequest, AIGenerateResponse, AIProvider

router = APIRouter()


@router.post("/generate")
async def generate_ai(request: AIGenerateRequest):
    """Generate AI content with streaming"""
    
    # Build prompt with context
    prompt = request.prompt
    if request.context:
        # Add context to prompt
        context_parts = []
        if request.context.get("background"):
            context_parts.append(f"背景設定：{request.context['background']}")
        if request.context.get("characters"):
            context_parts.append(f"人物設定：{request.context['characters']}")
        if request.context.get("outline"):
            context_parts.append(f"大綱：{request.context['outline']}")
        
        if context_parts:
            prompt = "\n".join(context_parts) + f"\n\n{request.prompt}"
    
    # Generate using specified provider
    provider_name = request.provider or "gpt-4o"
    
    async def stream_generator() -> AsyncGenerator[str, None]:
        try:
            async for chunk in AIFactory.generate(
                provider_name,
                prompt,
                model=request.model,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                api_key=request.api_key
            ):
                # Format as SSE
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Send done signal
            yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/providers", response_model=list[AIProvider])
async def get_providers():
    """Get all available AI providers"""
    providers = AIFactory.get_all_providers()
    return list(providers.values())


@router.post("/providers/{provider_name}/cost")
async def calculate_cost(provider_name: str, tokens: int):
    """Calculate cost for specified provider and tokens"""
    cost = AIFactory.get_cost(provider_name, tokens)
    return {"provider": provider_name, "tokens": tokens, "cost": cost}
