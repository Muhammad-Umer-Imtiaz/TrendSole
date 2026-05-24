"use client";

import { toSentenceCase } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-sky-50 text-sky-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-red-50 text-red-700",
  reviewed: "bg-sky-50 text-sky-700",
  resolved: "bg-emerald-50 text-emerald-700",
  open: "bg-amber-50 text-amber-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_STYLES[status.toLowerCase()] ?? "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {toSentenceCase(status)}
    </span>
  );
}
