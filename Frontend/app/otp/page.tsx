"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiAlertCircle, FiArrowRight, FiKey, FiShield } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
import { apiErrorMessage, authApi } from "@/lib/api";
import { otpFormSchema } from "@/lib/validations/auth";
import { getDefaultRouteForRole, useAuthStore } from "@/store/auth.store";

export default function OtpPage() {
  const router = useRouter();
  const applyAuthSession = useAuthStore((state) => state.applyAuthSession);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validation = otpFormSchema.safeParse({ otp });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Please enter the full verification code."
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await authApi.verifyOtp(validation.data);
      applyAuthSession(response);
      router.replace(getDefaultRouteForRole(response.user.role));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="OTP Verification"
      title="Verify your account"
      description="Enter the 6-digit OTP sent by your backend to complete verification and sign in."
      sideTitle="Fast verification for newly registered accounts."
      sideDescription="Once the code is confirmed, the frontend stores the session and routes you into the storefront or dashboard automatically."
      sideCardTitle="6-digit confirmation"
      sideCardDescription="OTP codes expire quickly, so enter the most recent one delivered to your email address."
      sideIcon={FiShield}
      footer={
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/login" className="font-semibold text-slate-950 hover:text-slate-700">
            Already verified? Sign in
          </Link>
          <Link href="/forgot-password" className="font-semibold text-slate-600 hover:text-slate-950">
            Need password help?
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Verification code
          </label>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4">
            <FiKey className="text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="h-14 w-full bg-transparent pl-3 text-slate-950 outline-none tracking-[0.45em]"
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Verifying..." : "Verify account"}
          {!submitting && <FiArrowRight />}
        </button>
      </form>
    </AuthShell>
  );
}
