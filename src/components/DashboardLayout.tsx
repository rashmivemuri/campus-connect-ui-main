import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "organizer";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="relative w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <AppSidebar role={role} mobile />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <AppSidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
