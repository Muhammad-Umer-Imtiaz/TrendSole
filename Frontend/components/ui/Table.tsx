"use client";

import { useMemo, useState, type ReactNode } from "react";
import PaginationControls from "@/components/ui/PaginationControls";
import type { PaginationMeta } from "@/lib/types";

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  pageSize?: number;
  pagination?: PaginationMeta;
  paginationLabel?: string;
  onPageChange?: (page: number) => void;
}

export default function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No records found.",
  isLoading = false,
  pageSize,
  pagination,
  paginationLabel,
  onPageChange,
}: TableProps<T>) {
  const [localPage, setLocalPage] = useState(1);

  const totalLocalPages =
    pageSize && pageSize > 0 ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const resolvedLocalPage = pagination
    ? localPage
    : Math.min(localPage, totalLocalPages);

  const visibleRows = useMemo(() => {
    if (pagination || !pageSize || pageSize <= 0) {
      return data;
    }

    const startIndex = (resolvedLocalPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, pageSize, pagination, resolvedLocalPage]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-2xl bg-[rgba(228,239,234,0.6)]"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[26px] border border-dashed border-[rgba(74,96,105,0.22)] bg-[rgba(255,255,255,0.65)] px-6 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[26px] border border-[rgba(74,96,105,0.1)] bg-white/85">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[rgba(74,96,105,0.1)]">
            <thead className="bg-[rgba(238,244,241,0.72)]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 ${column.className ?? ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[rgba(74,96,105,0.08)] bg-white/90">
              {visibleRows.map((row) => (
                <tr key={keyExtractor(row)} className="align-top transition-colors hover:bg-[rgba(248,246,242,0.82)]">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 text-sm text-slate-700 ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination ? (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label={paginationLabel}
          onPageChange={(page) => onPageChange?.(page)}
        />
      ) : pageSize && totalLocalPages > 1 ? (
        <PaginationControls
          page={resolvedLocalPage}
          totalPages={totalLocalPages}
          total={data.length}
          label={paginationLabel}
          onPageChange={setLocalPage}
        />
      ) : null}
    </div>
  );
}
