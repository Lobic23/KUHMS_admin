import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/users/")({
  component: UsersPage,
});

function UsersPage() {
  return (
	<div className="space-y-6">
	  User Management
	</div>
  );
}
