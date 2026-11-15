
import Link from "next/link";
import {
  ArrowRight,
  Users,
  MessageSquare,
  CalendarDays,
  UserRound,
  ShieldCheck,
  Sparkles,
  Globe2,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Meet your community",
    description:
      "Discover members, explore their interests, and connect with people who share your ambitions.",
    number: "01",
  },
  {
    icon: MessageSquare,
    title: "Conversations that matter",
    description:
      "Join community discussions, exchange ideas, ask questions, and learn from one another.",
    number: "02",
  },
  {
    icon: CalendarDays,
    title: "Make things happen",
    description:
      "Discover upcoming events, participate in activities, and create opportunities to meet.",
    number: "03",
  },
];

const highlights = [
  "One shared community",
  "Member profiles and discovery",
  "Real-time community discussions",
  "Events and attendee lists",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080D19] text-white">
      {/* Navigation */}
      <header className="relative z-20 border-b border-white/[0.08]">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Globe2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Business<span className="text-blue-400">garh</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-sm text-slate-400 md:flex">
            <a href="#about" className="transition hover:text-white">
              About
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#community" className="transition hover:text-white">
              Community
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Join community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[550px] w-[850px] -translate-x-1/2 rounded-full bg-blue-600/[0.12] blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-28 pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-36 lg:pt-32">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-4 py-2 text-xs font-medium tracking-wide text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              A community built around connection
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Where ideas meet
              <span className="block text-blue-400">opportunity.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              A place to connect with people, exchange ideas, discover
              opportunities, and grow together through a shared community.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Become a member
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Member login
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              A dedicated space for community and collaboration
            </div>
          </div>

          {/* Visual panel */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/[0.08] blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-[#101827] p-5 shadow-2xl shadow-black/30 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-sm font-semibold">Community space</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your place to connect and collaborate
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  Connected
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Member network</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Discover people and their interests
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex -space-x-2">
                    {["bg-blue-500", "bg-violet-500", "bg-cyan-500", "bg-indigo-500"].map(
                      (color, index) => (
                        <div
                          key={index}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#101827] ${color} text-xs font-bold`}
                        >
                          {["M", "A", "R", "S"][index]}
                        </div>
                      )
                    )}
                    <div className="flex h-9 items-center rounded-full border-2 border-[#101827] bg-slate-700 px-3 text-xs text-slate-300">
                      Your network
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                    <MessageSquare className="h-6 w-6 text-blue-400" />
                    <p className="mt-5 text-sm font-semibold">Discussions</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Share ideas and exchange knowledge
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                    <CalendarDays className="h-6 w-6 text-violet-400" />
                    <p className="mt-5 text-sm font-semibold">Events</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Find and participate in activities
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-blue-400/15 bg-blue-500/[0.07] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                    <Sparkles className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Your next connection starts here.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Join the conversation.
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-5 hidden rounded-xl border border-white/10 bg-[#172236] px-5 py-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10">
                  <UserRound className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold">One community</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Many possibilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-y border-white/[0.07] bg-[#0D1422] py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              About Businessgarh
            </p>
            <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              More than a network.
              <span className="text-slate-400">
                {" "}A place to grow together.
              </span>
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-slate-400">
              Businessgarh brings people together in one shared digital space.
              Build connections, take part in meaningful conversations, and
              discover community events that bring ideas to life.
            </p>
            <p className="mt-5 text-base leading-8 text-slate-400">
              Whether you want to share what you know or learn something new,
              there's room to participate and contribute.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              What you can do
            </p>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to
              <span className="text-blue-400"> participate.</span>
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              Simple tools designed to help members stay connected and make
              the most of their community.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.number}
                  className="group rounded-2xl border border-white/[0.08] bg-[#0D1422] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-[#111C2E]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium tracking-widest text-slate-600">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-8 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community */}
      <section
        id="community"
        className="border-y border-white/[0.07] bg-[#0D1422] py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Built for participation
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Your community.
              <span className="block text-blue-400">
                Your next opportunity.
              </span>
            </h2>

            <p className="mt-6 max-w-lg leading-8 text-slate-400">
              A connected experience that makes it easier to find members,
              join discussions, and take part in events — all in one place.
            </p>

            <Link
              href="/auth/sign-up"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold transition hover:bg-blue-500"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111B2B] p-7 sm:p-9">
            <h3 className="text-lg font-semibold">
              A connected experience
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Everything in one shared community space.
            </p>

            <div className="mt-8 space-y-5">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-400/20 bg-[#101D33] px-7 py-16 text-center sm:px-14">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Join Businessgarh
            </p>

            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Great things start with a connection.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
              Become part of a community where people connect, share ideas, and
              grow together.
            </p>

            <Link
              href="/auth/sign-up"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-sm font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Join the community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#070B13]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Globe2 className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold">
              Business<span className="text-blue-400">garh</span>
            </span>
          </Link>

          <p className="text-sm text-slate-500">
            Connecting people. Creating opportunities.
          </p>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/auth/login" className="transition hover:text-white">
              Login
            </Link>
            <Link href="/auth/sign-up" className="transition hover:text-white">
              Sign up
            </Link>
          </div>
        </div>

        <div className="border-t border-white/[0.06] py-5 text-center text-xs text-slate-600">
          © 2026 Businessgarh. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
