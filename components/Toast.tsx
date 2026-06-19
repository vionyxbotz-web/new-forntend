import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  isOpen,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/20",
      border: "border-green-500/50",
      iconColor: "text-green-400",
    },
    error: {
      icon: XCircle,
      color: "from-red-500 to-rose-500",
      bg: "bg-red-500/20",
      border: "border-red-500/50",
      iconColor: "text-red-400",
    },
    info: {
      icon: Info,
      color: "from-[var(--accent)] to-[var(--accent)]",
      bg: "bg-[var(--accent-glow)]",
      border: "border-[var(--accent-border)]",
      iconColor: "text-[var(--accent)]",
    },
    warning: {
      icon: AlertTriangle,
      color: "from-yellow-500 to-orange-500",
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/50",
      iconColor: "text-yellow-400",
    },
  };

  const { icon: Icon, color, bg, border, iconColor } = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 right-4 z-[100] max-w-md"
        >
          <motion.div
            className={`${bg} ${border} border  rounded-xl p-4 shadow-2xl`}
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 ${bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap break-words">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              className={`mt-3 h-1 rounded-full bg-gradient-to-r ${color}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom hook for using toast
export function useToast() {
  return {
    success: (message: string) => {
      // This will be implemented via context
      console.log("Success toast:", message);
    },
    error: (message: string) => {
      console.log("Error toast:", message);
    },
    info: (message: string) => {
      console.log("Info toast:", message);
    },
    warning: (message: string) => {
      console.log("Warning toast:", message);
    },
  };
}
