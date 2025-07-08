
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Equipment } from "@/types/eams";
import { Clock, Download, Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface AssetTimelineViewerProps {
  equipment: Equipment[];
}

interface TimelineEvent {
  id: string;
  assetId: string;
  assetName: string;
  type: 'movement' | 'maintenance' | 'check-in' | 'check-out' | 'status-change';
  timestamp: Date;
  description: string;
  location?: string;
  user?: string;
  status?: string;
}

export function AssetTimelineViewer({ equipment }: AssetTimelineViewerProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>('all');
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);

  // Generate mock timeline events
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const now = new Date();
    
    equipment.forEach(asset => {
      // Generate events for the last 30 days
      for (let i = 0; i < 30; i++) {
        const eventDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        
        // Random events per day
        const eventCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < eventCount; j++) {
          const eventTime = new Date(eventDate.getTime() + (j * 8 * 60 * 60 * 1000));
          
          const eventTypes: TimelineEvent['type'][] = ['movement', 'maintenance', 'check-in', 'check-out', 'status-change'];
          const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          events.push({
            id: `${asset.id}-${i}-${j}`,
            assetId: asset.id,
            assetName: asset.name,
            type: randomType,
            timestamp: eventTime,
            description: getEventDescription(randomType, asset),
            location: asset.location.building,
            user: `User ${Math.floor(Math.random() * 5) + 1}`,
            status: randomType === 'status-change' ? asset.status : undefined
          });
        }
      }
    });
    
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [equipment]);

  const filteredEvents = useMemo(() => {
    let filtered = timelineEvents;
    
    if (selectedAsset !== 'all') {
      filtered = filtered.filter(event => event.assetId === selectedAsset);
    }
    
    // Apply time range filter
    const totalEvents = filtered.length;
    const startIndex = Math.floor((timeRange[0] / 100) * totalEvents);
    const endIndex = Math.floor((timeRange[1] / 100) * totalEvents);
    
    return filtered.slice(startIndex, endIndex);
  }, [timelineEvents, selectedAsset, timeRange]);

  function getEventDescription(type: TimelineEvent['type'], asset: Equipment): string {
    switch (type) {
      case 'movement':
        return `Moved to ${asset.location.building} - ${asset.location.room}`;
      case 'maintenance':
        return 'Scheduled maintenance completed';
      case 'check-in':
        return 'Asset checked in for service';
      case 'check-out':
        return 'Asset checked out to technician';
      case 'status-change':
        return `Status changed to ${asset.status}`;
      default:
        return 'Event occurred';
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'movement': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      case 'check-in': return 'bg-purple-100 text-purple-800';
      case 'check-out': return 'bg-orange-100 text-orange-800';
      case 'status-change': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportTimeline = () => {
    const csvContent = [
      ['Timestamp', 'Asset', 'Event Type', 'Description', 'Location', 'User'],
      ...filteredEvents.map(event => [
        event.timestamp.toISOString(),
        event.assetName,
        event.type,
        event.description,
        event.location || '',
        event.user || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Asset Movement Timeline
            </CardTitle>
            <CardDescription>
              Interactive timeline showing asset movements and events with exportable logs
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportTimeline} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Asset:</label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                {equipment.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Speed:</label>
            <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTime(Math.min(100, currentTime + 10))}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Time Range Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Range</label>
          <Slider
            value={timeRange}
            onValueChange={setTimeRange}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events found for the selected criteria
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
                <div className="w-16 text-xs text-muted-foreground text-center">
                  <div>{event.timestamp.toLocaleDateString()}</div>
                  <div>{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{event.assetName}</span>
                    <Badge className={getEventColor(event.type)} variant="secondary">
                      {event.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {event.location && <span>📍 {event.location}</span>}
                    {event.user && <span>👤 {event.user}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
