
import Link from "next/link";

export default function SuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1120] px-5 text-white">
      <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-[#111B2E] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
          !
        </div>

        <h1 className="text-2xl font-bold">
          Account Suspended
        </h1>

        <p className="mt-4 leading-7 text-slate-400">
          Your Businessgarh account has been suspended by an administrator.
          You currently cannot access community features.
        </p>

        <p className="mt-3 text-sm text-slate-500">
          If you believe this is a mistake, please contact the Businessgarh
          administration team.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
        >
          Return to Home
        </Link>

        <p className="mt-6 text-xs text-slate-600">
          Businessgarh · Connect. Collaborate. Grow.
        </p>
      </div>
    </main>
  );
}
