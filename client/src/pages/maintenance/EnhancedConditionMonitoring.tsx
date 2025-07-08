import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Activity,
    Thermometer,
    Zap,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    Filter,
    Eye,
    Settings,
    Download,
    RefreshCw,
    MapPin,
    Brain,
    Factory,
    Gauge,
    BarChart3,
    Waves,
    Shield,
    Target,
    Database,
    Clock,
    Calendar,
    Users,
    Wrench
} from 'lucide-react';
import { useAssetContext } from '@/contexts/AssetContext';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { allHierarchicalEquipment } from '@/data/hierarchicalAssetData';
import EnhancedVibrationForm from './EnhancedVibrationForm';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import EnhancedPredictiveAnalytics from './EnhancedPredictiveAnalytics';

// Equipment health status calculation
const calculateEquipmentHealth = (equipment: any) => {
    // Simulate health calculation based on equipment age, type, and manufacturer
    const baseHealth = 85;
    const ageFactors = {
        'new': 0,
        'good': -5,
        'fair': -15,
        'poor': -30
    };

    const manufacturerFactors = {
        'HMS': 5,
        'SAER': 5,
        'ABB': 8,
        'ROBUSCHI/Italy': 6,
        'ELDIN': 0,
        'El Haggar Misr': -3
    };

    const categoryFactors = {
        'pump': 0,
        'motor': 5,
        'compressor': -5,
        'valve': 10,
        'sensor': 8
    };

    const health = baseHealth +
        (ageFactors[equipment.condition as keyof typeof ageFactors] || 0) +
        (manufacturerFactors[equipment.manufacturer as keyof typeof manufacturerFactors] || 0) +
        (categoryFactors[equipment.category as keyof typeof categoryFactors] || 0) +
        (Math.random() * 20 - 10); // Add some randomness

    return Math.max(0, Math.min(100, Math.round(health)));
};

// Generate equipment health data
const generateEquipmentHealthData = () => {
    return allHierarchicalEquipment.map(equipment => ({
        ...equipment,
        health: calculateEquipmentHealth(equipment),
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vibrationLevel: Math.random() * 10,
        temperature: 35 + Math.random() * 20,
        operatingHours: Math.floor(Math.random() * 8760),
        alerts: Math.floor(Math.random() * 3)
    }));
};

