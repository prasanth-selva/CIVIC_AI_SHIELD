import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import LiveDetection from "./pages/LiveDetection";
import VideoAnalysis from "./pages/VideoAnalysis";
import Alerts from "./pages/Alerts";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard");

  const allowedPages = useMemo(() => {
    if (!user) return ["dashboard"];
    if (user.role === "ADMIN") return ["dashboard", "live", "analysis", "alerts", "health", "settings"];
    if (user.role === "OPERATOR") return ["dashboard", "live"];
    return ["dashboard"];
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!allowedPages.includes(page)) {
      setPage("dashboard");
    }
  }, [allowedPages, page, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#050812] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 animate-spin" />
          <p className="text-sm text-gray-400">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <DashboardLayout setPage={setPage} role={user.role}>
      {{
        dashboard: <Dashboard />,
        live: <LiveDetection />,
        analysis: <VideoAnalysis />,
        alerts: <Alerts />,
        health: <SystemHealth />,
        settings: <Settings />,
      }[page]}
    </DashboardLayout>
  );
}
