
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  MessageCircle,
  CalendarDays,
  UserRound,
  Sparkles,
  BriefcaseBusiness,
  Compass,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type AccentStyle = {
  icon: string;
  hover: string;
  link: string;
};

const accentStyles: Record<string, AccentStyle> = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    hover: "group-hover:border-blue-500/40",
    link: "text-blue-400",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    hover: "group-hover:border-violet-500/40",
    link: "text-violet-400",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    hover: "group-hover:border-emerald-500/40",
    link: "text-emerald-400",
  },
};

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
  const firstName = fullName.trim().split(" ")[0] || "Member";
  const initial = fullName.trim().charAt(0).toUpperCase() || "B";

  const features = [
    {
      title: "Member Directory",
      description:
        "Discover entrepreneurs, professionals and people with shared interests.",
      href: "/protected/members",
      icon: Users,
      label: "Explore members",
      accent: "blue",
    },
    {
      title: "Community Discussions",
      description:
        "Exchange ideas, ask questions and participate in conversations.",
      href: "/protected/chat",
      icon: MessageCircle,
      label: "Join discussions",
      accent: "violet",
    },
    {
      title: "Community Events",
      description:
        "Discover upcoming gatherings and connect with the community.",
      href: "/protected/events",
      icon: CalendarDays,
      label: "Discover events",
      accent: "emerald",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0B1120] text-white">
      {/* WELCOME SECTION */}
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-600/[0.10] blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/[0.08] blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_0.8fr] md:px-10 md:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-semibold tracking-wide text-blue-300">
              <Sparkles size={14} />
              YOUR COMMUNITY SPACE
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Welcome back,
              <span className="mt-2 block text-blue-400">
                {firstName}.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 md:text-lg">
              Great things happen when people connect. Discover new
              perspectives, exchange ideas and build meaningful relationships
              with the Businessgarh community.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/protected/members"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Explore community
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/protected/events"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.09]"
              >
                View events
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          {/* MEMBER CARD */}
          <div className="relative flex flex-col justify-center">
            <div className="rounded-2xl border border-white/[0.09] bg-[#111B2D] p-7 shadow-2xl shadow-black/20 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest text-slate-400">
                  YOUR MEMBERSHIP
                </span>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-xs font-medium text-emerald-300">
                  Active
                </span>
              </div>

              <div className="mt-8 flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${fullName}'s profile`}
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                    {initial}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">
                    {fullName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Businessgarh Member
                  </p>
                </div>
              </div>

              <div className="my-7 border-t border-white/[0.08]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Make your profile stand out
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Share your background and interests with other members.
                  </p>
                </div>

                <Link
                  href="/protected/profile"
                  aria-label="Edit your profile"
                  className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition hover:bg-blue-500/20"
                >
                  <ArrowUpRight size={19} />
                </Link>
              </div>

              <Link
                href="/protected/profile"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Manage profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY FEATURES */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400">
            <Compass size={15} />
            EXPLORE THE NETWORK
          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your community, your opportunities.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Everything you need to connect, collaborate and participate in
            Businessgarh.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const styles = accentStyles[feature.accent];

            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group rounded-2xl border border-white/[0.08] bg-[#111B2D] p-7 transition duration-300 hover:-translate-y-1 hover:bg-[#152238] ${styles.hover}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-7 text-lg font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>

                <div
                  className={`mt-7 flex items-center gap-2 text-sm font-semibold ${styles.link}`}
                >
                  {feature.label}

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROFILE AND INTERESTS */}
      <section className="border-y border-white/[0.07] bg-[#0D1627]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:px-10 md:py-20">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400">
              <UserRound size={15} />
              YOUR IDENTITY
            </div>

            <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
              Let people know what makes you unique.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
              Your profile is your introduction to the community. Add your
              professional background, interests and a little about yourself
              so members can get to know you.
            </p>

            <Link
              href="/protected/profile"
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Update my profile
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111B2D] p-7 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">About me</h3>
              <BriefcaseBusiness size={19} className="text-slate-500" />
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              {profile?.bio ||
                "Your story starts here. Add a short introduction to help other members understand your background and professional journey."}
            </p>

            <div className="my-7 border-t border-white/[0.08]" />

            <h3 className="text-sm font-semibold text-white">
              My interests
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.interests?.length ? (
                profile.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="rounded-lg border border-blue-400/15 bg-blue-500/[0.08] px-3 py-2 text-xs font-medium text-blue-300"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No interests added yet. Update your profile to add some.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-[#0B1120] text-sm text-slate-400">
          Loading Businessgarh...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
