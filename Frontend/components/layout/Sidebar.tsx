"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiActivity,
  FiBarChart2,
  FiBox,
  FiGrid,
  FiPackage,
  FiShield,
  FiShoppingCart,
  FiTag,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { hasAllPermissions, SIDEBAR_ITEMS } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";

const ICONS = {
  dashboard: FiGrid,
  products: FiBox,
  categories: FiTag,
  orders: FiShoppingCart,
  customers: FiUsers,
  inventory: FiPackage,
  analytics: FiBarChart2,
  staff: FiShield,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  const items = SIDEBAR_ITEMS.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") {
      return false;
    }

    return hasAllPermissions(permissions, item.requiredPermissions);
  });

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 flex-col overflow-y-auto border-r border-black/8 bg-white px-5 py-6 transition-transform lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <FiActivity />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-950">
                Trend Sole
              </p>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-500 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="mt-8 space-y-1">
          {items.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="text-base" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Signed in as
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {user?.name ?? "Unknown user"}
          </p>
          <p className="mt-1 text-sm text-slate-500">{user?.email ?? ""}</p>
        </div>
      </aside>
    </>
  );
}
