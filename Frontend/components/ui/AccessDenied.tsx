"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export default function AccessDenied({
  title = "Access denied",
  description = "You do not have permission to view this area. Contact an administrator if this access should be available to you.",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-lg font-semibold text-red-600">
          403
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Return to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
