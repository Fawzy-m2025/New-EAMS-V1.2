import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, glassCardClass } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { CinematicKPICarousel } from './CinematicKPICarousel';
import {
    Clock, CheckCircle, Target, Users, Brain, Shield,
    TrendingUp, AlertTriangle, Calendar, Wrench, Gauge, DollarSign
} from 'lucide-react';
import type { WorkOrder, Zone } from '@/types/eams';
import { useAssetContext } from '@/contexts/AssetContext';
import { getRULPredictionsFromHistory } from '@/data/enhancedMLPipelineData';
import { calculateOverallStats, calculateHierarchyKPIs } from '@/utils/kpiCalculations';

interface EnhancedKPIDashboardProps {
    workOrders: WorkOrder[];
    zones?: Zone[]; // For dynamic KPI calculations
}

interface KPIMetric {
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    description: string;
}

export function EnhancedKPIDashboard({ workOrders, zones = [] }: EnhancedKPIDashboardProps) {
    const { vibrationHistory, equipment } = useAssetContext();
    const rulPredictions = getRULPredictionsFromHistory(vibrationHistory);
    const criticalCount = rulPredictions.filter(r => r.condition === 'Critical').length;
    const total = rulPredictions.length;
    const percentCritical = total > 0 ? (criticalCount / total) * 100 : 0;

    // Calculate dynamic KPIs from actual equipment data
    const overallStats = zones.length > 0 ? calculateOverallStats(zones) : null;
    const hierarchyKPIs = equipment.length > 0 ? calculateHierarchyKPIs(equipment) : null;

    // Calculate comprehensive KPIs
    const calculateKPIs = (): KPIMetric[] => {
        const totalOrders = workOrders.length;
        const completedOrders = workOrders.filter(wo => wo.status === 'completed').length;
        const onTimeOrders = workOrders.filter(wo =>
            wo.status === 'completed' &&
            new Date(wo.completedDate || '') <= new Date(wo.dueDate)
        ).length;

        const avgRepairTime = workOrders
            .filter(wo => wo.actualHours && wo.type !== 'Preventive')
            .reduce((acc, wo) => acc + (wo.actualHours || 0), 0) /
            workOrders.filter(wo => wo.actualHours && wo.type !== 'Preventive').length || 0;

        return [
            {
                name: 'On-Time Completion Rate (OTCR)',
                value: totalOrders > 0 ? (onTimeOrders / completedOrders) * 100 : 0,
                target: 95,
                unit: '%',
                trend: 5.2,
                status: 'excellent',
                description: 'ISO 14224 compliance metric'
            },
            {
                name: 'Mean Time to Repair (MTTR)',
                value: avgRepairTime,
                target: 4,
                unit: 'hours',
                trend: -12,
                status: 'good',
                description: 'Critical asset responsiveness'
            },
            {
                name: 'Maintenance Backlog',
                value: hierarchyKPIs ? Math.round(hierarchyKPIs.totalMaintenanceCost / 10000) / 10 : 3.2,
                target: 4,
                unit: 'weeks',
                trend: -8,
                status: 'good',
                description: 'Resource adequacy indicator'
            },
            {
                name: 'First-Pass Yield (FPY)',
                value: hierarchyKPIs ? Math.round(hierarchyKPIs.avgReliability) : 92,
                target: 90,
                unit: '%',
                trend: 3.1,
                status: 'excellent',
                description: 'Quality of maintenance work'
            },
            {
                name: 'Technician Utilization',
                value: hierarchyKPIs ? Math.round(hierarchyKPIs.avgAvailability) : 87,
                target: 80,
                unit: '%',
                trend: 2.4,
                status: 'excellent',
                description: 'Labor allocation efficiency'
            },
            {
                name: 'Predictive Success Rate',
                value: 88,
                target: 85,
                unit: '%',
                trend: 7.3,
                status: 'excellent',
                description: 'AI prediction accuracy'
            },
            {
                name: 'Compliance Adherence',
                value: 100,
                target: 100,
                unit: '%',
                trend: 0,
                status: 'excellent',
                description: 'OSHA, ISO, IEEE standards'
            }
        ];
    };

    const kpis = calculateKPIs();

    // Add vibration-based KPI
    const vibrationKPIs = [
        {
            name: 'Critical Equipment (%)',
            value: percentCritical,
            target: 0,
            unit: '%',
            trend: 0,
            status: percentCritical > 10 ? 'critical' : 'good',
            description: 'Equipment in critical vibration state'
        }
    ];

    const keyKPICards = [
        {
            icon: <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" />,
            status: 'excellent',
            statusColor: 'text-green-600 bg-green-100',
            value: '27%',
            label: 'Completion Rate',
            progress: 27,
            progressColor: '#22c55e',
            target: 'Target: 25%',
            trendIcon: <TrendingUp className="h-3 w-3" />,
            trend: '5.0%',
            trendColor: 'text-green-500'
        },
        {
            icon: <Clock className="h-4 w-4 text-blue-500 animate-pulse" />,
            status: 'good',
            statusColor: 'text-blue-600 bg-blue-100',
            value: '4.6h',
            label: 'Avg Completion Time',
            progress: 46,
            progressColor: '#3b82f6',
            target: 'Target: 5.0h',
            trendIcon: <TrendingUp className="h-3 w-3" />,
            trend: '-10.0%',
            trendColor: 'text-green-500'
        },
        {
            icon: <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />,
            status: 'critical',
            statusColor: 'text-red-600 bg-red-100',
            value: '11',
            label: 'Overdue Orders',
            progress: 55,
            progressColor: '#ef4444',
            target: 'Target: 5',
            trendIcon: <TrendingUp className="h-3 w-3 rotate-180" />,
            trend: '+15.0%',
            trendColor: 'text-red-500'
        },
        {
            icon: <DollarSign className="h-4 w-4 text-green-500 animate-pulse" />,
            status: 'excellent',
            statusColor: 'text-green-600 bg-green-100',
            value: '$1553',
            label: 'Avg Cost per Order',
            progress: 78,
            progressColor: '#22c55e',
            target: 'Target: $2000',
            trendIcon: <TrendingUp className="h-3 w-3" />,
            trend: '-8.0%',
            trendColor: 'text-green-500'
        }
    ];

    // Function to get the color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getGaugeColor = (value: number, target: number) => {
        const ratio = value / target;
        if (ratio >= 1) return '#22c55e'; // Green
        if (ratio >= 0.8) return '#3b82f6'; // Blue
        if (ratio >= 0.6) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    // Combine key KPI cards, other KPIs, and vibration KPIs
    const allKPICards = [
        ...keyKPICards.map(card => ({ ...card, type: 'key' })),
        ...kpis.map((kpi, index) => ({
            icon: index === 0 ? <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" /> :
                index === 1 ? <Clock className="h-4 w-4 text-blue-500 animate-pulse" /> :
                    index === 2 ? <Calendar className="h-4 w-4 text-orange-500 animate-pulse" /> :
                        index === 3 ? <Target className="h-4 w-4 text-purple-500 animate-pulse" /> :
                            index === 4 ? <Users className="h-4 w-4 text-indigo-500 animate-pulse" /> :
                                index === 5 ? <Brain className="h-4 w-4 text-pink-500 animate-pulse" /> :
                                    <Shield className="h-4 w-4 text-emerald-500 animate-pulse" />,
            status: kpi.status,
            statusColor: getStatusColor(kpi.status),
            value: `${kpi.value.toFixed(1)}${kpi.unit}`,
            label: kpi.name,
            progress: (kpi.value / kpi.target) * 100,
            progressColor: getGaugeColor(kpi.value, kpi.target),
            target: `Target: ${kpi.target}${kpi.unit}`,
            trendIcon: kpi.trend > 0 ? <TrendingUp className="h-3 w-3" /> :
                kpi.trend < 0 ? <TrendingUp className="h-3 w-3 rotate-180" /> :
                    <span>-</span>,
            trend: `${Math.abs(kpi.trend).toFixed(1)}%`,
            trendColor: kpi.trend > 0 ? 'text-green-500' : kpi.trend < 0 ? 'text-red-500' : 'text-gray-500',
            type: 'kpi',
        })),
        ...vibrationKPIs.map((kpi) => ({
            icon: <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />,
            status: kpi.status,
            statusColor: getStatusColor(kpi.status),
            value: `${kpi.value.toFixed(1)}${kpi.unit}`,
            label: kpi.name,
            progress: kpi.value,
            type: 'vibration',
        })),
    ];

    // Use CinematicKPICarousel for smooth sliding effect

    // Chart data for Chart.js
    const utilizationData = {
        labels: ['John S.', 'Mike J.', 'Sarah W.', 'Team A'],
        datasets: [{
            label: 'Technician Utilization',
            data: [92, 88, 85, 90],
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: 6,
        }],
    };

    const trendData = {
        labels: Array.from({ length: 12 }, (_, i) =>
            new Date(0, i).toLocaleDateString('en-US', { month: 'short' })
        ),
        datasets: [
            {
                label: 'OTCR (%)',
                data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 90),
                borderColor: '#22c55e',
                backgroundColor: '#22c55e' + '20',
                tension: 0.4,
            },
            {
                label: 'MTTR (hours)',
                data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 2) + 3),
                borderColor: '#3b82f6',
                backgroundColor: '#3b82f6' + '20',
                tension: 0.4,
            },
            {
                label: 'FPY (%)',
                data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 8) + 88),
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b' + '20',
                tension: 0.4,
            }
        ],
    };

    const backlogData = {
        labels: ['Pumps', 'Generators', 'HVAC', 'Valves'],
        datasets: [{
            label: 'Backlog Hours',
            data: [120, 80, 60, 40],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            borderColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 2,
        }],
    };

    const complianceData = {
        labels: ['OSHA', 'ISO 14224', 'IEEE', 'Internal'],
        datasets: [{
            label: 'Compliance Rate (%)',
            data: [100, 98, 100, 96],
            backgroundColor: ['#22c55e', '#3b82f6', '#10b981', '#f59e0b'],
            borderColor: ['#22c55e', '#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 2,
        }],
    };

    if (!workOrders || workOrders.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Enhanced KPI Dashboard</h2>
                        <p className="text-muted-foreground">No data available for display. Please ensure work orders are loaded.</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800">Real-time</Badge>
                        <Badge className="bg-blue-100 text-blue-800">ISO Compliant</Badge>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold gradient-text">Enhanced KPI Dashboard</h2>
                    <p className="text-muted-foreground">Real-time maintenance performance indicators</p>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-800">Real-time</Badge>
                    <Badge className="bg-blue-100 text-blue-800">ISO Compliant</Badge>
                </div>
            </div>

            {/* Unified KPI Cards with Cinematic Auto-Rotating Slider */}
            <CinematicKPICarousel workOrders={workOrders} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technician Utilization */}
                <EnhancedChart
                    title="Technician Utilization"
                    description="Current utilization rates by technician"
                    type="bar"
                    data={utilizationData}
                    height={300}
                    preset="financial"
                    colorScheme="financial"
                    animation="slide"
                    showControls={true}
                    showLegend={true}
                    interactive={true}
                    exportable={true}
                    refreshable={true}
                />

                {/* KPI Trends */}
                <EnhancedChart
                    title="KPI Trends (12 Months)"
                    description="Performance trends over the last year"
                    type="line"
                    data={trendData}
                    height={300}
                    preset="analytics"
                    colorScheme="gradient"
                    animation="fade"
                    showControls={true}
                    showLegend={true}
                    interactive={true}
                    exportable={true}
                    refreshable={true}
                />

                {/* Maintenance Backlog */}
                <EnhancedChart
                    title="Maintenance Backlog by Type"
                    description="Pending work hours by equipment type"
                    type="doughnut"
                    data={backlogData}
                    height={300}
                    preset="dashboard"
                    colorScheme="financial"
                    animation="bounce"
                    showControls={true}
                    showLegend={true}
                    interactive={true}
                    exportable={true}
                    refreshable={true}
                />

                {/* Compliance Status */}
                <EnhancedChart
                    title="Compliance Status"
                    description="Adherence to various standards and regulations"
                    type="bar"
                    data={complianceData}
                    height={300}
                    preset="presentation"
                    colorScheme="vibrant"
                    animation="zoom"
                    showControls={true}
                    showLegend={true}
                    interactive={true}
                    exportable={true}
                    refreshable={true}
                />
            </div>

            {/* Summary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={glassCardClass}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Top Performing KPI</span>
                        </div>
                        <div className="text-lg font-bold">Compliance Adherence</div>
                        <div className="text-xs text-muted-foreground">100% across all standards</div>
                    </CardContent>
                </Card>

                <Card className={glassCardClass}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Needs Attention</span>
                        </div>
                        <div className="text-lg font-bold">MTTR</div>
                        <div className="text-xs text-muted-foreground">12% improvement needed</div>
                    </CardContent>
                </Card>

                <Card className={glassCardClass}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Overall Performance</span>
                        </div>
                        <div className="text-lg font-bold">94.2%</div>
                        <div className="text-xs text-muted-foreground">Above target average</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
