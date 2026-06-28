"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiKey, FiShield } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
import { apiErrorMessage, authApi } from "@/lib/api";
import { otpFormSchema } from "@/lib/validations/auth";
import { getDefaultRouteForRole, useAuthStore } from "@/store/auth.store";

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applyAuthSession = useAuthStore((state) => state.applyAuthSession);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = sanitizedValue;
    setOtp(nextOtp);

    if (sanitizedValue && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const nextOtp = Array(6).fill("");
    pastedValue.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    inputRefs.current[Math.min(pastedValue.length, 5)]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const previousOtp = [...otp];
      previousOtp[index - 1] = "";
      setOtp(previousOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    const email = searchParams.get("email");

    if (!email) {
      setError("Email is missing for resend. Please go back and sign up again.");
      return;
    }

    try {
      setResending(true);
      setError(null);
      const response = await authApi.resendOtp({ email });
      setResendCooldown(60);
      setError(response.message);
    } catch (requestError) {
      const message = apiErrorMessage(requestError);
      setError(message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const otpValue = otp.join("");
    const validation = otpFormSchema.safeParse({ otp: otpValue });

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
     
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Verification code
          </label>
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                className="h-14 w-12 rounded-xl border border-slate-200 text-center text-lg font-semibold text-slate-950 outline-none focus:border-slate-950 sm:w-14"
              />
            ))}
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

        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
          <p>
            Didn’t receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendCooldown > 0}
            className="font-semibold text-slate-950 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in 00:${String(resendCooldown).padStart(2, "0")}`
                : "Resend OTP"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
