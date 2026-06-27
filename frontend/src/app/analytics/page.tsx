"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { ArrowLeft, Brain, Activity, Flame } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analytics/demo_user_1`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-[#D3E8C4] rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium">Loading AI Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-[#FDFCF8] relative pb-12 w-full text-[#1A1A1A]">
      <div className="bg-[#D3E8C4] rounded-b-[4rem] px-8 pt-10 pb-32 absolute top-0 w-full z-0 h-[300px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pt-10 flex-1">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <Link href="/" className="flex items-center space-x-2 bg-white/50 hover:bg-white backdrop-blur-sm px-6 py-3 rounded-full shadow-sm transition font-bold text-[#1A1A1A]">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm pr-6 pl-2 py-2 rounded-full shadow-sm">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden shadow-sm border-2 border-white">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[#1A1A1A] font-bold">Hi 👋 Chloe Brooke</p>
            </div>
          </div>
        </header>

        <div className="mb-12 text-center md:text-left">
          <h1 className="text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
            Cognitive Trends
          </h1>
          <p className="text-gray-700 text-xl mt-4 font-medium">Your 7-day AI forecast and memory timeline.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <Brain className="text-yellow-500" size={28} />
                <h2 className="text-3xl font-bold">Focus & Burnout Trend</h2>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontWeight: 500 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                    <Line type="monotone" dataKey="focus" stroke="#FDE272" strokeWidth={5} dot={{ r: 6, fill: '#FDE272', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Focus %" />
                    <Line type="monotone" dataKey="burnout" stroke="#9AC8FF" strokeWidth={5} dot={{ r: 6, fill: '#9AC8FF', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Burnout %" />
                    <Line type="monotone" dataKey="stress" stroke="#B0B0B0" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Stress %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="bg-[#FFF4D2] rounded-[2rem] p-8 shadow-sm flex flex-col justify-center items-center text-center">
                 <Activity size={40} className="text-yellow-600 mb-4" />
                 <h3 className="text-4xl font-bold mb-2">{data.trends[data.trends.length-1].focus}%</h3>
                 <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Current Focus</p>
               </div>
               <div className="bg-[#D4E5FF] rounded-[2rem] p-8 shadow-sm flex flex-col justify-center items-center text-center">
                 <Flame size={40} className="text-blue-500 mb-4" />
                 <h3 className="text-4xl font-bold mb-2">{data.trends[data.trends.length-1].burnout}%</h3>
                 <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Burnout Risk</p>
               </div>
            </div>
          </div>

          {/* Memory Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm h-full">
              <h2 className="text-3xl font-bold mb-8">Memory Timeline</h2>
              
              {data.memories.length === 0 ? (
                <div className="text-gray-500 text-center mt-12 font-medium">
                  No memories yet. Start journaling to build your timeline!
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {data.memories.map((memory: any, idx: number) => {
                    // Determine color based on sentiment
                    let dotColor = "bg-yellow-400";
                    if (memory.sentiment.toLowerCase().includes("stress") || memory.sentiment.toLowerCase().includes("neg")) dotColor = "bg-red-400";
                    if (memory.sentiment.toLowerCase().includes("pos") || memory.sentiment.toLowerCase().includes("great")) dotColor = "bg-green-400";

                    return (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Dot */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white ${dotColor} text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}></div>
                        
                        {/* Content */}
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-[#F5F5F7] p-5 rounded-[1.5rem] shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-gray-900">{memory.sentiment}</div>
                            <time className="text-xs font-medium text-gray-500">{memory.date}</time>
                          </div>
                          <div className="text-gray-600 font-medium leading-relaxed">"{memory.content}"</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
