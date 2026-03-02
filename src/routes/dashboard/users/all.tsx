import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/users/all")({
  component: AllUsersPage,
});

function AllUsersPage() {
  return <div className="space-y-6">all users</div>;
}
