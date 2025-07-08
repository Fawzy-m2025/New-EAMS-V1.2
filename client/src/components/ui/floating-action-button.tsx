
import React, { useState } from 'react';
import { Plus, MessageSquare, Settings, HelpCircle, Zap, Calculator, FileText, Users, Package, MapPin, QrCode, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface ActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'create' | 'navigate' | 'tools';
  shortcut?: string;
}

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic actions based on current route
  const getActions = (): ActionItem[] => {
    const baseActions: ActionItem[] = [
      {
        id: 'new-report',
        label: 'New Financial Report',
        icon: FileText,
        category: 'create',
        action: () => navigate('/analytics/custom-reports'),
        shortcut: 'Ctrl+N'
      },
      {
        id: 'calculator',
        label: 'Quick Calculator',
        icon: Calculator,
        category: 'tools',
        action: () => console.log('Open calculator modal'),
        shortcut: 'Ctrl+C'
      },
      {
        id: 'team-chat',
        label: 'Team Chat',
        icon: MessageSquare,
        category: 'navigate',
        action: () => console.log('Open team chat'),
        shortcut: 'Ctrl+M'
      },
      {
        id: 'employees',
        label: 'Employee Directory',
        icon: Users,
        category: 'navigate',
        action: () => navigate('/hr/employees')
      },
      {
        id: 'help',
        label: 'Help & Support',
        icon: HelpCircle,
        category: 'tools',
        action: () => console.log('Open help center'),
        shortcut: 'F1'
      }
    ];

    // Add asset-specific actions when on asset pages
    if (location.pathname.startsWith('/assets')) {
      const assetActions: ActionItem[] = [
        {
          id: 'scan-asset',
          label: 'Scan QR Code',
          icon: QrCode,
          category: 'tools',
          action: () => console.log('Open QR scanner'),
          shortcut: 'Ctrl+Q'
        },
        {
          id: 'track-location',
          label: 'Track Asset Location',
          icon: MapPin,
          category: 'navigate',
          action: () => navigate('/assets/tracking')
        },
        {
          id: 'add-asset',
          label: 'Add New Asset',
          icon: Package,
          category: 'create',
          action: () => console.log('Open add asset modal'),
          shortcut: 'Ctrl+A'
        }
      ];

      // Add page-specific actions
      if (location.pathname === '/assets/tracking') {
        assetActions.push({
          id: 'bulk-checkout',
          label: 'Bulk Check-out',
          icon: Clock,
          category: 'tools',
          action: () => console.log('Open bulk check-out modal')
        });
      }

      // Add performance-specific actions
      if (location.pathname === '/assets/performance') {
        assetActions.push(
          {
            id: 'generate-report',
            label: 'Generate Performance Report',
            icon: Zap,
            category: 'create',
            action: () => console.log('Generate performance report'),
            shortcut: 'Ctrl+R'
          },
          {
            id: 'benchmark-analysis',
            label: 'Benchmark Analysis',
            icon: Zap,
            category: 'tools',
            action: () => console.log('Open benchmark analysis')
          }
        );
      }

      return [...assetActions, ...baseActions];
    }

    return baseActions;
  };

  const actions = getActions();

  const categoryColors = {
    create: 'bg-green-500 hover:bg-green-600',
    navigate: 'bg-blue-500 hover:bg-blue-600',
    tools: 'bg-purple-500 hover:bg-purple-600',
  };

  const categoryLabels = {
    create: 'Create New',
    navigate: 'Navigation',
    tools: 'Quick Tools',
  };

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="mb-4 space-y-4 animate-fade-in">
          {Object.entries(groupedActions).map(([category, categoryActions]) => (
            <div key={category} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground text-right pr-2">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </div>
              {categoryActions.map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center justify-end gap-3 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="glass-card px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium whitespace-nowrap">
                        {action.label}
                      </span>
                      {action.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-muted rounded">
                          {action.shortcut}
                        </kbd>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => {
                      action.action();
                      setIsExpanded(false);
                    }}
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                      categoryColors[action.category],
                      "animate-slide-up"
                    )}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110",
          "bg-primary hover:bg-primary/90",
          isExpanded ? "rotate-45" : "rotate-0"
        )}
      >
        <Plus className="h-6 w-6 text-white transition-transform duration-300" />
      </Button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
