import React, { createContext, useContext, useState, useCallback } from 'react';
import { Info, AlertTriangle, CheckCircle, HelpCircle, Zap, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type TooltipType = 'info' | 'warning' | 'success' | 'tip' | 'performance' | 'security';

interface ContextTooltipContent {
  title: string;
  description: string;
  type: TooltipType;
  learnMore?: string;
}

interface ContextTooltipContextType {
  tooltips: Record<string, ContextTooltipContent>;
  addTooltip: (id: string, content: ContextTooltipContent) => void;
  removeTooltip: (id: string) => void;
}

const ContextTooltipContext = createContext<ContextTooltipContextType | undefined>(undefined);

export function useContextTooltip() {
  const context = useContext(ContextTooltipContext);
  if (!context) {
    throw new Error('useContextTooltip must be used within a ContextTooltipProvider');
  }
  return context;
}

// Update the predefined tooltips to include performance-specific ones
const predefinedTooltips: Record<string, ContextTooltipContent> = {
  'revenue-trend': {
    title: 'Revenue Trend Analysis',
    description: 'Shows quarterly revenue growth patterns with seasonal adjustments',
    type: 'info',
    learnMore: 'Learn about revenue forecasting'
  },
  'cash-flow': {
    title: 'Cash Flow Health',
    description: 'Real-time liquidity monitoring with 30-day projections',
    type: 'performance',
    learnMore: 'Cash flow optimization tips'
  },
  'budget-alert': {
    title: 'Budget Variance Alert',
    description: 'Alerts when spending exceeds 85% of allocated budget',
    type: 'warning',
    learnMore: 'Budget management best practices'
  },
  'asset-depreciation': {
    title: 'Asset Depreciation',
    description: 'Tracks asset value decline using straight-line and accelerated methods',
    type: 'info',
    learnMore: 'Depreciation calculation methods'
  },
  'compliance-status': {
    title: 'Compliance Status',
    description: 'Real-time monitoring of regulatory compliance requirements',
    type: 'security',
    learnMore: 'Compliance framework details'
  },
  'maintenance-due': {
    title: 'Maintenance Schedule',
    description: 'Predictive maintenance alerts based on usage patterns and manufacturer recommendations',
    type: 'tip',
    learnMore: 'Preventive maintenance strategies'
  },
  'asset-total': {
    title: 'Total Asset Count',
    description: 'Complete inventory of all registered assets across all locations and categories',
    type: 'info',
    learnMore: 'Asset inventory management'
  },
  'asset-active': {
    title: 'Active Assets',
    description: 'Assets currently in operation and available for use. Excludes maintenance and disposed items',
    type: 'success',
    learnMore: 'Asset utilization best practices'
  },
  'asset-maintenance': {
    title: 'Assets Under Maintenance',
    description: 'Assets temporarily unavailable due to scheduled or corrective maintenance activities',
    type: 'warning',
    learnMore: 'Maintenance scheduling strategies'
  },
  'asset-value': {
    title: 'Total Asset Value',
    description: 'Current market value of all assets including depreciation calculations',
    type: 'performance',
    learnMore: 'Asset valuation methods'
  },
  'asset-tracking': {
    title: 'Real-time Asset Tracking',
    description: 'Live monitoring of asset locations, movements, and status updates using IoT sensors and RFID technology',
    type: 'info',
    learnMore: 'Asset tracking technologies'
  },
  'asset-utilization': {
    title: 'Asset Utilization Rate',
    description: 'Percentage of time assets are actively used vs. idle, helping optimize resource allocation and identify underperforming assets',
    type: 'performance',
    learnMore: 'Utilization optimization strategies'
  },
  'check-out-system': {
    title: 'Check-out Management',
    description: 'Comprehensive system for tracking asset assignments, expected returns, and overdue alerts',
    type: 'tip',
    learnMore: 'Best practices for asset lending'
  },
  'performance-efficiency': {
    title: 'Asset Efficiency Score',
    description: 'Composite metric measuring asset output quality, speed, and resource consumption efficiency',
    type: 'performance',
    learnMore: 'Efficiency measurement methodologies'
  },
  'performance-availability': {
    title: 'Availability Rate',
    description: 'Percentage of scheduled time that assets are operational and available for use',
    type: 'performance',
    learnMore: 'Availability optimization techniques'
  },
  'performance-mtbf': {
    title: 'Mean Time Between Failures',
    description: 'Average time between asset failures, indicating reliability and maintenance effectiveness',
    type: 'info',
    learnMore: 'Reliability engineering principles'
  },
  'performance-roi': {
    title: 'Return on Investment',
    description: 'Financial performance metric showing the efficiency of asset investments over time',
    type: 'performance',
    learnMore: 'ROI calculation methods'
  },
  'performance-lifecycle': {
    title: 'Asset Lifecycle Management',
    description: 'Tracks assets through acquisition, utilization, maintenance, and disposal phases',
    type: 'info',
    learnMore: 'Lifecycle optimization strategies'
  },
  'predictive-analytics': {
    title: 'Predictive Analytics',
    description: 'AI-powered insights for maintenance scheduling, failure prediction, and optimization recommendations',
    type: 'tip',
    learnMore: 'Predictive maintenance technologies'
  }
};

interface ContextTooltipProviderProps {
  children: React.ReactNode;
}

export function ContextTooltipProvider({ children }: ContextTooltipProviderProps) {
  const [tooltips, setTooltips] = useState<Record<string, ContextTooltipContent>>(predefinedTooltips);

  const addTooltip = useCallback((id: string, content: ContextTooltipContent) => {
    setTooltips(prev => ({ ...prev, [id]: content }));
  }, []);

  const removeTooltip = useCallback((id: string) => {
    setTooltips(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return (
    <ContextTooltipContext.Provider value={{ tooltips, addTooltip, removeTooltip }}>
      <TooltipProvider delayDuration={200}>
        {children}
      </TooltipProvider>
    </ContextTooltipContext.Provider>
  );
}

interface ContextTooltipProps {
  id: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function ContextTooltip({ id, children, side = 'top', className }: ContextTooltipProps) {
  const { tooltips } = useContextTooltip();
  const tooltipContent = tooltips[id];

  if (!tooltipContent) {
    return <>{children}</>;
  }

  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    tip: HelpCircle,
    performance: Zap,
    security: Shield,
  };

  const Icon = icons[tooltipContent.type];

  const typeClasses = {
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
    success: 'text-green-600 bg-green-50 dark:bg-green-950/20',
    tip: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
    performance: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
    security: 'text-red-600 bg-red-50 dark:bg-red-950/20',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn("glass-card p-4 max-w-sm border-0", className)}
      >
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0 p-1.5 rounded-full", typeClasses[tooltipContent.type])}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1">
              {tooltipContent.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tooltipContent.description}
            </p>
            {tooltipContent.learnMore && (
              <button className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors">
                {tooltipContent.learnMore} →
              </button>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
