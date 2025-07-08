import type { 
  Zone, 
  Station, 
  Line, 
  System, 
  Equipment, 
  HierarchyTreeNode, 
  HierarchyStats, 
  AssetPath,
  HierarchyLevel,
  BreadcrumbItem 
} from "@/types/eams";

// Calculate hierarchy statistics
export const calculateHierarchyStats = (zones: Zone[]): HierarchyStats => {
  let totalStations = 0;
  let totalLines = 0;
  let totalSystems = 0;
  let totalEquipment = 0;
  let operationalEquipment = 0;
  let maintenanceEquipment = 0;
  let faultEquipment = 0;
  let criticalAlerts = 0;

  zones.forEach(zone => {
    totalStations += zone.stations.length;
    
    zone.stations.forEach(station => {
      totalLines += station.lines.length;
      totalSystems += station.systems.length;
      
      // Count equipment in lines
      station.lines.forEach(line => {
        totalEquipment += line.equipment.length;
        line.equipment.forEach(eq => {
          if (eq.status === 'operational') operationalEquipment++;
          else if (eq.status === 'maintenance') maintenanceEquipment++;
          else if (eq.status === 'fault') faultEquipment++;
          
          if (eq.conditionMonitoring?.alerts) {
            criticalAlerts += eq.conditionMonitoring.alerts.filter(a => a.severity === 'critical').length;
          }
        });
      });
      
      // Count equipment in systems
      station.systems.forEach(system => {
        totalEquipment += system.equipment.length;
        system.equipment.forEach(eq => {
          if (eq.status === 'operational') operationalEquipment++;
          else if (eq.status === 'maintenance') maintenanceEquipment++;
          else if (eq.status === 'fault') faultEquipment++;
          
          if (eq.conditionMonitoring?.alerts) {
            criticalAlerts += eq.conditionMonitoring.alerts.filter(a => a.severity === 'critical').length;
          }
        });
      });
    });
  });

  return {
    totalZones: zones.length,
    totalStations,
    totalLines,
    totalSystems,
    totalEquipment,
    operationalEquipment,
    maintenanceEquipment,
    faultEquipment,
    criticalAlerts
  };
};

// Build tree structure for navigation
export const buildHierarchyTree = (zones: Zone[]): HierarchyTreeNode[] => {
  return zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    level: zone.level,
    children: zone.stations.map(station => ({
      id: station.id,
      name: station.name,
      level: station.level,
      parentId: zone.id,
      children: [
        ...station.lines.map(line => ({
          id: line.id,
          name: line.name,
          level: line.level,
          parentId: station.id,
          children: line.equipment.map(eq => ({
            id: eq.id,
            name: eq.name,
            level: eq.level,
            parentId: line.id,
            children: [],
            assetCount: 0,
            isExpanded: false,
            isSelected: false,
            path: eq.path,
            breadcrumbs: eq.breadcrumbs,
            status: eq.status
          })),
          assetCount: line.equipment.length,
          isExpanded: false,
          isSelected: false,
          path: line.path,
          breadcrumbs: line.breadcrumbs,
          status: line.operationalStatus
        })),
        ...station.systems.map(system => ({
          id: system.id,
          name: system.name,
          level: system.level,
          parentId: station.id,
          children: system.equipment.map(eq => ({
            id: eq.id,
            name: eq.name,
            level: eq.level,
            parentId: system.id,
            children: [],
            assetCount: 0,
            isExpanded: false,
            isSelected: false,
            path: eq.path,
            breadcrumbs: eq.breadcrumbs,
            status: eq.status
          })),
          assetCount: system.equipment.length,
          isExpanded: false,
          isSelected: false,
          path: system.path,
          breadcrumbs: system.breadcrumbs,
          status: system.operationalStatus
        }))
      ],
      assetCount: station.lines.reduce((acc, line) => acc + line.equipment.length, 0) + 
                  station.systems.reduce((acc, system) => acc + system.equipment.length, 0),
      isExpanded: false,
      isSelected: false,
      path: station.path,
      breadcrumbs: station.breadcrumbs,
      status: station.operationalStatus
    })),
    assetCount: zone.assetCount || 0,
    isExpanded: false,
    isSelected: false,
    path: zone.path,
    breadcrumbs: zone.breadcrumbs
  }));
};

// Get equipment by hierarchy path
export const getEquipmentByPath = (zones: Zone[], path: string): Equipment[] => {
  const pathParts = path.split('/');
  
  if (pathParts.length < 2) return [];
  
  const zoneName = pathParts[0];
  const stationName = pathParts[1];
  const lineOrSystemName = pathParts[2];
  
  const zone = zones.find(z => z.name === zoneName);
  if (!zone) return [];
  
  const station = zone.stations.find(s => s.name === stationName);
  if (!station) return [];
  
  if (!lineOrSystemName) {
    // Return all equipment in station
    return [
      ...station.lines.flatMap(line => line.equipment),
      ...station.systems.flatMap(system => system.equipment)
    ];
  }
  
  // Check if it's a line or system
  const line = station.lines.find(l => l.name === lineOrSystemName);
  if (line) return line.equipment;
  
  const system = station.systems.find(s => s.name === lineOrSystemName);
  if (system) return system.equipment;
  
  return [];
};

