import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Home, Wrench, Bot, BarChart3, FileText, ChevronDown,
  Smartphone, Brain, Gauge, TrendingUp, Activity
} from 'lucide-react';

interface SmartNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  children?: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home
  },
  {
    id: 'work-management',
    label: 'Work Management',
    icon: Wrench,
    badge: '12',
    children: [
      { id: 'work-orders', label: 'Work Orders', icon: Wrench },
      { id: 'mobile', label: 'Mobile View', icon: Smartphone }
    ]
  },
  {
    id: 'ai-tools',
    label: 'AI Tools',
    icon: Bot,
    badge: 'NEW',
    children: [
      { id: 'ai-creator', label: 'AI Creator', icon: Bot, badge: 'NEW' },
      { id: 'ai-insights', label: 'AI Insights', icon: Brain },
      { id: 'automated-generator', label: 'Auto Work Orders', icon: Brain, badge: 'AI' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { id: 'analytics', label: 'Basic Analytics', icon: BarChart3 },
      { id: 'advanced-stats', label: 'Advanced Stats', icon: TrendingUp },
      { id: 'kpi-dashboard', label: 'KPI Dashboard', icon: Gauge },
      { id: 'statistical-charts', label: 'Statistical Charts', icon: Activity }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText
  }
];

export function SmartNavigation({ activeTab, onTabChange }: SmartNavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const isActiveTab = (itemId: string, children?: any[]) => {
    if (activeTab === itemId) return true;
    if (children) {
      return children.some(child => child.id === activeTab);
    }
    return false;
  };

  const getBadgeStyle = (badge: string) => {
    if (badge === 'NEW') return 'bg-green-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-2">
      {navigationItems.map((item) => {
        const isActive = isActiveTab(item.id, item.children);

        if (item.children) {
          return (
            <DropdownMenu
              key={item.id}
              open={openDropdown === item.id}
              onOpenChange={(open) => setOpenDropdown(open ? item.id : null)}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    relative gap-2 transition-all duration-300 hover-scale
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-primary/10 hover:text-primary'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''
                    }`} />
                  {item.badge && (
                    <Badge
                      className={`absolute -top-1 -right-1 h-5 w-auto px-1.5 text-xs ${getBadgeStyle(item.badge)}`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl"
                align="start"
              >
                {item.children.map((child) => (
                  <DropdownMenuItem
                    key={child.id}
                    onClick={() => {
                      console.log("Changing tab to:", child.id);
                      onTabChange(child.id);
                      setOpenDropdown(null);
                    }}
                    className={`
          flex items-center gap-3 cursor-pointer transition-all duration-200
          ${activeTab === child.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/10 hover:text-primary'
                      }
        `}
                  >
                    <child.icon className="h-4 w-4" />
                    <span>{child.label}</span>
                    {child.badge && (
                      <Badge className={`ml-auto h-4 w-auto px-1.5 text-xs ${getBadgeStyle(child.badge)}`}>
                        {child.badge}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            onClick={() => onTabChange(item.id)}
            className={`
              relative gap-2 transition-all duration-300 hover-scale
              ${isActive
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-primary/10 hover:text-primary'
              }
            `}
          >
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <Badge
                className={`absolute -top-1 -right-1 h-5 w-auto px-1.5 text-xs ${getBadgeStyle(item.badge)}`}
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
