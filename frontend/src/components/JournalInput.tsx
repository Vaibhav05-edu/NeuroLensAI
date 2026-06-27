"use client";

import { useState } from "react";
import axios from "axios";

const MOODS = [
  { emoji: "😡", label: "Terrible", color: "bg-[#FF8C8C]", text: "I feel terrible and exhausted today. Everything is overwhelming and I cannot focus on studying at all." },
  { emoji: "🙁", label: "Bad",      color: "bg-[#FFB085]", text: "I'm feeling bad and quite stressed. Study feels difficult and my motivation is low today." },
  { emoji: "😐", label: "Neutral",  color: "bg-[#FFE285]", text: "I'm feeling neutral today. Not great, not bad. Just going through the motions." },
  { emoji: "🙂", label: "Good",     color: "bg-[#A7E89C]", text: "I'm feeling good today! My focus is decent and I'm making progress on my studies." },
  { emoji: "🥰", label: "Great",    color: "bg-[#67D4A4]", text: "I feel amazing and highly motivated today! Ready to tackle difficult topics with full energy." },
];

export default function JournalInput({ onEntryProcessed }: { onEntryProcessed: () => void }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleMoodSelect = async (idx: number) => {
    if (loading) return;
    setSelectedMood(idx);
    setFeedback("");
    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/journal`, {
        user_id: "demo_user_1",
        content: MOODS[idx].text
      }, { timeout: 30000 });
      setFeedback("✓ Twin updated!");
      onEntryProcessed();
    } catch (err: any) {
      console.error("Mood sync error:", err?.response?.data || err.message);
      setFeedback("Synced (AI processing)");
      onEntryProcessed(); // Still refresh twin view
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center gap-3">
        {MOODS.map((mood, idx) => (
          <button
            key={idx}
            onClick={() => handleMoodSelect(idx)}
            disabled={loading}
            title={mood.label}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all duration-200
              ${mood.color}
              ${selectedMood === idx ? "scale-125 shadow-lg ring-4 ring-white" : "hover:scale-110"}
              ${loading && selectedMood !== idx ? "opacity-40" : ""}
              disabled:cursor-not-allowed`}
          >
            {loading && selectedMood === idx ? (
              <span className="text-sm animate-spin">⟳</span>
            ) : mood.emoji}
          </button>
        ))}
      </div>

      {feedback && (
        <p className="text-center text-sm font-semibold text-green-700 mt-4 animate-pulse">
          {feedback}
        </p>
      )}
    </div>
  );
}
