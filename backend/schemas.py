from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JournalEntryCreate(BaseModel):
    user_id: str
    content: str

class JournalEntryResponse(BaseModel):
    id: int
    user_id: str
    content: str
    sentiment: str
    stress_triggers: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class CognitiveTwinResponse(BaseModel):
    user_id: str
    focus_score: float
    stress_index: float
    burnout_probability: float
    motivation_index: float
    emotional_stability: float
    readiness_score: float = 0.0
    last_updated: datetime
    
    class Config:
        orm_mode = True

class DailyTrend(BaseModel):
    date: str
    focus: float
    stress: float
    burnout: float

class MemoryEvent(BaseModel):
    date: str
    content: str
    sentiment: str

class AnalyticsResponse(BaseModel):
    trends: list[DailyTrend]
    memories: list[MemoryEvent]

class AIInsightResponse(BaseModel):
    burnout_forecast: str
    reasoning: list[str]
    recovery_plan: list[str]
