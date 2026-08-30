function getPasswordScore(password) {
  if (!password) return 0;

  const checks = getPasswordRequirements(password).map((item) => item.met);

  return checks.filter(Boolean).length;
}

function getPasswordRequirements(password) {
  return [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Upper + lower", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
    { label: "Symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const tones = ["empty", "weak", "fair", "good", "strong"];
const progressTones = {
  empty: "bg-slate-300",
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-blue-500",
  strong: "bg-emerald-500",
};

export function PasswordStrengthMeter({ password }) {
  const score = getPasswordScore(password);
  const requirements = getPasswordRequirements(password || "");
  const characterCount = password?.length || 0;
  const label = labels[score];
  const tone = tones[score];
  const progress = `${Math.max(score, password ? 1 : 0) * 25}%`;

  return (
    <div className={`password-meter password-meter--${tone} mt-0.5 grid gap-2 rounded-[10px] border border-[#f2e7e3] bg-[#fffaf8] p-2.5`} aria-live="polite">
      <div className="password-meter__header flex items-center justify-between gap-2 text-[0.68rem] text-[#74676a]">
        <span>{label}</span>
        <strong className="text-[#2f2325]">{characterCount} characters</strong>
      </div>
      <div className="password-meter__track h-1.5 overflow-hidden rounded-full bg-[#eee4e0]">
        <span className={`block h-full rounded-full transition-all ${progressTones[tone]}`} style={{ width: progress }} />
      </div>
      <div className="password-meter__checks flex flex-wrap gap-1.5">
        {requirements.map((requirement) => (
          <span className={`rounded-full px-2 py-1 text-[0.62rem] leading-none ${requirement.met ? "is-met bg-emerald-100 text-emerald-700" : "bg-black/[0.035] text-[#9a8c8f]"}`} key={requirement.label}>
            {requirement.label}
          </span>
        ))}
      </div>
    </div>
  );
}
