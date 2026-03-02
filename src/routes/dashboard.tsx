

import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuthStore } from "@/store/authStore";
import { AppSidebar, navData } from "@/components/Sidebar/app-sidebar";
import { BellIcon, CalendarIcon,  PersonSimpleIcon, SignOutIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const allItems = navData.navMain.flatMap((n) => [{ title: n.title, url: n.url }, ...n.items]);
  const currentTitle = allItems.find((i) => i.url === pathname)?.title ?? "Dashboard";

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Topbar */}
            <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-sm font-bold">{currentTitle}</h1>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="relative rounded-xl p-2 hover:bg-accent">
                  <BellIcon size={16} className="text-muted-foreground" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                </button>
                <button className="rounded-xl p-2 hover:bg-accent">
                  <CalendarIcon size={16} className="text-muted-foreground" />
                </button>
                <div className="ml-2 flex  items-center justify-center ">
                  <PersonSimpleIcon/>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/" });
                  }}
                  className="ml-1 rounded-xl p-2 hover:bg-accent"
                  title="Logout"
                >
                  <SignOutIcon size={16} className="text-muted-foreground" />
                </button>
              </div>
            </header>

            {/* ← child routes render here */}
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
