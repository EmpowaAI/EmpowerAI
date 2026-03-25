// frontend/src/components/Toast.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-cv-success" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertCircle className="h-5 w-5 text-cv-warning" />,
    info: <Info className="h-5 w-5 text-primary" />,
  };

  const bgColors = {
    success: "bg-cv-success/10 border-cv-success/30",
    error: "bg-destructive/10 border-destructive/30",
    warning: "bg-cv-warning/10 border-cv-warning/30",
    info: "bg-primary/10 border-primary/30",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className={cn(
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
            "px-4 py-3 rounded-lg border shadow-lg",
            "flex items-center gap-3 min-w-[300px] max-w-md",
            bgColors[type]
          )}
        >
          {icons[type]}
          <p className="text-sm flex-1">{message}</p>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  );

  return { showToast, hideToast, ToastComponent };
}