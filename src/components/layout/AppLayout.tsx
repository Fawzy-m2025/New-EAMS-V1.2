import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { NotificationProvider } from "@/components/ui/notification-system";
import { ContextTooltipProvider } from "@/components/ui/context-tooltip";
import { PersonalizationProvider } from "@/hooks/use-personalization";
import { ThemeColorsProvider } from "@/hooks/use-theme-colors";
import { AnimationProvider } from "@/components/ui/animation-provider";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeColorsProvider>
      <PersonalizationProvider>
        <AnimationProvider>
          <ContextTooltipProvider>
            <NotificationProvider>
              <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
                {!isMobile && (
                  <Sidebar open={sidebarOpen || isTablet} toggleSidebar={toggleSidebar} />
                )}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar toggleSidebar={toggleSidebar} />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mx-auto max-w-7xl animate-fade-in">
                      {children}
                    </div>
                  </main>
                </div>
                <FloatingActionButton />
                {isMobile && <BottomNav />}
              </div>
            </NotificationProvider>
          </ContextTooltipProvider>
        </AnimationProvider>
      </PersonalizationProvider>
    </ThemeColorsProvider>
  );
}
