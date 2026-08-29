import { titleCase } from "../utils/formatters";

export function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{titleCase(status)}</span>;
}

