
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? (notification.priority === 'critical' ? 0 : 5000),
    };

    setNotifications(prev => {
      // Limit to 5 notifications max
      const updated = [newNotification, ...prev].slice(0, 5);
      return updated;
    });

    // Auto-dismiss if not persistent and has duration
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onRemove: () => void;
}

function NotificationCard({ notification, onRemove }: NotificationCardProps) {
  const { type, priority, title, message, action } = notification;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type];

  const priorityClasses = {
    low: 'border-l-gray-400',
    medium: 'border-l-blue-400',
    high: 'border-l-yellow-400',
    critical: 'border-l-red-500 animate-pulse',
  };

  const typeClasses = {
    success: 'text-green-600 bg-green-50 dark:bg-green-950/20',
    error: 'text-red-600 bg-red-50 dark:bg-red-950/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
  };

  return (
    <div
      className={cn(
        "glass-card p-4 border-l-4 shadow-lg animate-slide-up transition-all duration-300 hover:shadow-xl",
        priorityClasses[priority],
        "max-w-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 p-1 rounded-full", typeClasses[type])}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <button
              onClick={onRemove}
              className="flex-shrink-0 p-1 hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
          
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onRemove();
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper hook for common notifications
export function useNotify() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', priority: 'medium', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', priority: 'high', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', priority: 'medium', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', priority: 'low', title, message, ...options }),
    
    critical: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ 
        type: 'error', 
        priority: 'critical', 
        title, 
        message, 
        persistent: true,
        ...options 
      }),
  };
}
