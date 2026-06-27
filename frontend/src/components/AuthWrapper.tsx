"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("neuro_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded credentials for demo
    if (username === "demo_user_1" && password === "hackathon2026") {
      localStorage.setItem("neuro_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid credentials. Try demo_user_1 / hackathon2026");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FDFCF8]"></div>;

  return (
    <>
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F3F7ED]"
          >
            <div className="absolute top-0 w-full h-[400px] bg-[#D3E8C4] rounded-b-[4rem] z-0"></div>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative z-10 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-[#FFF4D2] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Lock size={28} className="text-yellow-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 text-center">Welcome Back</h2>
              <p className="text-gray-500 font-medium text-center mb-8">Sign in to your Cognitive Twin</p>
              
              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#D3E8C4] transition"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#D3E8C4] transition"
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm font-semibold text-center mt-2">{error}</p>}
                
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white font-bold text-lg rounded-2xl py-4 mt-4 hover:bg-gray-800 transition shadow-lg"
                >
                  Access Twin
                </button>
              </form>
              
              <div className="mt-8 text-sm text-gray-400 text-center">
                Demo Credentials:<br/>
                <span className="font-bold text-gray-600">demo_user_1</span> / <span className="font-bold text-gray-600">hackathon2026</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isAuthenticated && children}
    </>
  );
}
