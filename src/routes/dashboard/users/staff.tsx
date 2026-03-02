import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/users/staff")({
  component: StaffPage,
});

function StaffPage() {
  return <div className="space-y-6">Staff</div>;
}
