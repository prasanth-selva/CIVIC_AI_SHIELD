import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Activity, AlertTriangle, Zap, ShieldCheck, Radio } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function TacticalIdentity() {
  const { user } = useAuth();
  if (!user) return null;

  const roleConfigs: Record<string, { color: string; border: string; bg: string; shadow: string; module: string }> = {
    COMMANDER: { 
      color: "text-red-600", 
      border: "border-red-600", 
      bg: "bg-red-600",
      shadow: "shadow-[0_0_20px_rgba(255,0,0,0.5)]",
      module: "STRATEGIC_WARFARE_CONTROL"
    },
    STRATEGIC_OPS: { 
      color: "text-orange-500", 
      border: "border-orange-500", 
      bg: "bg-orange-500",
      shadow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]",
      module: "LOGISTICS_ORCHESTRATION"
    },
    FIELD_CONTROL: { 
      color: "text-blue-500", 
      border: "border-blue-500", 
      bg: "bg-blue-500",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
      module: "TACTICAL_UNIT_DEPLOYMENT"
    },
    ANALYST: { 
      color: "text-emerald-500", 
      border: "border-emerald-500", 
      bg: "bg-emerald-500",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]",
      module: "FORENSIC_PATTERN_GHOST"
    },
    OBSERVER: { 
      color: "text-gray-400", 
      border: "border-gray-400", 
      bg: "bg-gray-400",
      shadow: "shadow-[0_0_20px_rgba(156,163,175,0.5)]",
      module: "PASSIVE_RECON_STREAM"
    },
  };

  const config = roleConfigs[user.role] || roleConfigs.OBSERVER;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`tactical-glass-panel p-6 border-r-2 ${config.border} relative overflow-hidden group`}
    >
      <div className={`absolute inset-0 opacity-10 pointer-events-none`} style={{ background: `linear-gradient(135deg, ${config.bg.replace('bg-', '')}, transparent)` }} />
      
      {/* Holographic Identity Card */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-24 h-24 border-2 rounded-lg flex items-center justify-center bg-black/60 relative overflow-hidden ${config.border} ${config.shadow}`}>
               <User className={config.color} size={48} />
               <motion.div 
                 animate={{ y: [-48, 48] }} 
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className={`absolute inset-0 w-full h-[1px] opacity-40 shadow-[0_0_15px_rgba(255,255,255,1)] ${config.bg}`}
               />
            </div>
            <div className={`absolute -bottom-3 -right-3 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-black ${config.bg}`}>
              CL_{user.profile.clearance}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{user.full_name}</h3>
            <p className={`text-[12px] font-black tracking-[0.4em] uppercase ${config.color}`}>{user.role}</p>
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full animate-pulse ${config.bg}`} />
               <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">CALLSIGN: {user.profile.callsign}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 bg-black/60 border border-white/5 rounded-sm space-y-2 relative overflow-hidden group-hover:border-white/10 transition-colors">
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Operational_Efficiency</p>
              <div className="flex items-center justify-between">
                 <span className="text-xl font-black text-white">{user.profile.efficiency}%</span>
                 <Activity size={16} className={config.color} />
              </div>
              <div className="h-0.5 bg-white/5 w-full mt-2">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${user.profile.efficiency}%` }} className={`h-full ${config.bg}`} />
              </div>
           </div>
           <div className="p-4 bg-black/60 border border-white/5 rounded-sm space-y-2 relative overflow-hidden group-hover:border-white/10 transition-colors">
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Global_Threat_Index</p>
              <div className="flex items-center justify-between">
                 <span className="text-xl font-black text-white">{user.profile.threatScore}</span>
                 <AlertTriangle size={16} className="text-orange-500" />
              </div>
              <div className="h-0.5 bg-white/5 w-full mt-2">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${user.profile.threatScore}%` }} className="h-full bg-orange-500" />
              </div>
           </div>
        </div>

        <div className={`p-4 border border-dashed ${config.border} opacity-80 bg-black/40`}>
           <div className="flex items-center gap-3 mb-2">
              <Zap size={14} className={config.color} />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">ACTIVE_CAPABILITY: {config.module}</p>
           </div>
           <p className="text-[8px] font-mono text-gray-500 uppercase leading-relaxed italic">
              Authorization level {user.profile.clearance} grants access to tactical {config.module.toLowerCase()} interfaces and autonomous sensor federations.
           </p>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-500 italic">Neural_Link_Status</span>
              <span className={`${config.color} animate-pulse`}>{user.profile.neuralLinkStatus}</span>
           </div>
           <div className="h-1 bg-white/5 w-full overflow-hidden rounded-full">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "94%" }} 
                className={`h-full ${config.bg} ${config.shadow}`} 
              />
           </div>
        </div>

        <div className="pt-6 border-t border-white/5">
           <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.2em] mb-4">OPERATIONAL_HISTORY_LOG</p>
           <div className="space-y-3">
              {user.profile.opsHistory.map((op: string) => (
                <div key={op} className="flex items-center gap-4 group/item">
                   <div className={`w-1.5 h-1.5 rounded-full ${config.bg} opacity-20 group-hover/item:opacity-100 transition-opacity`} />
                   <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest group-hover/item:text-white transition-colors">{op} // COMPLETED</span>
                   <ShieldCheck size={10} className="text-emerald-500 ml-auto opacity-40" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Decorative HUD Corner */}
      <div className={`absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 opacity-20 pointer-events-none ${config.border}`} />
    </motion.div>
  );
}

