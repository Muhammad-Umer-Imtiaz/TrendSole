"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import type { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  sideTitle: string;
  sideDescription: string;
  sideCardTitle: string;
  sideCardDescription: string;
  sideIcon: IconType;
  children: ReactNode;
  footer?: ReactNode;
  showBackHome?: boolean;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  sideTitle,
  sideDescription,
  sideCardTitle,
  sideCardDescription,
  sideIcon: SideIcon,
  children,
  footer,
  showBackHome = true,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(194,166,122,0.18),_transparent_30%),linear-gradient(180deg,#f7f2ea_0%,#efe7dc_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[36px] border border-black/8 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden border-r border-black/8 bg-[linear-gradient(180deg,#16110d_0%,#271c15_100%)] px-10 py-12 text-white lg:flex lg:flex-col">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Trend Sole
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              {sideTitle}
            </h1>
            <p className="mt-4 max-w-md text-base leading-8 text-white/70">
              {sideDescription}
            </p>
          </div>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <SideIcon />
            </div>
            <p className="mt-4 text-lg font-semibold">{sideCardTitle}</p>
            <p className="mt-2 text-sm leading-7 text-white/65">
              {sideCardDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-500">{description}</p>

            <div className="mt-8">{children}</div>

            {footer ? <div className="mt-8">{footer}</div> : null}

            {showBackHome ? (
              <div className="mt-8">
                <Link
                  href="/"
                  className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                >
                  Back to storefront
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
