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

export function PasswordStrengthMeter({ password }) {
  const score = getPasswordScore(password);
  const requirements = getPasswordRequirements(password || "");
  const characterCount = password?.length || 0;
  const label = labels[score];
  const tone = tones[score];
  const progress = `${Math.max(score, password ? 1 : 0) * 25}%`;

  return (
    <div className={`password-meter password-meter--${tone}`} aria-live="polite">
      <div className="password-meter__header">
        <span>{label}</span>
        <strong>{characterCount} characters</strong>
      </div>
      <div className="password-meter__track">
        <span style={{ width: progress }} />
      </div>
      <div className="password-meter__checks">
        {requirements.map((requirement) => (
          <span className={requirement.met ? "is-met" : ""} key={requirement.label}>
            {requirement.label}
          </span>
        ))}
      </div>
    </div>
  );
}
