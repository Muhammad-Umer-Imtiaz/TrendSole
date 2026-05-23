"use client";

import { useRouter } from "next/navigation";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { toSentenceCase } from "@/lib/format";
import { useAuthStore } from "@/store/auth.store";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/8 bg-[#f8f6f2]/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 lg:hidden"
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Operations workspace
          </p>
          <h1 className="text-lg font-semibold text-slate-950">
            Welcome back, {user?.name?.split(" ")[0] ?? "Team"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Role
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {toSentenceCase(user?.role ?? "staff")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </header>
  );
}
