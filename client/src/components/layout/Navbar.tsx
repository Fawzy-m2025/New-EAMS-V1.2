import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, Settings, LogOut, User, Command } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { CommandPalette } from "@/components/ui/command-palette";
import { useState, useEffect } from "react";
import { glassCardClass } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NavbarProps {
  toggleSidebar: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const { theme } = useTheme();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className={cn("h-16 border-b border-border/50 bg-background/95 backdrop-blur-xl z-20 sticky top-0 transition-all duration-300 shadow-xl shadow-primary/10 focus-within:ring-primary/30", glassCardClass)}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-accent transition-all duration-200 hover:scale-105 micro-bounce"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center gap-3">
              <h1 className="text-xl font-bold gradient-text">
                Toshka Financial Insight Hub
              </h1>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                Enterprise
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="relative w-full group"
            >
              <div className="flex items-center gap-3 px-4 py-2 bg-accent/30 hover:bg-accent/50 rounded-lg transition-all duration-200 border border-border/50 hover:border-border group-hover:shadow-lg">
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
                  Search anything...
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <Command className="h-2.5 w-2.5" />
                    K
                  </kbd>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Button for Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden micro-bounce hover:bg-accent transition-all duration-200"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative micro-bounce hover:bg-accent transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass-card border-0">
                <div className="p-3 border-b border-border/50">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground">You have 3 unread messages</p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {[
                    {
                      title: "System Update Available",
                      description: "Version 2.1.1 is ready to install",
                      time: "2 minutes ago",
                      type: "info"
                    },
                    {
                      title: "Maintenance Scheduled",
                      description: "Equipment PM-001 due tomorrow",
                      time: "1 hour ago",
                      type: "warning"
                    },
                    {
                      title: "Budget Alert",
                      description: "Q4 budget 85% utilized",
                      time: "3 hours ago",
                      type: "alert"
                    }
                  ].map((notification, index) => (
                    <div key={index} className="p-3 hover:bg-accent/30 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'info' ? 'bg-blue-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          } animate-pulse`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative micro-bounce hover:bg-accent transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-0">
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">John Doe</div>
                      <div className="text-sm text-muted-foreground">john.doe@toshka.com</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs border-primary/20 text-primary">
                    Administrator
                  </Badge>
                </div>
                <DropdownMenuItem className="hover:bg-accent/50 transition-all duration-200">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/50 transition-all duration-200">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}
