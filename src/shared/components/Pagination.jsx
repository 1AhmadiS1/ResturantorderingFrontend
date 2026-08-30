import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ count = 0, offset = 0, limit = 10, onChange }) {
  if (count <= limit) return null;
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.ceil(count / limit);
  return (
    <div className="pagination flex min-h-[52px] items-center justify-between gap-2 border-t border-[#f2e7e3] px-3 py-2.5 text-[0.68rem] text-[#74676a] sm:min-h-[58px] sm:px-4 sm:text-xs">
      <span>{offset + 1}–{Math.min(offset + limit, count)} of {count}</span>
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <button className="icon-button grid size-8 place-items-center rounded-lg border border-[#eadbd6] bg-white text-[#6f5d60] hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage === 1} onClick={() => onChange(Math.max(0, offset - limit))} aria-label="Previous page"><ChevronLeft size={18} /></button>
        <strong className="text-[0.7rem] text-[#5a484c] sm:text-xs">{currentPage} / {pageCount}</strong>
        <button className="icon-button grid size-8 place-items-center rounded-lg border border-[#eadbd6] bg-white text-[#6f5d60] hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage === pageCount} onClick={() => onChange(offset + limit)} aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}
