
import { Suspense } from "react";
import EventDetails from "@/components/event-details";

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
          Loading event details...
        </main>
      }
    >
      <EventDetails />
    </Suspense>
  );
}
