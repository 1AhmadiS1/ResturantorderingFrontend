import { LoaderCircle } from "lucide-react";

const variants = {
  primary: "border-transparent bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_9px_22px_rgba(220,62,55,.22)] hover:from-brand-400 hover:to-brand-600",
  secondary: "border-[#eadbd6] bg-white text-[#5a3b3e] hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
  ghost: "border-transparent bg-transparent text-[#74676a] hover:bg-brand-50 hover:text-brand-700",
  danger: "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
};

const sizes = {
  sm: "min-h-9 px-3 py-2 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-[0.95rem]",
};

export function Button({ children, variant = "primary", size = "md", loading = false, className = "", ...props }) {
  return (
    <button
      className={`button button--${variant} button--${size} inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border font-bold whitespace-nowrap transition duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle size={17} className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
