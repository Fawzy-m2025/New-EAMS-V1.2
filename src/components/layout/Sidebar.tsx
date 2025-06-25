import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  PieChart,
  Monitor,
  Shield,
  Truck,
  Home,
  Package,
  Wrench,
  Building,
  ClipboardList,
  BarChart3,
  FileText,
  UserCheck,
  DollarSign,
  Boxes,
  Zap,
  Layers,
  Activity,
  TrendingUp,
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
  badge?: string;
  color?: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
    color: "text-blue-500"
  },
  {
    title: "Asset Management",
    icon: Package,
    color: "text-green-500",
    children: [
      { title: "Asset Registry", icon: TrendingUp, path: "/assets/registry", badge: "NEW" },
      { title: "Asset Tracking", icon: Monitor, path: "/assets/tracking" },
      { title: "Depreciation", icon: BarChart3, path: "/assets/depreciation" },
      { title: "Performance", icon: PieChart, path: "/assets/performance" }
    ]
  },
  {
    title: "Maintenance (CMMS)",
    icon: Wrench,
    color: "text-orange-500",
    badge: "12",
    children: [
      { title: "Work Orders", icon: ClipboardList, path: "/maintenance/work-orders", badge: "NEW" },
      { title: "Condition Monitoring", icon: Monitor, path: "/maintenance/condition-monitoring", badge: "NEW" },
      { title: "Preventive", icon: Calendar, path: "/maintenance/preventive" },
      { title: "Predictive", icon: Monitor, path: "/maintenance/predictive" },
      { title: "Spare Parts", icon: Boxes, path: "/maintenance/spare-parts" }
    ]
  },
  {
    title: "Financial (ERP)",
    icon: DollarSign,
    color: "text-purple-500",
    children: [
      { title: "Dashboard", icon: PieChart, path: "/financial" },
      { title: "General Ledger", icon: FileText, path: "/financial/gl" },
      { title: "Accounts Payable", icon: DollarSign, path: "/financial/ap" },
      { title: "Accounts Receivable", icon: BarChart3, path: "/financial/ar" },
      { title: "Budgeting", icon: PieChart, path: "/financial/budgeting" }
    ]
  },
  {
    title: "Human Resources",
    icon: Users,
    color: "text-pink-500",
    children: [
      { title: "Employees", icon: Users, path: "/hr/employees" },
      { title: "Payroll", icon: DollarSign, path: "/hr/payroll" },
      { title: "Time & Attendance", icon: Calendar, path: "/hr/attendance" },
      { title: "Performance", icon: UserCheck, path: "/hr/performance" },
      { title: "Training", icon: FileText, path: "/hr/training" }
    ]
  },
  {
    title: "Inventory",
    icon: Boxes,
    color: "text-cyan-500",
    children: [
      { title: "Stock Management", icon: Boxes, path: "/inventory/stock" },
      { title: "Procurement", icon: Truck, path: "/inventory/procurement" },
      { title: "Warehouses", icon: Building, path: "/inventory/warehouses" },
      { title: "Suppliers", icon: Users, path: "/inventory/suppliers" }
    ]
  },
  {
    title: "Projects",
    icon: ClipboardList,
    color: "text-indigo-500",
    children: [
      { title: "Project List", icon: ClipboardList, path: "/projects/list" },
      { title: "Planning", icon: Calendar, path: "/projects/planning" },
      { title: "Resources", icon: Users, path: "/projects/resources" },
      { title: "Timeline", icon: BarChart3, path: "/projects/timeline" }
    ]
  },
  {
    title: "Fleet Management",
    icon: Truck,
    color: "text-red-500",
    children: [
      { title: "Vehicles", icon: Truck, path: "/fleet/vehicles" },
      { title: "Maintenance", icon: Wrench, path: "/fleet/maintenance" },
      { title: "Fuel Management", icon: DollarSign, path: "/fleet/fuel" },
      { title: "Driver Management", icon: Users, path: "/fleet/drivers" }
    ]
  },
  {
    title: "HSE & Safety",
    icon: Shield,
    color: "text-yellow-500",
    children: [
      { title: "Incidents", icon: FileText, path: "/hse/incidents" },
      { title: "Safety Audits", icon: ClipboardList, path: "/hse/audits" },
      { title: "Compliance", icon: Shield, path: "/hse/compliance" },
      { title: "Training", icon: Users, path: "/hse/training" }
    ]
  },
  {
    title: "Engineering",
    icon: Settings,
    color: "text-teal-500",
    children: [
      { title: "Mechanical", icon: Settings, path: "/engineering/mechanical" },
      { title: "Electrical", icon: Zap, path: "/engineering/electrical" },
      { title: "Civil", icon: Building, path: "/engineering/civil" },
      { title: "Instrumentation", icon: Monitor, path: "/engineering/instrumentation" }
    ]
  },
  {
    title: "Analytics & Reports",
    icon: BarChart3,
    color: "text-violet-500",
    children: [
      { title: "Dashboards", icon: LayoutDashboard, path: "/analytics/dashboards" },
      { title: "KPI Dashboard", icon: Gauge, path: "/analytics/kpi-dashboard" },
      { title: "Financial Reports", icon: DollarSign, path: "/analytics/financial" },
      { title: "Asset Reports", icon: Package, path: "/analytics/assets" },
      { title: "Custom Reports", icon: FileText, path: "/analytics/custom-reports" }
    ]
  }
];

