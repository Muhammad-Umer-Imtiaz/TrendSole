import Link from "next/link";

export default function OtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">
      <div className="w-full max-w-xl rounded-[32px] border border-black/8 bg-white px-8 py-10 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">OTP flow not enabled here</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          This admin frontend is configured for direct JWT login provided by your
          backend authentication service.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
