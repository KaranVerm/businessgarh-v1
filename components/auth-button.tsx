
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function signOutAction() {
  "use server";

  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/auth/login");
}

export async function AuthButton() {
  // Wait for the incoming request before reading authentication data.
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const isLoggedIn = !error && !!data?.claims;

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          Login
        </Link>

        <Link
          href="/auth/sign-up"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="hidden text-sm text-slate-300 sm:inline">
        Welcome back
      </span>

      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
