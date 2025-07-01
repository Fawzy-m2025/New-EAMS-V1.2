import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Equipment } from "@/types/eams";
import { Activity, Wifi, AlertTriangle, TrendingUp, MapPin, Thermometer } from "lucide-react";
import { EnhancedChart } from "@/components/charts/EnhancedChart";

interface RealTimeMonitoringProps {
  equipment: Equipment[];
}

interface AssetDistribution {
  name: string;
  value: number;
  color: string;
}

interface UtilizationTrend {
  time: string;
  utilization: number;
}

export function RealTimeMonitoring({ equipment }: RealTimeMonitoringProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate WebSocket connection
  useEffect(() => {
    setIsConnected(true);
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const assetDistribution: AssetDistribution[] = useMemo(() => {
    const statusCounts = equipment.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      operational: '#22c55e',
      maintenance: '#eab308',
      fault: '#ef4444',
      offline: '#6b7280',
      testing: '#3b82f6'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [equipment]);

  const utilizationTrends: UtilizationTrend[] = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (new Date().getHours() - 23 + i + 24) % 24;
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        utilization: Math.floor(Math.random() * 30) + 60 // Random between 60-90%
      };
    });
    return hours;
  }, []);

  const criticalAlerts = useMemo(() => {
    return equipment.filter(asset =>
      asset.conditionMonitoring.alerts.some(alert => alert.severity === 'critical')
    );
  }, [equipment]);

  const highTrafficAreas = useMemo(() => {
    const areas = equipment.reduce((acc, asset) => {
      const area = asset.location.building || 'Unknown';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(areas)
      .map(([area, count]) => ({ area, count, traffic: Math.random() * 100 }))
      .sort((a, b) => b.traffic - a.traffic);
  }, [equipment]);

  // Transform data for Chart.js format
  const pieChartData = {
    labels: assetDistribution.map(item => item.name),
    datasets: [{
      label: 'Asset Distribution',
      data: assetDistribution.map(item => item.value),
      backgroundColor: assetDistribution.map(item => item.color),
      borderColor: assetDistribution.map(item => item.color),
      borderWidth: 2,
    }],
  };

  const barChartData = {
    labels: utilizationTrends.map(item => item.time),
    datasets: [{
      label: 'Utilization (%)',
      data: utilizationTrends.map(item => item.utilization),
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 4,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Real-time monitoring active' : 'Connection lost'}
              </span>
              <Badge variant="secondary" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Distribution Pie Chart */}
        <EnhancedChart
          title="Asset Distribution by Status"
          description="Real-time overview of equipment status"
          type="doughnut"
          data={pieChartData}
          height={300}
          preset="dashboard"
          colorScheme="vibrant"
          animation="bounce"
          showControls={true}
          showLegend={true}
          interactive={true}
          exportable={true}
          refreshable={true}
        />

        {/* Utilization Trends */}
        <EnhancedChart
          title="24-Hour Utilization Trends"
          description="Equipment usage patterns throughout the day"
          type="bar"
          data={barChartData}
          height={300}
          preset="analytics"
          colorScheme="gradient"
          animation="slide"
          showControls={true}
          showLegend={true}
          interactive={true}
          exportable={true}
          refreshable={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Critical Alerts
            </CardTitle>
            <CardDescription>Assets requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {criticalAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No critical alerts at this time
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.slice(0, 5).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.location.building}</div>
                      </div>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* High Traffic Areas Heat Map */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              High Traffic Areas
            </CardTitle>
            <CardDescription>Areas with highest equipment density</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highTrafficAreas.slice(0, 5).map((area, index) => (
                <div key={area.area} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{area.area}</div>
                      <div className="text-sm text-muted-foreground">{area.count} assets</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{area.traffic.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">traffic</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-green-500" />
            System Health Overview
          </CardTitle>
          <CardDescription>Overall system performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((assetDistribution.find(d => d.name === 'operational')?.value || 0) / equipment.length * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Operational Rate</div>
              <Progress
                value={(assetDistribution.find(d => d.name === 'operational')?.value || 0) / equipment.length * 100}
                className="mt-2"
              />
            </div>

            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {utilizationTrends.reduce((acc, trend) => acc + trend.utilization, 0) / utilizationTrends.length}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Utilization</div>
              <Progress
                value={utilizationTrends.reduce((acc, trend) => acc + trend.utilization, 0) / utilizationTrends.length}
                className="mt-2"
              />
            </div>

            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {criticalAlerts.length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
              <div className="text-xs text-muted-foreground mt-1">
                {criticalAlerts.length > 0 ? 'Requires attention' : 'All systems normal'}
              </div>
            </div>

            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {equipment.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
              <div className="text-xs text-muted-foreground mt-1">
                {equipment.filter(e => e.status === 'operational').length} operational
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
