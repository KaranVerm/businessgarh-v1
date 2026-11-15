
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function MembersContent() {
  await connection();

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    redirect("/auth/login");
  }

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, interests")
    .order("full_name", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-6">
        <div className="rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
          Unable to load members: {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold text-white">
          Community Members
        </h1>

        <p className="mt-2 text-slate-300">
          Discover and connect with the Businessgarh community.
        </p>

        <p className="mt-6 text-sm text-slate-400">
          {members?.length || 0} members
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {members?.map((member) => (
            <Link
              key={member.id}
              href={`/protected/members/${member.id}`}
              className="block rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-800"
            >
              <div className="flex items-center gap-4">

                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name || "Member"}
                    className="h-16 w-16 rounded-full border-2 border-slate-600 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-2xl text-white">
                    👤
                  </div>
                )}

                <div>
                  <h2 className="font-bold text-white">
                    {member.full_name || "Businessgarh Member"}
                  </h2>

                  <p className="text-sm text-slate-400">
                    Community Member
                  </p>
                </div>

              </div>

              <p className="mt-4 text-sm text-slate-300">
                {member.bio || "No professional bio added yet."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {member.interests?.map((interest: string) => (
                  <span
                    key={interest}
                    className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm font-semibold text-blue-400">
                View Profile →
              </p>

            </Link>
          ))}

        </div>

        {(!members || members.length === 0) && (
          <p className="mt-8 text-center text-slate-400">
            No community members found yet.
          </p>
        )}

      </div>
    </main>
  );
}

export default function MembersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-8 text-slate-300">
          Loading members...
        </div>
      }
    >
      <MembersContent />
    </Suspense>
  );
}
