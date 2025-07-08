import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  Search,
  MapPin,
  Building,
  Layers,
  Factory,
  Check
} from 'lucide-react';
import type { Zone, Station, Line, System, HierarchyLevel } from "@/types/eams";

interface HierarchySelection {
  zoneId?: string;
  stationId?: string;
  lineId?: string;
  systemId?: string;
  level: HierarchyLevel;
  path: string;
}

interface HierarchySelectorProps {
  zones: Zone[];
  selectedHierarchy?: HierarchySelection;
  onSelectionChange: (selection: HierarchySelection) => void;
  allowedLevels?: HierarchyLevel[];
  className?: string;
}

export function HierarchySelector({
  zones,
  selectedHierarchy,
  onSelectionChange,
  allowedLevels = ['line', 'system'],
  className = ""
}: HierarchySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Debug logging
  console.log('🌳 HierarchySelector received zones:', zones.length);
  console.log('🌳 Sample zone data:', zones[0]);

  // Filter zones based on search term
  const filteredZones = useMemo(() => {
    if (!searchTerm) return zones;

    return zones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.stations.some(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (station.lines || []).some(line =>
          line.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (station.systems || []).some(system =>
          system.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }, [zones, searchTerm]);

  // Handle node expansion
  const handleNodeExpand = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (expandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // Handle selection
  const handleSelection = (
    level: HierarchyLevel,
    zoneId?: string,
    stationId?: string,
    lineId?: string,
    systemId?: string
  ) => {
    console.log('🌳 HierarchySelector selection:', { level, zoneId, stationId, lineId, systemId });

    if (!allowedLevels.includes(level)) {
      console.log('🌳 Level not allowed:', level, 'Allowed:', allowedLevels);
      return;
    }

    const zone = zones.find(z => z.id === zoneId);
    const station = zone?.stations.find(s => s.id === stationId);
    const line = station?.lines.find(l => l.id === lineId);
    const system = station?.systems.find(s => s.id === systemId);

    let path = '';
    if (zone) path += zone.name;
    if (station) path += `/${station.name}`;
    if (line) path += `/${line.name}`;
    if (system) path += `/${system.name}`;

    const selection = {
      zoneId,
      stationId,
      lineId,
      systemId,
      level,
      path
    };

    console.log('🌳 Calling onSelectionChange with:', selection);
    onSelectionChange(selection);
  };

  // Check if a node is selected
  const isSelected = (
    level: HierarchyLevel,
    zoneId?: string,
    stationId?: string,
    lineId?: string,
    systemId?: string
  ) => {
    if (!selectedHierarchy) return false;

    return (
      selectedHierarchy.level === level &&
      selectedHierarchy.zoneId === zoneId &&
      selectedHierarchy.stationId === stationId &&
      selectedHierarchy.lineId === lineId &&
      selectedHierarchy.systemId === systemId
    );
  };

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
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Select Location</CardTitle>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Selected Path Display */}
        {selectedHierarchy && (
          <div className="mt-2">
            <Label className="text-sm font-medium">Selected Location:</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">
              <Badge variant="outline" className="text-sm">
                {selectedHierarchy.path || 'None selected'}
              </Badge>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredZones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No locations available</p>
              <p className="text-sm">Please check the hierarchical data configuration</p>
            </div>
          ) : (
            filteredZones.map(zone => (
              <div key={zone.id}>
                {/* Zone */}
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNodeExpand(zone.id);
                    }}
                  >
                    {expandedNodes.has(zone.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>

                  {getHierarchyIcon('zone')}
                  <span className="flex-1 text-sm font-medium">{zone.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {zone.stations.length} stations
                  </Badge>
                </div>

                {/* Stations */}
                {expandedNodes.has(zone.id) && (
                  <div className="ml-6 space-y-1">
                    {zone.stations.map(station => (
                      <div key={station.id}>
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNodeExpand(station.id);
                            }}
                          >
                            {expandedNodes.has(station.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>

                          {getHierarchyIcon('station')}
                          <span className="flex-1 text-sm">{station.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(station.lines || []).length + (station.systems || []).length} items
                          </Badge>
                        </div>

                        {/* Lines and Systems */}
                        {expandedNodes.has(station.id) && (
                          <div className="ml-6 space-y-1">
                            {/* Lines */}
                            {(station.lines || []).map(line => (
                              <div
                                key={line.id}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected('line', zone.id, station.id, line.id)
                                  ? 'bg-primary/10 border border-primary/20'
                                  : allowedLevels.includes('line')
                                    ? 'hover:bg-muted/50'
                                    : 'opacity-50 cursor-not-allowed'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (allowedLevels.includes('line')) {
                                    handleSelection('line', zone.id, station.id, line.id);
                                  }
                                }}
                              >
                                <div className="w-6 flex justify-center">
                                  {isSelected('line', zone.id, station.id, line.id) && (
                                    <Check className="h-3 w-3 text-primary" />
                                  )}
                                </div>

                                {getHierarchyIcon('line')}
                                <span className="flex-1 text-sm">{line.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {(line.equipment || []).length} equipment
                                </Badge>
                              </div>
                            ))}

                            {/* Systems */}
                            {(station.systems || []).map(system => (
                              <div
                                key={system.id}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected('system', zone.id, station.id, undefined, system.id)
                                  ? 'bg-primary/10 border border-primary/20'
                                  : allowedLevels.includes('system')
                                    ? 'hover:bg-muted/50'
                                    : 'opacity-50 cursor-not-allowed'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (allowedLevels.includes('system')) {
                                    handleSelection('system', zone.id, station.id, undefined, system.id);
                                  }
                                }}
                              >
                                <div className="w-6 flex justify-center">
                                  {isSelected('system', zone.id, station.id, undefined, system.id) && (
                                    <Check className="h-3 w-3 text-primary" />
                                  )}
                                </div>

                                {getHierarchyIcon('system')}
                                <span className="flex-1 text-sm">{system.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {(system.equipment || []).length} equipment
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
