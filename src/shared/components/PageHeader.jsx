export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0">
        {eyebrow && <span className="page-header__eyebrow text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-brand-600 sm:text-[0.7rem]">{eyebrow}</span>}
        <h1 className="mb-1 mt-1 text-[clamp(1.5rem,5vw,2.35rem)] font-extrabold tracking-[-0.035em] text-[#342326]">{title}</h1>
        {description && <p className="m-0 max-w-2xl text-[0.82rem] leading-relaxed text-[#74676a] sm:text-[0.94rem]">{description}</p>}
      </div>
      {actions && <div className="page-header__actions w-full shrink-0 sm:w-auto">{actions}</div>}
    </div>
  );
}
