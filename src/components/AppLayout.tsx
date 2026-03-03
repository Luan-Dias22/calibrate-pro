import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppLayout() {
  const { user, role, signOut } = useAuth();

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    tecnico: "Técnico",
    visualizador: "Visualizador",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <span className="text-sm font-medium text-muted-foreground">
                Sistema de Gestão de Calibração
              </span>
            </div>
            <div className="flex items-center gap-3">
              {role && (
                <Badge variant="secondary" className="text-xs">
                  {roleLabel[role] ?? role}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
