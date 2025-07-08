import React from 'react';
import { Card, CardContent, CardHeader, glassCardClass } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Clock, User, Camera, Mic, Navigation,
  Play, Pause, CheckCircle, AlertTriangle, Smartphone
} from 'lucide-react';
import type { WorkOrder, Priority } from '@/types/eams';

interface MobileWorkOrderCardProps {
  workOrder: WorkOrder;
  onStartWork: (id: string) => void;
  onCompleteWork: (id: string) => void;
  onTakePhoto: (id: string) => void;
  onRecordVoice: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function MobileWorkOrderCard({
  workOrder,
  onStartWork,
  onCompleteWork,
  onTakePhoto,
  onRecordVoice,
  onNavigate
}: MobileWorkOrderCardProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isInProgress = workOrder.status === 'in-progress';
  const isCompleted = workOrder.status === 'completed';
  const canStart = workOrder.status === 'assigned' || workOrder.status === 'open';

  return (
    <Card className={glassCardClass}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1 pr-2">{workOrder.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{workOrder.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Badge className={getPriorityColor(workOrder.priority)}>
            {workOrder.priority}
          </Badge>
          <Badge className={getStatusColor(workOrder.status)}>
            {workOrder.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Equipment and Location Info */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded"></div>
            </div>
            <span className="font-medium">{workOrder.equipmentName}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{workOrder.location}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{Array.isArray(workOrder.assignedTo) ? workOrder.assignedTo.join(', ') : workOrder.assignedTo}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Due: {workOrder.dueDate} • Est: {workOrder.estimatedHours}h</span>
          </div>
        </div>

        {/* Progress Bar */}
        {isInProgress && workOrder.actualHours && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{workOrder.actualHours}/{workOrder.estimatedHours}h</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((workOrder.actualHours / workOrder.estimatedHours) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {canStart && (
            <Button
              onClick={() => onStartWork(workOrder.id)}
              className="bg-green-600 hover:bg-green-700 text-white hover-scale"
              size="sm"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Work
            </Button>
          )}

          {isInProgress && (
            <Button
              onClick={() => onCompleteWork(workOrder.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white hover-scale"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => onNavigate(workOrder.id)}
            size="sm"
            className="hover-scale"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Navigate
          </Button>
        </div>

        {/* Media Capture Tools */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTakePhoto(workOrder.id)}
            className="flex-1 hover-scale"
          >
            <Camera className="h-4 w-4 mr-1" />
            Photo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRecordVoice(workOrder.id)}
            className="flex-1 hover-scale"
          >
            <Mic className="h-4 w-4 mr-1" />
            Voice Note
          </Button>
        </div>

        {/* Quick Status Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-muted/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {workOrder.type && (
              <span className="bg-muted/50 px-2 py-1 rounded">
                {workOrder.type}
              </span>
            )}
            {workOrder.priority === 'emergency' && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Emergency</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {workOrder.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
