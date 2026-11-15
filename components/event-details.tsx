
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type EventData = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string | null;
  online_link: string | null;
  status: string;
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

export default function EventDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState<EventData | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [attendees, setAttendees] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");

  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // LOAD EVENT, HOST AND ATTENDEES
  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      setLoading(true);
      setMessage("");

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/auth/login");
          return;
        }

        if (cancelled) return;

        setCurrentUserId(user.id);

        const { data: eventData, error: eventError } =
          await supabase
            .from("events")
            .select(
              "id, host_id, title, description, event_date, venue, online_link, status"
            )
            .eq("id", eventId)
            .maybeSingle();

        if (eventError) throw eventError;

        if (!eventData) {
          if (!cancelled) {
            setMessage("Event not found.");
            setEvent(null);
          }
          return;
        }

        if (cancelled) return;

        setEvent(eventData);

        const { data: rsvpData, error: rsvpError } =
          await supabase
            .from("event_rsvps")
            .select("user_id")
            .eq("event_id", eventId);

        if (rsvpError) throw rsvpError;

        const attendeeIds = [
          ...new Set(
            (rsvpData || []).map((rsvp) => rsvp.user_id)
          ),
        ];

        setIsAttending(attendeeIds.includes(user.id));

        const profileIds = [
          ...new Set([eventData.host_id, ...attendeeIds]),
        ];

        const { data: profiles, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", profileIds);

        if (profileError) throw profileError;

        if (cancelled) return;

        const profileList = profiles || [];

        setHost(
          profileList.find(
            (profile) => profile.id === eventData.host_id
          ) || null
        );

        setAttendees(
          attendeeIds
            .map((id) =>
              profileList.find((profile) => profile.id === id)
            )
            .filter((profile): profile is Profile =>
              Boolean(profile)
            )
        );
      } catch (error) {
        console.error("Event loading error:", error);

        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load event details."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [eventId, router, refreshKey]);

  // RSVP TO EVENT
  async function handleRSVP() {
    setActionLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("event_rsvps")
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      setMessage("You have successfully registered for this event!");
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to RSVP. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // CANCEL RSVP
  async function handleCancelRSVP() {
    setActionLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      setMessage("Your RSVP has been cancelled.");
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to cancel RSVP."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // CANCEL EVENT - HOST ONLY
  async function handleCancelEvent() {
    if (!event) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this event? Members will no longer be able to RSVP."
    );

    if (!confirmed) return;

    setActionLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      if (user.id !== event.host_id) {
        throw new Error(
          "Only the event creator can cancel this event."
        );
      }

      const { data, error } = await supabase
        .from("events")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .eq("host_id", user.id)
        .eq("status", "scheduled")
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "Event could not be cancelled. It may already be cancelled."
        );
      }

      setMessage("Event cancelled successfully!");
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      console.error("Event cancellation error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to cancel event."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
        Loading event details...
      </main>
    );
  }

  // EVENT NOT FOUND
  if (!event) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Event Not Found
          </h1>

          <p className="mt-3 text-slate-400">
            {message || "This event may have been removed."}
          </p>

          <Link
            href="/protected/events"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const isHost = currentUserId === event.host_id;
  const eventDate = new Date(event.event_date);
  const isPastEvent = eventDate <= new Date();
  const isCancelled = event.status === "cancelled";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/protected/events"
          className="mb-6 inline-block text-sm font-semibold text-blue-400 transition hover:text-blue-300"
        >
          ← Back to Community Events
        </Link>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl sm:p-10">

          {/* EVENT TITLE */}
          <div className="border-b border-slate-700 pb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Businessgarh Community Event
            </p>

            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {event.title}
            </h1>

            <p className="mt-4 text-slate-300">
              {event.description ||
                "No event description provided."}
            </p>

            {isCancelled && (
              <p className="mt-4 inline-block rounded-lg bg-red-950 px-3 py-2 text-sm font-semibold text-red-300">
                This event has been cancelled.
              </p>
            )}
          </div>

          {/* EVENT DETAILS */}
          <div className="grid gap-6 py-7 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                DATE AND TIME
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {eventDate.toLocaleDateString("en-IN", {
                  dateStyle: "full",
                })}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {eventDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                VENUE / LOCATION
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {event.venue || "Not specified"}
              </p>

              {event.venue && (
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(event.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Find on OpenStreetMap →
                </a>
              )}
            </div>

            {event.online_link && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ONLINE MEETING
                </p>

                <a
                  href={event.online_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block break-all font-semibold text-blue-400 hover:text-blue-300"
                >
                  Join Online Event →
                </a>
              </div>
            )}
          </div>

          {/* HOST */}
          <div className="border-t border-slate-700 py-7">
            <h2 className="text-lg font-bold text-white">
              Event Host
            </h2>

            <div className="mt-4 flex items-center gap-4">
              {host?.avatar_url ? (
                <img
                  src={host.avatar_url}
                  alt={host.full_name}
                  className="h-14 w-14 rounded-full border border-slate-600 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-2xl">
                  👤
                </div>
              )}

              <div>
                <p className="font-semibold text-white">
                  {host?.full_name || "Businessgarh Member"}
                </p>

                <p className="text-sm text-slate-400">
                  Event Organizer
                </p>
              </div>
            </div>
          </div>

          {/* RSVP AND HOST CONTROLS */}
          <div className="border-t border-slate-700 py-7">
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-white">
                  Attend This Event
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {attendees.length} members attending
                </p>
              </div>

              {/* HOST BUTTONS */}
              {isHost && !isCancelled && !isPastEvent && (
                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-blue-300">
                    You are the host
                  </span>

                  <Link
                    href={`/protected/events/${event.id}/edit`}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
                  >
                    Edit Event
                  </Link>

                  <button
                    type="button"
                    onClick={handleCancelEvent}
                    disabled={actionLoading}
                    className="rounded-xl border border-red-500 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Please wait..."
                      : "Cancel Event"}
                  </button>

                </div>
              )}

              {/* RSVP BUTTONS */}
              {!isHost &&
                !isCancelled &&
                !isPastEvent &&
                (isAttending ? (
                  <button
                    type="button"
                    onClick={handleCancelRSVP}
                    disabled={actionLoading}
                    className="rounded-xl border border-red-500 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Please wait..."
                      : "Cancel RSVP"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRSVP}
                    disabled={actionLoading}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Please wait..."
                      : "RSVP to Event"}
                  </button>
                ))}

              {isPastEvent && !isCancelled && (
                <span className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-400">
                  Event has ended
                </span>
              )}

            </div>

            {message && (
              <p
                role="status"
                className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-300"
              >
                {message}
              </p>
            )}
          </div>

          {/* ATTENDEE LIST */}
          <div className="border-t border-slate-700 pt-7">
            <h2 className="text-xl font-bold text-white">
              Attendees ({attendees.length})
            </h2>

            {attendees.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {attendees.map((attendee) => (
                  <Link
                    key={attendee.id}
                    href={`/protected/members/${attendee.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4 transition hover:border-blue-500 hover:bg-slate-800"
                  >
                    {attendee.avatar_url ? (
                      <img
                        src={attendee.avatar_url}
                        alt={attendee.full_name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700">
                        👤
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-white">
                        {attendee.full_name || "Community Member"}
                      </p>

                      <p className="text-xs text-blue-400">
                        View Profile →
                      </p>
                    </div>
                  </Link>
                ))}

              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-sm text-slate-400">
                No members have registered yet. Be the first to RSVP!
              </p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
