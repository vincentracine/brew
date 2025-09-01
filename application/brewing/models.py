"""Database models for the Brew CLI tool"""

from sqlalchemy import Column, String, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

Base = declarative_base()


class Feature(Base):
    """Feature model representing a product feature"""

    __tablename__ = "features"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    draft_content = Column(Text, nullable=True)
    date_published = Column(DateTime, nullable=True)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    date_created = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "summary": self.summary,
            "content": self.content,
            "draft_content": self.draft_content,
            "date_published": self.date_published.isoformat()
            if self.date_published
            else None,
            "date_updated": self.date_updated.isoformat(),
            "date_created": self.date_created.isoformat(),
        }


def get_database_url(brewing_dir: str) -> str:
    """Get the database URL for the project"""
    return f"sqlite:///{brewing_dir}/database.db"


def create_database_engine(brewing_dir: str):
    """Create database engine and session"""
    database_url = get_database_url(brewing_dir)
    engine = create_engine(database_url, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, SessionLocal


def init_database(brewing_dir: str):
    """Initialize the database with tables"""
    engine, _ = create_database_engine(brewing_dir)
    Base.metadata.create_all(bind=engine)
    return engine
