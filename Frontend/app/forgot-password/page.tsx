"use client";

import Link from "next/link";
import { useState } from "react";
import { FiAlertCircle, FiArrowRight, FiMail, FiRefreshCw } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
import { apiErrorMessage, authApi } from "@/lib/api";
import { forgotPasswordFormSchema } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validation = forgotPasswordFormSchema.safeParse({ email });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Please enter a valid email address."
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await authApi.forgotPassword(validation.data);
      setSuccessMessage(response.message);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password Recovery"
      title="Reset your password"
      description="Enter your account email and we will ask the backend to send a reset link to your inbox."
      sideTitle="Regain access without needing help from the dashboard team."
      sideDescription="This recovery flow uses the backend reset token endpoint and opens the secure reset page from the email link."
      sideCardTitle="Email-based recovery"
      sideCardDescription="If the account exists, the API sends a secure tokenized link that expires automatically."
      sideIcon={FiRefreshCw}
      
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>
         <div className="relative">
  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />

  <input
    type="email"
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    placeholder="you@example.com"
    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-950 outline-none transition-colors focus:border-slate-950"
  />
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
          {submitting ? "Sending reset link..." : "Send reset link"}
          {!submitting && <FiArrowRight />}
        </button>
      </form>
    </AuthShell>
  );
}
