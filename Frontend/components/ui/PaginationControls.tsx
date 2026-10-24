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
    <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-[rgba(238,244,241,0.68)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronLeft />
          Previous
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
