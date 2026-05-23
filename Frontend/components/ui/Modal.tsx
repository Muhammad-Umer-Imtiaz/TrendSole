"use client";

import { useEffect, type ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-black/8 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:text-slate-950"
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
