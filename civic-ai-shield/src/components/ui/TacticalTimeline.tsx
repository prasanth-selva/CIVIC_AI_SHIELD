import { motion, AnimatePresence } from "framer-motion";
import { Clock, Camera, AlertTriangle, UserCheck, Shield, Target, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import { useAuth } from "../../context/AuthContext";

export function TacticalTimeline() {
    const { token } = useAuth();
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        async function fetchTimeline() {
            try {
                const response = await fetch(`${API_BASE}/api/system/timeline`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data.events);
                }
            } catch (err) {
                console.error("Timeline fetch failed:", err);
            }
        }
        const interval = setInterval(fetchTimeline, 5000);
        fetchTimeline();
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="glass-panel-heavy p-8 border-l-2 border-red-950 relative overflow-hidden font-inter flex flex-col h-full">
            <div className="radar-sweep opacity-5" />
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Clock size={18} className="text-red-600" />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Strategic_Event_Timeline</h2>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                    Live_Stream_0xFA
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
                <AnimatePresence initial={false}>
                    {events.map((event, idx) => (
                        <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative pl-8 pb-6 border-l border-white/10 group"
                        >
                            {/* Connector Circle */}
                            <div className={`absolute top-0 left-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-black z-10 transition-all ${
                                event.type === 'ALERT' ? 'bg-red-600 border-red-400' : 'bg-gray-800 border-white/20'
                            }`} />

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-red-600 font-black italic">
                                        {new Date(event.timestamp * 1000).toLocaleTimeString()}
                                    </span>
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">{event.camera_id}</span>
                                </div>
                                
                                <div className="p-4 bg-white/5 border border-white/5 rounded-sm group-hover:border-red-600 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        {event.type === 'ALERT' ? <AlertTriangle size={14} className="text-red-600" /> : <Activity size={14} className="text-gray-500" />}
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{event.type}</p>
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic leading-relaxed">
                                        {event.type === 'ALERT' ? 
                                            `Critical threat detected: ${event.data.threat_type}. Confidence: ${(event.data.confidence * 100).toFixed(1)}%` : 
                                            `Neural node processed detection cluster. ${event.data.count} entities identified.`
                                        }
                                    </p>
                                    
                                    {event.data.labels && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {event.data.labels.map((l: string, i: number) => (
                                                <span key={i} className="px-2 py-0.5 bg-red-950/20 text-[8px] font-black text-red-500 uppercase italic border border-red-900/30">
                                                    {l}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Global_Timeline_Buffer: {events.length} Events</p>
                <button className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:text-white transition-colors italic">Clear_Audit_Log</button>
            </div>
        </div>
    );
}
