import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Aggregates vibration history records into per-equipment summaries for analytics and ML pipeline features.
 * Uses advanced formulas for health, risk, RUL, and alerts.
 * @param {VibrationHistoryRecord[]} history - The full vibration history log
 * @returns {Array} Array of equipment summaries for analytics
 */
export function aggregateVibrationHistory(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  // Group by equipmentId
  const grouped = history.reduce((acc, rec) => {
    if (!acc[rec.equipmentId]) acc[rec.equipmentId] = [];
    acc[rec.equipmentId].push(rec);
    return acc;
  }, {});

  // For each equipment, get latest record and aggregate stats
  return Object.values(grouped).map((records) => {
    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = records[0];
    const prev = records[1] || latest;
    const vibrationValues = records.map(r => r.vibrationRMS);
    const avgVibration = vibrationValues.reduce((a, b) => a + b, 0) / vibrationValues.length;
    const maxVibration = Math.max(...vibrationValues);
    const minVibration = Math.min(...vibrationValues);
    // Trend: (latest - oldest) / number of records
    const trend = (latest.vibrationRMS - records[records.length - 1].vibrationRMS) / records.length;
    // Alerts
    const alerts = [];
    if (latest.vibrationRMS > 10) {
      alerts.push({ type: 'Critical', message: 'Critical vibration detected', date: latest.date });
    } else if (latest.vibrationRMS > 7) {
      alerts.push({ type: 'High', message: 'High vibration detected', date: latest.date });
    } else if (trend > 0.5) {
      alerts.push({ type: 'Warning', message: 'Vibration rising rapidly', date: latest.date });
    }
    // Health Score (advanced)
    const vibrationScore = Math.max(0, 100 - latest.vibrationRMS * 8);
    const trendPenalty = trend > 0 ? Math.min(20, trend * 10) : 0;
    const alertPenalty = alerts.length * 5;
    // Simulate time since last maintenance (using date fields if available)
    const lastMaintenanceDate = latest.maintenanceDate ? new Date(latest.maintenanceDate) : new Date(latest.date);
    const timeSinceMaintenance = (new Date(latest.date) - lastMaintenanceDate) / (1000 * 60 * 60 * 24); // days
    const maintenancePenalty = timeSinceMaintenance > 180 ? 10 : 0;
    const healthScore = Math.max(0, vibrationScore - trendPenalty - alertPenalty - maintenancePenalty);
    // Risk Level (advanced)
    const probFailure = latest.vibrationRMS > 10 ? 0.9 :
      latest.vibrationRMS > 7 ? 0.7 :
        latest.vibrationRMS > 4 ? 0.4 : 0.1;
    const trendRisk = trend > 0.5 ? 0.2 : 0;
    const criticality = latest.criticality || 3; // 1–5 scale
    const environment = latest.environment || 2; // 1–5 scale
    const riskScore = (probFailure + trendRisk) * (criticality + environment);
    let riskLevel = 'Low';
    if (riskScore > 6) riskLevel = 'Critical';
    else if (riskScore > 4) riskLevel = 'High';
    else if (riskScore > 2) riskLevel = 'Medium';
    // Condition (based on health score)
    let condition = 'Good';
    if (healthScore < 20) condition = 'Critical';
    else if (healthScore < 40) condition = 'Poor';
    else if (healthScore < 60) condition = 'Fair';
    // RUL (advanced, linear projection)
    const safeThreshold = 7;
    const lastVib = latest.vibrationRMS;
    const prevVib = prev.vibrationRMS;
    const monthlyIncrease = lastVib - prevVib;
    const monthsToThreshold = monthlyIncrease > 0 ? (safeThreshold - lastVib) / monthlyIncrease : 12;
    const predictedRUL = Math.max(0, Math.round(monthsToThreshold));
    // Compose summary
    return {
      id: latest.equipmentId,
      name: latest.pumpNo || latest.equipmentId,
      zone: latest.zone,
      pumpStation: latest.pumpStation,
      vibration: avgVibration,
      vibrationLatest: latest.vibrationRMS,
      vibrationMax: maxVibration,
      vibrationMin: minVibration,
      healthScore,
      predictedRUL,
      riskLevel,
      riskScore,
      condition,
      maintenanceSchedule: latest.date,
      status: 'Active',
      estimatedCost: 10000,
      description: `Auto-generated summary for ${latest.pumpNo || latest.equipmentId}`,
      requiredParts: ['Standard Kit'],
      estimatedDuration: 4,
      assignedTechnician: 'Unassigned',
      age: 2,
      criticality,
      environment,
      rul: predictedRUL,
      trend,
      alerts,
      // Add more fields as needed for analytics
    };
  });
}
