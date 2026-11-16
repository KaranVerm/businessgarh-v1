
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Search,
  UserRound,
  ShieldCheck,
  Eye,
  Trash2,
} from "lucide-react";

import {
  suspendMember,
  reactivateMember,
  deleteMember,
} from "@/app/protected/admin/members/actions";

type Member = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  role: string;
  is_suspended: boolean;
  created_at: string | null;
};

export default function AdminMembersTable({
  members,
}: {
  members: Member[];
}) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // SEARCH MEMBERS
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) => {
      const name = member.full_name?.toLowerCase() ?? "";
      const bio = member.bio?.toLowerCase() ?? "";

      const interests =
        member.interests?.join(" ").toLowerCase() ?? "";

      return (
        name.includes(query) ||
        bio.includes(query) ||
        interests.includes(query)
      );
    });
  }, [members, search]);

  // SUSPEND MEMBER
  function handleSuspend(member: Member) {
    if (member.role === "admin") {
      window.alert(
        "Administrator accounts cannot be suspended here."
      );
      return;
    }

    const reason = window.prompt(
      `Enter the suspension reason for ${member.full_name}:`
    );

    if (!reason || !reason.trim()) {
      return;
    }

    if (reason.trim().length > 500) {
      window.alert(
        "The reason cannot exceed 500 characters."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to suspend ${member.full_name}?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await suspendMember(member.id, reason.trim());

        window.alert(
          `${member.full_name} has been suspended successfully.`
        );

        router.refresh();
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to suspend this member."
        );
      }
    });
  }

  // REACTIVATE MEMBER
  function handleReactivate(member: Member) {
    if (member.role === "admin") {
      window.alert(
        "Administrator accounts cannot be changed here."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reactivate ${member.full_name}?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await reactivateMember(member.id);

        window.alert(
          `${member.full_name} has been reactivated successfully.`
        );

        router.refresh();
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to reactivate this member."
        );
      }
    });
  }

  // PERMANENTLY DELETE MEMBER
  function handleDelete(member: Member) {
    if (member.role !== "member") {
      window.alert(
        "Only regular member accounts can be deleted here."
      );
      return;
    }

    const confirmationName = window.prompt(
      `Permanently delete ${member.full_name}?\n\nType the member's full name to confirm:`
    );

    if (!confirmationName) return;

    if (
      confirmationName.trim().toLowerCase() !==
      member.full_name.trim().toLowerCase()
    ) {
      window.alert(
        "The name does not match. Deletion cancelled."
      );
      return;
    }

    const confirmed = window.confirm(
      `FINAL WARNING:\n\nThis permanently deletes ${member.full_name}'s account, profile, messages, hosted events and RSVPs.\n\nThis action cannot be undone.\n\nContinue?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await deleteMember(
          member.id,
          confirmationName
        );

        window.alert(result.message);

        router.refresh();
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to delete this member."
        );
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">

      {/* HEADER AND SEARCH */}
      <div className="border-b border-white/[0.08] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-lg font-semibold">
              Registered Members
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Search and manage community members.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, bio or interest..."
              className="w-full rounded-xl border border-white/10 bg-[#080D19] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

        </div>
      </div>

      {/* MEMBER LIST */}
      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center">

          <UserRound className="mx-auto h-9 w-9 text-slate-600" />

          <p className="mt-4 font-medium text-white">
            No members found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Try another search term.
          </p>

        </div>
      ) : (
        <div className="divide-y divide-white/[0.07]">

          {filteredMembers.map((member) => {
            const initials =
              member.full_name
                ?.split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "M";

            return (
              <div
                key={member.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >

                {/* MEMBER INFORMATION */}
                <div className="flex min-w-0 items-center gap-4">

                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={`${member.full_name}'s profile`}
                      className="h-12 w-12 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-300">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold text-white">
                        {member.full_name || "Unnamed Member"}
                      </h3>

                      {member.role === "admin" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-300">

                          <ShieldCheck className="h-3 w-3" />

                          Admin

                        </span>
                      )}

                    </div>

                    <p className="mt-1 max-w-xl truncate text-sm text-slate-400">
                      {member.bio || "No bio added"}
                    </p>

                    {member.interests?.length ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Interests: {member.interests.join(", ")}
                      </p>
                    ) : null}

                  </div>
                </div>

                {/* STATUS AND ACTIONS */}
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      member.is_suspended
                        ? "bg-red-500/10 text-red-300"
                        : "bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {member.is_suspended
                      ? "Suspended"
                      : "Active"}
                  </span>

                  <Link
                    href={`/protected/members/${member.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    View profile
                  </Link>

                  {/* MEMBER-ONLY ACTIONS */}
                  {member.role === "member" && (
                    <>
                      {member.is_suspended ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleReactivate(member)
                          }
                          className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isPending
                            ? "Processing..."
                            : "Reactivate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleSuspend(member)
                          }
                          className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isPending
                            ? "Processing..."
                            : "Suspend"}
                        </button>
                      )}

                      {/* PERMANENT DELETE */}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleDelete(member)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />

                        {isPending
                          ? "Processing..."
                          : "Delete permanently"}
                      </button>
                    </>
                  )}

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* FOOTER */}
      <div className="border-t border-white/[0.08] px-5 py-4 text-xs text-slate-500 sm:px-6">
        Showing {filteredMembers.length} of {members.length} members
      </div>

    </section>
  );
}
