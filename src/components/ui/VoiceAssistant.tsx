import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAssistantProps {
  onCommand: (command: string) => void;
}

export function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [showIndicator, setShowIndicator] = useState(false);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9; // Slightly deeper, professional voice
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = useCallback((transcript: string) => {
    const cmd = transcript.toLowerCase();
    setLastTranscript(transcript);
    setShowIndicator(true);
    setTimeout(() => setShowIndicator(false), 3000);

    if (cmd.includes("dashboard") || cmd.includes("home")) {
      speak("Navigating to command dashboard.");
      onCommand("dashboard");
    } else if (cmd.includes("live") || cmd.includes("camera") || cmd.includes("stream")) {
      speak("Accessing live surveillance nodes.");
      onCommand("live");
    } else if (cmd.includes("track") || cmd.includes("subject") || cmd.includes("path")) {
      speak("Initializing re-identification tracking.");
      onCommand("tracking");
    } else if (cmd.includes("alert") || cmd.includes("history")) {
      speak("Opening incident archives.");
      onCommand("alerts");
    } else if (cmd.includes("status") || cmd.includes("check")) {
      speak("System nominal. All AI nodes active. Security levels at ninety-eight percent.");
    } else if (cmd.includes("privacy") || cmd.includes("mask")) {
       speak("Ethical AI protocols engaged.");
       // This would need a global state to toggle privacy mode, 
       // but for now we just acknowledge.
    }
  }, [onCommand]);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening, handleCommand]);

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl shadow-2xl max-w-xs"
          >
            <div className="flex items-center gap-3 mb-1">
                <Command size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Voice Command Received</span>
            </div>
            <p className="text-white text-sm font-medium">"{lastTranscript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {isListening && (
            <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex gap-1"
            >
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-1 h-4 bg-cyan-500 rounded-full" />
                ))}
            </motion.div>
        )}
        
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
                setIsListening(!isListening);
                if (!isListening) speak("Voice recognition active.");
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 ${
                isListening 
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]' 
                : 'bg-black/60 text-white border-white/10 hover:border-cyan-500/50'
            }`}
        >
            {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        </motion.button>
      </div>
    </div>
  );
}
