import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, AlertCircle, ShieldAlert, Crosshair, Zap, ChevronRight, Activity, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "../../config";
import { useAuth } from "../../context/AuthContext";

export function IntelligenceEscalationPanel() {
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchIntel() {
            try {
                const response = await fetch(`${API_BASE}/api/system/intelligence`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const d = await response.json();
                    setData(d);
                }
            } catch (err) {
                console.error("Intel fetch failed:", err);
            }
        }
        const interval = setInterval(fetchIntel, 3000);
        fetchIntel();
        return () => clearInterval(interval);
    }, [token]);

    const activeIntel = data?.autonomous_status ? Object.entries(data.autonomous_status)[0] : null;
    const intel: any = activeIntel ? activeIntel[1] : null;
    const camId = activeIntel ? activeIntel[0] : "NODE-SYSTEM";

    return (
        <div className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden font-inter flex flex-col h-full">
            <div className="radar-sweep opacity-5" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Brain size={18} className="text-red-600" />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Autonomous_Intel_Core</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest italic animate-pulse">
                    AI_Thinking...
                </div>
            </div>

            <div className="flex-1 space-y-8">
                {/* Threat Escalation Meter (Feature 1) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Escalation_Risk_Matrix</p>
                        <p className={`text-xl font-black italic tracking-tighter ${intel?.escalation > 0.6 ? 'text-red-500' : 'text-orange-500'}`}>
                            {intel ? (intel.escalation * 100).toFixed(1) : "0.0"}%
                        </p>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${intel ? intel.escalation * 100 : 0}%` }}
                            className={`h-full ${intel?.escalation > 0.6 ? 'bg-red-600' : 'bg-orange-500'}`}
                        />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                        <span>Stable</span>
                        <span>Evolving</span>
                        <span className="text-red-600">Critical_Threshold</span>
                    </div>
                </div>

                {/* AI Reasoning (Feature 2) */}
                <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-sm relative">
                    <div className="absolute top-2 right-2 opacity-10"><Zap size={24} className="text-red-600" /></div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp size={10} /> Predictive_Incident_Reasoning
                    </p>
                    <p className="text-xs text-gray-300 italic leading-relaxed">
                        {intel?.recommendation?.reasoning || "Passive analysis active. System waiting for behavioral anomaly patterns."}
                    </p>
                </div>

                {/* Recommended Response (Feature 2) */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Autonomous_Recommendation</p>
                    <div className="flex flex-col gap-3">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-sm group hover:border-red-600 transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{intel?.recommendation?.priority || "NORMAL"}_PRIORITY</span>
                                <span className="text-[9px] font-mono text-gray-600 italic">Conf: {intel?.recommendation?.confidence ? (intel.recommendation.confidence * 100).toFixed(0) : "95"}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black text-white italic uppercase">{intel?.recommendation?.action || "CONTINUE NOMINAL MONITORING"}</p>
                                <ChevronRight size={16} className="text-red-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prediction Pulse */}
            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Predicted_Node</p>
                            <p className="text-[10px] font-black text-white italic">{camId}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Impact_Radius</p>
                            <p className="text-[10px] font-black text-white italic">14.2m</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:bg-red-500 transition-all">
                        <Crosshair size={12} /> Execute_Support
                    </button>
                </div>
            </div>
        </div>
    );
}
