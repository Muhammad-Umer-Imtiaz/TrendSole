"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiLock, FiRefreshCw } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
import { apiErrorMessage, authApi } from "@/lib/api";
import { resetPasswordFormSchema } from "@/lib/validations/auth";

export default function ResetPasswordTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validation = resetPasswordFormSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Please review your new password."
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await authApi.resetPassword(params.token, {
        password: validation.data.password,
      });
      setSuccessMessage(response.message);
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Set New Password"
      title="Choose a fresh password"
      description="This page submits the new password together with the secure reset token provided by your backend."
      sideTitle="Finish the reset securely and get back into your account."
      sideDescription="Strong passwords and expiring reset links help keep storefront and dashboard access protected."
      sideCardTitle="Token validation in progress"
      sideCardDescription="If the token has expired or is invalid, the API will stop the reset and ask you to request a new link."
      sideIcon={FiRefreshCw}
    
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            New password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-slate-950 outline-none transition-colors focus:border-slate-950"
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
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm new password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your new password"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-slate-950 outline-none transition-colors focus:border-slate-950"
            />
           <button
  type="button"
  onClick={() => setShowConfirmPassword((current) => !current)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950 outline-none border-none focus:outline-none focus:ring-0 active:outline-none active:ring-0"
  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
>
  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
</button>
          </div>
        </div>

        {(error || successMessage) ? (
          <div
            className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
              error
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <p>{error ?? successMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Updating password..." : "Update password"}
          {!submitting && <FiArrowRight />}
        </button>
      </form>
    </AuthShell>
  );
}