// Get parent node
export const getParentNode = (zones: Zone[], nodeId: string): Zone | Station | Line | System | null => {
  for (const zone of zones) {
    if (zone.id === nodeId) return null; // Zone has no parent
    
    for (const station of zone.stations) {
      if (station.id === nodeId) return zone;
      
      for (const line of station.lines) {
        if (line.id === nodeId) return station;
        
        for (const equipment of line.equipment) {
          if (equipment.id === nodeId) return line;
        }
      }
      
      for (const system of station.systems) {
        if (system.id === nodeId) return station;
        
        for (const equipment of system.equipment) {
          if (equipment.id === nodeId) return system;
        }
      }
    }
  }
  
  return null;
};

// Get children nodes
export const getChildrenNodes = (zones: Zone[], nodeId: string): (Station | Line | System | Equipment)[] => {
  for (const zone of zones) {
    if (zone.id === nodeId) return zone.stations;
    
    for (const station of zone.stations) {
      if (station.id === nodeId) return [...station.lines, ...station.systems];
      
      for (const line of station.lines) {
        if (line.id === nodeId) return line.equipment;
      }
      
      for (const system of station.systems) {
        if (system.id === nodeId) return system.equipment;
      }
    }
  }
  
  return [];
};

// Generate asset path
export const generateAssetPath = (equipment: Equipment): AssetPath => {
  const pathParts = equipment.path.split('/');
  
  return {
    zone: pathParts[0] || '',
    station: pathParts[1] || '',
    line: equipment.lineId ? pathParts[2] : undefined,
    system: equipment.systemId ? pathParts[2] : undefined,
    equipment: equipment.name,
    fullPath: equipment.path
  };
};

// Search equipment by hierarchy
export const searchEquipmentInHierarchy = (
  zones: Zone[], 
  searchTerm: string, 
  filters?: {
    zoneId?: string;
    stationId?: string;
    lineId?: string;
    systemId?: string;
  }
): Equipment[] => {
  let allEquipment: Equipment[] = [];
  
  zones.forEach(zone => {
    if (filters?.zoneId && zone.id !== filters.zoneId) return;
    
    zone.stations.forEach(station => {
      if (filters?.stationId && station.id !== filters.stationId) return;
      
      station.lines.forEach(line => {
        if (filters?.lineId && line.id !== filters.lineId) return;
        allEquipment.push(...line.equipment);
      });
      
      station.systems.forEach(system => {
        if (filters?.systemId && system.id !== filters.systemId) return;
        allEquipment.push(...system.equipment);
      });
    });
  });
  
  if (!searchTerm) return allEquipment;
  
  const term = searchTerm.toLowerCase();
  return allEquipment.filter(eq => 
    eq.name.toLowerCase().includes(term) ||
    eq.manufacturer.toLowerCase().includes(term) ||
    eq.model.toLowerCase().includes(term) ||
    eq.serialNumber.toLowerCase().includes(term) ||
    eq.path.toLowerCase().includes(term)
  );
};

// Calculate KPIs for hierarchy level
export const calculateHierarchyKPIs = (equipment: Equipment[]) => {
  if (equipment.length === 0) return null;
  
  const operational = equipment.filter(eq => eq.status === 'operational').length;
  const maintenance = equipment.filter(eq => eq.status === 'maintenance').length;
  const fault = equipment.filter(eq => eq.status === 'fault').length;
  
  const avgOperatingHours = equipment.reduce((acc, eq) => acc + (eq.operatingHours || 0), 0) / equipment.length;
  
  const criticalCondition = equipment.filter(eq => eq.condition === 'critical').length;
  const poorCondition = equipment.filter(eq => eq.condition === 'poor').length;
  
  const totalAlerts = equipment.reduce((acc, eq) => 
    acc + (eq.conditionMonitoring?.alerts?.length || 0), 0
  );
  
  return {
    totalEquipment: equipment.length,
    operationalPercentage: (operational / equipment.length) * 100,
    maintenancePercentage: (maintenance / equipment.length) * 100,
    faultPercentage: (fault / equipment.length) * 100,
    avgOperatingHours,
    criticalEquipment: criticalCondition,
    poorConditionEquipment: poorCondition,
    totalAlerts,
    healthScore: Math.max(0, 100 - (criticalCondition * 20) - (poorCondition * 10) - (fault * 15))
  };
};
