import { motion } from "framer-motion";

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 row-start-3 p-4 flex items-center justify-between border-t border-cyan-500/10 bg-black/20 backdrop-blur-md text-xs text-gray-500"
        >
            <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-400">Civic AI Shield</span>
                <span>v1.0.0</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                <span>Environment: Demo</span>
            </div>
        </motion.footer>
    );
}
