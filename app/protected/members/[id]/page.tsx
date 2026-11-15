
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

async function MemberProfileContent({ params }: Props) {
  await connection();

  const { id } = await params;

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    redirect("/auth/login");
  }

  const { data: member, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, interests")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load member profile.");
  }

  if (!member) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/protected/members"
          className="mb-8 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          ← Back to Community Members
        </Link>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl md:p-10">

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">

            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name || "Member"}
                className="h-28 w-28 rounded-full border-4 border-slate-700 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-800 text-5xl">
                👤
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-white">
                {member.full_name || "Businessgarh Member"}
              </h1>

              <p className="mt-2 text-sm text-blue-400">
                Businessgarh Community Member
              </p>
            </div>

          </div>

          <div className="mt-10 border-t border-slate-700 pt-8">

            <h2 className="text-xl font-bold text-white">
              Professional Bio
            </h2>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
              {member.bio || "This member hasn't added a professional bio yet."}
            </p>

          </div>

          <div className="mt-8 border-t border-slate-700 pt-8">

            <h2 className="text-xl font-bold text-white">
              Business Interests
            </h2>

            {member.interests && member.interests.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {member.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-400">
                No business interests added yet.
              </p>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}

export default function MemberProfilePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 p-8 text-slate-300">Loading member profile...</div>}>
      <MemberProfileContent params={params} />
    </Suspense>
  );
}
