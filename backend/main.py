from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db
from ai_engine import process_journal_entry, generate_future_self, generate_recovery_plan
from datetime import datetime
from pydantic import BaseModel
import time

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroLens AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache: { user_id: { "tasks": [...], "ts": timestamp } }
_recovery_cache: dict = {}
_CACHE_TTL = 120  # seconds – only call Gemini once every 2 minutes per user

class UserIdRequest(BaseModel):
    user_id: str

def get_or_create_twin(user_id: str, db: Session) -> models.CognitiveTwin:
    twin = db.query(models.CognitiveTwin).filter(models.CognitiveTwin.user_id == user_id).first()
    if not twin:
        twin = models.CognitiveTwin(user_id=user_id)
        db.add(twin)
        db.commit()
        db.refresh(twin)
    return twin

@app.post("/api/journal", response_model=schemas.JournalEntryResponse)
async def create_journal_entry(entry: schemas.JournalEntryCreate, db: Session = Depends(get_db)):
    twin = get_or_create_twin(entry.user_id, db)

    twin_dict = {
        "focus_score": twin.focus_score,
        "stress_index": twin.stress_index,
        "burnout_probability": twin.burnout_probability,
        "motivation_index": twin.motivation_index,
        "emotional_stability": twin.emotional_stability
    }

    ai_analysis = await process_journal_entry(entry.content, twin_dict)

    new_entry = models.JournalEntry(
        user_id=entry.user_id,
        content=entry.content,
        sentiment=ai_analysis.get("sentiment", "Neutral"),
        stress_triggers=ai_analysis.get("stress_triggers", "")
    )
    db.add(new_entry)

    updates = ai_analysis.get("twin_updates", twin_dict)
    twin.focus_score = float(updates.get("focus_score", twin.focus_score))
    twin.stress_index = float(updates.get("stress_index", twin.stress_index))
    twin.burnout_probability = float(updates.get("burnout_probability", twin.burnout_probability))
    twin.motivation_index = float(updates.get("motivation_index", twin.motivation_index))
    twin.emotional_stability = float(updates.get("emotional_stability", twin.emotional_stability))
    twin.last_updated = datetime.utcnow()

    # Invalidate recovery cache so next load gets fresh plan
    _recovery_cache.pop(entry.user_id, None)

    db.commit()
    db.refresh(new_entry)
    return new_entry

def calculate_readiness(twin: models.CognitiveTwin):
    # Exam readiness based on focus, motivation, low stress, and low burnout
    score = (twin.focus_score + twin.motivation_index + (100 - twin.stress_index) + (100 - twin.burnout_probability)) / 4
    return max(0.0, min(100.0, score))

@app.get("/api/twin/{user_id}", response_model=schemas.CognitiveTwinResponse)
def get_cognitive_twin(user_id: str, db: Session = Depends(get_db)):
    twin = get_or_create_twin(user_id, db)
    setattr(twin, "readiness_score", calculate_readiness(twin))
    return twin

@app.get("/api/analytics/{user_id}", response_model=schemas.AnalyticsResponse)
def get_analytics(user_id: str, db: Session = Depends(get_db)):
    twin = get_or_create_twin(user_id, db)
    
    # Generate 7-day mock trend based on current state (great for hackathon demo)
    import random
    from datetime import timedelta
    trends = []
    base_f, base_s, base_b = twin.focus_score, twin.stress_index, twin.burnout_probability
    
    for i in range(7, -1, -1):
        dt = datetime.utcnow() - timedelta(days=i)
        # Add some random walk noise
        f = max(0, min(100, base_f + random.uniform(-15, 15)))
        s = max(0, min(100, base_s + random.uniform(-10, 10)))
        b = max(0, min(100, base_b + random.uniform(-5, 5)))
        trends.append({
            "date": dt.strftime("%a"),
            "focus": round(f, 1),
            "stress": round(s, 1),
            "burnout": round(b, 1)
        })
        
    # Fetch actual journal entries for Memory Timeline
    entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == user_id
    ).order_by(models.JournalEntry.created_at.desc()).limit(10).all()
    
    memories = [
        {
            "date": e.created_at.strftime("%b %d, %H:%M"),
            "content": e.content,
            "sentiment": e.sentiment
        }
        for e in entries
    ]
    
    return {"trends": trends, "memories": memories}

@app.post("/api/future-self")
async def get_future_self(req: UserIdRequest, db: Session = Depends(get_db)):
    twin = get_or_create_twin(req.user_id, db)
    twin_dict = {
        "focus_score": twin.focus_score,
        "stress_index": twin.stress_index,
        "burnout_probability": twin.burnout_probability
    }
    msg = await generate_future_self(twin_dict)
    return {"message": msg}

@app.post("/api/recovery")
async def get_recovery_plan(req: UserIdRequest, db: Session = Depends(get_db)):
    # Serve cached plan if fresh enough
    cached = _recovery_cache.get(req.user_id)
    if cached and (time.time() - cached["ts"]) < _CACHE_TTL:
        print(f"[Cache] Serving cached recovery plan for {req.user_id}")
        return {"tasks": cached["tasks"]}

    twin = get_or_create_twin(req.user_id, db)
    twin_dict = {
        "focus_score": twin.focus_score,
        "stress_index": twin.stress_index,
        "burnout_probability": twin.burnout_probability
    }
    plan = await generate_recovery_plan(twin_dict)

    # Cache the result
    _recovery_cache[req.user_id] = {"tasks": plan, "ts": time.time()}
    return {"tasks": plan}
