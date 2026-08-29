import { LoaderCircle } from "lucide-react";

export function Button({ children, variant = "primary", size = "md", loading = false, className = "", ...props }) {
  return (
    <button
      className={`button button--${variant} button--${size} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle size={17} className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

