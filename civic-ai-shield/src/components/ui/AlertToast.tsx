import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function AlertToast({
  type,
  message,
}: {
  type: "danger" | "success";
  message: string;
}) {
  const bgColor = type === "danger" ? "bg-red-500/20 border-red-500/50" : "bg-green-500/20 border-green-500/50";
  const Icon = type === "danger" ? AlertTriangle : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor}`}
    >
      <Icon size={20} />
      <p>{message}</p>
    </motion.div>
  );
}
