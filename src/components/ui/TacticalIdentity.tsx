import { motion, AnimatePresence } from "framer-motion";
import { Shield, Target, User, ShieldCheck, Activity, Zap, Radio, Globe, Lock, Cpu, Brain, Dna, MapPin, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function TacticalIdentity() {
  const { user } = useAuth();
  if (!user) return null;

  const roleColors: Record<string, string> = {
    COMMANDER: "text-red-600 border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]",
    STRATEGIC_OPS: "text-orange-500 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]",
    FIELD_CONTROL: "text-blue-500 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    ANALYST: "text-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]",
    OBSERVER: "text-gray-400 border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.5)]",
  };

  const currentColor = roleColors[user.role] || roleColors.OBSERVER;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="tactical-glass-panel p-6 border-r-2 border-red-600 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
      
      {/* Holographic Identity Card */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-20 h-20 border-2 rounded-lg flex items-center justify-center bg-black/60 relative overflow-hidden ${currentColor.split(' ')[1]}`}>
               <User className={currentColor.split(' ')[0]} size={40} />
               <motion.div 
                 animate={{ y: [-40, 40] }} 
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="absolute inset-0 w-full h-[1px] bg-red-600/40 shadow-[0_0_10px_rgba(255,0,0,1)]"
               />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter">
              RANK_{user.profile.clearance}
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{user.full_name}</h3>
            <p className={`text-[10px] font-black tracking-[0.4em] uppercase ${currentColor.split(' ')[0]}`}>{user.role}</p>
            <div className="flex items-center gap-2">
               <MapPin size={10} className="text-gray-600" />
               <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">CALLSIGN: {user.profile.callsign}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-3 bg-black/40 border border-white/5 rounded-sm space-y-1">
              <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Efficiency</p>
              <div className="flex items-center justify-between">
                 <span className="text-sm font-black text-white">{user.profile.efficiency}%</span>
                 <Activity size={12} className="text-red-600" />
              </div>
           </div>
           <div className="p-3 bg-black/40 border border-white/5 rounded-sm space-y-1">
              <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Threat_Score</p>
              <div className="flex items-center justify-between">
                 <span className="text-sm font-black text-white">{user.profile.threatScore}</span>
                 <AlertTriangle size={12} className="text-orange-500" />
              </div>
           </div>
        </div>

        <div className="space-y-3">
           <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
              <span className="text-gray-500">Neural_Link_Status</span>
              <span className="text-red-600 animate-pulse">{user.profile.neuralLinkStatus}</span>
           </div>
           <div className="h-1 bg-red-950/30 w-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "100%" }} 
                className="h-full bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]" 
              />
           </div>
        </div>

        <div className="pt-4 border-t border-white/5">
           <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-3">Operational_History</p>
           <div className="space-y-2">
              {user.profile.opsHistory.map(op => (
                <div key={op} className="flex items-center gap-3">
                   <Shield size={10} className="text-red-900" />
                   <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{op} // COMPLETED</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Decorative HUD Corner */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-red-600/20 pointer-events-none" />
    </motion.div>
  );
}

export function SecuritySentinel() {
  return (
    <div className="tactical-glass-panel p-6 border-l-2 border-orange-500 relative overflow-hidden group">
       <div className="radar-sweep opacity-10" />
       <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-orange-500/10 border border-orange-500/30">
             <ShieldCheck className="text-orange-500" size={18} />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">AI_Security_Sentinel</h3>
             <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Autonomous_Behavioral_Monitoring</p>
          </div>
       </div>

       <div className="space-y-6">
          <div className="flex flex-col gap-2">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Credential_Compromise_Risk</span>
                <span className="text-emerald-500">LOW (0.004%)</span>
             </div>
             <div className="h-1 bg-white/5 w-full">
                <motion.div animate={{ width: "4%" }} className="h-full bg-emerald-500" />
             </div>
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Anomaly_Detection_Sensitivity</span>
                <span className="text-orange-500">HIGH</span>
             </div>
             <div className="h-1 bg-white/5 w-full">
                <motion.div animate={{ width: "85%" }} className="h-full bg-orange-500" />
             </div>
          </div>

          <div className="p-4 bg-black/60 border border-orange-500/10 flex items-center gap-4">
             <Radio className="text-orange-500 animate-pulse" size={14} />
             <p className="text-[9px] font-mono text-orange-500/60 uppercase tracking-widest italic">Monitoring_User_Input_Vectors...</p>
          </div>
       </div>
    </div>
  );
}
