
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OSMResult = {
  display_name?: string;
  name?: string;
  namedetails?: {
    name?: string;
  };
  address?: {
    amenity?: string;
    tourism?: string;
    shop?: string;
    leisure?: string;
    building?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [onlineLink, setOnlineLink] = useState("");

  const [minDate, setMinDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [message, setMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  // CALCULATE MINIMUM EVENT DATE
  useEffect(() => {
    const now = new Date();

    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    setMinDate(localDate.toISOString().slice(0, 16));
  }, []);

  // GET CURRENT LOCATION AND FIND NEARBY PLACE
  function handleGetLocation() {
    setMessage("");
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location detection is not supported by your browser."
      );
      return;
    }

    setGettingLocation(true);
    setLocationMessage("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const params = new URLSearchParams({
            format: "jsonv2",
            lat: String(latitude),
            lon: String(longitude),
            zoom: "18",
            addressdetails: "1",
            namedetails: "1",
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error("Location lookup failed.");
          }

          const result: OSMResult = await response.json();

          const address = result.address || {};

          // FIND A RECOGNISABLE LANDMARK
          const landmark =
            result.namedetails?.name ||
            result.name ||
            address.amenity ||
            address.tourism ||
            address.shop ||
            address.leisure ||
            address.building;

          // COLLECT AREA AND CITY DETAILS
          const area = [
            address.neighbourhood,
            address.suburb,
            address.city || address.town || address.village,
            address.state,
            address.country,
          ].filter(
            (part): part is string =>
              typeof part === "string" &&
              part.trim().length > 0 &&
              (!landmark ||
                part.toLowerCase() !== landmark.toLowerCase())
          );

          // CREATE CLEAN LOCATION NAME
          let locationName = "";

          if (landmark) {
            locationName = [
              landmark,
              ...area,
            ].join(", ");
          } else if (result.display_name) {
            locationName = result.display_name;
          }

          if (!locationName) {
            locationName =
              `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }

          // FILL VENUE WITHOUT SHOWING WEBSITE URL
          setVenue(locationName);

          setLocationMessage(
            "Nearby location found and added successfully!"
          );

        } catch (error) {
          console.error("OpenStreetMap error:", error);

          setVenue(
            `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          );

          setLocationMessage(
            "Coordinates added, but the place name could not be found. You can enter the venue manually."
          );
        } finally {
          setGettingLocation(false);
        }
      },

      (error) => {
        let errorMessage = "Unable to detect your location.";

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Location permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage =
            "Your current location is unavailable. Please try again.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage =
            "Location request timed out. Please try again.";
        }

        setLocationMessage(errorMessage);
        setGettingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  // CREATE EVENT
  async function handleCreateEvent(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter an event title.");
      return;
    }

    if (!eventDate) {
      setMessage("Please select an event date and time.");
      return;
    }

    if (!venue.trim() && !onlineLink.trim()) {
      setMessage(
        "Please enter a venue or an online meeting link."
      );
      return;
    }

    const selectedDate = new Date(eventDate);

    if (Number.isNaN(selectedDate.getTime())) {
      setMessage("Please select a valid event date and time.");
      return;
    }

    if (selectedDate <= new Date()) {
      setMessage("Please select a future date and time.");
      return;
    }

    if (
      onlineLink.trim() &&
      !/^https?:\/\/\S+$/i.test(onlineLink.trim())
    ) {
      setMessage(
        "Please enter a valid online meeting URL starting with http:// or https://."
      );
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // VERIFY LOGGED-IN MEMBER
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.push("/auth/login");
        return;
      }

      // INSERT EVENT INTO SUPABASE
      const { error } = await supabase
        .from("events")
        .insert({
          host_id: authData.user.id,
          title: title.trim(),
          description: description.trim(),
          event_date: selectedDate.toISOString(),
          venue: venue.trim(),
          online_link: onlineLink.trim(),
          status: "scheduled",
        });

      if (error) {
        setMessage(
          "Unable to create event: " + error.message
        );
        return;
      }

      router.push("/protected/events");
      router.refresh();

    } catch (error) {
      console.error("Event creation error:", error);

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* BACK TO EVENTS */}
        <button
          type="button"
          onClick={() => router.push("/protected/events")}
          className="mb-6 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
        >
          ← Back to Events
        </button>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg sm:p-8">

          <h1 className="text-3xl font-bold text-white">
            Create an Event
          </h1>

          <p className="mt-2 text-slate-400">
            Organize an event and invite the Businessgarh community.
          </p>

          <form
            onSubmit={handleCreateEvent}
            className="mt-8 space-y-5"
          >

            {/* EVENT TITLE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Event Title *
              </label>

              <input
                type="text"
                required
                minLength={3}
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* EVENT DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Event Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* DATE AND TIME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Date and Time *
              </label>

              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={minDate || undefined}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* VENUE / LOCATION */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Venue / Location
              </label>

              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter event venue or location"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="mt-3 flex items-center gap-2 rounded-lg border border-blue-500 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                📍
                {gettingLocation
                  ? "Finding Nearby Places..."
                  : "Use Current Location"}
              </button>

              {locationMessage && (
                <p
                  role="status"
                  className="mt-2 text-sm text-blue-300"
                >
                  {locationMessage}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Allow location permission when your browser asks.
                You can edit the detected venue manually.
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Map data © OpenStreetMap contributors.
              </p>
            </div>

            {/* ONLINE MEETING LINK */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Online Meeting Link
              </label>

              <input
                type="url"
                value={onlineLink}
                onChange={(e) => setOnlineLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* ERROR MESSAGE */}
            {message && (
              <div
                role="alert"
                className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300"
              >
                {message}
              </div>
            )}

            {/* CREATE EVENT BUTTON */}
            <button
              type="submit"
              disabled={saving || gettingLocation}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating Event..." : "Create Event"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
