"use client";

import { motion } from "framer-motion";

export default function CognitiveDashboard({ twinData }: { twinData: any }) {
  if (!twinData) return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {[1,2,3].map(i => <div key={i} className="min-w-[280px] h-[400px] bg-gray-200 rounded-[2.5rem] animate-pulse"></div>)}
    </div>
  );

  const metrics = [
    { 
      name: "FOCUS", 
      value: twinData.focus_score, 
      bg: "bg-[#FFF4D2]", // Yellow
      blobColor: "bg-[#FDE272]",
      blobShape: "border-radius-[60%_40%_30%_70%/60%_30%_70%_40%]",
      face: "🙂"
    },
    { 
      name: "READINESS", 
      value: twinData.readiness_score || 0, 
      bg: "bg-[#C4F0D5]", // Green
      blobColor: "bg-[#80D29E]",
      blobShape: "border-radius-[30%_70%_70%_30%/30%_30%_70%_70%]",
      face: "🎯"
    },
    { 
      name: "BURNOUT", 
      value: twinData.burnout_probability, 
      bg: "bg-[#D4E5FF]", // Blue
      blobColor: "bg-[#9AC8FF]",
      blobShape: "border-radius-[40%_60%_70%_30%/40%_50%_60%_50%]",
      face: "😔"
    },
    { 
      name: "STRESS", 
      value: twinData.stress_index, 
      bg: "bg-[#E6E6E6]", // Gray
      blobColor: "bg-[#B0B0B0]",
      blobShape: "border-radius-[50%_50%_20%_80%/25%_80%_20%_75%]",
      face: "😐"
    }
  ];

  return (
    <div className="flex space-x-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
      {metrics.map((m, idx) => (
        <motion.div
          key={m.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`min-w-[300px] h-[500px] ${m.bg} rounded-[3rem] p-8 flex flex-col items-center justify-center relative snap-center shadow-sm`}
        >
          {/* Top Add Button */}
          <div className="absolute top-6 right-6 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
            <span className="text-xl">+</span>
          </div>

          <div className="relative flex flex-col items-center justify-center w-full h-full mb-12">
            <h2 className="text-[5rem] font-light text-[#1A1A1A] leading-none z-10 flex items-start -ml-4">
              {m.value.toFixed(0)}<span className="text-3xl mt-4">%</span>
            </h2>
            
            {/* The Blob */}
            <div 
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${m.blobColor} opacity-80 z-0 transition-all duration-[3000ms]`}
              style={{ borderRadius: m.name === "FOCUS" ? "60% 40% 30% 70% / 60% 30% 70% 40%" : 
                                    m.name === "BURNOUT" ? "40% 60% 70% 30% / 40% 50% 60% 50%" : 
                                    m.name === "STRESS" ? "50% 50% 20% 80% / 25% 80% 20% 75%" : 
                                    "30% 70% 70% 30% / 30% 30% 70% 70%" }}
            >
              {/* Face on blob */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-4xl opacity-80 mix-blend-overlay">
                {m.face}
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-medium text-[#1A1A1A] tracking-wider mb-8 z-10">{m.name}</h3>

          {/* Slider Graphic */}
          <div className="w-full mt-auto relative pt-4 border-t border-black/10">
             <div className="flex justify-between text-xs text-gray-500 font-medium mb-3">
               <div className="text-center">15<br/><span className="text-[10px] font-normal">Mon</span></div>
               <div className="text-center">16<br/><span className="text-[10px] font-normal">Tue</span></div>
               <div className="text-center text-[#1A1A1A] font-bold">17<br/><span className="text-[10px] font-normal">Wed</span></div>
               <div className="text-center">18<br/><span className="text-[10px] font-normal">Thu</span></div>
               <div className="text-center">19<br/><span className="text-[10px] font-normal">Fri</span></div>
             </div>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#1A1A1A] rounded-full border-4 border-white"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
