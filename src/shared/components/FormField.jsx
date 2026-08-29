export function FormField({ label, error, hint, required, children, className = "" }) {
  return (
    <label className={`form-field ${className}`}>
      <span className="form-field__label">
        {label} {required && <span aria-hidden="true">*</span>}
      </span>
      {children}
      {error ? <span className="form-field__error">{error}</span> : hint ? <span className="form-field__hint">{hint}</span> : null}
    </label>
  );
}

