import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { AlertNotificationPopup } from "../ui/AlertNotificationPopup";
import { VoiceAssistant } from "../ui/VoiceAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "../../context/AuthContext";

export default function DashboardLayout({
  children,
  setPage,
  role,
}: {
  children: React.ReactNode;
  setPage: (p: string) => void;
  role: Role;
}) {
  return (
    <div className="relative min-h-screen text-white bg-[#020202] overflow-hidden font-inter selection:bg-red-600/30">
      {/* Feature 8: Global Immersive Tactical Layers */}
      <div className="ambient-red-glow" />
      <div className="scanline-overlay" />
      <div className="hud-noise" />
      
      {/* Global Alert Pulse Effect */}
      <motion.div 
        animate={{ opacity: [0, 0.15, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="fixed inset-0 bg-red-600 pointer-events-none z-[999] mix-blend-overlay"
      />
      
      <div className="grid grid-cols-[280px_1fr] grid-rows-[80px_1fr_60px] min-h-screen relative z-10">
        <TopNav role={role} />
        <Sidebar setPage={setPage} role={role} />
        
        <main className="row-start-2 col-start-2 p-8 overflow-y-auto custom-scrollbar relative">
          {/* Subtle background element */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>

      {/* Advanced AI Interactive Elements */}
      <AlertNotificationPopup />
      <VoiceAssistant onCommand={setPage} />
      
      {/* HUD Scanner Element */}
      <div className="fixed bottom-10 right-10 w-64 h-64 opacity-10 pointer-events-none z-[1001]">
        <div className="radar-sweep" />
        <div className="absolute inset-0 border border-red-600/20 rounded-full" />
        <div className="absolute inset-4 border border-red-600/10 rounded-full" />
      </div>
    </div>
  );
}
