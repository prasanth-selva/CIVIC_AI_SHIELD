import { useState } from "react";
import Landing from "./pages/Landing";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import LiveDetection from "./pages/LiveDetection";
import VideoAnalysis from "./pages/VideoAnalysis";
import Alerts from "./pages/Alerts";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";

export default function App() {
  const [page, setPage] = useState("landing");

  if (page === "landing") {
    return <Landing onEnter={() => setPage("dashboard")} />;
  }

  return (
    <DashboardLayout setPage={setPage}>
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
