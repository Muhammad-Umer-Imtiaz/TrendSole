"use client";

import Link from "next/link";
import { FiKey, FiMail, FiShield } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";

export default function ResetPasswordLandingPage() {
  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Use your secure reset link"
      description="Password resets are completed from the tokenized link sent by your backend. Open that email to continue."
      sideTitle="Every reset request is tied to a short-lived secure token."
      sideDescription="This keeps password recovery professional and safe by preventing direct access without a backend-issued reset link."
      sideCardTitle="Token-based protection"
      sideCardDescription="The API validates the token, expiry window, and new password before updating the account."
      sideIcon={FiShield}
      footer={
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/forgot-password" className="font-semibold text-slate-950 hover:text-slate-700">
            Request a reset link
          </Link>
          <Link href="/login" className="font-semibold text-slate-600 hover:text-slate-950">
            Return to login
          </Link>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700">
              <FiMail />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Check your inbox</h3>
              <p className="mt-1 text-sm text-slate-500">
                The email from your backend contains the secure URL for the next step.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700">
              <FiKey />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Open the token route</h3>
              <p className="mt-1 text-sm text-slate-500">
                Once you land on the token page, you can submit the new password directly to the API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
