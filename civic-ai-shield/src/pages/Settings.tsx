import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Zap, Volume2, Lock } from "lucide-react";
import { useState } from "react";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Settings() {
  const [settings, setSettings] = useState({
    telegram: true,
    email: true,
    sms: false,
    pushNotifications: true,
    soundAlerts: true,
    confidenceThreshold: 75,
  });

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8 max-w-4xl">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Settings & Configuration</h1>
        <p className="text-gray-400">Configure alerts, detection sensitivity, and notification preferences</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Notifications</h2>

        {[
          {
            key: "telegram",
            icon: Bell,
            title: "Telegram Alerts",
            desc: "Receive instant threat notifications on Telegram",
          },
          {
            key: "email",
            icon: Mail,
            title: "Email Notifications",
            desc: "Get detailed incident summaries via email",
          },
          {
            key: "sms",
            icon: MessageSquare,
            title: "SMS Alerts",
            desc: "Critical alerts via text message",
          },
          {
            key: "pushNotifications",
            icon: Volume2,
            title: "Push Notifications",
            desc: "Browser push notifications for real-time updates",
          },
        ].map(({ key, icon: Icon, title, desc }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl hover:border-cyan-500/40 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Icon className="text-cyan-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-bold text-white text-lg">{title}</p>
                  <p className="text-gray-400 text-sm mt-1">{desc}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleToggle(key as keyof typeof settings)}
                className={`flex-shrink-0 relative w-14 h-8 rounded-full transition ${
                  settings[key as keyof typeof settings] ? "bg-cyan-500/40 border-cyan-500/60" : "bg-gray-700/40 border-gray-600/60"
                } border`}
              >
                <motion.div
                  animate={{
                    x: settings[key as keyof typeof settings] ? 28 : 4,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Detection Settings</h2>

        <motion.div className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="text-yellow-400" size={24} />
                <div>
                  <p className="font-bold text-white text-lg">Confidence Threshold</p>
                  <p className="text-gray-400 text-sm">Only alert on detections above this confidence level</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-cyan-400">{settings.confidenceThreshold}%</span>
            </div>

            <div className="relative h-3 bg-black/60 rounded-full overflow-hidden border border-cyan-500/20">
              <motion.input
                type="range"
                min="0"
                max="100"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <motion.div
                animate={{ width: `${settings.confidenceThreshold}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Low Sensitivity</span>
              <span>High Sensitivity</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pt-6 border-t border-white/10"
          >
            <p className="text-sm text-gray-400 mb-4">
              Current setting: Alerts triggered when confidence level exceeds {settings.confidenceThreshold}%
            </p>
            <div className="flex gap-2">
              {[
                { label: "Low", value: 50, desc: "More alerts, some false positives" },
                { label: "Medium", value: 75, desc: "Balanced approach" },
                { label: "High", value: 90, desc: "Fewer alerts, high accuracy" },
              ].map((preset) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSettings({ ...settings, confidenceThreshold: preset.value })}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    settings.confidenceThreshold === preset.value
                      ? "bg-cyan-500/30 border border-cyan-500/50 text-cyan-300"
                      : "bg-black/40 border border-white/10 text-gray-400 hover:border-cyan-500/30"
                  }`}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl">
          <div className="flex items-start gap-3 mb-6">
            <Lock className="text-purple-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="font-bold text-white text-lg">Sound Alerts</p>
              <p className="text-gray-400 text-sm">Play sound notification on high-priority threats</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleToggle("soundAlerts")}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border transition ${
              settings.soundAlerts
                ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
                : "bg-red-500/10 border-red-500/30 hover:border-red-500/50"
            }`}
          >
            <span className={`font-semibold ${settings.soundAlerts ? "text-green-400" : "text-red-400"}`}>
              {settings.soundAlerts ? "Enabled" : "Disabled"}
            </span>
            <motion.div
              animate={{ rotate: settings.soundAlerts ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="text-2xl"
            >
              {settings.soundAlerts ? "🔊" : "🔇"}
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition"
        >
          Save Settings
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-8 py-4 bg-black/40 border border-white/10 text-gray-300 font-bold rounded-xl hover:border-cyan-500/30 transition"
        >
          Reset to Defaults
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
