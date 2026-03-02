import { createFileRoute, } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/hostel/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  return <div> rooms</div>;
}
