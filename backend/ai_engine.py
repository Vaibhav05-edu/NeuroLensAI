import os
import json
import re
import asyncio
from openai import AsyncOpenAI, RateLimitError
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
FREE_MODEL = "google/gemma-4-31b-it:free"

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def extract_json(text: str):
    """Robustly extract JSON object from any text response."""
    if not text:
        return None
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except:
        pass
    # Try extracting JSON block
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None

async def call_ai(prompt: str, max_tokens: int = 400, retries: int = 1):
    """Call AI with retry logic for rate limits."""
    for attempt in range(retries):
        try:
            response = await client.chat.completions.create(
                model=FREE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except RateLimitError:
            if attempt < retries - 1:
                print(f"[AI] Rate limited, waiting 1s before retry {attempt + 1}...")
                await asyncio.sleep(1)
            else:
                print("[AI] Rate limit exhausted, using fallback.")
                return None
        except Exception as e:
            print(f"[AI] Error: {e}")
            return None

async def process_journal_entry(content: str, current_twin: dict):
    prompt = f"""You are a cognitive intelligence AI. The student wrote this journal entry:
"{content}"

Current cognitive state: Focus={current_twin['focus_score']:.0f}%, Stress={current_twin['stress_index']:.0f}%, Burnout={current_twin['burnout_probability']:.0f}%, Motivation={current_twin['motivation_index']:.0f}%, EmotionalStability={current_twin['emotional_stability']:.0f}%

Analyze and return ONLY raw JSON (no markdown, no code blocks):
{{"sentiment": "Positive", "stress_triggers": "exam pressure", "twin_updates": {{"focus_score": 75.0, "stress_index": 40.0, "burnout_probability": 35.0, "motivation_index": 80.0, "emotional_stability": 70.0}}}}"""

    raw = await call_ai(prompt, max_tokens=400)
    if not raw:
        # Fallback: simple sentiment-based heuristics
        lower = content.lower()
        is_stressed = any(w in lower for w in ["stress", "anxious", "overwhelm", "tired", "burnout", "can't", "cannot", "hard", "difficult"])
        is_positive = any(w in lower for w in ["great", "good", "happy", "focus", "confident", "done", "finished"])
        if is_stressed:
            return {"sentiment": "Stressed", "stress_triggers": "self-reported difficulty",
                    "twin_updates": {"focus_score": max(20, current_twin['focus_score'] - 10),
                                     "stress_index": min(90, current_twin['stress_index'] + 15),
                                     "burnout_probability": min(90, current_twin['burnout_probability'] + 10),
                                     "motivation_index": max(20, current_twin['motivation_index'] - 10),
                                     "emotional_stability": max(20, current_twin['emotional_stability'] - 10)}}
        elif is_positive:
            return {"sentiment": "Positive", "stress_triggers": "none",
                    "twin_updates": {"focus_score": min(100, current_twin['focus_score'] + 10),
                                     "stress_index": max(0, current_twin['stress_index'] - 10),
                                     "burnout_probability": max(0, current_twin['burnout_probability'] - 5),
                                     "motivation_index": min(100, current_twin['motivation_index'] + 10),
                                     "emotional_stability": min(100, current_twin['emotional_stability'] + 5)}}
        else:
            return {"sentiment": "Neutral", "stress_triggers": "none",
                    "twin_updates": {"focus_score": current_twin['focus_score'],
                                     "stress_index": current_twin['stress_index'],
                                     "burnout_probability": current_twin['burnout_probability'],
                                     "motivation_index": current_twin['motivation_index'],
                                     "emotional_stability": current_twin['emotional_stability']}}

    print(f"[AI] Journal raw: {raw[:300]}")
    return extract_json(raw)

async def generate_future_self(current_twin: dict):
    prompt = f"""You are the student's Future Self, 30 days before their competitive exam.
Their current stats: Focus={current_twin['focus_score']:.0f}%, Stress={current_twin['stress_index']:.0f}%, Burnout Risk={current_twin['burnout_probability']:.0f}%

Write a personal 2-sentence message starting with "I'm you, 30 days before the exam."
If burnout>50%, urge rest. If focus>70%, encourage strongly.

Return ONLY raw JSON: {{"message": "I'm you, 30 days before the exam. ..."}}"""

    raw = await call_ai(prompt, max_tokens=200)
    if not raw:
        burnout = current_twin.get('burnout_probability', 0)
        if burnout > 50:
            return "I'm you, 30 days before the exam. Please slow down — I pushed this hard and it backfired. Take a real break today, our score improves when we're rested."
        return "I'm you, 30 days before the exam. Your consistency right now is building the foundation we need. Keep showing up every day, it compounds."

    print(f"[AI] Future self raw: {raw[:300]}")
    result = extract_json(raw)
    if result and "message" in result:
        return result["message"]
    return raw.strip().strip('"').strip("'")

async def generate_recovery_plan(current_twin: dict):
    focus = current_twin['focus_score']
    stress = current_twin['stress_index']
    burnout = current_twin['burnout_probability']

    prompt = f"""Student: Focus={focus:.0f}%, Stress={stress:.0f}%, Burnout={burnout:.0f}%

Generate exactly 3 personalized recovery tasks. Return ONLY raw JSON:
{{"tasks":[{{"icon":"🧘‍♀️","title":"Box Breathing","description":"5 mins to lower stress."}},{{"icon":"💧","title":"Hydrate","description":"Drink water to boost focus."}},{{"icon":"🛏️","title":"Sleep Goal","description":"Sleep 8 hours to prevent burnout."}}]}}"""

    raw = await call_ai(prompt, max_tokens=400)
    if not raw:
        # Smart fallbacks based on stats
        tasks = []
        if burnout > 50:
            tasks.append({"icon": "⛔", "title": "Stop & Rest", "description": "Your burnout risk is critical. Take a full 24-hour break from studying."})
        else:
            tasks.append({"icon": "🧘‍♀️", "title": "Box Breathing", "description": "5 minutes of 4-4-4-4 breathing to lower cortisol and reset focus."})
        if stress > 40:
            tasks.append({"icon": "🚶", "title": "10-Minute Walk", "description": "Step outside for 10 minutes. Physical movement reduces stress hormones."})
        else:
            tasks.append({"icon": "💧", "title": "Hydrate Now", "description": "Drink 500ml of water. Dehydration drops cognitive performance by 15%."})
        if focus < 60:
            tasks.append({"icon": "🍎", "title": "Eat & Recharge", "description": "Have a nutritious snack. Low blood sugar directly reduces focus and concentration."})
        else:
            tasks.append({"icon": "🛏️", "title": "Sleep by 10PM", "description": f"Your burnout is at {burnout:.0f}%. Getting 8 hours tonight will drop it significantly."})
        return tasks

    print(f"[AI] Recovery raw: {raw[:300]}")
    result = extract_json(raw)
    if result and "tasks" in result:
        return result["tasks"]
    return []
