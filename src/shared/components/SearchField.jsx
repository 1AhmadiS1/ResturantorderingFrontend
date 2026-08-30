import { Search, X } from "lucide-react";

export function SearchField({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-field flex min-h-11 w-full max-w-[480px] items-center gap-2.5 rounded-[10px] border border-[#eadbd6] bg-white px-3 text-[#74676a] transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10">
      <Search className="shrink-0" size={18} aria-hidden="true" />
      <input className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#2f2325] outline-none placeholder:text-[#9a8c8f]" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button className="grid shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-1 text-[#74676a] hover:text-brand-700" onClick={() => onChange("")} aria-label="Clear search"><X size={16} /></button>}
    </div>
  );
}
