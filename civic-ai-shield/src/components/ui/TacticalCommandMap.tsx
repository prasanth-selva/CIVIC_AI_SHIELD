import { motion } from "framer-motion";
import { MapPin, Target, Crosshair, AlertTriangle, Shield, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface Node {
    id: string;
    x: number;
    y: number;
    status: "active" | "alert" | "idle";
    label: string;
}

export function TacticalCommandMap() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "cam-001", x: 200, y: 150, status: "alert", label: "Sector A / North Gate" },
        { id: "cam-002", x: 600, y: 100, status: "active", label: "Transit Hub / P3" },
        { id: "cam-003", x: 450, y: 350, status: "idle", label: "Harbor Pier 7" },
        { id: "cam-004", x: 150, y: 400, status: "active", label: "Main Plaza" },
        { id: "cam-005", x: 700, y: 450, status: "active", label: "Sector D / South" },
    ]);

    return (
        <div className="glass-panel-heavy border-red-600/30 overflow-hidden relative flex flex-col h-full font-inter">
            <div className="radar-sweep opacity-5" />
            
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                    <Shield size={18} className="text-red-600" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Digital_Twin_Strategic_Map</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full glow-red animate-pulse" />
                        <span className="text-[8px] font-black text-red-600 uppercase">Live_Sync</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-[#050505] relative overflow-hidden p-10">
                {/* Map Grid Layer */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ef444415_1px,transparent_1px),linear-gradient(to_bottom,#ef444415_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Tactical SVG Map */}
                <svg viewBox="0 0 800 500" className="w-full h-full relative z-10 opacity-30">
                    <path d="M50 50 L750 50 L750 450 L50 450 Z" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="5 5" />
                    <path d="M200 50 L200 450 M400 50 L400 450 M600 50 L600 450" stroke="#ef4444" strokeWidth="0.5" />
                    <path d="M50 150 L750 150 M50 300 L750 300" stroke="#ef4444" strokeWidth="0.5" />
                    
                    {/* Simulated Buildings */}
                    <rect x="100" y="80" width="120" height="80" fill="none" stroke="#ef4444" strokeWidth="1" />
                    <rect x="580" y="60" width="140" height="100" fill="none" stroke="#ef4444" strokeWidth="1" />
                    <rect x="350" y="320" width="180" height="100" fill="none" stroke="#ef4444" strokeWidth="1" />
                    <circle cx="150" cy="400" r="40" fill="none" stroke="#ef4444" strokeWidth="1" />
                </svg>

                {/* Nodes Layer */}
                {nodes.map((node) => (
                    <motion.div 
                        key={node.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute cursor-pointer group z-20"
                        style={{ left: `${(node.x / 800) * 100}%`, top: `${(node.y / 500) * 100}%` }}
                    >
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                            {/* Threat Pulse */}
                            {node.status === 'alert' && (
                                <motion.div 
                                    animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-red-600 rounded-full blur-xl"
                                />
                            )}
                            
                            {/* Node Icon */}
                            <div className={`p-2 rounded-sm border transition-all duration-300 ${
                                node.status === 'alert' ? 'bg-red-600 text-white border-red-400 glow-red' : 
                                node.status === 'active' ? 'bg-black/60 text-red-600 border-red-600/30' : 
                                'bg-black/60 text-gray-700 border-white/5'
                            } group-hover:scale-110 group-hover:border-red-600`}>
                                {node.status === 'alert' ? <AlertTriangle size={14} /> : <Target size={14} />}
                            </div>

                            {/* Label */}
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[8px] font-black text-white uppercase tracking-widest bg-black/80 px-2 py-1 border border-white/10 rounded-sm">
                                    {node.id}: {node.label}
                                </p>
                            </div>

                            {/* Coordinate Lines */}
                            <div className="absolute top-1/2 left-0 w-4 h-px bg-red-600/20 -translate-x-full" />
                            <div className="absolute left-1/2 top-0 h-4 w-px bg-red-600/20 -translate-y-full" />
                        </div>
                    </motion.div>
                ))}

                {/* Animated Scanner Bar */}
                <motion.div 
                    animate={{ y: [0, 500, 0] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent z-10"
                />
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center text-[8px] font-black text-gray-600 uppercase tracking-widest">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> ALERT_NODE</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600/30 rounded-full" /> PASSIVE_NODE</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-800 rounded-full" /> OFFLINE</div>
                </div>
                <p>Projection: MIL-STD-810G // Scale 1:250</p>
            </div>
        </div>
    );
}
