import { Suspense } from "react";
import NewNoteClient from "./NewNoteClient";

export default function NewNotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-slate-500">
          Loading...
        </div>
      }
    >
      <NewNoteClient />
    </Suspense>
  );
}