export { menuItems };

export function Sidebar({ open, toggleSidebar }: SidebarProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "Asset Management": true,
    "Maintenance (CMMS)": true,
    "Analytics & Reports": true
  });
  const drawerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  // Focus trap for Drawer
  useEffect(() => {
    if (isTablet && open && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
    }
  }, [isTablet, open]);

  function toggleExpand(title: string) {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }

  // Ripple effect for menu items
  function handleRipple(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.className = "ripple";
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }

  function renderMenuItem(item: MenuItem, index: number) {
    const isExpanded = expandedItems[item.title];
    if (item.children) {
      return (
        <div key={index} className="sidebar-section">
          <button
            onClick={e => { handleRipple(e); toggleExpand(item.title); }}
            className={cn(
              "sidebar-link w-full flex justify-between items-center group rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none overflow-hidden relative",
              isExpanded && "text-sidebar-primary bg-primary/10 border-l-4 border-primary",
              !isExpanded && "hover:bg-primary/10 hover:scale-[1.03]"
            )}
            aria-expanded={isExpanded}
            aria-label={`Expand ${item.title} section`}
            tabIndex={0}
          >
            <span className="flex items-center gap-3">
              <span className="relative">
                <item.icon size={18} className={cn("transition-colors", item.color)} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold animate-bounce" aria-live="polite" aria-atomic="true">
                    {item.badge}
                  </span>
                )}
              </span>
              {open && (
                <span className="font-medium">{item.title}</span>
              )}
            </span>
            {open && (
              <ChevronRight
                size={16}
                className={cn(
                  "transition-transform duration-300",
                  isExpanded && "transform rotate-90"
                )}
              />
            )}
          </button>
          {/* Sub-menu: no animation, just show/hide */}
          {isExpanded && open && (
            <div className="ml-7 mt-2 space-y-1 border-l border-sidebar-border/30 pl-4 overflow-hidden">
              {item.children.map((child, childIdx) => (
                <NavLink
                  key={childIdx}
                  to={child.path || "#"}
                  tabIndex={0}
                  aria-label={child.title}
                >
                  {({ isActive }) => (
                    <div
                      className={cn(
                        "sidebar-link text-sm py-2 relative rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none overflow-hidden",
                        isActive
                          ? "bg-primary/10 border-l-4 border-primary text-primary scale-105 hover:bg-primary/20"
                          : "hover:bg-primary/10"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <span className="icon-ripple" onClick={(e) => handleRipple(e as React.MouseEvent<HTMLSpanElement, MouseEvent>)}>
                          <child.icon size={16} className="text-sidebar-foreground/70" />
                        </span>
                        <span>{child.title}</span>
                        {child.badge && (
                          <span className={cn(
                            "ml-auto text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold animate-pulse",
                            child.badge === "NEW" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          )} aria-live="polite" aria-atomic="true">
                            {child.badge}
                          </span>
                        )}
                      </span>
                    </div>
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
        tabIndex={0}
        aria-label={item.title}
      >
        {({ isActive }) => (
          <div
            className={cn(
              "sidebar-link flex items-center gap-3 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none overflow-hidden relative",
              isActive
                ? "bg-primary/10 border-l-4 border-primary text-primary scale-105 hover:bg-primary/20"
                : "hover:bg-primary/10"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="relative icon-ripple" onClick={(e) => handleRipple(e as React.MouseEvent<HTMLSpanElement, MouseEvent>)}>
              <item.icon size={18} className={cn("transition-colors", item.color)} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold animate-bounce" aria-live="polite" aria-atomic="true">
                  {item.badge}
                </span>
              )}
            </span>
            {open && <span className="font-medium">{item.title}</span>}
          </div>
        )}
      </NavLink>
    );
  }

  if (isMobile) {
    return null;
  }

  const sidebarContent = (
    <>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/50 bg-primary/10 backdrop-blur-md rounded-t-xl shadow-xl">
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full pulse-dot animate-pulse"></div>
          </div>
          {open && (
            <div className="flex flex-col flex-1">
              <span className="font-bold text-lg text-sidebar-foreground gradient-text">
                TEMS
              </span>
              <span className="text-xs text-sidebar-foreground/60 -mt-1">
                Enterprise Management
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Menu Items */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin" role="navigation" aria-label="Sidebar main navigation">
        {/* Quick Stats */}
        {open && (
          <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="text-xs text-sidebar-foreground/60 mb-2">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-sidebar-foreground">All Systems Operational</span>
            </div>
          </div>
        )}
        {menuItems.map((item, index) => renderMenuItem(item, index))}
        {/* Bottom Section */}
        {open && (
          <div className="pt-4 mt-auto">
            <div className="p-3 bg-gradient-to-r from-sidebar-accent/30 to-transparent rounded-lg">
              <div className="text-xs text-sidebar-foreground/60 mb-1">Version 2.1.0</div>
              <div className="text-xs text-sidebar-foreground/40">Last updated today</div>
            </div>
          </div>
        )}
      </nav>
    </>
  );

  if (isTablet) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex"
            aria-modal="true"
            role="dialog"
            aria-label="Navigation drawer"
            style={{ pointerEvents: open ? 'auto' : 'none' }}
          >
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={toggleSidebar} tabIndex={-1} aria-label="Close navigation drawer overlay" />
            <motion.div
              className="p-0 w-72 max-w-full h-full rounded-xl shadow-xl backdrop-blur-md bg-sidebar/80"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              tabIndex={0}
            >
              <div className="h-full bg-sidebar rounded-xl">
                {sidebarContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop (default):
  return (
    open && (
      <aside
        className={cn(
          "bg-primary/10 backdrop-blur-md border-r border-sidebar-border transition-all duration-300 ease-in-out z-30 relative shadow-xl rounded-xl",
          open ? "w-72 translate-x-0" : "-translate-x-full w-16"
        )}
        role="navigation"
        aria-label="Main sidebar"
      >
        {sidebarContent}
      </aside>
    )
  );
}

// Ripple effect CSS (add to your global CSS or Tailwind config):
// .ripple {
//   position: absolute;
//   border-radius: 50%;
//   transform: scale(0);
//   animation: ripple 0.6s linear;
//   background: rgba(0,0,0,0.15);
//   pointer-events: none;
//   z-index: 10;
// }
// @keyframes ripple {
//   to { transform: scale(2); opacity: 0; }
// }
