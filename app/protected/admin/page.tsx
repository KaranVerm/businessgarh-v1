
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ShieldCheck,
  Users,
  MessageSquare,
  CalendarDays,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080D19] text-white">
          <p className="text-sm text-slate-400">
            Loading admin dashboard...
          </p>
        </main>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  await connection();

  const supabase = await createClient();

  // Verify authenticated user
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  // Verify admin role from Supabase
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/protected");
  }

  const adminName = profile.full_name || "Administrator";

  return (
    <main className="min-h-screen bg-[#080D19] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/protected"
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to community
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Businessgarh administration
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-xs text-emerald-300">
              Administrator access
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {adminName}
            </p>
          </div>
        </div>

        {/* Welcome */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-[#111B2B] p-7 sm:p-9">
          <p className="text-sm font-medium text-blue-400">
            CONTROL CENTER
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Welcome to Businessgarh Admin
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Manage community members, maintain discussions, and oversee
            community events from one central dashboard.
          </p>
        </section>

        {/* Management */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Management
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Administrative tools for your community.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ManagementCard
              icon={<Users className="h-6 w-6" />}
              title="Members"
              description="Review and manage registered community members."
            />

            <ManagementCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Messages"
              description="Review and moderate inappropriate discussions."
            />

            <ManagementCard
              icon={<CalendarDays className="h-6 w-6" />}
              title="Events"
              description="Review and moderate community events."
            />

            <ManagementCard
              icon={<Settings className="h-6 w-6" />}
              title="Administration"
              description="Manage administrative access and settings."
            />
          </div>
        </section>

        {/* Security */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-[#0D1422] p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold">
              Access protection
            </h2>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            This page verifies the authenticated user's role against
            the Supabase profiles table. Users without a verified
            admin role are redirected to the community dashboard.
          </p>
        </section>

      </div>
    </main>
  );
}

function ManagementCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101827] p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <span className="text-xs font-medium text-slate-500">
          Coming next
        </span>
      </div>
    </div>
  );
}
