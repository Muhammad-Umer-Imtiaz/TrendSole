"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiLock } from "react-icons/fi";
import { loginFormSchema } from "@/lib/validations/auth";
import { getDefaultRouteForRole, useAuthStore } from "@/store/auth.store";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(getDefaultRouteForRole(user?.role));
    }
  }, [isAuthenticated, isHydrated, router, user?.role]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    clearError();

    const validation = loginFormSchema.safeParse(formData);

    if (!validation.success) {
      setFormError(
        validation.error.issues[0]?.message ??
          "Please review your login credentials."
      );
      return;
    }

    try {
      const response = await login(validation.data);
      const fallbackRoute = getDefaultRouteForRole(response.user.role);
      const targetPath =
        nextPath && !(response.user.role === "customer" && nextPath.startsWith("/dashboard"))
          ? nextPath
          : fallbackRoute;

      router.replace(targetPath);
    } catch {
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[32px] border border-black/8 bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden border-r border-black/8 bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Trend Sole
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              One sign-in for storefront shoppers and your operations team.
            </h1>
            <p className="mt-4 max-w-md text-base leading-8 text-white/70">
              Customers land in the storefront, while staff, managers, and admins
              are routed into the dashboard with permission-aware access.
            </p>
          </div>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <FiLock />
            </div>
            <p className="mt-4 text-lg font-semibold">JWT-protected role-aware access</p>
            <p className="mt-2 text-sm leading-7 text-white/65">
              Sign in with your Trend Sole account to continue shopping,
              manage your profile, or work inside the dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Trend Sole Login
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950">
              Sign in to continue
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-500">
              Customers go straight to the storefront. Team accounts open the
              dashboard based on their assigned role and permissions.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="you@trendsole.com"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-colors focus:border-slate-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  placeholder="Enter your password"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-colors focus:border-slate-950"
                />
              </div>

              {(formError || error) && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <FiAlertCircle className="mt-0.5 shrink-0" />
                  <p>{formError ?? error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Continue"}
                {!isLoading && <FiArrowRight />}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              New here? Customer accounts can sign up directly. Team access still
              depends on the role and permissions assigned from the backend.
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="text-sm font-semibold text-slate-950 hover:text-slate-700"
              >
                Create customer account
              </Link>
              <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                Back to storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">
          <div className="rounded-3xl border border-black/8 bg-white px-8 py-6 text-sm text-slate-500">
            Loading login...
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
