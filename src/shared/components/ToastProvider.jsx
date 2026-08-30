import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let toastId = 0;
const toastStyles = {
  success: "[&_svg:first-child]:text-emerald-600",
  error: "[&_svg:first-child]:text-red-600",
  info: "[&_svg:first-child]:text-blue-600",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);
  const removeToast = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region fixed bottom-4 right-4 z-[200] grid w-[min(390px,calc(100vw-32px))] gap-2 sm:bottom-5 sm:right-5" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.type === "error" ? CircleAlert : toast.type === "info" ? Info : CheckCircle2;
          return <div className={`toast toast--${toast.type} grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-[#eadbd6] bg-white px-3 py-3 text-sm text-[#2f2325] shadow-[0_16px_40px_rgba(91,49,42,.18)] ${toastStyles[toast.type] || toastStyles.info}`} key={toast.id}><Icon size={19} /><span>{toast.message}</span><button className="grid cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#74676a] hover:text-[#2f2325]" onClick={() => removeToast(toast.id)} aria-label="Dismiss"><X size={16} /></button></div>;
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
