import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Target, Crosshair, AlertTriangle, Shield, Info, Zap, MoveUpRight, Ghost, Scaling } from "lucide-react";
import { useState, useEffect } from "react";

interface Node {
    id: string;
    x: number;
    y: number;
    status: "active" | "alert" | "idle";
    label: string;
    threatLevel?: number;
}

export function TacticalCommandMap() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "cam-001", x: 200, y: 150, status: "alert", label: "Sector A / North Gate", threatLevel: 0.85 },
        { id: "cam-002", x: 600, y: 100, status: "active", label: "Transit Hub / P3", threatLevel: 0.4 },
        { id: "cam-003", x: 450, y: 350, status: "idle", label: "Harbor Pier 7", threatLevel: 0.1 },
        { id: "cam-004", x: 150, y: 400, status: "active", label: "Main Plaza", threatLevel: 0.6 },
        { id: "cam-005", x: 700, y: 450, status: "active", label: "Sector D / South", threatLevel: 0.3 },
    ]);

    const [selectedNode, setSelectedNode] = useState<string | null>("cam-001");
    const [dangerZones, setDangerZones] = useState([
        { x: 180, y: 140, r: 80, id: "DZ-1", risk: "CRITICAL" },
        { x: 550, y: 400, r: 60, id: "DZ-2", risk: "EVOLVING" },
    ]);

    return (
        <div className="glass-panel-heavy border-red-600/30 overflow-hidden relative flex flex-col h-full font-inter">
            <div className="radar-sweep opacity-5" />
            
            {/* Strategic Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600/10 border border-red-500/30 flex items-center justify-center">
                        <Shield size={16} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Digital_Twin_Strategic_Map</h3>
                        <p className="text-[8px] font-black text-red-600 uppercase tracking-widest">Projection: MIL-STD-810G // Active_War_Room</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active_Nodes</p>
                        <p className="text-[10px] font-mono text-white">05 / 12</p>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-sm">
                        <Zap size={14} className="text-red-600 animate-pulse" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">AI_Heat_Sync: Stable</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-[#020202] relative overflow-hidden">
                {/* Tactical Grid Layers */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ef444420_1px,transparent_1px),linear-gradient(to_bottom,#ef444420_1px,transparent_1px)] bg-[size:200px_200px]" />
                
                {/* Feature 5: AI-Generated Danger Zones */}
                {dangerZones.map((zone) => (
                    <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${(zone.x / 800) * 100}%`, top: `${(zone.y / 500) * 100}%` }}
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className={`rounded-full blur-3xl ${zone.risk === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}`}
                            style={{ width: zone.r * 2.5, height: zone.r * 2.5 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-[8px] font-black text-red-600/40 uppercase tracking-[0.4em] rotate-45">DANGER_ZONE</p>
                        </div>
                    </motion.div>
                ))}

                {/* Tactical SVG Architecture */}
                <svg viewBox="0 0 800 500" className="w-full h-full relative z-10 opacity-30 pointer-events-none">
                    <path d="M50 50 L750 50 L750 450 L50 450 Z" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="5 5" />
                    
                    {/* Simulated Corridors & Structural Lines */}
                    <path d="M200 50 L200 180 M200 320 L200 450" stroke="red" strokeWidth="0.5" />
                    <path d="M50 250 L300 250 M500 250 L750 250" stroke="red" strokeWidth="0.5" />
                    
                    {/* Feature 4: Subject Trajectory Projections (Simulation) */}
                    {selectedNode === 'cam-001' && (
                        <motion.path 
                            d="M200 150 L250 180 L280 140"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </svg>

                {/* Node Points */}
                {nodes.map((node) => (
                    <motion.div 
                        key={node.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute cursor-pointer group z-20"
                        style={{ left: `${(node.x / 800) * 100}%`, top: `${(node.y / 500) * 100}%` }}
                        onClick={() => setSelectedNode(node.id)}
                    >
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                            {/* Threat Pulse */}
                            {node.status === 'alert' && (
                                <motion.div 
                                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute inset-0 bg-red-600 rounded-full blur-md"
                                    style={{ width: 40, height: 40, margin: -10 }}
                                />
                            )}
                            
                            {/* Node Icon */}
                            <div className={`p-2 rounded-sm border-2 transition-all duration-500 flex items-center justify-center ${
                                selectedNode === node.id ? 'bg-red-600 text-white border-red-400 scale-125 glow-red' :
                                node.status === 'alert' ? 'bg-black/80 text-red-600 border-red-600/50' : 
                                'bg-black/60 text-gray-700 border-white/5 group-hover:border-red-600'
                            }`}>
                                {node.status === 'alert' ? <AlertTriangle size={14} /> : <Target size={14} />}
                            </div>

                            {/* Label Overlay */}
                            <AnimatePresence>
                                {(selectedNode === node.id || node.status === 'alert') && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap"
                                    >
                                        <div className="bg-black/90 border-l-2 border-red-600 p-2 backdrop-blur-md">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{node.id}</p>
                                            <p className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">{node.label}</p>
                                            {node.threatLevel && node.threatLevel > 0.5 && (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-red-600" style={{ width: `${node.threatLevel * 100}%` }} />
                                                    </div>
                                                    <span className="text-[7px] text-red-600 font-black">{(node.threatLevel * 100).toFixed(0)}%_RISK</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}

                {/* Map Interface Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
                    <button className="p-3 bg-black/80 border border-white/5 text-gray-500 hover:text-white hover:border-red-600 transition-all rounded-sm"><Scaling size={16} /></button>
                    <button className="p-3 bg-black/80 border border-white/5 text-gray-500 hover:text-white hover:border-red-600 transition-all rounded-sm"><MoveUpRight size={16} /></button>
                </div>
            </div>

            {/* Tactical Footer Metrics */}
            <div className="p-6 bg-black/40 border-t border-white/5 grid grid-cols-4 gap-8">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Map_Projection</p>
                    <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">SEC_ALPHA_V3</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Neural_Sync_Nodes</p>
                    <div className="flex gap-1">
                        {[1,1,1,0,0].map((v, i) => (
                            <div key={i} className={`w-3 h-1 rounded-full ${v ? 'bg-red-600' : 'bg-gray-800'}`} />
                        ))}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Strategic_Threat_Level</p>
                    <p className="text-[10px] font-black text-red-600 uppercase italic tracking-tighter animate-pulse">ELEVATED_BETA</p>
                </div>
                <div className="flex items-center justify-end">
                    <button className="px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:bg-red-500 transition-all">
                        <Crosshair size={12} /> Jump_To_Node
                    </button>
                </div>
            </div>
        </div>
    );
}
