"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import { signupFormSchema } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/auth.store";

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
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

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
      await signup({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        phone: validation.data.phone,
        address: validation.data.address,
      });

      router.replace(`/otp?email=${encodeURIComponent(validation.data.email)}`);
    } catch {
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[32px] border border-black/8 bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden border-r border-black/8 bg-[#18140f] px-10 py-12 text-white lg:flex lg:flex-col">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Trend Sole
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              Create your customer account and verify it securely.
            </h1>
            <p className="mt-4 max-w-md text-base leading-8 text-white/70">
              Signup creates a customer account automatically and sends a one-time
              verification code to your email before you can place orders.
            </p>
          </div>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <FiUserPlus />
            </div>
            <p className="mt-4 text-lg font-semibold">Customer-first onboarding</p>
            <p className="mt-2 text-sm leading-7 text-white/65">
              After signup you will receive an OTP by email and complete the
              final verification step before you can place orders.
            </p>
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Customer Signup
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">
              Create your account
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              Your account is created with the <span className="font-semibold">customer</span>
              {" "}role by default, and it will be verified through a one-time code sent to your email.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Muhammad Umer"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none"
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
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none"
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
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none"
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-950 outline-none"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(event) => handleChange("password", event.target.value)}
                      placeholder="Minimum 6 characters"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-950"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(event) =>
                        handleChange("confirmPassword", event.target.value)
                      }
                      placeholder="Repeat password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-950"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
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
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create account"}
                {!isLoading && <FiArrowRight />}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <Link href="/login" className="font-semibold text-slate-950 hover:text-slate-700">
                Already have an account?
              </Link>
              <Link href="/" className="font-semibold text-slate-600 hover:text-slate-950">
                Back to storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
