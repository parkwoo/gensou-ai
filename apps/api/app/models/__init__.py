from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Novel(Base):
    __tablename__ = "novels"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    background = Column(Text, nullable=True)
    characters = Column(Text, nullable=True)
    relationships = Column(Text, nullable=True)
    style = Column(Text, nullable=True)
    outline = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    chapters = relationship("Chapter", back_populates="novel", cascade="all, delete-orphan")


class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(String, primary_key=True, index=True)
    novel_id = Column(String, ForeignKey("novels.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    outline = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    novel = relationship("Novel", back_populates="chapters")


class AIUsage(Base):
    __tablename__ = "ai_usage"
    
    id = Column(String, primary_key=True, index=True)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    task = Column(String, nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    cost = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class FineTunedModel(Base):
    __tablename__ = "fine_tuned_models"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    base_model = Column(String, nullable=False)
    dataset_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, training, completed, failed
    metrics = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class TrainingDataset(Base):
    __tablename__ = "training_datasets"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    samples_count = Column(Integer, default=0)
    genre = Column(String, nullable=True)
    style = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Knowledge(Base):
    """知識ベースのモデル"""
    __tablename__ = "knowledge"
    
    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False, index=True)  # character, setting, location, term
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)  # JSON string: ["tag1", "tag2"]
    related_ids = Column(Text, nullable=True)  # JSON string: ["id1", "id2"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
