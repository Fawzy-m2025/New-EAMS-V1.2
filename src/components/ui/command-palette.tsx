
import React, { useState, useEffect } from 'react';
import { Search, Command, Clock, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  path: string;
  icon?: React.ReactNode;
  category: 'Navigation' | 'Actions' | 'Recent';
  keywords: string[];
}

const commands: CommandItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Main overview and analytics',
    path: '/',
    category: 'Navigation',
    keywords: ['home', 'overview', 'main', 'dashboard']
  },
  {
    id: 'financial',
    title: 'Financial Dashboard',
    description: 'Financial reports and analytics',
    path: '/financial',
    category: 'Navigation',
    keywords: ['money', 'finance', 'budget', 'revenue']
  },
  {
    id: 'assets',
    title: 'Asset Management',
    description: 'Manage company assets',
    path: '/assets/registry',
    category: 'Navigation',
    keywords: ['assets', 'equipment', 'machinery']
  },
  {
    id: 'maintenance',
    title: 'Work Orders',
    description: 'Maintenance and work orders',
    path: '/maintenance/work-orders',
    category: 'Navigation',
    keywords: ['maintenance', 'repair', 'work', 'orders']
  },
  {
    id: 'employees',
    title: 'Employee Management',
    description: 'HR and employee data',
    path: '/hr/employees',
    category: 'Navigation',
    keywords: ['hr', 'staff', 'people', 'employees']
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Stock and inventory tracking',
    path: '/inventory/stock',
    category: 'Navigation',
    keywords: ['stock', 'inventory', 'warehouse']
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Advanced analytics and reports',
    path: '/analytics/dashboards',
    category: 'Navigation',
    keywords: ['analytics', 'reports', 'charts', 'data']
  }
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description?.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (command: CommandItem) => {
    navigate(command.path);
    onOpenChange(false);
    setQuery('');
    setSelectedIndex(0);
    
    // Add to recent commands
    const recent = JSON.parse(localStorage.getItem('recent-commands') || '[]');
    const updated = [command.id, ...recent.filter((id: string) => id !== command.id)].slice(0, 5);
    localStorage.setItem('recent-commands', JSON.stringify(updated));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
    }
  }, [query, open]);

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 glass-card border-0 overflow-hidden">
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Search commands, pages, and actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 px-0 text-base"
            autoFocus
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-2.5 w-2.5" />
              K
            </kbd>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category} className="mb-4 last:mb-0">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              <div className="space-y-1">
                {items.map((command, index) => {
                  const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                  return (
                    <button
                      key={command.id}
                      onClick={() => handleSelect(command)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                        "hover:bg-accent hover:text-accent-foreground",
                        globalIndex === selectedIndex && "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {command.icon || <Star className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {command.title}
                          </div>
                          {command.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-muted-foreground text-sm">
                No results found for "{query}"
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Try searching for pages, features, or actions
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border/50 bg-muted font-mono text-[10px]">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border/50 bg-muted font-mono text-[10px]">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border/50 bg-muted font-mono text-[10px]">
                ⎋
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
