import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { AlertNotificationPopup } from "../ui/AlertNotificationPopup";
import { motion } from "framer-motion";

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
    <div className="grid grid-cols-[260px_1fr] grid-rows-[70px_1fr_50px] min-h-screen text-white bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#050812] overflow-hidden">
      <TopNav role={role} />
      <Sidebar setPage={setPage} role={role} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="row-start-2 col-start-2 p-8 overflow-y-auto"
      >
        {children}
      </motion.main>
      <Footer />
      <AlertNotificationPopup />
    </div>
  );
}
