// src/routes/dashboard/hostel/index.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/hostel/")({
  component: HostelPage,
});

function HostelPage() {
  return (
    <div className="space-y-6">
      title="Hostel Management" description="Overview of all blocks, rooms, residents and
      complaints."
    </div>
  );
}
