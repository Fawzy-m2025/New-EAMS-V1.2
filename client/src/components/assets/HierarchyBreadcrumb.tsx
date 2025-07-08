import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Home, 
  MapPin, 
  Building, 
  Layers, 
  Settings,
  Factory
} from 'lucide-react';
import type { BreadcrumbItem, HierarchyLevel } from "@/types/eams";

interface HierarchyBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (breadcrumb: BreadcrumbItem) => void;
  className?: string;
}

export function HierarchyBreadcrumb({
  breadcrumbs,
  onNavigate,
  className = ""
}: HierarchyBreadcrumbProps) {
  
  // Get icon for hierarchy level
  const getHierarchyIcon = (level: HierarchyLevel) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (level) {
      case 'zone':
        return <MapPin {...iconProps} />;
      case 'station':
        return <Building {...iconProps} />;
      case 'line':
        return <Layers {...iconProps} />;
      case 'system':
        return <Factory {...iconProps} />;
      case 'equipment':
        return <Settings {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      {/* Home/Root */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate({ id: 'root', name: 'Assets', level: 'zone', path: '' })}
      >
        <Home className="h-4 w-4" />
      </Button>

      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.id}>
          {/* Separator */}
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          
          {/* Breadcrumb Item */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 flex items-center gap-1 ${
              index === breadcrumbs.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onNavigate(breadcrumb)}
            disabled={index === breadcrumbs.length - 1}
          >
            {getHierarchyIcon(breadcrumb.level)}
            <span>{breadcrumb.name}</span>
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
}

// Compact version for smaller spaces
export function CompactHierarchyBreadcrumb({
  breadcrumbs,
  onNavigate,
  className = ""
}: HierarchyBreadcrumbProps) {
  
  if (breadcrumbs.length === 0) {
    return null;
  }

  // Show only the last 3 breadcrumbs for compact view
  const visibleBreadcrumbs = breadcrumbs.slice(-3);
  const hasHiddenItems = breadcrumbs.length > 3;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      {hasHiddenItems && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1 text-muted-foreground hover:text-foreground"
            onClick={() => onNavigate(breadcrumbs[0])}
          >
            <Home className="h-3 w-3" />
          </Button>
          <span className="text-muted-foreground">...</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        </>
      )}

      {visibleBreadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.id}>
          {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-1 text-xs ${
              index === visibleBreadcrumbs.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onNavigate(breadcrumb)}
            disabled={index === visibleBreadcrumbs.length - 1}
          >
            {breadcrumb.name}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
}

// Utility function to create breadcrumbs from path
export const createBreadcrumbsFromPath = (path: string): BreadcrumbItem[] => {
  if (!path) return [];
  
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  parts.forEach((part, index) => {
    const currentPath = parts.slice(0, index + 1).join('/');
    let level: HierarchyLevel = 'equipment';
    
    // Determine level based on position
    if (index === 0) level = 'zone';
    else if (index === 1) level = 'station';
    else if (index === 2) {
      // Could be line or system - we'll need context to determine
      level = part.toLowerCase().includes('line') ? 'line' : 'system';
    }
    else level = 'equipment';
    
    breadcrumbs.push({
      id: `${level}-${index}`,
      name: part,
      level,
      path: currentPath
    });
  });
  
  return breadcrumbs;
};

// Utility function to get parent breadcrumb
export const getParentBreadcrumb = (breadcrumbs: BreadcrumbItem[]): BreadcrumbItem | null => {
  if (breadcrumbs.length <= 1) return null;
  return breadcrumbs[breadcrumbs.length - 2];
};

// Utility function to get root breadcrumb
export const getRootBreadcrumb = (breadcrumbs: BreadcrumbItem[]): BreadcrumbItem | null => {
  if (breadcrumbs.length === 0) return null;
  return breadcrumbs[0];
};