export function SecuritySentinel() {
  const [trustScore, setTrustScore] = useState(98.4);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTrustScore(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tactical-glass-panel p-6 border-l-2 border-orange-500 relative overflow-hidden group">
       <div className="radar-sweep opacity-10" />
       <div className="flex items-center gap-5 mb-10">
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-sm">
             <ShieldCheck className="text-orange-500" size={24} />
          </div>
          <div>
             <h3 className="text-[12px] font-black text-orange-500 uppercase tracking-[0.4em] italic">AI_SECURITY_SENTINEL</h3>
             <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mt-1">Autonomous_Behavioral_Monitoring_v4.2</p>
          </div>
       </div>

       <div className="space-y-8">
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Operator_Trust_Score</span>
                <span className="text-2xl font-black text-emerald-500 italic tracking-tighter">{trustScore}%</span>
             </div>
             <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                <motion.div animate={{ width: `${trustScore}%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Anomaly_Index</p>
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-1 bg-white/5">
                      <motion.div animate={{ width: "4%" }} className="h-full bg-emerald-500" />
                   </div>
                   <span className="text-[10px] font-mono text-emerald-500">LOW</span>
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Sensitivity</p>
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-1 bg-white/5">
                      <motion.div animate={{ width: "85%" }} className="h-full bg-orange-500" />
                   </div>
                   <span className="text-[10px] font-mono text-orange-500">HIGH</span>
                </div>
             </div>
          </div>

          <div className="p-4 bg-black/60 border border-orange-500/10 flex items-center gap-5 relative group/terminal">
             <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover/terminal:opacity-100 transition-opacity" />
             <Radio className="text-orange-500 animate-pulse" size={18} />
             <div className="flex flex-col">
                <p className="text-[10px] font-mono text-orange-500 uppercase tracking-widest italic leading-tight">Monitoring_Interaction_Vectors...</p>
                <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest mt-1">SENTINEL_SCAN: OMEGA_RECON_ACTIVE</p>
             </div>
          </div>
       </div>

       {/* Neural Anomaly Visualization */}
       <div className="mt-10 h-24 flex items-end gap-1 px-2">
          {Array.from({ length: 40 }).map((_, i) => (
             <motion.div
               key={i}
               animate={{ height: [10, Math.random() * 40 + 10, 10] }}
               transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
               className="flex-1 bg-orange-500/20"
             />
          ))}
       </div>
    </div>
  );
}
