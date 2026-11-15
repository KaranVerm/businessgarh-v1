
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function DashboardContent() {
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, bio, interests")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch error:", profileError.message);
  }

  const fullName = profile?.full_name || "Businessgarh Member";

  return (
    <main className="min-h-screen bg-[#080D19] text-white">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D19]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">

          <Link href="/protected" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-xl font-bold">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Businessgarh
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/protected" className="text-sm text-white transition hover:text-blue-400">
              Home
            </Link>
            <Link href="/protected/members" className="text-sm text-slate-300 transition hover:text-white">
              Community
            </Link>
            <Link href="/protected/chat" className="text-sm text-slate-300 transition hover:text-white">
              Discussions
            </Link>
            <Link href="/protected/events" className="text-sm text-slate-300 transition hover:text-white">
              Events
            </Link>
          </nav>

          <Link
            href="/protected/profile"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm font-medium sm:block">
              My Profile
            </span>
          </Link>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold tracking-widest text-blue-300">
                THE BUSINESSGARH NETWORK
              </span>
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Build connections.
              <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Create opportunities.
              </span>
              Grow together.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 md:text-lg">
              A community for ambitious people, entrepreneurs and
              professionals to connect, collaborate and exchange ideas.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/protected/members"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Explore Community →
              </Link>

              <Link
                href="/protected/events"
                className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Discover Events
              </Link>
            </div>
          </div>

          {/* MEMBER WELCOME PANEL */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#14213B] to-[#0D1425] p-8 shadow-2xl shadow-blue-950/20">

            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile photograph"
                  className="h-16 w-16 rounded-full border-2 border-blue-400/50 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold tracking-widest text-blue-300">
                  MEMBER SPACE
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Welcome, {fullName}!
                </h2>
              </div>
            </div>

            <div className="my-7 h-px bg-white/10" />

            <h3 className="text-lg font-semibold">Your journey starts here.</h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Connect with members, participate in discussions and
              discover opportunities within the Businessgarh network.
            </p>

            <Link
              href="/protected/profile"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Manage your profile →
            </Link>

          </div>
        </div>
      </section>

      {/* COMMUNITY INTRODUCTION */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">

        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-400">
              EXPLORE BUSINESSGARH
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Everything starts with a connection.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Discover people, exchange ideas and take part in a growing community.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* MEMBERS */}
          <Link
            href="/protected/members"
            className="group rounded-2xl border border-white/10 bg-[#111B2D] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-[#16243A]"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-2xl text-blue-400">
              ♙
            </div>

            <h3 className="text-xl font-bold">Member Directory</h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Discover professionals, entrepreneurs and people
              who share your interests.
            </p>

            <p className="mt-6 text-sm font-semibold text-blue-400 transition group-hover:text-blue-300">
              Explore Members →
            </p>
          </Link>

          {/* CHAT */}
          <Link
            href="/protected/chat"
            className="group rounded-2xl border border-white/10 bg-[#111B2D] p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-[#16243A]"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-2xl text-indigo-400">
              ◈
            </div>

            <h3 className="text-xl font-bold">Community Discussions</h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Share your thoughts, discuss ideas and interact
              with other community members.
            </p>

            <p className="mt-6 text-sm font-semibold text-indigo-400 transition group-hover:text-indigo-300">
              Join Discussions →
            </p>
          </Link>

          {/* EVENTS */}
          <Link
            href="/protected/events"
            className="group rounded-2xl border border-white/10 bg-[#111B2D] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-[#16243A]"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl text-emerald-400">
              ◷
            </div>

            <h3 className="text-xl font-bold">Community Events</h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Discover upcoming events, meet people and
              participate in community activities.
            </p>

            <p className="mt-6 text-sm font-semibold text-emerald-400 transition group-hover:text-emerald-300">
              Discover Events →
            </p>
          </Link>

        </div>
      </section>

      {/* PROFILE ABOUT SECTION */}
      <section className="border-y border-white/10 bg-[#0C1423]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:px-10">

          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-400">
              YOUR IDENTITY
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Tell the community about yourself.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Your profile helps other members understand your
              background, interests and professional journey.
            </p>

            <Link
              href="/protected/profile"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Edit My Profile →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111B2D] p-7">
            <h3 className="text-lg font-bold">About Me</h3>
            <p className="mt-3 leading-7 text-slate-400">
              {profile?.bio || "Add your professional introduction to help other members know you."}
            </p>

            <div className="my-6 h-px bg-white/10" />

            <h3 className="font-bold">My Interests</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.interests?.length ? (
                profile.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No interests added yet.
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050914]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 md:flex-row md:items-center md:px-10">

          <div>
            <h3 className="text-lg font-bold">Businessgarh</h3>
            <p className="mt-1 text-sm text-slate-500">
              Connect. Collaborate. Grow.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <Link href="/protected/members" className="transition hover:text-white">
              Community
            </Link>
            <Link href="/protected/chat" className="transition hover:text-white">
              Discussions
            </Link>
            <Link href="/protected/events" className="transition hover:text-white">
              Events
            </Link>
            <Link href="/protected/profile" className="transition hover:text-white">
              Profile
            </Link>
          </div>

          <p className="text-xs text-slate-600">
            © 2026 Businessgarh
          </p>

        </div>
      </footer>

    </main>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080D19] text-slate-300">
          Loading Businessgarh...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
