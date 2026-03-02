import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/hostel/complaints")({
  component: ComplaintsPage,
});

function ComplaintsPage() {
  return <div> complain</div>;
}
