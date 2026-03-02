import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/dashboard/hostel/residents")({
  component: ResidentsPage,
});

function ResidentsPage() {
  return <div >Residet</div>;
}
