import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { SeverityBadge } from "./SeverityBadge";

export interface AlertData {
    id: string | number;
    threat: string;
    location: string;
    severity: "high" | "medium" | "low" | "safe";
    time: string;
}

export function AlertNotificationPopup() {
    const [alerts, setAlerts] = useState<AlertData[]>([]);

    // Simulation of incoming alerts
    useEffect(() => {
        const interval = setInterval(() => {
            // 10% chance to trigger an alert every 10 seconds for demo
            if (Math.random() < 0.1) {
                const newAlert: AlertData = {
                    id: Date.now(),
                    threat: ["Fight Detected", "Fall Detected", "Accident Detected"][Math.floor(Math.random() * 3)],
                    location: ["Area 01", "Main Gate", "Parking Lot"][Math.floor(Math.random() * 3)],
                    severity: Math.random() > 0.5 ? "high" : "medium",
                    time: new Date().toLocaleTimeString(),
                };
                addAlert(newAlert);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const addAlert = (alert: AlertData) => {
        setAlerts((prev) => [...prev, alert]);
        // Auto dismiss after 10 seconds
        setTimeout(() => {
            removeAlert(alert.id);
        }, 10000);
    };

    const removeAlert = (id: string | number) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="pointer-events-auto w-96 bg-gray-900/90 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className={`h-1 w-full ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`} />
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{alert.threat}</h4>
                                        <p className="text-xs text-gray-400">{alert.location}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeAlert(alert.id)} className="text-gray-500 hover:text-white transition">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SeverityBadge level={alert.severity} />
                                    <span className="text-xs text-gray-500 font-mono">{alert.time}</span>
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition">
                                    <Play size={12} fill="currentColor" />
                                    View Live
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
