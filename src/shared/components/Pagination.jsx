import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ count = 0, offset = 0, limit = 10, onChange }) {
  if (count <= limit) return null;
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.ceil(count / limit);
  return (
    <div className="pagination">
      <span>{offset + 1}–{Math.min(offset + limit, count)} of {count}</span>
      <div>
        <button className="icon-button" disabled={currentPage === 1} onClick={() => onChange(Math.max(0, offset - limit))} aria-label="Previous page"><ChevronLeft size={18} /></button>
        <strong>{currentPage} / {pageCount}</strong>
        <button className="icon-button" disabled={currentPage === pageCount} onClick={() => onChange(offset + limit)} aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

