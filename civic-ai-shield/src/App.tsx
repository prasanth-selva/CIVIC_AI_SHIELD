import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import LiveDetection from "./pages/LiveDetection";
import VideoAnalysis from "./pages/VideoAnalysis";
import Alerts from "./pages/Alerts";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SubjectTracking from "./pages/SubjectTracking";
import { useAuth } from "./context/AuthContext";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("CRITICAL_OS_FAILURE:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-20 bg-black text-red-600 font-mono">SYSTEM_HALTED: CRITICAL_UI_EXCEPTION</div>;
    return this.props.children;
  }
}

import React from "react";

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard");

  console.log("APP_INIT: User:", !!user, "Loading:", loading);

  const allowedPages = useMemo(() => {
    if (!user) return ["dashboard"];
    if (user.role === "ADMIN") return ["dashboard", "live", "tracking", "analysis", "alerts", "health", "settings"];
    if (user.role === "OPERATOR") return ["dashboard", "live", "tracking"];
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
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-red-600/40 border-t-red-600 animate-spin" />
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Initializing_ASWIG_Core...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <DashboardLayout setPage={setPage} role={user.role}>
        {{
          dashboard: <Dashboard />,
          live: <LiveDetection />,
          tracking: <SubjectTracking />,
          analysis: <VideoAnalysis />,
          alerts: <Alerts />,
          health: <SystemHealth />,
          settings: <Settings />,
        }[page]}
      </DashboardLayout>
    </ErrorBoundary>
  );
}
