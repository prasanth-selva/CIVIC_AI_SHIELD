import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Terminal, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await login(email.trim(), password, remember);
    if (!result.ok) {
      setError(result.error);
    }

    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-6 font-inter overflow-hidden">
      {/* Global Cinematic Overlays */}
      <div className="ambient-red-glow" />
      <div className="scanline-overlay" />
      <div className="film-grain" />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="radar-sweep" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md tilt-card glass-panel-heavy p-10 border-l-4 border-red-600 relative z-10 shadow-[0_0_100px_rgba(255,0,0,0.1)]"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-sm bg-red-950/40 border border-red-500/30 flex items-center justify-center glow-red">
            <Shield className="text-red-500" size={28} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-black mb-1">Secure Terminal Access</p>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">CIVIC_AI_SHIELD</h1>
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-red-500/70">
            <Terminal size={14} />
            <p className="text-[10px] font-mono tracking-widest uppercase">Kernel Protocol: V4.2.0-STABLE</p>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enter operational credentials to initialize the command console.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Operator ID</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ID_IDENTIFIER"
                  className="w-full bg-black/60 border border-white/5 rounded-sm px-4 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-red-600/50 transition-all font-mono"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  <Activity size={14} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Access Cipher</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="w-full bg-black/60 border border-white/5 rounded-sm px-4 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-red-600/50 transition-all font-mono"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={14} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="accent-red-600"
              />
              Stay Initialized
            </label>
            <span className="text-red-600 cursor-pointer hover:text-red-400 transition-colors">Emergency Reset</span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border-l-2 border-red-500 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-3"
            >
              Access Denied: {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            className="w-full btn-cinematic disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                />
                Authenticating...
              </span>
            ) : "Initialize Access"}
          </motion.button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-[9px] text-gray-700 font-mono space-y-2 uppercase tracking-widest">
          <p className="text-red-900/50 font-black">Authorized Personnel Only</p>
          <div className="grid grid-cols-2 gap-4">
             <p>Admin: admin@civic.ai</p>
             <p>Pass: Admin123</p>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-10 text-[9px] font-mono text-white/20 uppercase tracking-[0.5em] pointer-events-none">
        CAIS_SECURE_KERNEL_NODE_IDENTIFIED
      </div>
    </div>
  );
}
