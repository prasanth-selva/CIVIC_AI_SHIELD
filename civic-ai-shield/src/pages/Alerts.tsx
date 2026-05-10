import { motion, AnimatePresence } from "framer-motion";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AlertTriangle, Clock, MapPin, ChevronRight, FileText, ShieldAlert, Crosshair, UserCheck, CheckCircle2, MoreVertical, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";

type AlertStatus = "DETECTED" | "UNDER REVIEW" | "DISPATCHED" | "CONTAINED" | "RESOLVED";

const alertStatusConfig: Record<AlertStatus, { color: string; label: string }> = {
  DETECTED: { color: "text-red-500", label: "DETECTED" },
  "UNDER REVIEW": { color: "text-orange-500", label: "UNDER REVIEW" },
  DISPATCHED: { color: "text-blue-500", label: "DISPATCHED" },
  CONTAINED: { color: "text-purple-500", label: "CONTAINED" },
  RESOLVED: { color: "text-green-500", label: "RESOLVED" },
};

export default function Alerts() {
  const { token } = useAuth();
  const [filter, setFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, fetch from API. Mocking for now but with the new status system.
    setAlerts([
      { id: "A-9421", type: "Intrusion Detected", location: "Sector Alpha / Gate 4", time: "2024-05-10 21:30:15", severity: "high", status: "DETECTED", confidence: 0.98 },
      { id: "A-9418", type: "Loitering Pattern", location: "Transit Hub", time: "2024-05-10 20:15:00", severity: "medium", status: "UNDER REVIEW", confidence: 0.82 },
      { id: "A-9390", type: "Abandoned Object", location: "Main Plaza", time: "2024-05-10 19:45:10", severity: "low", status: "RESOLVED", confidence: 0.95 },
      { id: "A-9382", type: "Violence Escalation", location: "Parking Level 2", time: "2024-05-10 18:20:00", severity: "high", status: "DISPATCHED", confidence: 0.88 },
    ]);
  }, []);

  const downloadReport = async (alertId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Tactical_Incident_Report_${alertId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = (id: string, status: AlertStatus) => {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selectedAlert?.id === id) setSelectedAlert((prev: any) => ({ ...prev, status }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 font-inter pb-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-0.5 bg-red-600" />
             <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em]">Audit_Log_Archive</p>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Incident_Intelligence</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search_ID/Node..." 
                    className="bg-black/40 border border-white/10 rounded-sm pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all w-64"
                />
            </div>
            <button className="p-2 bg-white/5 border border-white/5 rounded-sm text-gray-500 hover:text-white transition-colors">
                <Filter size={16} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
                {alerts.map((alert) => (
                    <motion.div
                        layout
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedAlert(alert)}
                        className={`group relative cursor-pointer glass-panel p-6 border-l-2 transition-all duration-500 ${
                            selectedAlert?.id === alert.id ? 'border-red-600 bg-red-600/5' : 'border-red-950 hover:border-red-600'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-6">
                                <div className={`p-4 rounded-sm border ${
                                    alert.severity === 'high' ? 'bg-red-600/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/5 text-gray-500'
                                }`}>
                                    <ShieldAlert size={20} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-red-600 font-black italic">{alert.id}</span>
                                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${alertStatusConfig[alert.status as AlertStatus].color}`}>
                                            {alertStatusConfig[alert.status as AlertStatus].label}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{alert.type}</h3>
                                    <div className="flex items-center gap-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><MapPin size={12} /> {alert.location}</div>
                                        <div className="flex items-center gap-2"><Clock size={12} /> {alert.time}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Confidence</p>
                                <p className="text-xl font-black text-white italic tracking-tighter">{(alert.confidence * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Tactical Response Console */}
        <div className="sticky top-10">
            <AnimatePresence mode="wait">
                {selectedAlert ? (
                    <motion.div
                        key={selectedAlert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel-heavy p-8 border-t-2 border-red-600 relative overflow-hidden"
                    >
                        <div className="radar-sweep opacity-5" />
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-1">Strategic_Incident_Review</p>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{selectedAlert.id} // RESPONSE</h2>
                            </div>
                            <button onClick={() => setSelectedAlert(null)} className="text-gray-600 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Severity_Rank</p>
                                    <SeverityBadge level={selectedAlert.severity} animated={selectedAlert.severity === 'high'} />
                                </div>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Current_Phase</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${alertStatusConfig[selectedAlert.status as AlertStatus].color}`}>
                                        {selectedAlert.status}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Workflow_Action_Chain</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {(["UNDER REVIEW", "DISPATCHED", "CONTAINED", "RESOLVED"] as AlertStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(selectedAlert.id, status)}
                                            className={`w-full p-4 flex items-center justify-between border rounded-sm transition-all ${
                                                selectedAlert.status === status 
                                                ? 'bg-red-600 text-white border-red-500' 
                                                : 'bg-black/40 border-white/10 text-gray-500 hover:border-red-600/50 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Evidentiary_Data</p>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => downloadReport(selectedAlert.id)}
                                        disabled={isGenerating}
                                        className="flex-1 p-4 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center gap-2 group hover:border-red-600 transition-all disabled:opacity-50"
                                    >
                                        <FileText size={18} className={isGenerating ? "animate-spin text-red-600" : "text-red-600"} />
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Tactical_PDF</span>
                                    </button>
                                    <button className="flex-1 p-4 bg-white/5 border border-white/5 rounded-sm flex flex-col items-center gap-2 group hover:border-red-600 transition-all">
                                        <Crosshair size={18} className="text-red-600" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Node_Focus</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-4 border-l-2 border-red-600 bg-red-600/5">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                                <UserCheck size={12} /> Strategic_Operator_Notes
                            </p>
                            <textarea 
                                placeholder="Enter operational notes for incident audit..."
                                className="w-full bg-transparent border-none text-[10px] text-gray-400 placeholder-gray-700 outline-none resize-none h-20"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel-heavy p-12 border-red-950 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <ShieldAlert size={48} className="text-red-950" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-gray-600 uppercase tracking-tighter italic">Selection_Required</h3>
                            <p className="text-[10px] text-gray-700 uppercase font-black leading-relaxed">
                                Select an active incident from the strategic log to initialize tactical response console.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
