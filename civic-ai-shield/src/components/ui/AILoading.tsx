import { motion } from "framer-motion";

export function AILoading({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Spinner */}
      <motion.div
        className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

      {/* Pulsing Text */}
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="tracking-[0.3em] text-cyan-400 text-sm font-bold uppercase"
      >
        {text}
      </motion.p>

      {/* Animated Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-cyan-400 rounded-full"
            animate={{ y: [0, -12, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
