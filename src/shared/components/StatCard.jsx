export function StatCard({ icon: Icon, label, value, detail, tone = "red" }) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}><Icon size={21} /></div>
      <div><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
    </article>
  );
}

