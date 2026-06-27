"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ArrowUpRight, X, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import CognitiveDashboard from "@/components/CognitiveDashboard";
import JournalInput from "@/components/JournalInput";

export default function Home() {
  const [twinData, setTwinData] = useState(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFutureSelf, setShowFutureSelf] = useState(false);
  const [futureSelfResponse, setFutureSelfResponse] = useState("");
  const [recoveryTasks, setRecoveryTasks] = useState([]);
  const [isLoadingFuture, setIsLoadingFuture] = useState(false);

  const fetchTwinData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/twin/demo_user_1`);
      setTwinData(response.data);
      fetchRecoveryPlan();
    } catch (err) {
      console.warn("Failed to fetch twin data", err);
    }
  };
  
  const fetchRecoveryPlan = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/recovery`, { user_id: "demo_user_1" }, { timeout: 15000 });
      setRecoveryTasks(response.data.tasks || []);
    } catch (err) {
      console.warn("Failed to fetch recovery plan, using local fallback");
      // Fallback UI so it doesn't load forever
      setRecoveryTasks([
        { icon: "🧘‍♀️", title: "Box Breathing", description: "5 minutes of 4-4-4-4 breathing to lower cortisol." },
        { icon: "🚶", title: "Short Walk", description: "Step away from screens for 10 minutes to reset." },
        { icon: "💧", title: "Hydrate", description: "Drink a glass of water to maintain cognitive function." }
      ]);
    }
  };

  useEffect(() => {
    fetchTwinData();
  }, []);

  const handleJournalSubmit = async () => {
    if (!journalText.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/journal`, {
        user_id: "demo_user_1",
        content: journalText
      });
      setJournalText("");
      setShowJournalModal(false);
      fetchTwinData(); // Refetches twin and triggers new recovery plan
    } catch (err) {
      console.warn("Error submitting journal", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFutureSelfMessage = async () => {
    setShowFutureSelf(true);
    setIsLoadingFuture(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/future-self`, { user_id: "demo_user_1" });
      setFutureSelfResponse(response.data.message);
    } catch (err) {
      setFutureSelfResponse("I'm you from the future. Keep studying hard, you got this!");
    } finally {
      setIsLoadingFuture(false);
    }
  };

  // Determine weather based on stats
  const getWeather = () => {
    if (!twinData) return { icon: "☁️", text: "Loading" };
    if (twinData.burnout_probability > 60) return { icon: "⛈️", text: "Burnout Alert" };
    if (twinData.stress_index > 50) return { icon: "🌧️", text: "Fatigued" };
    if (twinData.focus_score < 50) return { icon: "⛅", text: "Distracted" };
    return { icon: "☀️", text: "Clear Focus" };
  };

  const weather = getWeather();

  return (
    <main className="min-h-screen bg-[#F3F7ED] flex flex-col relative pb-12 w-full">
      <div className="bg-[#D3E8C4] rounded-b-[4rem] px-8 pt-10 pb-32 absolute top-0 w-full z-0 h-[400px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pt-10 flex-1">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm pr-6 pl-2 py-2 rounded-full shadow-sm">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden shadow-sm border-2 border-white">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[#1A1A1A] font-bold">Hi 👋 Chloe Brooke</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="relative hidden md:block shadow-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 bg-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-700 font-medium"
              />
            </div>
            
            <Link href="/analytics" className="px-6 py-3 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition font-bold text-[#1A1A1A]">
              Analytics
            </Link>

            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition">
              <Bell size={20} className="text-gray-700" />
            </button>
          </div>
        </header>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Greeting & Input) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="mb-8">
              <p className="text-gray-700 text-xl mb-2 font-medium">Good morning,</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
                Welcome back,<br/>how's your mind<br/>today?
              </h1>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-[#1A1A1A] font-bold text-xl mb-6">Daily mood check-in</h3>
              <JournalInput onEntryProcessed={fetchTwinData} />
            </div>
            
            {/* Cognitive Weather & Future Self */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FFF4D2] rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-2">{weather.icon}</div>
                <h4 className="font-bold text-[#1A1A1A] text-lg leading-tight">{weather.text}</h4>
                <p className="text-xs text-gray-600 mt-1 font-medium uppercase tracking-wider">Brain Weather</p>
              </div>
              
              <div 
                onClick={fetchFutureSelfMessage}
                className="bg-[#D4E5FF] rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition group relative overflow-hidden"
              >
                <Sparkles size={32} className="text-blue-500 mb-2 group-hover:scale-110 transition" />
                <h4 className="font-bold text-[#1A1A1A] text-lg leading-tight">Future Self</h4>
                <p className="text-xs text-gray-600 mt-1 font-medium uppercase tracking-wider">Talk to AI</p>
              </div>
            </div>

            {/* Mind Clarity Card */}
            <div 
              onClick={() => setShowJournalModal(true)}
              className="bg-[#FFE5D9] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition"
            >
              <h4 className="font-bold text-[#1A1A1A] text-2xl leading-tight mb-4 pr-8">Mind Clarity<br/>Journal</h4>
              <p className="text-gray-700 mb-8 max-w-[200px] font-medium leading-relaxed">Write down your thoughts to clear cognitive fatigue.</p>
              <div className="absolute top-6 right-6 w-12 h-12 bg-white/50 rounded-full flex items-center justify-center group-hover:bg-white transition shadow-sm">
                <ArrowUpRight size={24} className="text-[#1A1A1A]" />
              </div>
              <div className="absolute -bottom-10 -right-10 text-[8rem] opacity-40 group-hover:scale-110 transition duration-500">📓</div>
            </div>
          </div>

          {/* Right Column (Twin Data Blobs) */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-6">
               <h3 className="text-[#1A1A1A] font-bold text-2xl px-2">Cognitive Twin Analysis</h3>
            </div>
            <CognitiveDashboard twinData={twinData} />
            
            {/* Dynamic AI Recovery Plan */}
            <div className="mt-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-[#1A1A1A] font-bold text-2xl mb-6 flex items-center">
                 <span className="bg-[#C4F0D5] p-2 rounded-xl mr-3">❤️</span>
                 AI Recovery Plan
               </h3>
               {recoveryTasks.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {recoveryTasks.map((task, idx) => (
                     <div key={idx} className="bg-[#F5F5F7] p-6 rounded-[2rem] flex flex-col">
                       <span className="text-2xl mb-3">{task.icon}</span>
                       <h4 className="font-bold text-[#1A1A1A] text-lg">{task.title}</h4>
                       <p className="text-gray-500 text-sm mt-2">{task.description}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-[#F5F5F7] p-6 rounded-[2rem] text-center text-gray-500 font-medium animate-pulse">
                   Generating dynamic recovery plan...
                 </div>
               )}
            </div>
          </div>

        </div>
      </div>

      {/* Journal Modal Overlay */}
      <AnimatePresence>
        {showJournalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#FFF4D2] w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowJournalModal(false)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition shadow-sm"
              >
                <X size={24} className="text-[#1A1A1A]" />
              </button>
              
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Mind Clarity Journal</h2>
              <p className="text-gray-700 mb-8 text-lg font-medium">Record your thoughts. Our AI will analyze your cognitive state.</p>
              
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="I am feeling overwhelmed with Physics preparations today..."
                className="w-full h-48 bg-white/60 border-none rounded-[2rem] p-6 text-xl text-[#1A1A1A] placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white mb-6 resize-none"
              />
              
              <div className="flex justify-end">
                <button
                  onClick={handleJournalSubmit}
                  disabled={isSubmitting || !journalText.trim()}
                  className="bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold text-xl px-10 py-5 rounded-full flex items-center space-x-3 shadow-lg transition disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Syncing Twin..." : "Save Entry"}</span>
                  {!isSubmitting && <Send size={24} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Future Self Modal Overlay */}
        {showFutureSelf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#D4E5FF] w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowFutureSelf(false)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition shadow-sm"
              >
                <X size={24} className="text-[#1A1A1A]" />
              </button>
              
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">🔮</div>
                 <h2 className="text-3xl font-bold text-[#1A1A1A]">Future Self AI</h2>
              </div>
              
              <div className="bg-white/60 rounded-[2rem] p-8 min-h-[160px] flex items-center justify-center">
                {isLoadingFuture ? (
                  <div className="animate-pulse flex space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animation-delay-200"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animation-delay-400"></div>
                  </div>
                ) : (
                  <p className="text-xl text-[#1A1A1A] font-medium leading-relaxed italic">
                    "{futureSelfResponse}"
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
