import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/hostel/allocations")({
  component: AllocationsPage,
});

function AllocationsPage() {
  return <div className="space-y-6">Allocation</div>;
}
