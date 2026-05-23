"use client";

import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({
  title,
  description,
  action,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-3xl border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${className}`}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-950">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}

      {children}
    </section>
  );
}
