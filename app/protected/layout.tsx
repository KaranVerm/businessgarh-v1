
import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

const navigation = [
  { name: "Dashboard", href: "/protected" },
  { name: "Members", href: "/protected/members" },
  { name: "Community Chat", href: "/protected/chat" },
  { name: "Events", href: "/protected/events" },
  { name: "My Profile", href: "/protected/profile" },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* SHARED NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">

          {/* LOGO */}
          <Link
            href="/protected"
            className="text-xl font-bold tracking-tight text-white"
          >
            Business<span className="text-blue-500">garh</span>
          </Link>

          {/* NAVIGATION LINKS */}
          <nav className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-blue-600 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* ACCOUNT */}
          <Suspense fallback={<div className="h-9 w-20" />}>
            <AuthButton />
          </Suspense>

        </div>
      </header>

      {/* PAGE CONTENT */}
      <div className="min-h-[calc(100vh-140px)]">
        {children}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 px-5 py-6 text-center text-xs text-slate-500">
        © 2026 Businessgarh. All rights reserved.
      </footer>

    </main>
  );
}
