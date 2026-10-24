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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(32,49,58,0.16)] px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[30px] border border-[rgba(74,96,105,0.12)] bg-[rgba(255,255,255,0.96)] shadow-[0_28px_90px_rgba(84,101,111,0.14)]">
        <div className="flex items-start justify-between border-b border-[rgba(74,96,105,0.09)] px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="button-secondary rounded-full p-2 text-slate-500 transition-colors hover:text-slate-950"
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
