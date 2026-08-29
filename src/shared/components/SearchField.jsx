import { Search, X } from "lucide-react";

export function SearchField({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-field">
      <Search size={18} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button onClick={() => onChange("")} aria-label="Clear search"><X size={16} /></button>}
    </div>
  );
}

