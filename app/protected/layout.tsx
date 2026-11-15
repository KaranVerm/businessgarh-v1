
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ProtectedNavigation } from "@/components/protected-navigation";
import { AuthButton } from "@/components/auth-button";

async function ProtectedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Unable to verify your account status. Please try again.");
  }

  if (profile.is_suspended) {
    redirect("/auth/suspended");
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Suspense
        fallback={
          <header className="h-[72px] border-b border-white/[0.08] bg-[#0B1120]" />
        }
      >
        <ProtectedNavigation
          account={
            <Suspense
              fallback={
                <div className="h-9 w-20 animate-pulse rounded-lg bg-white/10" />
              }
            >
              <AuthButton />
            </Suspense>
          }
        />
      </Suspense>

      <div className="min-h-[calc(100vh-140px)]">
        {children}
      </div>

      <footer className="border-t border-white/[0.08] bg-[#080D19] px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div>
            <p className="font-semibold">
              Business<span className="text-blue-400">garh</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Connect. Collaborate. Grow.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 Businessgarh. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1120]" />
      }
    >
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}
