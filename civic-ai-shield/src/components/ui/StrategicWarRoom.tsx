import { motion, AnimatePresence } from "framer-motion";
import { Globe, ShieldAlert, Target, Zap, Activity, Crosshair, ChevronRight, Terminal, Brain, Cpu, Database, Network } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config";

export function StrategicWarRoom() {
    const { token } = useAuth();
    const [missions, setMissions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function fetchWarRoom() {
            try {
                const [mRes, sRes] = await Promise.all([
                    fetch(`${API_BASE}/api/strategic/war-room`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/api/system/intelligence`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                if (mRes.ok) setMissions((await mRes.json()).active_missions);
                if (sRes.ok) setStats(await sRes.json());
            } catch (err) {
                console.error("War Room fetch failed:", err);
            }
        }
        const interval = setInterval(fetchWarRoom, 3000);
        fetchWarRoom();
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="glass-panel-heavy p-10 border-l-2 border-red-600 relative overflow-hidden font-inter flex flex-col h-full bg-[#020202]/95 backdrop-blur-3xl">
            <div className="radar-sweep opacity-10" />
            
            {/* War Room Header */}
            <div className="flex justify-between items-start mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.6)]" />
                        <p className="text-red-600 font-black text-[12px] uppercase tracking-[0.6em] italic">Strategic_War_Room // ASWIG_CORE</p>
                    </div>
                    <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Global_Command_Wall</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="px-6 py-3 bg-red-600 text-white border border-red-400 rounded-sm flex items-center gap-3 animate-pulse">
                        <ShieldAlert size={18} />
                        <span className="text-[12px] font-black uppercase tracking-widest italic">WARFARE_GRID: ACTIVE</span>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest italic">SEC_AUTH: OMEGA_LEVEL</p>
                        <p className="text-[10px] font-black text-red-600 uppercase italic mt-1">Grid_Uptime: 1422h_42m</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-0">
                {/* Mission Control (Feature 1) */}
                <div className="lg:col-span-2 space-y-8 overflow-y-auto custom-scrollbar pr-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Target size={20} className="text-red-600" /> Active_Mission_Directives
                        </h3>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">({missions.length}) ACTIVE_TASKS</span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {missions.map((mission, idx) => (
                            <motion.div
                                key={mission.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-panel p-8 border-l-4 border-red-600 bg-red-600/5 group hover:bg-red-600/10 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                    <Target size={64} className="text-red-600" />
                                </div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-mono text-red-600 font-black italic">{mission.id}</span>
                                            <div className="w-1 h-1 rounded-full bg-gray-700" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">STATUS: {mission.status}</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{mission.directive}</h4>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Threat_Ladder</p>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className={`w-4 h-1.5 rounded-full ${i <= mission.threat_ladder ? 'bg-red-600' : 'bg-gray-800'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Cascade_Prob</p>
                                        <p className="text-sm font-black text-red-600 italic">{(mission.cascade_prob * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Deployed_Units</p>
                                        <div className="flex gap-2">
                                            {mission.units_deployed.map((unit: string) => (
                                                <span key={unit} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-tighter italic">{unit}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Strategic Telemetry (Feature 2 & 3) */}
                <div className="space-y-8 flex flex-col">
                    {/* ASWIG Core Analytics */}
                    <div className="glass-panel-heavy p-8 border-t-2 border-red-600 relative overflow-hidden flex-1">
                        <div className="radar-sweep opacity-5" />
                        <div className="flex items-center gap-3 mb-8">
                            <Brain size={18} className="text-red-600" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Strategic_Reasoning_Core</h3>
                        </div>
                        
                        <div className="space-y-8">
                            <MetricBlock label="Strategic_Threat_Score" value={stats?.aswig_status?.strategic_intelligence?.strategic_threat_score || "0.42"} color="text-red-600" />
                            <MetricBlock label="Global_Cascade_Index" value={stats?.aswig_status?.strategic_intelligence?.cascade_probability || "0.12"} color="text-orange-500" />
                            
                            <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-sm">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-2 italic flex items-center gap-2">
                                    <Terminal size={12} /> AI_Tactical_Recommendation
                                </p>
                                <p className="text-[10px] text-gray-300 italic leading-relaxed">
                                    {stats?.aswig_status?.strategic_intelligence?.recommendation_matrix || "MONITORING_GRID_SYNC_ACTIVE"}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mesh_Infrastructure_Health</p>
                                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm">
                                    <div className="flex items-center gap-3">
                                        <Database size={14} className="text-red-600" />
                                        <span className="text-[10px] font-black text-white">Self_Healing: ACTIVE</span>
                                    </div>
                                    <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            animate={{ width: ["0%", "100%", "0%"] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="h-full bg-red-600" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Threat DNA Summary (Feature 5) */}
                    <div className="glass-panel p-6 border-l-2 border-red-950 h-32 flex flex-col justify-between">
                         <div className="flex justify-between items-center">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                                <DnaIcon size={12} className="text-red-600" /> Behavioral_Threat_DNA
                            </p>
                            <span className="text-[8px] font-black text-red-600/60 uppercase">NODE_SYNC: 100%</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{stats?.aswig_status?.threat_dna?.dna_id || "SCANNING..."}</p>
                            <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="w-1/2 h-full bg-red-600/40" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Global HUD Overlay Utilities */}
            <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-10">
                    <HudStat label="Grid_Sync" value="SYNCHRONIZED" color="text-green-500" />
                    <HudStat label="Federation_Latency" value="14ms" color="text-white" />
                    <HudStat label="Active_Edge_Nodes" value={stats?.network?.active_nodes || "0"} color="text-red-600" />
                </div>
                <div className="flex items-center gap-6">
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">ASWIG_STRATEGIC_OS_v4.2.5_STABLE</p>
                    <button className="px-6 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-red-600 transition-all">
                        Execute_Strategic_Shift
                    </button>
                </div>
            </div>
        </div>
    );
}

function MetricBlock({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
            <p className={`text-4xl font-black ${color} italic tracking-tighter uppercase`}>{value}</p>
        </div>
    );
}

function HudStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
            <p className={`text-[10px] font-black ${color} uppercase tracking-tighter`}>{value}</p>
        </div>
    );
}

function DnaIcon(props: any) {
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
            <path d="m8 8-4 4 4 4" />
            <path d="m16 8 4 4-4 4" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
    )
}
