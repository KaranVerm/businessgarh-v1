
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminMembersTable from "@/components/admin-members-table";

export default function AdminMembersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080D19] p-10 text-white">
          Loading members...
        </main>
      }
    >
      <AdminMembersContent />
    </Suspense>
  );
}

async function AdminMembersContent() {
  await connection();

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    redirect("/protected");
  }

  const { data: members, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, bio, interests, role, is_suspended, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#080D19] p-8 text-white">
        <p className="text-red-400">
          Unable to load members: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D19] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/protected/admin"
          className="mb-7 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Member Management
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  View and manage registered community members.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111B2B] px-5 py-3">
            <p className="text-xs text-slate-400">Total registered members</p>
            <p className="mt-1 text-2xl font-bold">
              {members?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-9">
          <AdminMembersTable members={members ?? []} />
        </div>
      </div>
    </main>
  );
}