const EnhancedConditionMonitoring: React.FC = () => {
    const { vibrationHistory } = useAssetContext();
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [healthFilter, setHealthFilter] = useState('all');
    const [showVibrationForm, setShowVibrationForm] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
    const [equipmentData, setEquipmentData] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Initialize equipment data
    useEffect(() => {
        setEquipmentData(generateEquipmentHealthData());
    }, []);

    // Filter equipment based on search and filters
    const filteredEquipment = equipmentData.filter(equipment => {
        const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipment.assetTag.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || equipment.category === categoryFilter;
        const matchesHealth = healthFilter === 'all' ||
            (healthFilter === 'good' && equipment.health >= 80) ||
            (healthFilter === 'warning' && equipment.health >= 60 && equipment.health < 80) ||
            (healthFilter === 'critical' && equipment.health < 60);
        return matchesSearch && matchesCategory && matchesHealth;
    });

    // Calculate summary statistics
    const summaryStats = {
        total: equipmentData.length,
        healthy: equipmentData.filter(eq => eq.health >= 80).length,
        warning: equipmentData.filter(eq => eq.health >= 60 && eq.health < 80).length,
        critical: equipmentData.filter(eq => eq.health < 60).length,
        avgHealth: Math.round(equipmentData.reduce((sum, eq) => sum + eq.health, 0) / equipmentData.length),
        totalAlerts: equipmentData.reduce((sum, eq) => sum + eq.alerts, 0)
    };

    // Get health status color and icon
    const getHealthStatus = (health: number) => {
        if (health >= 80) return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Healthy' };
        if (health >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle, label: 'Warning' };
        return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'Critical' };
    };

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => {
            setEquipmentData(generateEquipmentHealthData());
            setRefreshing(false);
        }, 1000);
    };

    // Chart data for trends
    const vibrationTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Average Vibration (mm/s)',
                data: [2.1, 2.3, 2.0, 2.4, 2.2, 2.1],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }
        ]
    };

    const healthDistributionData = {
        labels: ['Healthy', 'Warning', 'Critical'],
        datasets: [
            {
                data: [summaryStats.healthy, summaryStats.warning, summaryStats.critical],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }
        ]
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Enhanced Condition Monitoring</h1>
                    <p className="text-muted-foreground">
                        Professional equipment health monitoring and vibration analysis
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setShowVibrationForm(true)}
                        className="flex items-center gap-2"
                    >
                        <Waves className="h-4 w-4" />
                        New Vibration Reading
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Equipment</p>
                                <p className="text-2xl font-bold">{summaryStats.total}</p>
                            </div>
                            <Factory className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Average Health</p>
                                <p className="text-2xl font-bold">{summaryStats.avgHealth}%</p>
                            </div>
                            <Target className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Alerts</p>
                                <p className="text-2xl font-bold">{summaryStats.totalAlerts}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Critical Items</p>
                                <p className="text-2xl font-bold">{summaryStats.critical}</p>
                            </div>
                            <Shield className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment Health</TabsTrigger>
                    <TabsTrigger value="vibration">Vibration Analysis</TabsTrigger>
                    <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
                    <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Health Distribution Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Equipment Health Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    type="doughnut"
                                    data={healthDistributionData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Vibration Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Waves className="h-5 w-5" />
                                    Vibration Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    type="line"
                                    data={vibrationTrendData}
                                    options={{
                                        responsive: true,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: 'Vibration (mm/s)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Recent Alerts & Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {equipmentData.filter(eq => eq.alerts > 0).slice(0, 5).map((equipment, index) => (
                                    <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <p className="font-medium">{equipment.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {equipment.location?.zone} → {equipment.location?.station}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{equipment.alerts} alerts</Badge>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Equipment Health Tab */}
                <TabsContent value="equipment" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search equipment..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="pump">Pumps</SelectItem>
                                        <SelectItem value="motor">Motors</SelectItem>
                                        <SelectItem value="compressor">Compressors</SelectItem>
                                        <SelectItem value="valve">Valves</SelectItem>
                                        <SelectItem value="sensor">Sensors</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={healthFilter} onValueChange={setHealthFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Health Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="good">Healthy</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEquipment.map((equipment) => {
                            const healthStatus = getHealthStatus(equipment.health);
                            const HealthIcon = healthStatus.icon;

                            return (
                                <Card key={equipment.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-sm font-medium line-clamp-1">
                                                    {equipment.name}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {equipment.assetTag}
                                                </p>
                                            </div>
                                            <div className={`p-1 rounded-full ${healthStatus.bg}`}>
                                                <HealthIcon className={`h-4 w-4 ${healthStatus.color}`} />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-3">
                                        {/* Health Progress */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Health Score</span>
                                                <span className={healthStatus.color}>{equipment.health}%</span>
                                            </div>
                                            <Progress value={equipment.health} className="h-2" />
                                        </div>

                                        {/* Equipment Details */}
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Factory className="h-3 w-3 text-gray-400" />
                                                <span>{equipment.manufacturer}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                <span className="line-clamp-1">
                                                    {equipment.location?.zone} → {equipment.location?.station}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="h-3 w-3 text-gray-400" />
                                                <span>{equipment.temperature.toFixed(1)}°C</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Waves className="h-3 w-3 text-gray-400" />
                                                <span>{equipment.vibrationLevel.toFixed(2)} mm/s</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs"
                                                onClick={() => {
                                                    setSelectedEquipment(equipment);
                                                    setShowVibrationForm(true);
                                                }}
                                            >
                                                <Waves className="h-3 w-3 mr-1" />
                                                Monitor
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-xs">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Alerts */}
                                        {equipment.alerts > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {equipment.alerts} alert{equipment.alerts > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Vibration Analysis Tab */}
                <TabsContent value="vibration" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Vibration History Table */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Recent Vibration Readings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">Date</th>
                                                <th className="text-left p-2">Equipment</th>
                                                <th className="text-left p-2">Location</th>
                                                <th className="text-left p-2">RMS (mm/s)</th>
                                                <th className="text-left p-2">Status</th>
                                                <th className="text-left p-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vibrationHistory.slice(0, 10).map((record) => {
                                                const equipment = allHierarchicalEquipment.find(eq => eq.id === record.equipmentId);
                                                const vibrationLevel = record.vibrationRMS || 0;
                                                const status = vibrationLevel < 2.8 ? 'good' : vibrationLevel < 7.1 ? 'warning' : 'critical';
                                                const statusColors = {
                                                    good: 'text-green-600 bg-green-100',
                                                    warning: 'text-yellow-600 bg-yellow-100',
                                                    critical: 'text-red-600 bg-red-100'
                                                };

                                                return (
                                                    <tr key={record.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-2">{record.date}</td>
                                                        <td className="p-2 font-medium">
                                                            {equipment?.name || record.pumpNo}
                                                        </td>
                                                        <td className="p-2 text-xs">
                                                            {equipment?.location?.zone} → {equipment?.location?.station}
                                                        </td>
                                                        <td className="p-2">{vibrationLevel.toFixed(2)}</td>
                                                        <td className="p-2">
                                                            <Badge className={`text-xs ${statusColors[status as keyof typeof statusColors]}`}>
                                                                {status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-2">
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ISO 10816 Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    ISO 10816 Guidelines
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium">Zone A (Good)</p>
                                            <p className="text-xs text-muted-foreground">≤ 2.8 mm/s RMS</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium">Zone B (Acceptable)</p>
                                            <p className="text-xs text-muted-foreground">2.8 - 7.1 mm/s RMS</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium">Zone C (Unsatisfactory)</p>
                                            <p className="text-xs text-muted-foreground">7.1 - 18.0 mm/s RMS</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium">Zone D (Unacceptable)</p>
                                            <p className="text-xs text-muted-foreground">&gt; 18.0 mm/s RMS</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="text-xs text-muted-foreground">
                                    <p className="font-medium mb-1">Equipment Classes:</p>
                                    <p>• Class I: Small machines (≤15kW)</p>
                                    <p>• Class II: Medium machines (15-75kW)</p>
                                    <p>• Class III: Large machines (75-300kW)</p>
                                    <p>• Class IV: Large machines (&gt;300kW)</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Trends & Analytics Tab */}
                <TabsContent value="trends" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Equipment Health Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Equipment Health Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    type="line"
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                        datasets: [
                                            {
                                                label: 'Average Health Score',
                                                data: [88, 87, 89, 86, 88, 87],
                                                borderColor: 'rgb(34, 197, 94)',
                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                tension: 0.4
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                                min: 80,
                                                max: 100,
                                                title: {
                                                    display: true,
                                                    text: 'Health Score (%)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Maintenance Predictions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Predictive Maintenance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-sm">HMS D200-500A-GGG(485)</p>
                                            <Badge variant="outline" className="text-xs">7 days</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Predicted bearing replacement needed based on vibration trends
                                        </p>
                                        <Progress value={85} className="h-2 mt-2" />
                                    </div>

                                    <div className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-sm">ELDIN А355SMA4FБT2</p>
                                            <Badge variant="outline" className="text-xs">14 days</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Motor alignment check recommended due to increasing vibration
                                        </p>
                                        <Progress value={65} className="h-2 mt-2" />
                                    </div>

                                    <div className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-sm">ROBUSCHI RVS14/M</p>
                                            <Badge variant="outline" className="text-xs">21 days</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Routine maintenance scheduled based on operating hours
                                        </p>
                                        <Progress value={45} className="h-2 mt-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Predictive Analytics Tab */}
                <TabsContent value="predictive" className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Advanced Predictive Analytics</h3>
                                <p className="text-sm text-muted-foreground">
                                    Standards-compliant reliability engineering and predictive maintenance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-xs">ISO 55001</Badge>
                            <Badge variant="outline" className="text-xs">ISO 14224</Badge>
                            <Badge variant="outline" className="text-xs">CRE Standards</Badge>
                            <Badge variant="outline" className="text-xs">OREDA 2015</Badge>
                            <Badge variant="outline" className="text-xs">NSWC-10</Badge>
                        </div>
                    </div>

                    {/* Embedded Enhanced Predictive Analytics */}
                    <EnhancedPredictiveAnalytics />
                </TabsContent>
            </Tabs>

            {/* Enhanced Vibration Form */}
            <EnhancedVibrationForm
                open={showVibrationForm}
                onClose={() => {
                    setShowVibrationForm(false);
                    setSelectedEquipment(null);
                }}
            />
        </div>
    );
};

export default EnhancedConditionMonitoring;
