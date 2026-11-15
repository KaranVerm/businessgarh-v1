
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  const [hostId, setHostId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [onlineLink, setOnlineLink] = useState("");

  // LOAD EVENT
  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
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

        const { data: event, error: eventError } = await supabase
          .from("events")
          .select(
            "id, host_id, title, description, event_date, venue, online_link, status"
          )
          .eq("id", eventId)
          .maybeSingle();

        if (eventError) throw eventError;

        if (!event) {
          setError("Event not found.");
          return;
        }

        if (cancelled) return;

        setHostId(event.host_id);

        if (event.host_id !== user.id) {
          setError("Only the event creator can edit this event.");
          return;
        }

        if (event.status === "cancelled") {
          setError("A cancelled event cannot be edited.");
          return;
        }

        setTitle(event.title);
        setDescription(event.description || "");
        setEventDate(
          new Date(event.event_date).toISOString().slice(0, 16)
        );
        setVenue(event.venue || "");
        setOnlineLink(event.online_link || "");
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load event."
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
  }, [eventId, router]);

  // SAVE CHANGES
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || title.trim().length < 3) {
      setError("Event title must contain at least 3 characters.");
      return;
    }

    if (!eventDate || new Date(eventDate).getTime() <= Date.now()) {
      setError("Please choose a future date and time.");
      return;
    }

    if (!venue.trim() && !onlineLink.trim()) {
      setError("Please provide a venue or an online meeting link.");
      return;
    }

    if (onlineLink.trim()) {
      try {
        const url = new URL(onlineLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        setError("Please enter a valid online meeting URL.");
        return;
      }
    }

    setSaving(true);

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

      if (user.id !== hostId || !currentUserId || user.id !== currentUserId) {
        setError("You are not authorized to edit this event.");
        return;
      }

      const { data, error: updateError } = await supabase
        .from("events")
        .update({
          title: title.trim(),
          description: description.trim(),
          event_date: new Date(eventDate).toISOString(),
          venue: venue.trim(),
          online_link: onlineLink.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .eq("host_id", user.id)
        .eq("status", "scheduled")
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data) {
        throw new Error(
          "Event was not updated. Check that you are the host and the event is still scheduled."
        );
      }

      setSuccess("Event updated successfully!");

      setTimeout(() => {
        router.push(`/protected/events/${eventId}`);
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to update event."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
        Loading event...
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Unable to Edit Event
          </h1>

          <p className="mt-4 text-red-400">{error}</p>

          <Link
            href={`/protected/events/${eventId}`}
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Back to Event
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <Link
          href={`/protected/events/${eventId}`}
          className="mb-6 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          ← Back to Event
        </Link>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl sm:p-10">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Businessgarh Events
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Edit Event
          </h1>

          <p className="mt-2 text-slate-400">
            Update your event information below.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Event Title *
              </label>

              <input
                type="text"
                required
                minLength={3}
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Describe your event..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Date and Time *
              </label>

              <input
                type="datetime-local"
                required
                min={new Date().toISOString().slice(0, 16)}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Venue / Location
              </label>

              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Enter event venue"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Online Meeting Link
              </label>

              <input
                type="url"
                value={onlineLink}
                onChange={(e) => setOnlineLink(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="https://meet.google.com/..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
