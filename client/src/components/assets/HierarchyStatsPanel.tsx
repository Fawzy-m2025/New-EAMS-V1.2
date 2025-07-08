import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Building, 
  Layers, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Factory,
  TrendingUp,
  Activity
} from 'lucide-react';
import type { HierarchyStats } from "@/types/eams";

interface HierarchyStatsPanelProps {
  stats: HierarchyStats;
  className?: string;
}

export function HierarchyStatsPanel({
  stats,
  className = ""
}: HierarchyStatsPanelProps) {
  
  // Calculate percentages
  const operationalPercentage = stats.totalEquipment > 0 
    ? (stats.operationalEquipment / stats.totalEquipment) * 100 
    : 0;
  
  const maintenancePercentage = stats.totalEquipment > 0 
    ? (stats.maintenanceEquipment / stats.totalEquipment) * 100 
    : 0;
  
  const faultPercentage = stats.totalEquipment > 0 
    ? (stats.faultEquipment / stats.totalEquipment) * 100 
    : 0;

  const healthScore = Math.max(0, 100 - (faultPercentage * 2) - (maintenancePercentage * 0.5));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalZones}</p>
                <p className="text-sm text-muted-foreground">Zones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStations}</p>
                <p className="text-sm text-muted-foreground">Stations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLines}</p>
                <p className="text-sm text-muted-foreground">Lines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Factory className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSystems}</p>
                <p className="text-sm text-muted-foreground">Systems</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Equipment Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">
                  {stats.operationalEquipment}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Operational</p>
              <Progress value={operationalPercentage} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {operationalPercentage.toFixed(1)}%
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600">
                  {stats.maintenanceEquipment}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <Progress value={maintenancePercentage} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {maintenancePercentage.toFixed(1)}%
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">
                  {stats.faultEquipment}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Fault</p>
              <Progress value={faultPercentage} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {faultPercentage.toFixed(1)}%
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">
                  {stats.totalEquipment}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
              <Progress value={100} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Overall Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                <span className={`${
                  healthScore >= 80 ? 'text-green-600' :
                  healthScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {healthScore.toFixed(0)}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <Progress 
                value={healthScore} 
                className="mb-2 h-3"
              />
              <Badge className={`${
                healthScore >= 80 ? 'bg-green-100 text-green-800' :
                healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {healthScore >= 80 ? 'Excellent' :
                 healthScore >= 60 ? 'Good' :
                 healthScore >= 40 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                <span className={`${
                  stats.criticalAlerts === 0 ? 'text-green-600' :
                  stats.criticalAlerts <= 5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {stats.criticalAlerts}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Active critical alerts
              </p>
              <Badge className={`${
                stats.criticalAlerts === 0 ? 'bg-green-100 text-green-800' :
                stats.criticalAlerts <= 5 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {stats.criticalAlerts === 0 ? 'All Clear' :
                 stats.criticalAlerts <= 5 ? 'Attention Needed' :
                 'Immediate Action Required'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactHierarchyStats({
  stats,
  className = ""
}: HierarchyStatsPanelProps) {
  const operationalPercentage = stats.totalEquipment > 0 
    ? (stats.operationalEquipment / stats.totalEquipment) * 100 
    : 0;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{stats.totalEquipment}</span>
        <span className="text-xs text-muted-foreground">assets</span>
      </div>
      
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">{operationalPercentage.toFixed(0)}%</span>
        <span className="text-xs text-muted-foreground">operational</span>
      </div>
      
      {stats.criticalAlerts > 0 && (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-red-600">{stats.criticalAlerts}</span>
          <span className="text-xs text-muted-foreground">alerts</span>
        </div>
      )}
    </div>
  );
}
