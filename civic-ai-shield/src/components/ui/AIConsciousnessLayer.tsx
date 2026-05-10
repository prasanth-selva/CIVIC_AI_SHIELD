import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Activity, Cpu, Database, Terminal, ChevronRight, Activity as PulseIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config";

export function AIConsciousnessLayer() {
    const { token } = useAuth();
    const [thoughts, setThoughts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function fetchConsciousness() {
            try {
                const response = await fetch(`${API_BASE}/api/strategic/consciousness`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const d = await response.json();
                    setThoughts(d.thought_stream);
                    setStats(d);
                }
            } catch (err) {
                console.error("Consciousness fetch failed:", err);
            }
        }
        const interval = setInterval(fetchConsciousness, 2000);
        fetchConsciousness();
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden font-inter flex flex-col h-full bg-[#020202]/80 backdrop-blur-3xl">
            <div className="radar-sweep opacity-5" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Brain size={18} className="text-red-600" />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">AI_Consciousness_Interface</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest italic">COGNITION_ACTIVE</span>
                </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-4">
                {/* Neural Load (Feature 9) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Neural_Cognition_Load</p>
                        <div className="flex items-end justify-between">
                            <p className="text-xl font-black text-white italic tracking-tighter">{stats?.neural_load || "0.0%"}</p>
                            <Cpu size={14} className="text-red-600" />
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Decision_Confidence</p>
                        <div className="flex items-end justify-between">
                            <p className="text-xl font-black text-white italic tracking-tighter">{(stats?.decision_confidence_avg * 100 || 0).toFixed(1)}%</p>
                            <Zap size={14} className="text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* AI Thought Stream (Feature 9) */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={12} /> Autonomous_Reasoning_Feed
                    </p>
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {thoughts.slice().reverse().map((thought, idx) => (
                                <motion.div
                                    key={thought.timestamp}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-4 border-l-2 ${idx === 0 ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/2'} rounded-sm`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[8px] font-mono text-gray-500">{new Date(thought.timestamp * 1000).toLocaleTimeString()}</span>
                                        <span className="text-[8px] font-black text-red-600 uppercase">{(thought.confidence * 100).toFixed(0)}%_CONF</span>
                                    </div>
                                    <p className="text-[10px] text-gray-300 italic leading-relaxed">
                                        <span className="text-red-600 mr-2">»</span>
                                        {thought.thought}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Live Neural Pulse (Feature 9) */}
                <div className="p-6 bg-red-950/5 border border-red-900/20 rounded-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <PulseIcon size={12} className="text-red-600" />
                        <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Neural_Decision_Graph</p>
                    </div>
                    <div className="flex gap-1 h-12 items-end">
                        {Array.from({ length: 32 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                animate={{ height: [4, Math.random() * 40 + 4, 4] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.03 }}
                                className="flex-1 bg-red-600/40"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Consciousness Layer Footer */}
            <div className="mt-8 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-2">
                        <Database size={10} />
                        Strategic_Memory_Reconstruction
                    </div>
                    <span className="text-red-600 italic">ACTIVE_COG_LINK</span>
                 </div>
            </div>
        </div>
    );
}
