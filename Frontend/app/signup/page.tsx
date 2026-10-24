"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiUserPlus } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
import { signupFormSchema } from "@/lib/validations/auth";
import { getDefaultRouteForRole, useAuthStore } from "@/store/auth.store";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
  agreedToTerms: false,
};

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(getDefaultRouteForRole(user?.role));
    }
  }, [isAuthenticated, isHydrated, router, user?.role]);

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    clearError();

    const validation = signupFormSchema.safeParse(formData);

    if (!validation.success) {
      setFormError(
        validation.error.issues[0]?.message ??
          "Please review the information you entered."
      );
      return;
    }

    try {
      const response = await signup({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        phone: validation.data.phone,
        address: validation.data.address,
      });

      router.replace(getDefaultRouteForRole(response.user.role));
    } catch {
      return;
    }
  };

  return (
    <AuthShell
      eyebrow="Customer Signup"
      title="Create your account"
      description="Your account is created with the customer role by default, so you can start shopping right away."
      sideTitle="Create your customer account and start ordering right away."
      sideDescription="Signup stays simple and focused, while staff and admin roles remain managed in the operations workspace."
      sideCardTitle="Customer-first onboarding"
      sideCardDescription="After signup you will be signed in automatically and taken into the storefront experience."
      sideIcon={FiUserPlus}
      footer={
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/login" className="font-semibold text-slate-950 hover:text-slate-700">
            Already have an account?
          </Link>
          <Link href="/" className="font-semibold text-slate-600 hover:text-slate-950">
            Back to storefront
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Muhammad Umer"
                  className="input-surface h-14 w-full rounded-2xl px-4 text-slate-950 outline-none"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    placeholder="you@example.com"
                    className="input-surface h-14 w-full rounded-2xl px-4 text-slate-950 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    placeholder="+92 300 0000000"
                    className="input-surface h-14 w-full rounded-2xl px-4 text-slate-950 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  rows={3}
                  placeholder="Shipping address"
                  className="input-surface w-full rounded-2xl px-4 py-4 text-slate-950 outline-none"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input-surface h-14 w-full rounded-2xl px-4 text-slate-950 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      handleChange("confirmPassword", event.target.value)
                    }
                    placeholder="Repeat password"
                    className="input-surface h-14 w-full rounded-2xl px-4 text-slate-950 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] px-4 py-4 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(event) =>
                    handleChange("agreedToTerms", event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  I understand this signup creates a customer account and I agree
                  to use the platform responsibly.
                </span>
              </label>

              {(formError || error) && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <FiAlertCircle className="mt-0.5 shrink-0" />
                  <p>{formError ?? error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="button-primary inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create account"}
                {!isLoading && <FiArrowRight />}
              </button>
            </form>
    </AuthShell>
  );
}
