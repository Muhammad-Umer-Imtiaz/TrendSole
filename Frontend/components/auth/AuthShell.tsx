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
    <div className="app-shell px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[40px] border border-[rgba(74,96,105,0.12)] bg-[rgba(255,255,255,0.88)] shadow-[0_30px_80px_rgba(84,101,111,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="soft-grid hidden border-r border-[rgba(74,96,105,0.1)] bg-[linear-gradient(180deg,#eff5f1_0%,#e6efea_100%)] px-10 py-12 text-slate-900 lg:flex lg:flex-col">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Trend Sole
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
              {sideTitle}
            </h1>
            <p className="mt-4 max-w-md text-base leading-8 text-slate-600">
              {sideDescription}
            </p>
          </div>

          <div className="mt-auto rounded-[28px] border border-[rgba(74,96,105,0.1)] bg-white/75 p-6 shadow-[0_12px_30px_rgba(84,101,111,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(228,239,234,0.95)] text-slate-800">
              <SideIcon />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">{sideCardTitle}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {sideCardDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            <p className="section-kicker">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">{title}</h2>
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
