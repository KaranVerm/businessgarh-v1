
import { Suspense } from "react";
import EditEvent from "@/components/edit-event";

export default function EditEventPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
          Loading edit event page...
        </main>
      }
    >
      <EditEvent />
    </Suspense>
  );
}
