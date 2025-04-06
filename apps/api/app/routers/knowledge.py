"""
知識ベース関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import uuid

from app.models import Knowledge
from app.database import get_db

router = APIRouter(prefix="/api/knowledge")


class KnowledgeItem(BaseModel):
    """知識アイテムのモデル"""
    id: str
    type: str  # character, setting, location, term
    name: str
    description: str
    tags: List[str]
    related_ids: Optional[List[str]] = None
    created_at: str
    updated_at: str


class CreateKnowledgeRequest(BaseModel):
    """知識作成リクエスト"""
    type: str  # character, setting, location, term
    name: str
    description: str
    tags: List[str] = []
    related_ids: Optional[List[str]] = None


class UpdateKnowledgeRequest(BaseModel):
    """知識更新リクエスト"""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    related_ids: Optional[List[str]] = None


def knowledge_to_dict(knowledge: Knowledge) -> dict:
    """Knowledgeモデルを辞書に変換"""
    return {
        "id": knowledge.id,
        "type": knowledge.type,
        "name": knowledge.name,
        "description": knowledge.description,
        "tags": json.loads(knowledge.tags) if knowledge.tags else [],
        "related_ids": json.loads(knowledge.related_ids) if knowledge.related_ids else [],
        "created_at": knowledge.created_at.isoformat(),
        "updated_at": knowledge.updated_at.isoformat(),
    }


@router.get("", response_model=List[KnowledgeItem])
async def get_knowledge(
    type: Optional[str] = None,
    search: Optional[str] = None,
    db=Depends(get_db)
):
    """
    知識ベースを取得する
    
    - type: フィルタリングするタイプ（character, setting, location, term）
    - search: 検索クエリ（名前、説明、タグを検索）
    """
    query = db.query(Knowledge)
    
    # タイプでフィルタリング
    if type:
        query = query.filter(Knowledge.type == type)
    
    # 検索クエリでフィルタリング
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Knowledge.name.ilike(search_pattern)) |
            (Knowledge.description.ilike(search_pattern))
        )
        # タグも検索（JSON文字列として検索）
        query = query.filter(Knowledge.tags.ilike(search_pattern))
    
    # 更新日時の降順でソート
    items = query.order_by(Knowledge.updated_at.desc()).all()
    
    return [knowledge_to_dict(item) for item in items]


@router.get("/{knowledge_id}", response_model=KnowledgeItem)
async def get_knowledge_item(knowledge_id: str, db=Depends(get_db)):
    """特定の知識アイテムを取得する"""
    item = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="知識が見つかりません")
    
    return knowledge_to_dict(item)


@router.post("", response_model=KnowledgeItem)
async def create_knowledge(request: CreateKnowledgeRequest, db=Depends(get_db)):
    """新しい知識アイテムを作成する"""
    knowledge_id = str(uuid.uuid4())
    
    new_knowledge = Knowledge(
        id=knowledge_id,
        type=request.type,
        name=request.name,
        description=request.description,
        tags=json.dumps(request.tags, ensure_ascii=False),
        related_ids=json.dumps(request.related_ids or [], ensure_ascii=False),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    db.add(new_knowledge)
    db.commit()
    db.refresh(new_knowledge)
    
    return knowledge_to_dict(new_knowledge)


@router.put("/{knowledge_id}", response_model=KnowledgeItem)
async def update_knowledge(
    knowledge_id: str,
    request: UpdateKnowledgeRequest,
    db=Depends(get_db)
):
    """知識アイテムを更新する"""
    item = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="知識が見つかりません")
    
    # 更新するフィールドのみ更新
    if request.name is not None:
        item.name = request.name
    if request.description is not None:
        item.description = request.description
    if request.tags is not None:
        item.tags = json.dumps(request.tags, ensure_ascii=False)
    if request.related_ids is not None:
        item.related_ids = json.dumps(request.related_ids, ensure_ascii=False)
    
    item.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    
    return knowledge_to_dict(item)


@router.delete("/{knowledge_id}")
async def delete_knowledge(knowledge_id: str, db=Depends(get_db)):
    """知識アイテムを削除する"""
    item = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="知識が見つかりません")
    
    db.delete(item)
    db.commit()
    
    return {"message": "知識を削除しました"}


@router.get("/stats/summary")
async def get_knowledge_stats(db=Depends(get_db)):
    """知識ベースの統計情報を取得する"""
    total = db.query(Knowledge).count()
    
    # タイプ別のカウント
    character_count = db.query(Knowledge).filter(Knowledge.type == "character").count()
    setting_count = db.query(Knowledge).filter(Knowledge.type == "setting").count()
    location_count = db.query(Knowledge).filter(Knowledge.type == "location").count()
    term_count = db.query(Knowledge).filter(Knowledge.type == "term").count()
    
    return {
        "total": total,
        "by_type": {
            "character": character_count,
            "setting": setting_count,
            "location": location_count,
            "term": term_count,
        }
    }
