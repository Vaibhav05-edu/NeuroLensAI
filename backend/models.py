from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CognitiveTwin(Base):
    __tablename__ = "cognitive_twins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Clerk ID for simplicity
    focus_score = Column(Float, default=100.0)
    stress_index = Column(Float, default=0.0)
    burnout_probability = Column(Float, default=0.0)
    motivation_index = Column(Float, default=100.0)
    emotional_stability = Column(Float, default=100.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    content = Column(Text, default="")
    sentiment = Column(String, default="Neutral")
    stress_triggers = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
