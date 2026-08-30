import { useEffect } from "react";
import { X } from "lucide-react";

const modalSizes = {
  sm: "max-w-[440px]",
  md: "max-w-[620px]",
  lg: "max-w-[780px]",
  xl: "max-w-[1100px]",
};

export function Modal({ open, onClose, title, description, children, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-[#371e24]/45 p-0 backdrop-blur-sm sm:grid sm:place-items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal modal--${size} max-h-[calc(100dvh-18px)] w-full overflow-auto rounded-t-2xl border border-[#eadbd6] bg-[#fffaf7] text-[#2f2325] shadow-[0_28px_80px_rgba(67,30,38,.23)] sm:max-h-[calc(100vh-40px)] sm:rounded-[21px] ${modalSizes[size] || modalSizes.md}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal__header sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#eadbd6] bg-[#fffaf7]/95 px-3.5 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="mb-1 text-base font-extrabold sm:text-lg" id="modal-title">{title}</h2>
            {description && <p className="m-0 text-xs leading-relaxed text-[#74676a] sm:text-[0.77rem]">{description}</p>}
          </div>
          <button className="icon-button grid size-9 shrink-0 place-items-center rounded-xl border border-[#eadbd6] bg-white text-[#6f5d60] hover:bg-brand-50 hover:text-brand-700" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </header>
        <div className="modal__body p-3.5 sm:p-5">{children}</div>
      </section>
    </div>
  );
}
