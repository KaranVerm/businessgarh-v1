
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function EventsContent() {
  await connection();

  const supabase = await createClient();

  // VERIFY AUTHENTICATED MEMBER
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    redirect("/auth/login");
  }

  // FETCH UPCOMING EVENTS
  const { data: events, error } = await supabase
    .from("events")
    .select(
      "id, host_id, title, description, event_date, venue, online_link"
    )
    .eq("status", "scheduled")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-red-300">
        Unable to load events: {error.message}
      </main>
    );
  }

  // FETCH EVENT HOSTS
  const hostIds = [
    ...new Set((events || []).map((event) => event.host_id)),
  ];

  let profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  }[] = [];

  if (hostIds.length > 0) {
    const { data: hostProfiles, error: hostError } =
      await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", hostIds);

    if (hostError) {
      console.error("Host profiles error:", hostError.message);
    } else {
      profiles = hostProfiles || [];
    }
  }

  // FETCH RSVP RECORDS
  const eventIds = (events || []).map((event) => event.id);

  let rsvps: { event_id: string }[] = [];

  if (eventIds.length > 0) {
    const { data: rsvpData, error: rsvpError } =
      await supabase
        .from("event_rsvps")
        .select("event_id")
        .in("event_id", eventIds);

    if (rsvpError) {
      console.error("RSVP fetch error:", rsvpError.message);
    } else {
      rsvps = rsvpData || [];
    }
  }

  // HELPER FUNCTIONS
  const getHost = (hostId: string) =>
    profiles.find((profile) => profile.id === hostId);

  const getAttendeeCount = (eventId: string) =>
    rsvps.filter((rsvp) => rsvp.event_id === eventId).length;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Community Events
            </h1>

            <p className="mt-2 text-slate-300">
              Discover events and connect with the community.
            </p>
          </div>

          <Link
            href="/protected/events/create"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            + Create Event
          </Link>
        </div>

        {/* EVENT COUNT */}
        <p className="mt-8 text-sm text-slate-400">
          {events?.length || 0} upcoming events
        </p>

        {/* EVENT CARDS */}
        {events && events.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {events.map((event) => {
              const host = getHost(event.host_id);

              return (
                <Link
                  key={event.id}
                  href={`/protected/events/${event.id}`}
                  className="group block rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-800"
                >
                  <h2 className="text-xl font-bold text-white transition group-hover:text-blue-400">
                    {event.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm text-slate-300">
                    {event.description ||
                      "No event description provided."}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-700 pt-4">

                    {/* DATE */}
                    <div>
                      <p className="text-xs text-slate-400">
                        DATE AND TIME
                      </p>

                      <p className="mt-1 text-sm text-white">
                        {new Date(event.event_date).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>

                    {/* LOCATION */}
                    <div>
                      <p className="text-xs text-slate-400">
                        LOCATION
                      </p>

                      <p className="mt-1 break-words text-sm text-white">
                        {event.venue ||
                          event.online_link ||
                          "Location not specified"}
                      </p>
                    </div>

                    {/* HOST */}
                    <div>
                      <p className="text-xs text-slate-400">
                        HOST
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {host?.avatar_url ? (
                          <img
                            src={host.avatar_url}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs">
                            👤
                          </div>
                        )}

                        <p className="text-sm text-white">
                          {host?.full_name || "Businessgarh Member"}
                        </p>
                      </div>
                    </div>

                    {/* ATTENDEES */}
                    <div>
                      <p className="text-xs text-slate-400">
                        ATTENDEES
                      </p>

                      <p className="mt-1 text-sm font-semibold text-blue-400">
                        {getAttendeeCount(event.id)} members attending
                      </p>
                    </div>

                  </div>

                  {/* VIEW DETAILS */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-4">
                    <span className="text-sm font-semibold text-blue-400">
                      View Event Details
                    </span>

                    <span className="text-blue-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}

          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold text-white">
              No upcoming events
            </h2>

            <p className="mt-2 text-slate-400">
              Be the first to organize an event for the community!
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-8 text-slate-300">
          Loading community events...
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
