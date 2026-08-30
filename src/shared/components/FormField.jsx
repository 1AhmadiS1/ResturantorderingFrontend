export function FormField({ label, error, hint, required, children, className = "" }) {
  return (
    <label className={`form-field flex min-w-0 max-w-full flex-col gap-1.5 [&_input]:box-border [&_input]:min-h-[46px] [&_input]:w-full [&_input]:max-w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#eadbd6] [&_input]:bg-white [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[#2f2325] [&_input]:transition [&_input]:outline-none [&_input:focus]:border-brand-400 [&_input:focus]:ring-4 [&_input:focus]:ring-brand-500/10 [&_input:disabled]:opacity-60 [&_select]:box-border [&_select]:min-h-[46px] [&_select]:w-full [&_select]:max-w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-[#eadbd6] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_select:focus]:border-brand-400 [&_select:focus]:ring-4 [&_select:focus]:ring-brand-500/10 [&_textarea]:box-border [&_textarea]:w-full [&_textarea]:max-w-full [&_textarea]:resize-y [&_textarea]:rounded-[10px] [&_textarea]:border [&_textarea]:border-[#eadbd6] [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:leading-relaxed [&_textarea]:outline-none [&_textarea:focus]:border-brand-400 [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-brand-500/10 ${className}`}>
      <span className="form-field__label text-[0.82rem] font-semibold text-[#58484b]">
        {label} {required && <span aria-hidden="true">*</span>}
      </span>
      {children}
      {error ? <span className="form-field__error text-xs text-red-700">{error}</span> : hint ? <span className="form-field__hint text-xs text-[#74676a]">{hint}</span> : null}
    </label>
  );
}
