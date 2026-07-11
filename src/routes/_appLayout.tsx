import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
