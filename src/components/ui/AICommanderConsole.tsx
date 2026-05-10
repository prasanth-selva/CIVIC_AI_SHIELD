import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shield, Crosshair, Zap, ChevronRight, Activity, Terminal, Target, AlertTriangle, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import { useAuth } from "../../context/AuthContext";

export function AICommanderConsole() {
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchCommander() {
            try {
                const response = await fetch(`${API_BASE}/api/system/intelligence`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const d = await response.json();
                    setData(d);
                }
            } catch (err) {
                console.error("Commander fetch failed:", err);
            }
        }
        const interval = setInterval(fetchCommander, 3000);
        fetchCommander();
        return () => clearInterval(interval);
    }, [token]);

    const resources = data?.commander_status?.resource_matrix || {};

    return (
        <div className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden font-inter flex flex-col h-full">
            <div className="radar-sweep opacity-5" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className="text-red-600" />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Autonomous_Commander_v4</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest italic animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                    SENTIENT_ACTIVE
                </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                {/* Resource Matrix (Feature 1) */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tactical_Resource_Matrix</p>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(resources).map(([id, status]: any) => (
                            <div key={id} className="p-3 bg-white/5 border border-white/5 rounded-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-600 animate-pulse'}`} />
                                    <span className="text-[10px] font-black text-white">{id}</span>
                                </div>
                                <span className={`text-[8px] font-bold ${status === 'AVAILABLE' ? 'text-green-500/60' : 'text-red-500/60'}`}>{status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Recommendation Chain (Feature 1) */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Autonomous_Decision_Chain</p>
                    <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <Brain size={14} className="text-red-600" />
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Command_Reasoning</span>
                        </div>
                        <p className="text-xs text-gray-300 italic leading-relaxed mb-4">
                            "Multiple node anomalies detected in Sector Alpha. Swarm handoff initiated. Resource ALPHA-TEAM auto-dispatched based on 94% threat evolution confidence."
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-red-900/30">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-600">CONFIDENCE</span>
                                <span className="text-xs font-black text-white tracking-tighter">98.2%</span>
                            </div>
                            <button className="px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:bg-red-500 transition-all">
                                <CheckCircle2 size={12} /> Confirm_Override
                            </button>
                        </div>
                    </div>
                </div>

                {/* Swarm Synchronization (Feature 5) */}
                <div className="p-4 glass-panel border-white/5 rounded-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-red-600" />
                        <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Swarm_Handoff_Status</p>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                        <div className="flex items-center gap-3">
                            <Crosshair size={14} className="text-red-600" />
                            <span className="text-[10px] font-black text-white">Target_Sync: Active</span>
                        </div>
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-[8px] font-black text-white">
                                    C{i}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Console Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                    <Terminal size={12} />
                    Commander_Session: 0xFA21
                </div>
                <span>Uptime: 142h_42m</span>
            </div>
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
