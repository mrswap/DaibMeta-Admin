import { createContext, useContext, useState, useCallback } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

// ==================== CONTEXT ====================
const ToastContext = createContext(null);

// ==================== PROVIDER ====================
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );

  // Public API
  const toast = {
    success: (msg, duration) => addToast("success", msg, duration),
    error: (msg, duration) => addToast("error", msg, duration),
    warn: (msg, duration) => addToast("warn", msg, duration),
    info: (msg, duration) => addToast("info", msg, duration),
    custom: (type, msg, duration) => addToast(type, msg, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// ==================== HOOK ====================
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
};

// ==================== CONTAINER ====================
const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};

// ==================== ITEM ====================
const ToastItem = ({ toast, onClose }) => {
  const variants = {
    success: {
      bg: "bg-brand-50",
      border: "border-brand-200",
      icon: <FiCheckCircle className="h-5 w-5 text-brand-600" />,
      text: "text-brand-800",
    },
    error: {
      bg: "bg-danger-50",
      border: "border-danger-100",
      icon: <FiAlertCircle className="h-5 w-5 text-danger-500" />,
      text: "text-danger-900",
    },
    warn: {
      bg: "bg-warn-50",
      border: "border-warn-200",
      icon: <FiAlertTriangle className="h-5 w-5 text-warn-800" />,
      text: "text-warn-900",
    },
    info: {
      bg: "bg-accent-50",
      border: "border-accent-200",
      icon: <FiInfo className="h-5 w-5 text-accent-600" />,
      text: "text-accent-900",
    },
  };

  const v = variants[toast.type] || variants.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${v.border} ${v.bg} px-4 py-3 shadow-lg animate-in slide-in-from-right`}
      style={{
        animation: "slideIn 0.25s ease-out",
      }}
    >
      <div className="shrink-0 pt-0.5">{v.icon}</div>
      <p className={`flex-1 text-sm font-medium ${v.text}`}>{toast.message}</p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className={`shrink-0 rounded p-0.5 ${v.text} opacity-60 hover:opacity-100`}
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

// Add keyframes globally (ek baar)
if (typeof document !== "undefined") {
  const styleId = "toast-animations";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(120%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}
