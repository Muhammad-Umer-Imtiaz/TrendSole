"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AccessDenied from "@/components/ui/AccessDenied";
import { hasAllPermissions } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import type { Permission } from "@/lib/types";

interface AuthGuardProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requireAdmin?: boolean;
}

export default function AuthGuard({
  children,
  requiredPermissions = [],
  requireAdmin = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (pathname.startsWith("/dashboard") && user?.role === "customer") {
      router.replace("/");
    }
  }, [isAuthenticated, isHydrated, pathname, router, user?.role]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">
        <div className="rounded-3xl border border-black/8 bg-white px-8 py-6 text-sm text-slate-500">
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (pathname.startsWith("/dashboard") && user?.role === "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">
        <div className="rounded-3xl border border-black/8 bg-white px-8 py-6 text-sm text-slate-500">
          Redirecting to the storefront...
        </div>
      </div>
    );
  }

  if (requireAdmin && user?.role !== "admin") {
    return <AccessDenied title="Admin access only" />;
  }

  if (
    requiredPermissions.length > 0 &&
    !hasAllPermissions(permissions, requiredPermissions)
  ) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
