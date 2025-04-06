from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.models import Novel, Chapter
from app.schemas import Novel as NovelSchema, NovelCreate, NovelUpdate
from app.schemas import Chapter as ChapterSchema, ChapterCreate, ChapterUpdate

router = APIRouter()


@router.get("", response_model=List[NovelSchema])
async def get_novels(db: Session = Depends(get_db)):
    """Get all novels"""
    novels = db.query(Novel).order_by(Novel.updated_at.desc()).all()
    return novels


@router.get("/{novel_id}", response_model=NovelSchema)
async def get_novel(novel_id: str, db: Session = Depends(get_db)):
    """Get a specific novel"""
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    return novel


@router.post("", response_model=NovelSchema)
async def create_novel(novel: NovelCreate, db: Session = Depends(get_db)):
    """Create a new novel"""
    db_novel = Novel(
        id=str(uuid.uuid4()),
        **novel.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    return db_novel


@router.put("/{novel_id}", response_model=NovelSchema)
async def update_novel(novel_id: str, novel: NovelUpdate, db: Session = Depends(get_db)):
    """Update a novel"""
    db_novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not db_novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    
    update_data = novel.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_novel, key, value)
    
    db_novel.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_novel)
    return db_novel


@router.delete("/{novel_id}")
async def delete_novel(novel_id: str, db: Session = Depends(get_db)):
    """Delete a novel"""
    db_novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not db_novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    
    db.delete(db_novel)
    db.commit()
    return {"message": "Novel deleted"}


# Chapter endpoints
@router.get("/{novel_id}/chapters", response_model=List[ChapterSchema])
async def get_chapters(novel_id: str, db: Session = Depends(get_db)):
    """Get all chapters for a novel"""
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    
    chapters = db.query(Chapter).filter(Chapter.novel_id == novel_id).order_by(Chapter.order).all()
    return chapters


@router.get("/{novel_id}/chapters/{chapter_id}", response_model=ChapterSchema)
async def get_chapter(novel_id: str, chapter_id: str, db: Session = Depends(get_db)):
    """Get a specific chapter"""
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.novel_id == novel_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.post("/{novel_id}/chapters", response_model=ChapterSchema)
async def create_chapter(novel_id: str, chapter: ChapterCreate, db: Session = Depends(get_db)):
    """Create a new chapter"""
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    
    db_chapter = Chapter(
        id=str(uuid.uuid4()),
        novel_id=novel_id,
        **chapter.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.put("/{novel_id}/chapters/{chapter_id}", response_model=ChapterSchema)
async def update_chapter(novel_id: str, chapter_id: str, chapter: ChapterUpdate, db: Session = Depends(get_db)):
    """Update a chapter"""
    db_chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.novel_id == novel_id
    ).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    update_data = chapter.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_chapter, key, value)
    
    db_chapter.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.delete("/{novel_id}/chapters/{chapter_id}")
async def delete_chapter(novel_id: str, chapter_id: str, db: Session = Depends(get_db)):
    """Delete a chapter"""
    db_chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.novel_id == novel_id
    ).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    db.delete(db_chapter)
    db.commit()
    return {"message": "Chapter deleted"}
