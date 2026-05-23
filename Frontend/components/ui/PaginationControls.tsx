"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total?: number;
  label?: string;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page,
  totalPages,
  total,
  label = "items",
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span>
        {typeof total === "number" ? ` • ${total} ${label}` : ""}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronLeft />
          Previous
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
