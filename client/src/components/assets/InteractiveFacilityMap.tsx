import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/eams";
import { MapPin, Zap, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface InteractiveFacilityMapProps {
  equipment: Equipment[];
}

const InteractiveFacilityMap: React.FC<InteractiveFacilityMapProps> = ({ equipment }) => {
  const [selectedAsset, setSelectedAsset] = useState<Equipment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fault': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'bg-green-100 border-green-300';
      case 'maintenance': return 'bg-yellow-100 border-yellow-300';
      case 'fault': return 'bg-red-100 border-red-300';
      case 'offline': return 'bg-gray-100 border-gray-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  const filteredEquipment = useMemo(() => {
    if (filterStatus === 'all') return equipment;
    return equipment.filter(item => item.status.toLowerCase() === filterStatus);
  }, [equipment, filterStatus]);

  // Generate grid positions for equipment
  const equipmentWithPositions = useMemo(() => {
    return filteredEquipment.map((item, index) => ({
      ...item,
      gridX: (index % 8) * 120 + 60,
      gridY: Math.floor(index / 8) * 100 + 60
    }));
  }, [filteredEquipment]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Facility Map
          </CardTitle>
          <CardDescription>
            2D facility layout showing equipment locations and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({equipment.length})
            </Button>
            <Button 
              variant={filterStatus === 'operational' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('operational')}
            >
              Operational
            </Button>
            <Button 
              variant={filterStatus === 'maintenance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('maintenance')}
            >
              Maintenance
            </Button>
            <Button 
              variant={filterStatus === 'fault' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('fault')}
            >
              Fault
            </Button>
          </div>

          {/* 2D Map Container */}
          <div className="relative border-2 border-gray-200 rounded-lg bg-gray-50 overflow-auto" style={{ height: '500px' }}>
            <svg width="1000" height="600" className="absolute inset-0">
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Zone Boundaries */}
              <rect x="50" y="50" width="900" height="500" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
              <text x="60" y="40" fill="#3b82f6" fontSize="14" fontWeight="bold">Zone A - Production Area</text>
              
              {/* Equipment Markers */}
              {equipmentWithPositions.map((item, index) => (
                <g key={item.id}>
                  <circle
                    cx={item.gridX}
                    cy={item.gridY}
                    r="20"
                    className={`cursor-pointer transition-all duration-200 ${getStatusColor(item.status)} ${
                      selectedAsset?.id === item.id ? 'stroke-4 stroke-blue-600' : 'stroke-2'
                    }`}
                    onClick={() => setSelectedAsset(item)}
                  />
                  <text 
                    x={item.gridX} 
                    y={item.gridY + 5} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {item.name.substring(0, 6)}
                  </text>
                  
                  {/* Status Icon */}
                  <foreignObject x={item.gridX + 15} y={item.gridY - 25} width="20" height="20">
                    {getStatusIcon(item.status)}
                  </foreignObject>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-300"></div>
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-300"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-300"></div>
              <span>Fault</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300"></div>
              <span>Offline</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Asset Details */}
      {selectedAsset && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Asset Details: {selectedAsset.name}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedAsset(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedAsset.status)}
                  <Badge variant={selectedAsset.status === 'operational' ? 'default' : 'destructive'}>
                    {selectedAsset.status}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Type</div>
                <div>{selectedAsset.type}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Condition</div>
                <div>{selectedAsset.condition}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Health Score</div>
                <div>{selectedAsset.healthScore}%</div>
              </div>
            </div>
            {selectedAsset.location && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-500">Location</div>
                <div>{selectedAsset.location}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { InteractiveFacilityMap };