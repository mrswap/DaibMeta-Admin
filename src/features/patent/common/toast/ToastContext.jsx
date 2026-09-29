import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

// ==============================
// Types & Constants
// ==============================

const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

const DEFAULT_CONFIG = {
  duration: 3000,
  position: "top-right",
  maxToasts: 5,
  pauseOnHover: true,
};

// ==============================
// Toast Item Component (Fixed)
// ==============================

const ToastItem = ({ id, message, type, onClose, duration, pauseOnHover }) => {
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const isMountedRef = useRef(true);
  const isClosedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const closeToast = useCallback(() => {
    if (isClosedRef.current) return;
    isClosedRef.current = true;
    clearTimer();
    onClose(id);
  }, [clearTimer, id, onClose]);

  const startTimer = useCallback(() => {
    if (isPaused || isClosedRef.current) return;

    clearTimer();

    timeoutRef.current = setTimeout(() => {
      if (!isPaused && !isClosedRef.current && isMountedRef.current) {
        closeToast();
      }
    }, remainingTimeRef.current);
  }, [isPaused, clearTimer, closeToast]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && !isClosedRef.current) {
      setIsPaused(true);
      clearTimer();
      remainingTimeRef.current -= Date.now() - startTimeRef.current;
      // Ensure remaining time doesn't go below 0
      if (remainingTimeRef.current < 0) remainingTimeRef.current = 0;
    }
  }, [pauseOnHover, clearTimer]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && !isClosedRef.current) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
      // Only restart if there's remaining time
      if (remainingTimeRef.current > 0) {
        startTimer();
      } else {
        closeToast();
      }
    }
  }, [pauseOnHover, startTimer, closeToast]);

  useEffect(() => {
    isMountedRef.current = true;
    startTimeRef.current = Date.now();
    startTimer();

    return () => {
      isMountedRef.current = false;
      clearTimer();
    };
  }, [startTimer, clearTimer]);

  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case TOAST_TYPES.ERROR:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case TOAST_TYPES.WARNING:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const typeClasses = {
    [TOAST_TYPES.SUCCESS]: "bg-green-50 border-green-200 text-green-800",
    [TOAST_TYPES.ERROR]: "bg-red-50 border-red-200 text-red-800",
    [TOAST_TYPES.WARNING]: "bg-yellow-50 border-yellow-200 text-yellow-800",
    [TOAST_TYPES.INFO]: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        shadow-lg min-w-[320px] max-w-md
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        ${typeClasses[type]}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{getIcon()}</div>

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        onClick={closeToast}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

// ==============================
// Toast Container Component
// ==============================

const ToastContainer = ({ toasts, onClose, position, pauseOnHover }) => {
  const positionClasses = {
    "top-right": "top-5 right-5",
    "top-left": "top-5 left-5",
    "bottom-right": "bottom-5 right-5",
    "bottom-left": "bottom-5 left-5",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-3`}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={onClose}
          pauseOnHover={pauseOnHover}
        />
      ))}
    </div>
  );
};

// ==============================
// Toast Context
// ==============================

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// ==============================
// Toast Provider
// ==============================

export const ToastProvider = ({ children, config = DEFAULT_CONFIG }) => {
  const [toasts, setToasts] = useState([]);
  const idCounterRef = useRef(0);
  const timeoutsRef = useRef(new Map()); // Store timeouts for safety

  const removeToast = useCallback((id) => {
    setToasts((prev) => {
      const newToasts = prev.filter((toast) => toast.id !== id);
      return newToasts;
    });
  }, []);

  const addToast = useCallback(
    (message, type = TOAST_TYPES.SUCCESS, options = {}) => {
      const id = ++idCounterRef.current;
      const duration = options.duration || config.duration;

      setToasts((prev) => {
        const newToasts = [...prev, { id, message, type, duration }];

        // Limit max toasts
        if (newToasts.length > config.maxToasts) {
          return newToasts.slice(-config.maxToasts);
        }

        return newToasts;
      });

      return id;
    },
    [config.duration, config.maxToasts],
  );

  const toastApi = {
    success: (message, options) =>
      addToast(message, TOAST_TYPES.SUCCESS, options),
    error: (message, options) => addToast(message, TOAST_TYPES.ERROR, options),
    warning: (message, options) =>
      addToast(message, TOAST_TYPES.WARNING, options),
    info: (message, options) => addToast(message, TOAST_TYPES.INFO, options),
    dismiss: removeToast,
    dismissAll: () => setToasts([]),
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={config.position}
        pauseOnHover={config.pauseOnHover}
      />
    </ToastContext.Provider>
  );
};

// ==============================
// CSS Animations (Add to your global CSS)
// ==============================
/* 
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out;
}
*/
