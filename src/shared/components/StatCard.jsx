const toneStyles = {
  red: "bg-[#fff0ec] text-[#d8433c]",
  green: "bg-[#edf9f2] text-[#319b67]",
  amber: "bg-[#fff7df] text-[#b87a1f]",
  blue: "bg-[#eef5ff] text-[#4d82d1]",
};

export function StatCard({ icon: Icon, label, value, detail, tone = "red" }) {
  return (
    <article className={`stat-card flex min-h-20 min-w-0 items-center gap-2 rounded-xl border border-transparent p-2.5 shadow-[0_10px_28px_rgba(91,49,42,.07)] sm:min-h-[126px] sm:items-start sm:gap-3.5 sm:p-5 ${toneStyles[tone] || toneStyles.red}`}>
      <div className={`stat-card__icon stat-card__icon--${tone} grid size-8 shrink-0 place-items-center rounded-lg bg-current/10 sm:size-10 sm:rounded-xl`}><Icon size={21} /></div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[0.64rem] leading-tight text-[#76666a] sm:text-[0.8rem]">{label}</span>
        <strong className="my-0.5 text-base font-extrabold tabular-nums text-[#352629] [overflow-wrap:anywhere] sm:my-1 sm:text-[clamp(1.35rem,2vw,1.8rem)]">{value}</strong>
        {detail && <small className="truncate text-[0.6rem] text-[#8e7e81] sm:text-[0.72rem]">{detail}</small>}
      </div>
    </article>
  );
}
