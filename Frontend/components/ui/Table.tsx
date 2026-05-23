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
            className="h-14 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${column.className ?? ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {visibleRows.map((row) => (
                <tr key={keyExtractor(row)} className="align-top">
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
