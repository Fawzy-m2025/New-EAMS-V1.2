import { useState } from "react";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar, menuItems } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export function BottomNav() {
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
        "Asset Management": true,
        "Maintenance (CMMS)": true,
        "Analytics & Reports": true
    });

    function toggleExpand(title: string) {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    }

    // Drawer menu rendering (with spin animation for active icon)
    function renderMenuItem(item, index) {
        const isExpanded = expandedItems[item.title];
        if (item.children) {
            return (
                <div key={index} className="sidebar-section">
                    <button
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                            "sidebar-link w-full flex justify-between items-center group rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none overflow-hidden relative",
                            isExpanded && "text-sidebar-primary bg-primary/10 border-l-4 border-primary",
                            !isExpanded && "hover:bg-accent/20 hover:scale-[1.03]"
                        )}
                        aria-expanded={isExpanded}
                        aria-label={`Expand ${item.title} section`}
                        tabIndex={0}
                    >
                        <span className="flex items-center gap-3">
                            <span className="relative">
                                <motion.span animate={isExpanded ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.5 }}>
                                    <item.icon size={18} className={cn("transition-colors", item.color)} />
                                </motion.span>
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold animate-bounce" aria-live="polite" aria-atomic="true">
                                        {item.badge}
                                    </span>
                                )}
                            </span>
                            <span className="font-medium">{item.title}</span>
                        </span>
                        <Menu size={16} className={cn("transition-transform duration-300", isExpanded && "transform rotate-90")} />
                    </button>
                    {isExpanded && (
                        <div className="ml-7 mt-2 space-y-1 border-l border-sidebar-border/30 pl-4">
                            {item.children.map((child, childIdx) => (
                                <NavLink
                                    key={childIdx}
                                    to={child.path || "#"}
                                    className={({ isActive }) => cn(
                                        "sidebar-link text-sm py-2 relative rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none overflow-hidden",
                                        isActive ? "bg-primary/10 border-l-4 border-primary text-primary scale-105" : "hover:bg-accent/20 hover:scale-[1.03] text-sidebar-foreground/80"
                                    )}
                                    aria-label={child.title}
                                    tabIndex={0}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <motion.span animate={isActive ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.5 }}>
                                                <child.icon size={16} className="text-sidebar-foreground/70" />
                                            </motion.span>
                                            <span>{child.title}</span>
                                            {child.badge && (
                                                <span className={cn(
                                                    "ml-auto text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold animate-pulse",
                                                    child.badge === "NEW" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                                )} aria-live="polite" aria-atomic="true">
                                                    {child.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <NavLink
                key={index}
                to={item.path || "#"}
                className={({ isActive }) => cn(
                    "sidebar-link flex items-center gap-3 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none overflow-hidden relative",
                    isActive ? "bg-primary/10 border-l-4 border-primary text-primary scale-105" : "hover:bg-accent/20 hover:scale-[1.03] text-sidebar-foreground/80"
                )}
                aria-label={item.title}
                tabIndex={0}
            >
                {({ isActive }) => (
                    <>
                        <motion.span animate={isActive ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.5 }}>
                            <item.icon size={18} className={cn("transition-colors", item.color)} />
                        </motion.span>
                        <span className="font-medium">{item.title}</span>
                    </>
                )}
            </NavLink>
        );
    }

    if (!isMobile) return null;

    return (
        <>
            {/* Floating menu button */}
            <button
                className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all hover:scale-110"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
            >
                <Menu size={28} />
            </button>
            {/* Drawer with full sidebar menu */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-xl p-0">
                    <div className="p-4 flex items-center justify-between border-b border-border">
                        <span className="font-bold text-lg">Menu</span>
                        <ThemeSwitcher aria-label="Toggle theme" />
                    </div>
                    <nav className="p-4 space-y-1" role="navigation" aria-label="Mobile full menu">
                        {menuItems.map(renderMenuItem)}
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    );
} 