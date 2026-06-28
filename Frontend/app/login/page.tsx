"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthShell
      eyebrow="Trend Sole Login"
      title="Sign in to continue"
      description="Customers return to the storefront, while staff and admins are routed to the dashboard with their assigned access."
      sideTitle="One sign-in flow for customers, staff, managers, and admins."
      sideDescription="Keep shopping and operations in one place with permission-aware authentication backed by your API."
      sideCardTitle="Protected account access"
      sideCardDescription="Use your Trend Sole credentials to manage your profile, review orders, or work in the operations dashboard."
      sideIcon={FiShield}
      
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    placeholder="Enter your password"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-colors focus:border-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-950 outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                  >
                    Forgot password?
                  </Link>
                </div>
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

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-slate-950 hover:text-slate-700">
                  Sign up here
                </Link>
              </p>
            </form>

      
    </AuthShell>
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
