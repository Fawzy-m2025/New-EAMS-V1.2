import type { Equipment, Zone, Station, Line, System, HierarchyStats } from "@/types/eams";

/**
 * Safe parsing function for numeric values with validation and bounds checking
 */
export function safeParseNumber(value: any, fallback = 0, min = -Infinity, max = Infinity, context = 'numeric value'): number {
  try {
    if (value === null || value === undefined || value === '') {
      return Math.max(min, Math.min(max, fallback));
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

    if (isNaN(numValue) || !isFinite(numValue)) {
      console.warn(`Invalid ${context}: ${value}, using fallback: ${fallback}`);
      return Math.max(min, Math.min(max, fallback));
    }

    // Apply bounds checking
    const boundedValue = Math.max(min, Math.min(max, numValue));

    if (boundedValue !== numValue) {
      console.warn(`${context} ${numValue} out of bounds [${min}, ${max}], clamped to ${boundedValue}`);
    }

    return boundedValue;
  } catch (error) {
    console.error(`Error parsing ${context}:`, error);
    return Math.max(min, Math.min(max, fallback));
  }
}

/**
 * Safe division with zero-check and bounds validation
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0, context = 'division'): number {
  try {
    if (denominator === 0 || !isFinite(denominator)) {
      console.warn(`Division by zero or invalid denominator in ${context}, using fallback: ${fallback}`);
      return fallback;
    }

    const result = numerator / denominator;

    if (!isFinite(result)) {
      console.warn(`Invalid division result in ${context}, using fallback: ${fallback}`);
      return fallback;
    }

    return result;
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    return fallback;
  }
}

// Equipment-level KPI calculations
export interface EquipmentKPIs {
  healthScore: number;
  availability: number;
  reliability: number;
  efficiency: number;
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
  utilizationRate: number;
  energyEfficiency: number;
  maintenanceCost: number;
  downtimeHours: number;
  criticalAlerts: number;
  vibrationScore: number;
  temperatureScore: number;
}

// Hierarchy-level KPI calculations
export interface HierarchyKPIs {
  totalEquipment: number;
  operationalEquipment: number;
  maintenanceEquipment: number;
  faultEquipment: number;
  avgHealthScore: number;
  avgAvailability: number;
  avgReliability: number;
  avgEfficiency: number;
  totalMaintenanceCost: number;
  totalDowntimeHours: number;
  criticalAlerts: number;
  oee: number; // Overall Equipment Effectiveness
}

// Calculate equipment-level KPIs with comprehensive error handling
export const calculateEquipmentKPIs = (equipment: Equipment | null | undefined): EquipmentKPIs => {
  try {
    // Validate input equipment
    if (!equipment || typeof equipment !== 'object') {
      console.warn('Invalid equipment data provided to calculateEquipmentKPIs');
      return {
        healthScore: 0,
        availability: 0,
        reliability: 0,
        efficiency: 0,
        mtbf: 0,
        mttr: 0,
        utilizationRate: 0,
        energyEfficiency: 0,
        maintenanceCost: 0,
        downtimeHours: 0,
        criticalAlerts: 0,
        vibrationScore: 0,
        temperatureScore: 0
      };
    }

    // Safe extraction of operating hours with validation
    const operatingHours = safeParseNumber(equipment.operatingHours, 0, 0, 100000, 'operating hours');

    // Safe date handling with validation
    let installationDate: Date;
    try {
      installationDate = equipment.installationDate ? new Date(equipment.installationDate) : new Date();
      if (isNaN(installationDate.getTime())) {
        console.warn(`Invalid installation date: ${equipment.installationDate}`);
        installationDate = new Date();
      }
    } catch (error) {
      console.warn('Error parsing installation date:', error);
      installationDate = new Date();
    }

    const daysSinceInstallation = Math.max(1, safeDivide(Date.now() - installationDate.getTime(), 1000 * 60 * 60 * 24, 1, 'days since installation'));

    // Health Score based on condition and monitoring data with validation
    let healthScore = 100;

    // Condition impact with safe string handling
    const condition = equipment.condition?.toLowerCase();
    switch (condition) {
      case 'excellent': healthScore = 95; break;
      case 'good': healthScore = 80; break;
      case 'fair': healthScore = 65; break;
      case 'poor': healthScore = 40; break;
      case 'critical': healthScore = 20; break;
      default:
        console.info(`Unknown equipment condition: ${equipment.condition}, using default health score`);
        healthScore = 50;
    }

    // Vibration impact with comprehensive validation
    let vibrationScore = 100;
    if (equipment.conditionMonitoring?.vibration) {
      try {
        const rms = safeParseNumber(equipment.conditionMonitoring.vibration.rmsVelocity, 0, 0, 100, 'RMS velocity');
        const zone = equipment.conditionMonitoring.vibration.iso10816Zone?.toUpperCase();

        switch (zone) {
          case 'A': vibrationScore = 95; break;
          case 'B': vibrationScore = 80; break;
          case 'C': vibrationScore = 60; break;
          case 'D': vibrationScore = 30; break;
          default:
            console.info(`Unknown ISO 10816 zone: ${zone}, using default vibration score`);
            vibrationScore = 70;
        }

        // Adjust health score based on vibration with bounds checking
        healthScore = Math.max(0, Math.min(healthScore, vibrationScore));
      } catch (error) {
        console.error('Error processing vibration data:', error);
        vibrationScore = 70; // Default fallback
      }
    }

    // Temperature impact with enhanced validation
    let temperatureScore = 100;
    if (equipment.conditionMonitoring?.thermography) {
      try {
        const deltaT = safeParseNumber(equipment.conditionMonitoring.thermography.deltaT, 0, -50, 200, 'temperature delta');

        if (deltaT > 20) temperatureScore = 60;
        else if (deltaT > 15) temperatureScore = 75;
        else if (deltaT > 10) temperatureScore = 85;
        else temperatureScore = 95;

        // Adjust health score based on temperature with bounds checking
        healthScore = Math.max(0, Math.min(healthScore, temperatureScore));
      } catch (error) {
        console.error('Error processing temperature data:', error);
        temperatureScore = 85; // Default fallback
      }
    }

    // Alerts impact with safe array operations
    let criticalAlerts = 0;
    let warningAlerts = 0;

    try {
      if (equipment.conditionMonitoring?.alerts && Array.isArray(equipment.conditionMonitoring.alerts)) {
        criticalAlerts = equipment.conditionMonitoring.alerts.filter(alert =>
          alert && typeof alert === 'object' && alert.severity === 'critical'
        ).length;

        warningAlerts = equipment.conditionMonitoring.alerts.filter(alert =>
          alert && typeof alert === 'object' && alert.severity === 'warning'
        ).length;
      }

      // Apply alert penalties with bounds checking
      const alertPenalty = Math.min(50, (criticalAlerts * 10) + (warningAlerts * 5)); // Cap penalty at 50 points
      healthScore = Math.max(0, healthScore - alertPenalty);
    } catch (error) {
      console.error('Error processing alerts:', error);
      criticalAlerts = 0;
      warningAlerts = 0;
    }

    // Availability calculation with safe status handling
    let availability = 100;
    const status = equipment.status?.toLowerCase();
    switch (status) {
      case 'operational': availability = 98; break;
      case 'maintenance': availability = 0; break;
      case 'fault': availability = 0; break;
      case 'offline': availability = 0; break;
      case 'testing': availability = 50; break;
      default:
        console.info(`Unknown equipment status: ${equipment.status}, using default availability`);
        availability = 80;
    }

    // Reliability calculation with safe array operations and bounds checking
    const failureCount = Math.max(0, equipment.failureHistory?.length || 0);
    const ageFactor = Math.min(20, safeDivide(daysSinceInstallation, 365, 0, 'age factor calculation') * 2); // Cap age impact at 20 points
    const reliability = Math.max(60, Math.min(100, 100 - (failureCount * 5) - ageFactor));

    // Efficiency calculation with safe specification handling
    const specEfficiency = safeParseNumber(equipment.specifications?.efficiency, 85, 0, 100, 'specification efficiency');
    const conditionFactor = safeParseNumber(healthScore, 50, 0, 100, 'health score') / 100;
    const efficiency = Math.max(0, Math.min(100, specEfficiency * conditionFactor));

    // MTBF calculation with safe division and bounds checking
    const mtbf = failureCount > 0
      ? Math.max(1, safeDivide(operatingHours, failureCount, 8760, 'MTBF calculation'))
      : Math.min(8760, Math.max(1, operatingHours));

    // MTTR calculation with enhanced logic
    const maintenanceCount = Math.max(0, equipment.maintenanceHistory?.length || 0);
    const mttr = maintenanceCount > 0
      ? Math.max(0.5, Math.min(24, 4)) // Fixed: was calculating (maintenanceCount * 4) / maintenanceCount = 4
      : 4; // Average 4 hours default

    // Utilization rate with safe calculation and bounds checking
    const expectedHours = Math.max(1, daysSinceInstallation * 24 * 0.8); // 80% expected utilization
    const utilizationRate = Math.max(0, Math.min(100, safeDivide(operatingHours, expectedHours, 0, 'utilization rate') * 100));

    // Energy efficiency with bounds checking
    const energyEfficiency = Math.max(0, Math.min(100, efficiency * 0.9)); // Approximate correlation

    // Maintenance cost with safe calculation and validation
    const ratedPower = safeParseNumber(equipment.specifications?.ratedPower, 50, 0, 10000, 'rated power');
    const baseCost = ratedPower * 20; // $20 per kW annually

    let conditionMultiplier = 1;
    const conditionLower = equipment.condition?.toLowerCase();
    if (conditionLower === 'poor') conditionMultiplier = 2;
    else if (conditionLower === 'critical') conditionMultiplier = 3;

    const maintenanceCost = Math.max(0, baseCost * conditionMultiplier);

    // Downtime hours with safe calculation and bounds checking
    const downtimeHours = Math.max(0, (failureCount * 8) + (maintenanceCount * 4));

    // Return KPIs with safe rounding and final validation
    return {
      healthScore: Math.max(0, Math.min(100, Math.round(healthScore))),
      availability: Math.max(0, Math.min(100, Math.round(availability * 100) / 100)),
      reliability: Math.max(0, Math.min(100, Math.round(reliability * 100) / 100)),
      efficiency: Math.max(0, Math.min(100, Math.round(efficiency * 100) / 100)),
      mtbf: Math.max(0, Math.round(mtbf)),
      mttr: Math.max(0, Math.round(mttr * 100) / 100),
      utilizationRate: Math.max(0, Math.min(100, Math.round(utilizationRate * 100) / 100)),
      energyEfficiency: Math.max(0, Math.min(100, Math.round(energyEfficiency * 100) / 100)),
      maintenanceCost: Math.max(0, Math.round(maintenanceCost)),
      downtimeHours: Math.max(0, Math.round(downtimeHours)),
      criticalAlerts: Math.max(0, criticalAlerts),
      vibrationScore: Math.max(0, Math.min(100, Math.round(vibrationScore))),
      temperatureScore: Math.max(0, Math.min(100, Math.round(temperatureScore)))
    };
  } catch (error) {
    console.error('Error in calculateEquipmentKPIs:', error);
    // Return safe default values in case of error
    return {
      healthScore: 0,
      availability: 0,
      reliability: 0,
      efficiency: 0,
      mtbf: 0,
      mttr: 0,
      utilizationRate: 0,
      energyEfficiency: 0,
      maintenanceCost: 0,
      downtimeHours: 0,
      criticalAlerts: 0,
      vibrationScore: 0,
      temperatureScore: 0
    };
  }
};

// Calculate hierarchy-level KPIs with comprehensive error handling
export const calculateHierarchyKPIs = (equipment: Equipment[] | null | undefined): HierarchyKPIs => {
  try {
    // Validate input equipment array
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
      console.info('No equipment provided for hierarchy KPI calculation');
      return {
        totalEquipment: 0,
        operationalEquipment: 0,
        maintenanceEquipment: 0,
        faultEquipment: 0,
        avgHealthScore: 0,
        avgAvailability: 0,
        avgReliability: 0,
        avgEfficiency: 0,
        totalMaintenanceCost: 0,
        totalDowntimeHours: 0,
        criticalAlerts: 0,
        oee: 0
      };
    }

    // Filter out invalid equipment entries
    const validEquipment = equipment.filter(eq => eq && typeof eq === 'object');

    if (validEquipment.length === 0) {
      console.warn('No valid equipment found in array');
      return {
        totalEquipment: 0,
        operationalEquipment: 0,
        maintenanceEquipment: 0,
        faultEquipment: 0,
        avgHealthScore: 0,
        avgAvailability: 0,
        avgReliability: 0,
        avgEfficiency: 0,
        totalMaintenanceCost: 0,
        totalDowntimeHours: 0,
        criticalAlerts: 0,
        oee: 0
      };
    }

    // Calculate KPIs for each equipment with error handling
    const equipmentKPIs = validEquipment.map(eq => {
      try {
        return calculateEquipmentKPIs(eq);
      } catch (error) {
        console.error(`Error calculating KPIs for equipment ${eq.id || 'unknown'}:`, error);
        return calculateEquipmentKPIs(null); // Returns default values
      }
    });

    // Safe status counting with validation
    const operationalEquipment = validEquipment.filter(eq =>
      eq.status && eq.status.toLowerCase() === 'operational'
    ).length;

    const maintenanceEquipment = validEquipment.filter(eq =>
      eq.status && eq.status.toLowerCase() === 'maintenance'
    ).length;

    const faultEquipment = validEquipment.filter(eq =>
      eq.status && eq.status.toLowerCase() === 'fault'
    ).length;

    // Safe average calculations with division by zero protection
    const equipmentCount = Math.max(1, validEquipment.length);

    const avgHealthScore = safeDivide(
      equipmentKPIs.reduce((sum, kpi) => sum + (kpi?.healthScore || 0), 0),
      equipmentCount,
      0,
      'average health score'
    );

    const avgAvailability = safeDivide(
      equipmentKPIs.reduce((sum, kpi) => sum + (kpi?.availability || 0), 0),
      equipmentCount,
      0,
      'average availability'
    );

    const avgReliability = safeDivide(
      equipmentKPIs.reduce((sum, kpi) => sum + (kpi?.reliability || 0), 0),
      equipmentCount,
      0,
      'average reliability'
    );

    const avgEfficiency = safeDivide(
      equipmentKPIs.reduce((sum, kpi) => sum + (kpi?.efficiency || 0), 0),
      equipmentCount,
      0,
      'average efficiency'
    );

    // Safe total calculations with bounds checking
    const totalMaintenanceCost = Math.max(0, equipmentKPIs.reduce((sum, kpi) =>
      sum + (kpi?.maintenanceCost || 0), 0
    ));

    const totalDowntimeHours = Math.max(0, equipmentKPIs.reduce((sum, kpi) =>
      sum + (kpi?.downtimeHours || 0), 0
    ));

    const criticalAlerts = Math.max(0, equipmentKPIs.reduce((sum, kpi) =>
      sum + (kpi?.criticalAlerts || 0), 0
    ));

    // OEE calculation with safe mathematical operations
    const performance = Math.max(0, Math.min(1, safeDivide(avgEfficiency, 100, 0, 'OEE performance')));
    const alertRatio = safeDivide(criticalAlerts, validEquipment.length, 0, 'alert ratio');
    const quality = Math.max(0.8, Math.min(1, 1 - (alertRatio * 0.1))); // Quality based on alerts
    const availabilityFactor = Math.max(0, Math.min(1, safeDivide(avgAvailability, 100, 0, 'OEE availability')));
    const oee = Math.max(0, Math.min(100, availabilityFactor * performance * quality * 100));

    return {
      totalEquipment: Math.max(0, validEquipment.length),
      operationalEquipment: Math.max(0, operationalEquipment),
      maintenanceEquipment: Math.max(0, maintenanceEquipment),
      faultEquipment: Math.max(0, faultEquipment),
      avgHealthScore: Math.max(0, Math.min(100, Math.round(avgHealthScore))),
      avgAvailability: Math.max(0, Math.min(100, Math.round(avgAvailability * 100) / 100)),
      avgReliability: Math.max(0, Math.min(100, Math.round(avgReliability * 100) / 100)),
      avgEfficiency: Math.max(0, Math.min(100, Math.round(avgEfficiency * 100) / 100)),
      totalMaintenanceCost: Math.max(0, Math.round(totalMaintenanceCost)),
      totalDowntimeHours: Math.max(0, Math.round(totalDowntimeHours)),
      criticalAlerts: Math.max(0, criticalAlerts),
      oee: Math.max(0, Math.min(100, Math.round(oee * 100) / 100))
    };
  } catch (error) {
    console.error('Error in calculateHierarchyKPIs:', error);
    // Return safe default values in case of error
    return {
      totalEquipment: 0,
      operationalEquipment: 0,
      maintenanceEquipment: 0,
      faultEquipment: 0,
      avgHealthScore: 0,
      avgAvailability: 0,
      avgReliability: 0,
      avgEfficiency: 0,
      totalMaintenanceCost: 0,
      totalDowntimeHours: 0,
      criticalAlerts: 0,
      oee: 0
    };
  }
};

// Calculate zone-level KPIs with enhanced error handling
export const calculateZoneKPIs = (zone: Zone | null | undefined): HierarchyKPIs => {
  try {
    if (!zone || typeof zone !== 'object') {
      console.warn('Invalid zone data provided to calculateZoneKPIs');
      return calculateHierarchyKPIs([]);
    }

    const allEquipment: Equipment[] = [];

    // Safe iteration over stations with validation
    if (zone.stations && Array.isArray(zone.stations)) {
      zone.stations.forEach(station => {
        try {
          if (station && typeof station === 'object') {
            // Safe iteration over lines
            if (station.lines && Array.isArray(station.lines)) {
              station.lines.forEach(line => {
                if (line && line.equipment && Array.isArray(line.equipment)) {
                  allEquipment.push(...line.equipment.filter(eq => eq && typeof eq === 'object'));
                }
              });
            }

            // Safe iteration over systems
            if (station.systems && Array.isArray(station.systems)) {
              station.systems.forEach(system => {
                if (system && system.equipment && Array.isArray(system.equipment)) {
                  allEquipment.push(...system.equipment.filter(eq => eq && typeof eq === 'object'));
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error processing station ${station?.id || 'unknown'}:`, error);
        }
      });
    }

    return calculateHierarchyKPIs(allEquipment);
  } catch (error) {
    console.error('Error in calculateZoneKPIs:', error);
    return calculateHierarchyKPIs([]);
  }
};

// Calculate station-level KPIs with enhanced error handling
export const calculateStationKPIs = (station: Station | null | undefined): HierarchyKPIs => {
  try {
    if (!station || typeof station !== 'object') {
      console.warn('Invalid station data provided to calculateStationKPIs');
      return calculateHierarchyKPIs([]);
    }

    const allEquipment: Equipment[] = [];

    // Safe iteration over lines with validation
    if (station.lines && Array.isArray(station.lines)) {
      station.lines.forEach(line => {
        try {
          if (line && line.equipment && Array.isArray(line.equipment)) {
            allEquipment.push(...line.equipment.filter(eq => eq && typeof eq === 'object'));
          }
        } catch (error) {
          console.error(`Error processing line ${line?.id || 'unknown'}:`, error);
        }
      });
    }

    // Safe iteration over systems with validation
    if (station.systems && Array.isArray(station.systems)) {
      station.systems.forEach(system => {
        try {
          if (system && system.equipment && Array.isArray(system.equipment)) {
            allEquipment.push(...system.equipment.filter(eq => eq && typeof eq === 'object'));
          }
        } catch (error) {
          console.error(`Error processing system ${system?.id || 'unknown'}:`, error);
        }
      });
    }

    return calculateHierarchyKPIs(allEquipment);
  } catch (error) {
    console.error('Error in calculateStationKPIs:', error);
    return calculateHierarchyKPIs([]);
  }
};

// Calculate line-level KPIs
export const calculateLineKPIs = (line: Line): HierarchyKPIs => {
  return calculateHierarchyKPIs(line.equipment);
};

// Calculate system-level KPIs
export const calculateSystemKPIs = (system: System): HierarchyKPIs => {
  return calculateHierarchyKPIs(system.equipment);
};

// Calculate overall hierarchy statistics
export const calculateOverallStats = (zones: Zone[]): HierarchyStats => {
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

      station.lines.forEach(line => {
        totalEquipment += line.equipment.length;
        line.equipment.forEach(eq => {
          if (eq.status === 'operational') operationalEquipment++;
          else if (eq.status === 'maintenance') maintenanceEquipment++;
          else if (eq.status === 'fault') faultEquipment++;

          criticalAlerts += eq.conditionMonitoring?.alerts?.filter(a => a.severity === 'critical').length || 0;
        });
      });

      station.systems.forEach(system => {
        totalEquipment += system.equipment.length;
        system.equipment.forEach(eq => {
          if (eq.status === 'operational') operationalEquipment++;
          else if (eq.status === 'maintenance') maintenanceEquipment++;
          else if (eq.status === 'fault') faultEquipment++;

          criticalAlerts += eq.conditionMonitoring?.alerts?.filter(a => a.severity === 'critical').length || 0;
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
