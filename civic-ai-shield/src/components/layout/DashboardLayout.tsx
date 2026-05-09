import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { AlertNotificationPopup } from "../ui/AlertNotificationPopup";
import { VoiceAssistant } from "../ui/VoiceAssistant";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
  setPage,
  role,
}: {
  children: React.ReactNode;
  setPage: (p: string) => void;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
}) {
  return (
    <div className="relative min-h-screen text-white bg-command-center overflow-hidden font-inter">
      {/* Global Cinematic Overlays */}
      <div className="ambient-red-glow" />
      <div className="scanline-overlay" />
      <div className="film-grain" />
      
      <div className="grid grid-cols-[280px_1fr] grid-rows-[80px_1fr_60px] min-h-screen relative z-10">
        <TopNav role={role} />
        <Sidebar setPage={setPage} role={role} />
        
        <main className="row-start-2 col-start-2 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>

      {/* Advanced UI Elements */}
      <AlertNotificationPopup />
      <VoiceAssistant onCommand={setPage} />
      
      {/* Background Radar Overlay (Subtle) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none">
        <div className="radar-sweep" />
      </div>
    </div>
  );
}

