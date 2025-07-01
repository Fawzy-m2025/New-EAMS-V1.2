import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle,
    Clock,
    Target,
    Zap,
    Gauge,
    Activity,
    BarChart3,
    Settings,
    Users,
    FileText,
    Shield,
    Database,
    Cpu,
    Wrench,
    Eye,
    ChevronDown,
    Download,
    XCircle,
    DollarSign,
    AlertCircle,
    Calendar,
    Bell
} from 'lucide-react';
import mlService from '@/services/mlService';
import { enhancedAssetData } from '@/data/enhancedAssetData';
import EnhancedMLPipelines from './EnhancedMLPipelines';
import {
    equipmentHealthScores as mockEquipmentHealthScores,
    equipmentPredictiveAlerts as mockEquipmentPredictiveAlerts,
    equipmentWeibullData as mockEquipmentWeibullData,
    equipmentMaintenanceOptimization as mockEquipmentMaintenanceOptimization,
    equipmentPrescriptiveActions as mockEquipmentPrescriptiveActions
} from '@/data/advancedPredictiveAnalyticsData';

const AdvancedPredictiveAnalytics: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [showPredictiveDropdown, setShowPredictiveDropdown] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [equipmentChangeLoading, setEquipmentChangeLoading] = useState(false);

    // Equipment-specific data
    const [equipmentHealthScores, setEquipmentHealthScores] = useState(mockEquipmentHealthScores);
    const [equipmentPredictiveAlerts, setEquipmentPredictiveAlerts] = useState(mockEquipmentPredictiveAlerts);
    const [equipmentWeibullData, setEquipmentWeibullData] = useState(mockEquipmentWeibullData);
    const [equipmentMaintenanceOptimization, setEquipmentMaintenanceOptimization] = useState(mockEquipmentMaintenanceOptimization);
    const [equipmentPrescriptiveActions, setEquipmentPrescriptiveActions] = useState(mockEquipmentPrescriptiveActions);

    // Get available equipment for selection
    const availableEquipment = enhancedAssetData.map(asset => ({
        id: asset.id,
        name: asset.name,
        category: asset.category
    }));

    // Equipment-specific data fetching
    const fetchEquipmentData = async () => {
        try {
            setLoading(true);

            // Fetch equipment-specific data
            const [
                healthScores,
                predictiveAlerts,
                weibullData,
                maintenanceOpt,
                prescriptiveActions
            ] = await Promise.all([
                mlService.getEquipmentHealthScores(),
                mlService.getEquipmentPredictiveAlerts(),
                mlService.getEquipmentWeibullAnalysis(),
                mlService.getEquipmentMaintenanceOptimization(),
                mlService.getEquipmentPrescriptiveActions()
            ]);

            setEquipmentHealthScores(healthScores);
            setEquipmentPredictiveAlerts(predictiveAlerts);
            setEquipmentWeibullData(weibullData);
            setEquipmentMaintenanceOptimization(maintenanceOpt);
            setEquipmentPrescriptiveActions(prescriptiveActions);

            setError(null);
        } catch (err) {
            console.error('Error fetching equipment data:', err);
            setError('Failed to fetch equipment data');
        } finally {
            setLoading(false);
            setEquipmentChangeLoading(false);
        }
    };

    // Load equipment data on component mount
    useEffect(() => {
        fetchEquipmentData();
    }, []);

    // Set loading state when equipment selection changes
    useEffect(() => {
        if (selectedEquipment && selectedEquipment !== 'all') {
            setEquipmentChangeLoading(true);
            // Simulate a brief loading time for equipment change
            const timer = setTimeout(() => {
                setEquipmentChangeLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [selectedEquipment]);

    // Filter data by selected equipment
    const filteredHealthScores = selectedEquipment === 'all'
        ? equipmentHealthScores
        : equipmentHealthScores.filter(score => score.assetId === selectedEquipment);

    const filteredPredictiveAlerts = selectedEquipment === 'all'
        ? equipmentPredictiveAlerts
        : equipmentPredictiveAlerts.filter(alert => alert.equipmentId === selectedEquipment);

    const filteredWeibullData = selectedEquipment === 'all'
        ? equipmentWeibullData
        : equipmentWeibullData.filter(weibull => weibull.equipmentId === selectedEquipment);

    const filteredMaintenanceOptimization = selectedEquipment === 'all'
        ? equipmentMaintenanceOptimization
        : equipmentMaintenanceOptimization.filter(opt => opt.equipmentId === selectedEquipment);

    const filteredPrescriptiveActions = selectedEquipment === 'all'
        ? equipmentPrescriptiveActions
        : equipmentPrescriptiveActions.filter(action => action.equipmentId === selectedEquipment);

    // Get Weibull parameters for selected equipment
    const getWeibullParamsForEquipment = () => {
        if (selectedEquipment === 'all') {
            // Return average parameters for all equipment
            return {
                shapeParameter: 3.0,
                scaleParameter: 8000,
                confidenceInterval: {
                    lower: 2.7,
                    upper: 3.3
                },
                goodnessOfFit: {
                    rSquared: 0.95,
                    kolmogorovSmirnov: 0.045,
                    andersonDarling: 0.32
                }
            };
        }

        // Get specific equipment Weibull data
        const equipmentWeibull = filteredWeibullData[0];
        if (equipmentWeibull) {
            return {
                shapeParameter: equipmentWeibull.shapeParameter || 3.0,
                scaleParameter: equipmentWeibull.scaleParameter || 8000,
                confidenceInterval: {
                    lower: 2.7,
                    upper: 3.3
                },
                goodnessOfFit: {
                    rSquared: 0.95,
                    kolmogorovSmirnov: 0.045,
                    andersonDarling: 0.32
                }
            };
        }

        // Fallback to default parameters
        return {
            shapeParameter: 3.0,
            scaleParameter: 8000,
            confidenceInterval: {
                lower: 2.7,
                upper: 3.3
            },
            goodnessOfFit: {
                rSquared: 0.95,
                kolmogorovSmirnov: 0.045,
                andersonDarling: 0.32
            }
        };
    };

    // Get current Weibull parameters
    const weibullParams = getWeibullParamsForEquipment();

    // Tab navigation configuration
    const tabConfig = [
        { value: 'overview', label: 'Overview', icon: BarChart3, description: 'Analytics dashboard overview' },
        { value: 'weibull', label: 'Weibull Analysis', icon: TrendingUp, description: 'Reliability analysis and predictions' },
        { value: 'alerts', label: 'Predictive Alerts', icon: AlertTriangle, description: 'Real-time predictive alerts' },
        { value: 'health', label: 'Health Scores', icon: Gauge, description: 'Equipment health assessment' },
        { value: 'optimization', label: 'Maintenance Optimization', icon: Settings, description: 'Maintenance strategy optimization' },
        { value: 'rcfa', label: 'RCFA & PFMEA', icon: Brain, description: 'Root cause and failure mode analysis' },
        { value: 'advanced', label: 'Advanced Analytics', icon: Activity, description: 'Advanced statistical analysis' },
        { value: 'explainability', label: 'Model Explainability', icon: Brain, description: 'ML model explanations' },
        { value: 'prescriptive', label: 'Advanced Prescriptive', icon: Zap, description: 'Prescriptive recommendations' },
        { value: 'notifications', label: 'Notification Workflows', icon: Clock, description: 'Alert notification management' },
        { value: 'pipelines', label: 'ML Pipelines', icon: Shield, description: 'Machine learning pipeline management' }
    ];

    const getCurrentTabInfo = () => {
        return tabConfig.find(tab => tab.value === activeTab) || tabConfig[0];
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleEquipmentChange = (equipmentId: string) => {
        setSelectedEquipment(equipmentId);
    };

    // Weibull Analysis Functions
    const calculateReliability = (time: number, shape: number, scale: number): number => {
        return Math.exp(-Math.pow(time / scale, shape));
    };

    const calculateFailureDensity = (time: number, shape: number, scale: number): number => {
        return (shape / scale) * Math.pow(time / scale, shape - 1) * Math.exp(-Math.pow(time / scale, shape));
    };

    const calculateHazardRate = (time: number, shape: number, scale: number): number => {
        return (shape / scale) * Math.pow(time / scale, shape - 1);
    };

    const calculateMeanTimeToFailure = (shape: number, scale: number): number => {
        return scale * Math.exp(Math.log(Math.PI) / 2 + Math.log(2) / 2) * Math.exp(Math.log(1 + 1 / shape));
    };

    const calculateMedianLife = (shape: number, scale: number): number => {
        return scale * Math.pow(Math.log(2), 1 / shape);
    };

    const calculateB10Life = (shape: number, scale: number): number => {
        return scale * Math.pow(Math.log(10 / 9), 1 / shape);
    };

    const calculateB50Life = (shape: number, scale: number): number => {
        return scale * Math.pow(Math.log(2), 1 / shape);
    };

    // Generate Weibull Chart Data
    const generateWeibullChartData = () => {
        const timePoints = Array.from({ length: 100 }, (_, i) => i * 200);

        return {
            labels: timePoints.map(t => `${t}h`),
            datasets: [
                {
                    label: 'Reliability Function R(t)',
                    data: timePoints.map(t => calculateReliability(t, weibullParams.shapeParameter, weibullParams.scaleParameter) * 100),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y',
                    fill: true
                },
                {
                    label: 'Probability of Failure F(t)',
                    data: timePoints.map(t => (1 - calculateReliability(t, weibullParams.shapeParameter, weibullParams.scaleParameter)) * 100),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y1',
                    fill: false
                }
            ]
        };
    };

    // Legacy function for compatibility
    const generateReliabilityData = () => {
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Reliability (%)',
                    data: [95, 94, 96, 93, 97, 98],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y'
                },
                {
                    label: 'Failure Rate (×10⁻³)',
                    data: [5.2, 6.1, 4.8, 7.2, 3.9, 2.8],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y1'
                }
            ]
        };
    };

    const generateFailureDensityData = () => {
        const timePoints = Array.from({ length: 100 }, (_, i) => i * 200);

        return {
            labels: timePoints.map(t => `${t}h`),
            datasets: [{
                label: 'Failure Density f(t)',
                data: timePoints.map(t => calculateFailureDensity(t, weibullParams.shapeParameter, weibullParams.scaleParameter) * 10000),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                fill: true
            }]
        };
    };

    const generateHazardRateData = () => {
        const timePoints = Array.from({ length: 100 }, (_, i) => i * 200);

        return {
            labels: timePoints.map(t => `${t}h`),
            datasets: [{
                label: 'Hazard Rate h(t)',
                data: timePoints.map(t => calculateHazardRate(t, weibullParams.shapeParameter, weibullParams.scaleParameter) * 1000),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true
            }]
        };
    };

    const generateProbabilityPlotData = () => {
        const failureTimes = [1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400, 6000, 7200, 8400, 9600, 10800, 12000];
        const sortedTimes = failureTimes.sort((a, b) => a - b);
        const n = sortedTimes.length;

        const medianRanks = sortedTimes.map((_, i) => {
            const rank = i + 1;
            return (rank - 0.3) / (n + 0.4);
        });

        const weibullTransformed = sortedTimes.map(time => Math.log(time));
        const reliabilityTransformed = medianRanks.map(r => Math.log(-Math.log(1 - r)));

        return {
            labels: sortedTimes.map(t => `${t}h`),
            datasets: [{
                label: 'Weibull Probability Plot',
                data: weibullTransformed.map((x, i) => ({ x, y: reliabilityTransformed[i] })),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false
            }]
        };
    };

    const getSeverityColor = (severity: string): string => {
        switch (severity) {
            case 'critical': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'declining':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchEquipmentData}>Retry</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">Loading Predictive Analytics</h3>
                    <p className="text-muted-foreground">Initializing equipment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Predictive Tab Dropdown Overlay */}
            {showPredictiveDropdown && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-background rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                Predictive Analytics Navigation
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPredictiveDropdown(false)}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {tabConfig.map((tab) => (
                                <Button
                                    key={tab.value}
                                    variant="outline"
                                    className="h-auto p-4 flex flex-col items-start gap-2"
                                    onClick={() => {
                                        handleTabChange(tab.value);
                                        setShowPredictiveDropdown(false);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        {React.createElement(tab.icon, { className: "h-5 w-5" })}
                                        <span className="font-medium">{tab.label}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground text-left">
                                        {tab.description}
                                    </p>
                                </Button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => setShowPredictiveDropdown(false)}
                                className="flex items-center gap-2"
                            >
                                Continue to Overview
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Equipment Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Equipment Selection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="equipment-select">Select Equipment:</Label>
                        <Select value={selectedEquipment} onValueChange={handleEquipmentChange}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Select equipment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Equipment</SelectItem>
                                {availableEquipment.map(equipment => (
                                    <SelectItem key={equipment.id} value={equipment.id}>
                                        {equipment.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Badge variant="outline">
                            {filteredHealthScores.length} Equipment
                        </Badge>
                        {equipmentChangeLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Loading equipment data...
                            </div>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowPredictiveDropdown(true)}
                            className="flex items-center gap-2"
                        >
                            <Brain className="h-4 w-4" />
                            Navigation Menu
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredHealthScores.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Monitored assets
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredPredictiveAlerts.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Predictive alerts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Health</CardTitle>
                                <Gauge className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {filteredHealthScores.length > 0
                                        ? Math.round(filteredHealthScores.reduce((sum, score) => sum + score.score, 0) / filteredHealthScores.length)
                                        : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Equipment health score
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Equipment</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {filteredHealthScores.filter(score => score.riskLevel === 'critical' || score.riskLevel === 'high').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    High priority assets
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advanced Overview Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Health Score Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Health Score Distribution</CardTitle>
                                <CardDescription>Distribution of equipment health scores across different categories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Health Score Distribution"
                                    type="bar"
                                    loading={equipmentChangeLoading}
                                    data={{
                                        labels: ['Excellent (90-100%)', 'Good (80-89%)', 'Fair (70-79%)', 'Poor (60-69%)', 'Critical (<60%)'],
                                        datasets: [{
                                            label: 'Equipment Count',
                                            data: [
                                                filteredHealthScores.filter(s => s.score >= 90).length,
                                                filteredHealthScores.filter(s => s.score >= 80 && s.score < 90).length,
                                                filteredHealthScores.filter(s => s.score >= 70 && s.score < 80).length,
                                                filteredHealthScores.filter(s => s.score >= 60 && s.score < 70).length,
                                                filteredHealthScores.filter(s => s.score < 60).length
                                            ],
                                            backgroundColor: [
                                                '#10b981',
                                                '#3b82f6',
                                                '#f59e0b',
                                                '#f97316',
                                                '#ef4444'
                                            ]
                                        }]
                                    }}
                                    height={300}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Number of Equipment'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Alert Severity Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Alert Severity Analysis</CardTitle>
                                <CardDescription>Breakdown of predictive alerts by severity level</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Alert Severity Distribution"
                                    type="doughnut"
                                    loading={equipmentChangeLoading}
                                    data={{
                                        labels: ['Critical', 'High', 'Medium', 'Low'],
                                        datasets: [{
                                            data: [
                                                filteredPredictiveAlerts.filter(a => a.severity === 'critical').length,
                                                filteredPredictiveAlerts.filter(a => a.severity === 'high').length,
                                                filteredPredictiveAlerts.filter(a => a.severity === 'medium').length,
                                                filteredPredictiveAlerts.filter(a => a.severity === 'low').length
                                            ],
                                            backgroundColor: [
                                                '#ef4444',
                                                '#f97316',
                                                '#f59e0b',
                                                '#10b981'
                                            ]
                                        }]
                                    }}
                                    height={300}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trend Analysis Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Health Score Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Health Score Trends (Last 6 Months)</CardTitle>
                                <CardDescription>Monthly average health score progression</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Health Score Trends"
                                    type="line"
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                        datasets: [{
                                            label: 'Average Health Score',
                                            data: [85, 87, 84, 89, 91, 88],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4,
                                            fill: true
                                        }, {
                                            label: 'Critical Equipment %',
                                            data: [12, 10, 15, 8, 6, 9],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            tension: 0.4,
                                            yAxisID: 'y1'
                                        }]
                                    }}
                                    height={300}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Health Score (%)'
                                                },
                                                min: 70,
                                                max: 100
                                            },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                title: {
                                                    display: true,
                                                    text: 'Critical Equipment (%)'
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                                min: 0,
                                                max: 20
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Failure Rate Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Failure Rate Analysis</CardTitle>
                                <CardDescription>Monthly failure rates and predictions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Failure Rate Trends"
                                    type="line"
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                        datasets: [{
                                            label: 'Actual Failures',
                                            data: [3, 2, 4, 1, 2, 1],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Predicted Failures',
                                            data: [2.8, 2.2, 3.9, 1.1, 1.8, 0.9],
                                            borderColor: '#f59e0b',
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                            tension: 0.4,
                                            borderDash: [5, 5]
                                        }]
                                    }}
                                    height={300}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Number of Failures'
                                                },
                                                min: 0
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Correlation Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment Performance Correlation Matrix</CardTitle>
                            <CardDescription>Correlation between different performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EnhancedChart
                                title="Performance Correlation Matrix"
                                type="radar"
                                data={{
                                    labels: ['Health Score', 'Vibration', 'Temperature', 'Pressure', 'Oil Quality', 'Operating Hours'],
                                    datasets: [{
                                        label: 'Correlation with Health Score',
                                        data: [1.0, -0.85, -0.72, -0.68, 0.78, -0.45],
                                        borderColor: '#3b82f6',
                                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                        pointBackgroundColor: '#3b82f6'
                                    }]
                                }}
                                height={400}
                                customOptions={{
                                    scales: {
                                        r: {
                                            min: -1,
                                            max: 1,
                                            ticks: {
                                                stepSize: 0.2
                                            }
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Equipment Health Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment Health Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredHealthScores.slice(0, 5).map((score) => (
                                    <div key={score.assetId} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Gauge className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{score.assetName}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Health Score: {score.score}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={score.riskLevel === 'critical' ? 'destructive' : score.riskLevel === 'high' ? 'secondary' : 'default'}>
                                                {score.riskLevel}
                                            </Badge>
                                            {getTrendIcon(score.trend)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Weibull Analysis Tab */}
                <TabsContent value="weibull" className="space-y-6">
                    {/* Equipment Info for Weibull Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Weibull Analysis for {selectedEquipment === 'all'
                                    ? 'All Equipment'
                                    : availableEquipment.find(eq => eq.id === selectedEquipment)?.name || 'Selected Equipment'
                                }
                            </CardTitle>
                            <CardDescription>
                                Reliability analysis using Weibull distribution parameters
                                {selectedEquipment !== 'all' && filteredWeibullData[0] && (
                                    <span className="block mt-1">
                                        Last updated: {new Date(filteredWeibullData[0].lastUpdated).toLocaleString()}
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weibull Parameters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Weibull Parameters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {equipmentChangeLoading && (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                <span className="text-sm text-muted-foreground">Loading equipment parameters...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border">
                                            <div className="text-sm text-muted-foreground">Shape Parameter (β)</div>
                                            <div className="text-lg font-bold text-blue-600">{weibullParams.shapeParameter}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Wear-out failure pattern (β &gt; 1)
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                CI: {weibullParams.confidenceInterval.lower.toFixed(2)} - {weibullParams.confidenceInterval.upper.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border">
                                            <div className="text-sm text-muted-foreground">Scale Parameter (η)</div>
                                            <div className="text-lg font-bold text-green-600">{weibullParams.scaleParameter}h</div>
                                            <div className="text-xs text-muted-foreground">
                                                Characteristic life parameter
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">R² Goodness of Fit:</span>
                                            <span className="font-medium text-green-600">{(weibullParams.goodnessOfFit.rSquared * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Kolmogorov-Smirnov:</span>
                                            <span className="font-medium">{weibullParams.goodnessOfFit.kolmogorovSmirnov.toFixed(3)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Anderson-Darling:</span>
                                            <span className="font-medium">{weibullParams.goodnessOfFit.andersonDarling.toFixed(3)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Life Characteristics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {equipmentChangeLoading && (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                <span className="text-sm text-muted-foreground">Calculating life characteristics...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border">
                                            <div className="text-sm text-muted-foreground">Mean Time to Failure (MTTF)</div>
                                            <div className="text-lg font-bold text-purple-600">
                                                {calculateMeanTimeToFailure(weibullParams.shapeParameter, weibullParams.scaleParameter).toFixed(0)}h
                                            </div>
                                        </div>
                                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border">
                                            <div className="text-sm text-muted-foreground">Median Life (B50)</div>
                                            <div className="text-lg font-bold text-orange-600">
                                                {calculateMedianLife(weibullParams.shapeParameter, weibullParams.scaleParameter).toFixed(0)}h
                                            </div>
                                        </div>
                                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border">
                                            <div className="text-sm text-muted-foreground">B10 Life (10% failure)</div>
                                            <div className="text-lg font-bold text-red-600">
                                                {calculateB10Life(weibullParams.shapeParameter, weibullParams.scaleParameter).toFixed(0)}h
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advanced Weibull Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Reliability Function and Probability of Failure */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Reliability Function & Probability of Failure</CardTitle>
                                <CardDescription>
                                    R(t) = e^(-(t/η)^β) and F(t) = 1 - R(t)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Weibull Reliability Analysis"
                                    type="line"
                                    loading={equipmentChangeLoading}
                                    data={generateWeibullChartData()}
                                    height={400}
                                    customOptions={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Time (hours)'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Reliability (%)'
                                                },
                                                min: 0,
                                                max: 100
                                            },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                title: {
                                                    display: true,
                                                    text: 'Probability of Failure (%)'
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context: any) {
                                                        if (context.datasetIndex === 0) {
                                                            return `Reliability: ${context.parsed.y.toFixed(1)}%`;
                                                        } else {
                                                            return `Probability of Failure: ${context.parsed.y.toFixed(1)}%`;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Failure Density Function */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Failure Density Function</CardTitle>
                                <CardDescription>
                                    f(t) = (β/η) * (t/η)^(β-1) * e^(-(t/η)^β)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Failure Density Distribution"
                                    type="line"
                                    loading={equipmentChangeLoading}
                                    data={generateFailureDensityData()}
                                    height={400}
                                    customOptions={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Time (hours)'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Failure Density (×10⁻⁴)'
                                                }
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context: any) {
                                                        return `Failure Density: ${(context.parsed.y / 10000).toFixed(6)}`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Advanced Weibull Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weibull Probability Plot */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Weibull Probability Plot</CardTitle>
                                <CardDescription>
                                    Linearized Weibull plot for parameter estimation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Weibull Probability Plot"
                                    type="scatter"
                                    data={generateProbabilityPlotData()}
                                    height={400}
                                    customOptions={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'ln(Time)'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'ln(-ln(1-F(t)))'
                                                }
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context: any) {
                                                        return `Time: ${Math.exp(context.parsed.x).toFixed(0)}h, Probability: ${(1 - Math.exp(-Math.exp(context.parsed.y)) * 100).toFixed(1)}%`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Survival Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Survival Analysis</CardTitle>
                                <CardDescription>
                                    Kaplan-Meier survival curve with confidence intervals
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Survival Analysis"
                                    type="line"
                                    data={{
                                        labels: ['0', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000'],
                                        datasets: [{
                                            label: 'Survival Probability',
                                            data: [1.0, 0.95, 0.88, 0.78, 0.65, 0.52, 0.38, 0.25, 0.15, 0.08, 0.03],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            fill: true,
                                            tension: 0.4
                                        }, {
                                            label: 'Upper CI (95%)',
                                            data: [1.0, 0.97, 0.92, 0.85, 0.75, 0.65, 0.52, 0.38, 0.25, 0.15, 0.08],
                                            borderColor: '#10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            borderDash: [5, 5],
                                            fill: false
                                        }, {
                                            label: 'Lower CI (95%)',
                                            data: [1.0, 0.93, 0.84, 0.71, 0.55, 0.39, 0.24, 0.12, 0.05, 0.01, 0.0],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            borderDash: [5, 5],
                                            fill: false
                                        }]
                                    }}
                                    height={400}
                                    customOptions={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Time (hours)'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Survival Probability'
                                                },
                                                min: 0,
                                                max: 1
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Weibull Parameter Sensitivity Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Parameter Sensitivity Analysis</CardTitle>
                            <CardDescription>
                                Impact of shape and scale parameter variations on reliability
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EnhancedChart
                                title="Parameter Sensitivity"
                                type="line"
                                data={{
                                    labels: ['0', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000'],
                                    datasets: [{
                                        label: 'β=2.5, η=8000 (Current)',
                                        data: [1.0, 0.97, 0.91, 0.82, 0.70, 0.56, 0.42, 0.29, 0.18],
                                        borderColor: '#3b82f6',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        tension: 0.4
                                    }, {
                                        label: 'β=3.0, η=8000 (Higher Shape)',
                                        data: [1.0, 0.98, 0.94, 0.87, 0.76, 0.62, 0.47, 0.33, 0.21],
                                        borderColor: '#10b981',
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        borderDash: [5, 5],
                                        tension: 0.4
                                    }, {
                                        label: 'β=2.5, η=10000 (Higher Scale)',
                                        data: [1.0, 0.98, 0.94, 0.88, 0.80, 0.70, 0.58, 0.46, 0.34],
                                        borderColor: '#f59e0b',
                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                        borderDash: [3, 3],
                                        tension: 0.4
                                    }]
                                }}
                                height={400}
                                customOptions={{
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Time (hours)'
                                            }
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Reliability'
                                            },
                                            min: 0,
                                            max: 1
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Predictive Alerts Tab */}
                <TabsContent value="alerts" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Predictive Alerts Dashboard
                            </CardTitle>
                            <CardDescription>
                                Real-time predictive alerts and early warning system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Alert Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Active Alerts</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-red-600">
                                                {filteredPredictiveAlerts.length}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Current alerts</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Prediction Accuracy</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">94.2%</div>
                                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Avg Lead Time</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-blue-600">3.2h</div>
                                            <p className="text-xs text-muted-foreground">Early warning</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">False Positives</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-orange-600">5.8%</div>
                                            <p className="text-xs text-muted-foreground">Rate</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Advanced Alert Analysis Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Alert Prediction Accuracy Over Time</CardTitle>
                                            <CardDescription>Model performance and prediction reliability trends</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Prediction Accuracy Trends"
                                                type="line"
                                                data={{
                                                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                                                    datasets: [{
                                                        label: 'True Positives',
                                                        data: [85, 88, 91, 89, 93, 95, 92, 94],
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        tension: 0.4,
                                                        yAxisID: 'y'
                                                    }, {
                                                        label: 'False Positives',
                                                        data: [15, 12, 9, 11, 7, 5, 8, 6],
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                        tension: 0.4,
                                                        yAxisID: 'y'
                                                    }, {
                                                        label: 'False Negatives',
                                                        data: [8, 6, 4, 7, 3, 2, 5, 3],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4,
                                                        yAxisID: 'y1'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'left',
                                                            title: {
                                                                display: true,
                                                                text: 'Alert Count'
                                                            },
                                                            min: 0,
                                                            max: 100
                                                        },
                                                        y1: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'right',
                                                            title: {
                                                                display: true,
                                                                text: 'Missed Alerts'
                                                            },
                                                            grid: {
                                                                drawOnChartArea: false,
                                                            },
                                                            min: 0,
                                                            max: 10
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Alert Severity Distribution</CardTitle>
                                            <CardDescription>Breakdown of alerts by severity and equipment type</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Alert Severity Analysis"
                                                type="bar"
                                                data={{
                                                    labels: ['Pumps', 'Motors', 'Compressors', 'Turbines', 'Generators', 'Transformers'],
                                                    datasets: [{
                                                        label: 'Critical',
                                                        data: [12, 8, 15, 6, 4, 3],
                                                        backgroundColor: '#ef4444'
                                                    }, {
                                                        label: 'High',
                                                        data: [18, 12, 22, 8, 6, 5],
                                                        backgroundColor: '#f97316'
                                                    }, {
                                                        label: 'Medium',
                                                        data: [25, 20, 28, 12, 8, 7],
                                                        backgroundColor: '#f59e0b'
                                                    }, {
                                                        label: 'Low',
                                                        data: [35, 28, 32, 15, 10, 8],
                                                        backgroundColor: '#3b82f6'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Number of Alerts'
                                                            },
                                                            min: 0
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Alert Clustering Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Alert Clustering Analysis</CardTitle>
                                        <CardDescription>Pattern recognition and alert clustering for root cause identification</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Alert Clusters"
                                            type="scatter"
                                            data={{
                                                datasets: [{
                                                    label: 'Cluster 1: Vibration Issues',
                                                    data: [
                                                        { x: 0.2, y: 0.8 }, { x: 0.3, y: 0.7 }, { x: 0.25, y: 0.75 },
                                                        { x: 0.35, y: 0.65 }, { x: 0.15, y: 0.85 }
                                                    ],
                                                    backgroundColor: '#ef4444',
                                                    pointRadius: 8
                                                }, {
                                                    label: 'Cluster 2: Temperature Issues',
                                                    data: [
                                                        { x: 0.8, y: 0.3 }, { x: 0.75, y: 0.35 }, { x: 0.85, y: 0.25 },
                                                        { x: 0.7, y: 0.4 }, { x: 0.9, y: 0.2 }
                                                    ],
                                                    backgroundColor: '#f59e0b',
                                                    pointRadius: 8
                                                }, {
                                                    label: 'Cluster 3: Pressure Issues',
                                                    data: [
                                                        { x: 0.5, y: 0.5 }, { x: 0.45, y: 0.55 }, { x: 0.55, y: 0.45 },
                                                        { x: 0.4, y: 0.6 }, { x: 0.6, y: 0.4 }
                                                    ],
                                                    backgroundColor: '#3b82f6',
                                                    pointRadius: 8
                                                }, {
                                                    label: 'Cluster 4: Oil Quality Issues',
                                                    data: [
                                                        { x: 0.1, y: 0.1 }, { x: 0.15, y: 0.05 }, { x: 0.05, y: 0.15 },
                                                        { x: 0.2, y: 0.0 }, { x: 0.0, y: 0.2 }
                                                    ],
                                                    backgroundColor: '#10b981',
                                                    pointRadius: 8
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: 'Vibration Severity'
                                                        },
                                                        min: 0,
                                                        max: 1
                                                    },
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Temperature Severity'
                                                        },
                                                        min: 0,
                                                        max: 1
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Alert Response Time Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Alert Response Time Distribution</CardTitle>
                                            <CardDescription>Response time patterns by alert type and severity</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Response Time Analysis"
                                                type="bar"
                                                data={{
                                                    labels: ['<5min', '5-15min', '15-30min', '30-60min', '1-2h', '2-4h', '>4h'],
                                                    datasets: [{
                                                        label: 'Critical Alerts',
                                                        data: [60, 25, 10, 3, 1, 1, 0],
                                                        backgroundColor: '#ef4444'
                                                    }, {
                                                        label: 'High Priority',
                                                        data: [30, 40, 20, 8, 2, 0, 0],
                                                        backgroundColor: '#f97316'
                                                    }, {
                                                        label: 'Medium Priority',
                                                        data: [10, 25, 35, 20, 8, 2, 0],
                                                        backgroundColor: '#f59e0b'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Percentage of Alerts'
                                                            },
                                                            min: 0,
                                                            max: 70
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Alert Frequency by Time of Day</CardTitle>
                                            <CardDescription>24-hour alert pattern analysis</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="24-Hour Alert Pattern"
                                                type="line"
                                                data={{
                                                    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                                                    datasets: [{
                                                        label: 'Critical Alerts',
                                                        data: [3, 2, 1, 2, 8, 12, 15, 18, 22, 16, 10, 6],
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                        tension: 0.4,
                                                        fill: true
                                                    }, {
                                                        label: 'Warning Alerts',
                                                        data: [8, 6, 4, 6, 15, 22, 28, 32, 35, 25, 18, 12],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4,
                                                        fill: true
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Number of Alerts'
                                                            },
                                                            min: 0,
                                                            max: 40
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Alert Resolution Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Alert Resolution Performance</CardTitle>
                                        <CardDescription>Resolution time and success rate analysis</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Resolution Performance"
                                            type="line"
                                            data={{
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                                datasets: [{
                                                    label: 'Avg Resolution Time (hours)',
                                                    data: [4.2, 3.8, 3.5, 3.2, 2.9, 2.7, 2.5, 2.3, 2.1, 1.9, 1.8, 1.6],
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y'
                                                }, {
                                                    label: 'Resolution Success Rate (%)',
                                                    data: [85, 87, 89, 91, 93, 94, 95, 96, 97, 98, 98.5, 99],
                                                    borderColor: '#10b981',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y1'
                                                }, {
                                                    label: 'Preventive Actions Taken',
                                                    data: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48],
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y2'
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    y: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'left',
                                                        title: {
                                                            display: true,
                                                            text: 'Resolution Time (hours)'
                                                        },
                                                        min: 0,
                                                        max: 5
                                                    },
                                                    y1: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'right',
                                                        title: {
                                                            display: true,
                                                            text: 'Success Rate (%)'
                                                        },
                                                        grid: {
                                                            drawOnChartArea: false,
                                                        },
                                                        min: 80,
                                                        max: 100
                                                    },
                                                    y2: {
                                                        type: 'linear',
                                                        display: false,
                                                        min: 0,
                                                        max: 50
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Current Alerts Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Current Predictive Alerts</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {filteredPredictiveAlerts.map((alert) => (
                                                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                                                        <div>
                                                            <h4 className="font-medium">{alert.equipmentId}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {alert.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'secondary' : 'default'}>
                                                            {alert.severity}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {alert.timestamp}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Health Scores Tab */}
                <TabsContent value="health" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gauge className="h-5 w-5" />
                                Equipment Health Analysis
                            </CardTitle>
                            <CardDescription>
                                Comprehensive health monitoring and degradation analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Health Score Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Average Health</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">
                                                {filteredHealthScores.length > 0
                                                    ? Math.round(filteredHealthScores.reduce((sum, score) => sum + score.score, 0) / filteredHealthScores.length)
                                                    : 0}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">Overall fleet health</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Critical Equipment</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-red-600">
                                                {filteredHealthScores.filter(score => score.riskLevel === 'critical').length}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Requires attention</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Health Trend</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-blue-600">+2.3%</div>
                                            <p className="text-xs text-muted-foreground">vs last month</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Degradation Rate</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-orange-600">-0.8%</div>
                                            <p className="text-xs text-muted-foreground">per month</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Advanced Health Analysis Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Health Score Distribution by Equipment Type</CardTitle>
                                            <CardDescription>Comparative health analysis across different equipment categories</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Equipment Health Distribution"
                                                type="bar"
                                                data={{
                                                    labels: ['Pumps', 'Motors', 'Compressors', 'Turbines', 'Generators', 'Transformers'],
                                                    datasets: [{
                                                        label: 'Excellent (90-100%)',
                                                        data: [15, 12, 8, 6, 4, 3],
                                                        backgroundColor: '#10b981'
                                                    }, {
                                                        label: 'Good (80-89%)',
                                                        data: [25, 22, 18, 12, 8, 6],
                                                        backgroundColor: '#3b82f6'
                                                    }, {
                                                        label: 'Fair (70-79%)',
                                                        data: [18, 15, 12, 8, 6, 4],
                                                        backgroundColor: '#f59e0b'
                                                    }, {
                                                        label: 'Poor (60-69%)',
                                                        data: [8, 6, 5, 3, 2, 1],
                                                        backgroundColor: '#f97316'
                                                    }, {
                                                        label: 'Critical (<60%)',
                                                        data: [3, 2, 1, 1, 0, 0],
                                                        backgroundColor: '#ef4444'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Number of Equipment'
                                                            },
                                                            min: 0
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Health Score Trends Over Time</CardTitle>
                                            <CardDescription>Monthly health progression for different equipment types</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Health Score Trends"
                                                type="line"
                                                data={{
                                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                                    datasets: [{
                                                        label: 'Pumps',
                                                        data: [85, 87, 86, 88, 89, 91, 90, 92, 93, 91, 94, 95],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Motors',
                                                        data: [82, 84, 83, 85, 86, 88, 87, 89, 90, 88, 91, 92],
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Compressors',
                                                        data: [78, 80, 79, 81, 82, 84, 83, 85, 86, 84, 87, 88],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Turbines',
                                                        data: [75, 77, 76, 78, 79, 81, 80, 82, 83, 81, 84, 85],
                                                        borderColor: '#f97316',
                                                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                                        tension: 0.4
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Health Score (%)'
                                                            },
                                                            min: 70,
                                                            max: 100
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Degradation Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Equipment Degradation Patterns</CardTitle>
                                        <CardDescription>Degradation rate analysis and failure prediction modeling</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Degradation Analysis"
                                            type="line"
                                            data={{
                                                labels: ['0', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000'],
                                                datasets: [{
                                                    label: 'Normal Degradation',
                                                    data: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80],
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    tension: 0.4
                                                }, {
                                                    label: 'Accelerated Degradation',
                                                    data: [100, 97, 93, 88, 82, 75, 67, 58, 48, 37, 25],
                                                    borderColor: '#ef4444',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    tension: 0.4
                                                }, {
                                                    label: 'Maintenance Threshold',
                                                    data: Array(11).fill(75),
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    borderDash: [5, 5],
                                                    fill: false
                                                }, {
                                                    label: 'Critical Threshold',
                                                    data: Array(11).fill(60),
                                                    borderColor: '#ef4444',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    borderDash: [3, 3],
                                                    fill: false
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: 'Operating Hours'
                                                        }
                                                    },
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Health Score (%)'
                                                        },
                                                        min: 20,
                                                        max: 100
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Health Score Correlation Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Health vs Performance Correlation</CardTitle>
                                            <CardDescription>Relationship between health scores and operational performance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Health-Performance Correlation"
                                                type="scatter"
                                                data={{
                                                    datasets: [{
                                                        label: 'High Performance',
                                                        data: [
                                                            { x: 95, y: 98 }, { x: 92, y: 96 }, { x: 88, y: 94 },
                                                            { x: 85, y: 92 }, { x: 82, y: 90 }, { x: 78, y: 88 }
                                                        ],
                                                        backgroundColor: '#10b981',
                                                        pointRadius: 6
                                                    }, {
                                                        label: 'Medium Performance',
                                                        data: [
                                                            { x: 75, y: 85 }, { x: 72, y: 82 }, { x: 68, y: 80 },
                                                            { x: 65, y: 78 }, { x: 62, y: 75 }, { x: 58, y: 72 }
                                                        ],
                                                        backgroundColor: '#f59e0b',
                                                        pointRadius: 6
                                                    }, {
                                                        label: 'Low Performance',
                                                        data: [
                                                            { x: 55, y: 65 }, { x: 52, y: 62 }, { x: 48, y: 60 },
                                                            { x: 45, y: 58 }, { x: 42, y: 55 }, { x: 38, y: 52 }
                                                        ],
                                                        backgroundColor: '#ef4444',
                                                        pointRadius: 6
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Health Score (%)'
                                                            },
                                                            min: 35,
                                                            max: 100
                                                        },
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Performance Score (%)'
                                                            },
                                                            min: 50,
                                                            max: 100
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Health Score by Operating Conditions</CardTitle>
                                            <CardDescription>Health distribution under different operating parameters</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Operating Conditions Impact"
                                                type="bar"
                                                data={{
                                                    labels: ['Normal Load', 'High Load', 'Low Load', 'Startup', 'Shutdown', 'Emergency'],
                                                    datasets: [{
                                                        label: 'Average Health Score',
                                                        data: [88, 82, 91, 85, 87, 75],
                                                        backgroundColor: [
                                                            '#10b981',
                                                            '#f59e0b',
                                                            '#3b82f6',
                                                            '#8b5cf6',
                                                            '#06b6d4',
                                                            '#ef4444'
                                                        ]
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Health Score (%)'
                                                            },
                                                            min: 70,
                                                            max: 95
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Health Score Prediction Model */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Health Score Prediction Model</CardTitle>
                                        <CardDescription>Machine learning model for predicting future health scores</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Health Score Predictions"
                                            type="line"
                                            data={{
                                                labels: ['Current', '+1 Month', '+2 Months', '+3 Months', '+4 Months', '+5 Months', '+6 Months'],
                                                datasets: [{
                                                    label: 'Actual Health Score',
                                                    data: [88, 87, 86, 85, 84, 83, 82],
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    tension: 0.4
                                                }, {
                                                    label: 'Predicted Health Score',
                                                    data: [88, 87.2, 86.1, 84.8, 83.3, 81.6, 79.7],
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    borderDash: [5, 5],
                                                    tension: 0.4
                                                }, {
                                                    label: 'Confidence Interval (Upper)',
                                                    data: [88, 88.5, 87.8, 86.9, 85.8, 84.5, 83.0],
                                                    borderColor: '#10b981',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    borderDash: [3, 3],
                                                    fill: false
                                                }, {
                                                    label: 'Confidence Interval (Lower)',
                                                    data: [88, 85.9, 84.4, 82.7, 80.8, 78.7, 76.4],
                                                    borderColor: '#ef4444',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    borderDash: [3, 3],
                                                    fill: false
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Health Score (%)'
                                                        },
                                                        min: 75,
                                                        max: 90
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Equipment Health Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Equipment Health Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {filteredHealthScores.map((score) => (
                                                <div key={score.assetId} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Gauge className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{score.assetName}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Health Score: {score.score}% • Risk Level: {score.riskLevel}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={score.riskLevel === 'critical' ? 'destructive' : score.riskLevel === 'high' ? 'secondary' : 'default'}>
                                                            {score.riskLevel}
                                                        </Badge>
                                                        {getTrendIcon(score.trend)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Maintenance Optimization Tab */}
                <TabsContent value="optimization" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Maintenance Optimization Dashboard
                            </CardTitle>
                            <CardDescription>
                                Advanced maintenance strategy optimization and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Optimization Performance Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Cost Savings</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">$2.4M</div>
                                            <p className="text-xs text-muted-foreground">Annual savings</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Uptime Improvement</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-blue-600">+8.5%</div>
                                            <p className="text-xs text-muted-foreground">vs baseline</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Maintenance Efficiency</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-purple-600">94.2%</div>
                                            <p className="text-xs text-muted-foreground">Resource utilization</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">ROI</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-orange-600">312%</div>
                                            <p className="text-xs text-muted-foreground">Return on investment</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Cost-Benefit Analysis by Strategy */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Cost-Benefit Analysis by Strategy</CardTitle>
                                        <CardDescription>Multi-bar chart comparing different maintenance strategies</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Maintenance Strategy Comparison"
                                            type="bar"
                                            data={{
                                                labels: ['Preventive', 'Predictive', 'Condition-Based', 'Reactive', 'Proactive'],
                                                datasets: [{
                                                    label: 'Annual Cost ($K)',
                                                    data: [850, 620, 780, 1200, 680],
                                                    backgroundColor: '#ef4444',
                                                    yAxisID: 'y'
                                                }, {
                                                    label: 'Uptime (%)',
                                                    data: [85, 92, 88, 72, 90],
                                                    backgroundColor: '#3b82f6',
                                                    yAxisID: 'y1'
                                                }, {
                                                    label: 'Failure Rate (%)',
                                                    data: [12, 6, 9, 25, 7],
                                                    backgroundColor: '#f59e0b',
                                                    yAxisID: 'y1'
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    y: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'left',
                                                        title: {
                                                            display: true,
                                                            text: 'Cost ($K)'
                                                        },
                                                        min: 0,
                                                        max: 1400
                                                    },
                                                    y1: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'right',
                                                        title: {
                                                            display: true,
                                                            text: 'Percentage (%)'
                                                        },
                                                        min: 0,
                                                        max: 100
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Maintenance Strategy Effectiveness */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Maintenance Strategy Effectiveness</CardTitle>
                                            <CardDescription>Radar chart showing performance across multiple dimensions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Strategy Effectiveness Radar"
                                                type="radar"
                                                data={{
                                                    labels: ['Reliability', 'Cost Efficiency', 'Safety', 'Compliance', 'Resource Utilization', 'Predictability'],
                                                    datasets: [{
                                                        label: 'Predictive Maintenance',
                                                        data: [92, 88, 95, 90, 85, 94],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                        pointBackgroundColor: '#3b82f6'
                                                    }, {
                                                        label: 'Preventive Maintenance',
                                                        data: [78, 75, 85, 80, 70, 65],
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                        pointBackgroundColor: '#10b981'
                                                    }, {
                                                        label: 'Reactive Maintenance',
                                                        data: [45, 30, 60, 50, 40, 25],
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                                        pointBackgroundColor: '#ef4444'
                                                    }]
                                                }}
                                                height={400}
                                                customOptions={{
                                                    scales: {
                                                        r: {
                                                            min: 0,
                                                            max: 100,
                                                            beginAtZero: true
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Optimization Implementation Timeline</CardTitle>
                                            <CardDescription>Multi-axis line chart showing progress, cost savings, and reliability improvement</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Implementation Progress"
                                                type="line"
                                                data={{
                                                    labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
                                                    datasets: [{
                                                        label: 'Implementation Progress (%)',
                                                        data: [15, 35, 55, 75, 90, 100],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        yAxisID: 'y',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Cost Savings ($K)',
                                                        data: [50, 120, 280, 450, 680, 950],
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        yAxisID: 'y1',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Reliability Improvement (%)',
                                                        data: [2, 4, 6, 8, 10, 12],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        yAxisID: 'y2',
                                                        tension: 0.4
                                                    }]
                                                }}
                                                height={400}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'left',
                                                            title: {
                                                                display: true,
                                                                text: 'Progress (%)'
                                                            },
                                                            min: 0,
                                                            max: 100
                                                        },
                                                        y1: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'right',
                                                            title: {
                                                                display: true,
                                                                text: 'Cost Savings ($K)'
                                                            },
                                                            min: 0,
                                                            max: 1000
                                                        },
                                                        y2: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'right',
                                                            title: {
                                                                display: true,
                                                                text: 'Reliability (%)'
                                                            },
                                                            min: 0,
                                                            max: 15
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Resource Allocation Optimization */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Resource Allocation Optimization</CardTitle>
                                            <CardDescription>Doughnut chart showing optimal resource distribution</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Resource Allocation"
                                                type="doughnut"
                                                data={{
                                                    labels: ['Preventive Maintenance', 'Predictive Monitoring', 'Emergency Repairs', 'Training & Development', 'Equipment Upgrades'],
                                                    datasets: [{
                                                        data: [35, 25, 15, 15, 10],
                                                        backgroundColor: [
                                                            '#3b82f6',
                                                            '#10b981',
                                                            '#ef4444',
                                                            '#f59e0b',
                                                            '#8b5cf6'
                                                        ],
                                                        borderWidth: 2,
                                                        borderColor: '#ffffff'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom'
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Maintenance Efficiency Trends</CardTitle>
                                            <CardDescription>Multi-line chart showing efficiency improvements over time</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Efficiency Trends"
                                                type="line"
                                                data={{
                                                    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
                                                    datasets: [{
                                                        label: 'Work Order Completion Rate (%)',
                                                        data: [78, 82, 85, 88, 91, 94],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'First-Time Fix Rate (%)',
                                                        data: [65, 68, 72, 75, 78, 82],
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Mean Time to Repair (hours)',
                                                        data: [8.5, 7.8, 7.2, 6.5, 5.9, 5.2],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4,
                                                        yAxisID: 'y1'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Rate (%)'
                                                            },
                                                            min: 60,
                                                            max: 100
                                                        },
                                                        y1: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'right',
                                                            title: {
                                                                display: true,
                                                                text: 'Time (hours)'
                                                            },
                                                            min: 0,
                                                            max: 10
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Risk Assessment Matrix */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Risk Assessment Matrix</CardTitle>
                                        <CardDescription>Scatter plot showing equipment risk based on failure probability and impact</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Risk Assessment Matrix"
                                            type="scatter"
                                            data={{
                                                datasets: [{
                                                    label: 'Low Risk',
                                                    data: [
                                                        { x: 0.1, y: 0.2 }, { x: 0.15, y: 0.3 }, { x: 0.2, y: 0.1 },
                                                        { x: 0.25, y: 0.25 }, { x: 0.3, y: 0.15 }
                                                    ],
                                                    backgroundColor: '#10b981',
                                                    pointRadius: 6
                                                }, {
                                                    label: 'Medium Risk',
                                                    data: [
                                                        { x: 0.4, y: 0.5 }, { x: 0.5, y: 0.4 }, { x: 0.6, y: 0.3 },
                                                        { x: 0.3, y: 0.6 }, { x: 0.7, y: 0.2 }
                                                    ],
                                                    backgroundColor: '#f59e0b',
                                                    pointRadius: 8
                                                }, {
                                                    label: 'High Risk',
                                                    data: [
                                                        { x: 0.8, y: 0.9 }, { x: 0.9, y: 0.8 }, { x: 0.85, y: 0.85 },
                                                        { x: 0.75, y: 0.95 }, { x: 0.95, y: 0.75 }
                                                    ],
                                                    backgroundColor: '#ef4444',
                                                    pointRadius: 10
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: 'Failure Probability'
                                                        },
                                                        min: 0,
                                                        max: 1
                                                    },
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Impact Severity'
                                                        },
                                                        min: 0,
                                                        max: 1
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Optimization Recommendations */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Optimization Recommendations</CardTitle>
                                        <CardDescription>AI-powered recommendations for maintenance strategy improvements</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                                                    <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">High Priority</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Implement predictive maintenance for pumps</span>
                                                            <span className="font-medium text-green-600">$450K savings</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Optimize spare parts inventory</span>
                                                            <span className="font-medium text-green-600">$280K savings</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Enhance technician training program</span>
                                                            <span className="font-medium text-green-600">15% efficiency gain</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                                    <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Medium Priority</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Deploy IoT sensors for motors</span>
                                                            <span className="font-medium text-blue-600">$180K investment</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Implement CMMS integration</span>
                                                            <span className="font-medium text-blue-600">$120K investment</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Establish reliability-centered maintenance</span>
                                                            <span className="font-medium text-blue-600">8% uptime improvement</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="explainability" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Model Explainability
                            </CardTitle>
                            <CardDescription>
                                Understand how the ML model makes predictions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* SHAP Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Feature Importance (SHAP)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="SHAP Feature Importance"
                                                type="bar"
                                                data={{
                                                    labels: ['Vibration RMS', 'Temperature', 'Pressure', 'Oil Quality', 'Operating Hours'],
                                                    datasets: [{
                                                        label: 'SHAP Value',
                                                        data: [0.35, 0.28, 0.22, 0.15, 0.12],
                                                        backgroundColor: [
                                                            '#ef4444',
                                                            '#f97316',
                                                            '#eab308',
                                                            '#3b82f6',
                                                            '#8b5cf6'
                                                        ]
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    indexAxis: 'y',
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'SHAP Value'
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Local Explanation</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                    <h4 className="font-medium mb-2">Prediction: High Risk (78%)</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Vibration RMS:</span>
                                                            <span className="font-medium text-red-600">+0.35</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Temperature:</span>
                                                            <span className="font-medium text-orange-600">+0.28</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Pressure:</span>
                                                            <span className="font-medium text-yellow-600">+0.22</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Oil Quality:</span>
                                                            <span className="font-medium text-green-600">-0.15</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <p><strong>Interpretation:</strong> High vibration levels and elevated temperature are the primary drivers of this high-risk prediction.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* LIME Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>LIME Explanations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-2">Feature Contributions</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Vibration RMS (45.2):</span>
                                                            <span className="font-medium text-red-600">+35%</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Temperature (65.8°C):</span>
                                                            <span className="font-medium text-orange-600">+28%</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Pressure (120.5 PSI):</span>
                                                            <span className="font-medium text-yellow-600">+22%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-2">Alternative Scenarios</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Normal vibration:</span>
                                                            <span className="font-medium text-green-600">45% risk</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Low temperature:</span>
                                                            <span className="font-medium text-green-600">52% risk</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm">Optimal conditions:</span>
                                                            <span className="font-medium text-green-600">23% risk</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Model Interpretability Metrics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Model Interpretability</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">87%</div>
                                                <div className="text-sm text-muted-foreground">Overall Score</div>
                                            </div>
                                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">92%</div>
                                                <div className="text-sm text-muted-foreground">Feature Clarity</div>
                                            </div>
                                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">85%</div>
                                                <div className="text-sm text-muted-foreground">Decision Transparency</div>
                                            </div>
                                            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600">78%</div>
                                                <div className="text-sm text-muted-foreground">Bias Detection</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Feature Interaction Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Feature Interaction Plot</CardTitle>
                                            <CardDescription>Interaction strength between feature pairs</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Feature Interactions"
                                                type="scatter"
                                                data={{
                                                    datasets: [{
                                                        label: 'Feature Interactions',
                                                        data: [
                                                            { x: 0.35, y: 0.28, feature1: 'Vibration-Temperature' },
                                                            { x: 0.22, y: 0.15, feature1: 'Pressure-Oil Quality' },
                                                            { x: 0.18, y: 0.12, feature1: 'Temperature-Pressure' },
                                                            { x: 0.15, y: 0.08, feature1: 'Vibration-Pressure' },
                                                            { x: 0.12, y: 0.06, feature1: 'Oil Quality-Temperature' }
                                                        ],
                                                        backgroundColor: [
                                                            '#ef4444',
                                                            '#f97316',
                                                            '#f59e0b',
                                                            '#3b82f6',
                                                            '#8b5cf6'
                                                        ],
                                                        pointRadius: [8, 6, 5, 4, 3]
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Feature 1 Importance'
                                                            },
                                                            min: 0,
                                                            max: 0.4
                                                        },
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Feature 2 Importance'
                                                            },
                                                            min: 0,
                                                            max: 0.3
                                                        }
                                                    },
                                                    plugins: {
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function (context: any) {
                                                                    return `${context.raw.feature1}: High interaction`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Decision Boundary Visualization</CardTitle>
                                            <CardDescription>Model decision boundaries in feature space</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Decision Boundaries"
                                                type="scatter"
                                                data={{
                                                    datasets: [{
                                                        label: 'Normal Operation',
                                                        data: [
                                                            { x: 40, y: 65 }, { x: 42, y: 66 }, { x: 41, y: 64 },
                                                            { x: 43, y: 67 }, { x: 39, y: 63 }, { x: 44, y: 68 }
                                                        ],
                                                        backgroundColor: '#10b981',
                                                        pointRadius: 6
                                                    }, {
                                                        label: 'Warning Zone',
                                                        data: [
                                                            { x: 48, y: 72 }, { x: 50, y: 74 }, { x: 49, y: 73 },
                                                            { x: 51, y: 75 }, { x: 47, y: 71 }
                                                        ],
                                                        backgroundColor: '#f59e0b',
                                                        pointRadius: 6
                                                    }, {
                                                        label: 'Failure Zone',
                                                        data: [
                                                            { x: 55, y: 80 }, { x: 58, y: 82 }, { x: 56, y: 81 }
                                                        ],
                                                        backgroundColor: '#ef4444',
                                                        pointRadius: 6
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Vibration RMS (mm/s)'
                                                            },
                                                            min: 35,
                                                            max: 60
                                                        },
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Temperature (°C)'
                                                            },
                                                            min: 60,
                                                            max: 85
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Model Performance Over Time */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Model Performance Evolution</CardTitle>
                                        <CardDescription>Model accuracy and interpretability over time</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Model Performance Trends"
                                            type="line"
                                            data={{
                                                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                                                datasets: [{
                                                    label: 'Model Accuracy',
                                                    data: [85, 87, 89, 91, 92, 94, 93, 95],
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y'
                                                }, {
                                                    label: 'Interpretability Score',
                                                    data: [75, 78, 82, 85, 87, 89, 88, 90],
                                                    borderColor: '#10b981',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y'
                                                }, {
                                                    label: 'Feature Stability',
                                                    data: [70, 72, 75, 78, 80, 82, 81, 83],
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y'
                                                }, {
                                                    label: 'Data Quality',
                                                    data: [88, 90, 92, 94, 95, 96, 95, 97],
                                                    borderColor: '#8b5cf6',
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                    tension: 0.4,
                                                    yAxisID: 'y1'
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    y: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'left',
                                                        title: {
                                                            display: true,
                                                            text: 'Performance Score (%)'
                                                        },
                                                        min: 65,
                                                        max: 100
                                                    },
                                                    y1: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'right',
                                                        title: {
                                                            display: true,
                                                            text: 'Data Quality (%)'
                                                        },
                                                        grid: {
                                                            drawOnChartArea: false,
                                                        },
                                                        min: 85,
                                                        max: 100
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* SHAP Summary Plot */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>SHAP Summary Plot</CardTitle>
                                        <CardDescription>Global feature importance with individual prediction contributions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="SHAP Summary"
                                            type="bar"
                                            data={{
                                                labels: ['Vibration RMS', 'Temperature', 'Pressure', 'Oil Quality', 'Operating Hours', 'Power Factor'],
                                                datasets: [{
                                                    label: 'Mean |SHAP|',
                                                    data: [0.35, 0.28, 0.22, 0.15, 0.12, 0.08],
                                                    backgroundColor: [
                                                        '#ef4444',
                                                        '#f97316',
                                                        '#f59e0b',
                                                        '#3b82f6',
                                                        '#8b5cf6',
                                                        '#06b6d4'
                                                    ]
                                                }]
                                            }}
                                            height={300}
                                            customOptions={{
                                                indexAxis: 'y',
                                                scales: {
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: 'Mean |SHAP Value|'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="prescriptive" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Advanced Prescriptive Analytics
                            </CardTitle>
                            <CardDescription>
                                AI-powered recommendations and action plans
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Prescriptive Actions */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recommended Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {filteredPrescriptiveActions.map((action) => (
                                                    <div key={action.equipmentId + '-' + action.action} className="p-4 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium">{action.action}</h4>
                                                            <Badge variant={action.priority === 'critical' ? 'destructive' : action.priority === 'high' ? 'secondary' : 'default'}>
                                                                {action.priority}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-3">Due: {action.dueDate}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Impact Analysis</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Action Impact Comparison"
                                                type="radar"
                                                data={{
                                                    labels: ['Cost Savings', 'Risk Reduction', 'Reliability', 'Downtime Reduction'],
                                                    datasets: [{
                                                        label: 'Current Actions',
                                                        data: [60, 70, 65, 55],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.2)'
                                                    }, {
                                                        label: 'Recommended Actions',
                                                        data: [85, 90, 88, 82],
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.2)'
                                                    }]
                                                }}
                                                height={300}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Scenario Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Scenario Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Worst Case</h4>
                                                    <div className="text-sm text-red-700 dark:text-red-300">
                                                        <p>• No action taken</p>
                                                        <p>• 45% failure probability</p>
                                                        <p>• $150k potential loss</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                                                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Current</h4>
                                                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                                        <p>• Reactive maintenance</p>
                                                        <p>• 25% failure probability</p>
                                                        <p>• $75k potential loss</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Best Case</h4>
                                                    <div className="text-sm text-green-700 dark:text-green-300">
                                                        <p>• Predictive maintenance</p>
                                                        <p>• 8% failure probability</p>
                                                        <p>• $25k potential loss</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Notification Workflows
                            </CardTitle>
                            <CardDescription>
                                Manage alert notifications and escalation workflows
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Notification Settings */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Notification Preferences</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">Email Notifications</div>
                                                        <div className="text-sm text-muted-foreground">Receive alerts via email</div>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">SMS Alerts</div>
                                                        <div className="text-sm text-muted-foreground">Critical alerts via SMS</div>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">Push Notifications</div>
                                                        <div className="text-sm text-muted-foreground">Mobile app notifications</div>
                                                    </div>
                                                    <Switch />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">Dashboard Alerts</div>
                                                        <div className="text-sm text-muted-foreground">Real-time dashboard alerts</div>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Escalation Rules</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium">Critical Alerts</h4>
                                                        <Badge variant="destructive">Immediate</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Notify maintenance supervisor and plant manager within 5 minutes
                                                    </p>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium">High Priority</h4>
                                                        <Badge variant="secondary">30 min</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Notify maintenance team within 30 minutes
                                                    </p>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium">Medium Priority</h4>
                                                        <Badge variant="outline">2 hours</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Notify maintenance team within 2 hours
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Notification History */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Notifications</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                                    <div>
                                                        <h4 className="font-medium">Critical: Bearing Temperature High</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Main Water Pump • 2 hours ago
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="destructive">Unread</Badge>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                                    <div>
                                                        <h4 className="font-medium">High: Vibration Levels Elevated</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Drive Motor Unit • 4 hours ago
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">Read</Badge>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                                    <div>
                                                        <h4 className="font-medium">Medium: Maintenance Due</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Emergency Generator • 6 hours ago
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">Read</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notification Performance Metrics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">2.3min</div>
                                                <div className="text-sm text-muted-foreground">Avg Response Time</div>
                                            </div>
                                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">98.5%</div>
                                                <div className="text-sm text-muted-foreground">Delivery Success</div>
                                            </div>
                                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">94.2%</div>
                                                <div className="text-sm text-muted-foreground">Acknowledgment Rate</div>
                                            </div>
                                            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600">87.8%</div>
                                                <div className="text-sm text-muted-foreground">Resolution Rate</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notification Pattern Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Notification Volume Trends</CardTitle>
                                            <CardDescription>Daily notification patterns over time</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Notification Volume"
                                                type="line"
                                                data={{
                                                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                                    datasets: [{
                                                        label: 'Critical Alerts',
                                                        data: [12, 15, 8, 18, 22, 5, 3],
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Warning Alerts',
                                                        data: [25, 28, 20, 32, 35, 12, 8],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Info Notifications',
                                                        data: [45, 52, 38, 58, 62, 25, 18],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        tension: 0.4
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Number of Notifications'
                                                            },
                                                            min: 0
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Response Time Distribution</CardTitle>
                                            <CardDescription>Distribution of response times by severity</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Response Time Analysis"
                                                type="bar"
                                                data={{
                                                    labels: ['<1min', '1-2min', '2-5min', '5-10min', '10-30min', '>30min'],
                                                    datasets: [{
                                                        label: 'Critical Alerts',
                                                        data: [45, 30, 15, 8, 2, 0],
                                                        backgroundColor: '#ef4444'
                                                    }, {
                                                        label: 'High Priority',
                                                        data: [25, 40, 25, 8, 2, 0],
                                                        backgroundColor: '#f97316'
                                                    }, {
                                                        label: 'Medium Priority',
                                                        data: [10, 25, 35, 20, 8, 2],
                                                        backgroundColor: '#f59e0b'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Percentage of Alerts'
                                                            },
                                                            min: 0,
                                                            max: 50
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Escalation Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Escalation Pattern Analysis</CardTitle>
                                        <CardDescription>Escalation frequency and resolution time by level</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Escalation Analysis"
                                            type="bar"
                                            data={{
                                                labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
                                                datasets: [{
                                                    label: 'Escalation Frequency',
                                                    data: [100, 65, 35, 15, 5],
                                                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                                    borderColor: '#3b82f6',
                                                    borderWidth: 1,
                                                    yAxisID: 'y'
                                                }, {
                                                    label: 'Avg Resolution Time (hours)',
                                                    data: [0.5, 2.5, 8.0, 24.0, 72.0],
                                                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                                                    borderColor: '#ef4444',
                                                    borderWidth: 1,
                                                    yAxisID: 'y1'
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    y: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'left',
                                                        title: {
                                                            display: true,
                                                            text: 'Escalation Frequency (%)'
                                                        },
                                                        min: 0,
                                                        max: 100
                                                    },
                                                    y1: {
                                                        type: 'linear',
                                                        display: true,
                                                        position: 'right',
                                                        title: {
                                                            display: true,
                                                            text: 'Resolution Time (hours)'
                                                        },
                                                        grid: {
                                                            drawOnChartArea: false,
                                                        },
                                                        min: 0,
                                                        max: 80
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Channel Performance Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Channel Effectiveness</CardTitle>
                                            <CardDescription>Notification delivery success by channel</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Channel Performance"
                                                type="doughnut"
                                                data={{
                                                    labels: ['Email', 'SMS', 'Mobile App', 'Dashboard', 'Phone Call'],
                                                    datasets: [{
                                                        data: [95, 98, 92, 100, 99],
                                                        backgroundColor: [
                                                            '#3b82f6',
                                                            '#10b981',
                                                            '#f59e0b',
                                                            '#8b5cf6',
                                                            '#ef4444'
                                                        ]
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    plugins: {
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function (context: any) {
                                                                    return `${context.label}: ${context.parsed}% success rate`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Time-based Notification Patterns</CardTitle>
                                            <CardDescription>Notification effectiveness by time of day</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Time-based Patterns"
                                                type="line"
                                                data={{
                                                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                                                    datasets: [{
                                                        label: 'Response Rate (%)',
                                                        data: [85, 78, 92, 88, 95, 90, 87],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        tension: 0.4,
                                                        fill: true
                                                    }, {
                                                        label: 'Notification Volume',
                                                        data: [5, 3, 25, 35, 30, 15, 8],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4,
                                                        yAxisID: 'y1'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Response Rate (%)'
                                                            },
                                                            min: 70,
                                                            max: 100
                                                        },
                                                        y1: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'right',
                                                            title: {
                                                                display: true,
                                                                text: 'Volume'
                                                            },
                                                            grid: {
                                                                drawOnChartArea: false,
                                                            },
                                                            min: 0,
                                                            max: 40
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pipelines" className="space-y-6">
                    {/* Enhanced ML Pipeline Component Integration */}
                    <EnhancedMLPipelines />
                </TabsContent>

                <TabsContent value="rcfa" className="space-y-6">
                    {/* Equipment Info for RCFA & PFMEA */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                RCFA & PFMEA Analysis for {selectedEquipment === 'all'
                                    ? 'All Equipment'
                                    : availableEquipment.find(eq => eq.id === selectedEquipment)?.name || 'Selected Equipment'
                                }
                            </CardTitle>
                            <CardDescription>
                                Root cause and failure mode analysis using RCFA and PFMEA methodologies
                                {selectedEquipment !== 'all' && filteredWeibullData[0] && (
                                    <span className="block mt-1">
                                        Last updated: {new Date(filteredWeibullData[0].lastUpdated).toLocaleString()}
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* RCFA & PFMEA Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Failures</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">3</div>
                                <p className="text-xs text-muted-foreground">
                                    High priority failures
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">RPN Score</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">378</div>
                                <p className="text-xs text-muted-foreground">
                                    Highest risk priority
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">95%</div>
                                <p className="text-xs text-muted-foreground">
                                    Vibration analysis
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cost Impact</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">$45K</div>
                                <p className="text-xs text-muted-foreground">
                                    Annual savings potential
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Analysis Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Root Cause Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Root Cause Analysis
                                </CardTitle>
                                <CardDescription>Primary and contributing factors analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {equipmentChangeLoading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            <span className="text-sm text-muted-foreground">Loading root cause data...</span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Primary Root Cause
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                                            Bearing wear due to inadequate lubrication and excessive vibration
                                        </p>
                                    </div>
                                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                        <h4 className="font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Contributing Factors
                                        </h4>
                                        <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 mt-2">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                High operating temperatures
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                Contaminated lubricant
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                Misalignment issues
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Preventive Actions
                                        </h4>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 mt-2">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                Implement automated lubrication system
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                Regular vibration monitoring
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                Enhanced maintenance schedule
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Failure Mode Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Failure Mode Analysis
                                </CardTitle>
                                <CardDescription>PFMEA analysis with severity, occurrence, and detection ratings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {equipmentChangeLoading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            <span className="text-sm text-muted-foreground">Loading failure mode data...</span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left p-3 font-medium">Failure Mode</th>
                                                    <th className="text-left p-3 font-medium">Severity</th>
                                                    <th className="text-left p-3 font-medium">Occurrence</th>
                                                    <th className="text-left p-3 font-medium">Detection</th>
                                                    <th className="text-left p-3 font-medium">RPN</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                <tr className="hover:bg-muted/50 transition-colors">
                                                    <td className="p-3 font-medium">Bearing Failure</td>
                                                    <td className="p-3">
                                                        <Badge variant="destructive" className="text-xs">9</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="secondary" className="text-xs">7</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-xs">6</Badge>
                                                    </td>
                                                    <td className="p-3 font-bold text-red-600">378</td>
                                                </tr>
                                                <tr className="hover:bg-muted/50 transition-colors">
                                                    <td className="p-3 font-medium">Shaft Misalignment</td>
                                                    <td className="p-3">
                                                        <Badge variant="destructive" className="text-xs">8</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="secondary" className="text-xs">5</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-xs">7</Badge>
                                                    </td>
                                                    <td className="p-3 font-bold text-orange-600">280</td>
                                                </tr>
                                                <tr className="hover:bg-muted/50 transition-colors">
                                                    <td className="p-3 font-medium">Seal Leakage</td>
                                                    <td className="p-3">
                                                        <Badge variant="secondary" className="text-xs">6</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-xs">4</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-xs">8</Badge>
                                                    </td>
                                                    <td className="p-3 font-bold text-yellow-600">192</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Root Cause Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Root Cause Distribution Analysis</CardTitle>
                                <CardDescription>Statistical breakdown of failure root causes across equipment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Root Cause Distribution"
                                    type="bar"
                                    loading={equipmentChangeLoading}
                                    data={{
                                        labels: ['Bearing Wear', 'Misalignment', 'Lubrication', 'Contamination', 'Thermal Stress', 'Vibration', 'Corrosion', 'Fatigue'],
                                        datasets: [{
                                            label: 'Frequency',
                                            data: [35, 25, 20, 15, 12, 18, 10, 8],
                                            backgroundColor: [
                                                '#ef4444',
                                                '#f97316',
                                                '#f59e0b',
                                                '#3b82f6',
                                                '#8b5cf6',
                                                '#06b6d4',
                                                '#84cc16',
                                                '#f43f5e'
                                            ]
                                        }]
                                    }}
                                    height={300}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Number of Failures'
                                                },
                                                min: 0,
                                                max: 40
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* RPN Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Priority Number (RPN) Analysis</CardTitle>
                                <CardDescription>RPN distribution and critical failure modes identification</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="RPN Analysis"
                                    type="scatter"
                                    loading={equipmentChangeLoading}
                                    data={{
                                        datasets: [{
                                            label: 'Critical (RPN > 300)',
                                            data: [
                                                { x: 9, y: 7, rpn: 378, mode: 'Bearing Failure' },
                                                { x: 8, y: 6, rpn: 320, mode: 'Shaft Breakage' },
                                                { x: 9, y: 5, rpn: 315, mode: 'Catastrophic Failure' }
                                            ],
                                            backgroundColor: '#ef4444',
                                            pointRadius: 10
                                        }, {
                                            label: 'High (200-300)',
                                            data: [
                                                { x: 8, y: 5, rpn: 280, mode: 'Shaft Misalignment' },
                                                { x: 7, y: 6, rpn: 252, mode: 'Gear Failure' },
                                                { x: 6, y: 7, rpn: 252, mode: 'Coupling Failure' }
                                            ],
                                            backgroundColor: '#f97316',
                                            pointRadius: 8
                                        }, {
                                            label: 'Medium (100-200)',
                                            data: [
                                                { x: 6, y: 4, rpn: 192, mode: 'Seal Leakage' },
                                                { x: 5, y: 5, rpn: 175, mode: 'Vibration Issues' },
                                                { x: 4, y: 6, rpn: 168, mode: 'Temperature Rise' }
                                            ],
                                            backgroundColor: '#f59e0b',
                                            pointRadius: 6
                                        }, {
                                            label: 'Low (<100)',
                                            data: [
                                                { x: 3, y: 4, rpn: 84, mode: 'Minor Wear' },
                                                { x: 2, y: 5, rpn: 70, mode: 'Noise Issues' },
                                                { x: 4, y: 2, rpn: 56, mode: 'Cosmetic Damage' }
                                            ],
                                            backgroundColor: '#10b981',
                                            pointRadius: 4
                                        }]
                                    }}
                                    height={300}
                                    customOptions={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Severity Rating'
                                                },
                                                min: 1,
                                                max: 10
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Occurrence Rating'
                                                },
                                                min: 1,
                                                max: 10
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context: any) {
                                                        return `${context.raw.mode}: RPN = ${context.raw.rpn}`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Full Width Charts */}
                    <div className="space-y-6">
                        {/* Failure Mode Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Failure Mode Trends Over Time</CardTitle>
                                <CardDescription>Historical analysis of failure modes and their frequency patterns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Failure Mode Trends"
                                    type="line"
                                    loading={equipmentChangeLoading}
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                        datasets: [{
                                            label: 'Bearing Failures',
                                            data: [8, 6, 9, 7, 5, 4, 3, 2, 1, 1, 0, 0],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Misalignment Issues',
                                            data: [5, 4, 6, 5, 4, 3, 2, 2, 1, 1, 0, 0],
                                            borderColor: '#f97316',
                                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Lubrication Problems',
                                            data: [12, 10, 8, 6, 4, 3, 2, 1, 1, 0, 0, 0],
                                            borderColor: '#f59e0b',
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Contamination Issues',
                                            data: [6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4
                                        }]
                                    }}
                                    height={400}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Number of Failures'
                                                },
                                                min: 0,
                                                max: 15
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Detection and Cost Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detection Method Effectiveness</CardTitle>
                                    <CardDescription>Comparison of different detection methods and their success rates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EnhancedChart
                                        title="Detection Effectiveness"
                                        type="bar"
                                        loading={equipmentChangeLoading}
                                        data={{
                                            labels: ['Vibration Analysis', 'Thermal Imaging', 'Oil Analysis', 'Ultrasound', 'Visual Inspection', 'Performance Monitoring'],
                                            datasets: [{
                                                label: 'Detection Rate (%)',
                                                data: [95, 88, 92, 85, 70, 90],
                                                backgroundColor: [
                                                    '#3b82f6',
                                                    '#ef4444',
                                                    '#10b981',
                                                    '#f59e0b',
                                                    '#8b5cf6',
                                                    '#06b6d4'
                                                ]
                                            }]
                                        }}
                                        height={300}
                                        customOptions={{
                                            scales: {
                                                y: {
                                                    title: {
                                                        display: true,
                                                        text: 'Detection Rate (%)'
                                                    },
                                                    min: 60,
                                                    max: 100
                                                }
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Failure Cost Analysis</CardTitle>
                                    <CardDescription>Financial impact of different failure modes and root causes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EnhancedChart
                                        title="Failure Cost Impact"
                                        type="doughnut"
                                        loading={equipmentChangeLoading}
                                        data={{
                                            labels: ['Bearing Failures', 'Misalignment', 'Lubrication Issues', 'Contamination', 'Thermal Stress', 'Other'],
                                            datasets: [{
                                                data: [45, 25, 15, 8, 5, 2],
                                                backgroundColor: [
                                                    '#ef4444',
                                                    '#f97316',
                                                    '#f59e0b',
                                                    '#3b82f6',
                                                    '#8b5cf6',
                                                    '#06b6d4'
                                                ]
                                            }]
                                        }}
                                        height={300}
                                        customOptions={{
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (context: any) {
                                                            return `${context.label}: ${context.parsed}% of total cost`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Corrective Action Effectiveness */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Corrective Action Effectiveness Analysis</CardTitle>
                                <CardDescription>Impact of implemented corrective actions on failure reduction</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Corrective Action Impact"
                                    type="line"
                                    loading={equipmentChangeLoading}
                                    data={{
                                        labels: ['Before', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
                                        datasets: [{
                                            label: 'Bearing Failures',
                                            data: [8, 6, 4, 2, 1, 0, 0],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Misalignment Issues',
                                            data: [5, 4, 3, 2, 1, 0, 0],
                                            borderColor: '#f97316',
                                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Lubrication Problems',
                                            data: [12, 8, 5, 3, 1, 0, 0],
                                            borderColor: '#f59e0b',
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Total Failures',
                                            data: [25, 18, 12, 7, 3, 0, 0],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4,
                                            borderWidth: 3
                                        }]
                                    }}
                                    height={400}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Number of Failures'
                                                },
                                                min: 0,
                                                max: 30
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Advanced Analytics Tab */}
                <TabsContent value="advanced" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Advanced Statistical Analytics
                            </CardTitle>
                            <CardDescription>
                                Advanced statistical analysis and multivariate modeling
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Advanced Analytics Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Statistical Models</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-blue-600">12</div>
                                            <p className="text-xs text-muted-foreground">Active models</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Model Accuracy</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">94.7%</div>
                                            <p className="text-xs text-muted-foreground">Average accuracy</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Data Points</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-purple-600">2.4M</div>
                                            <p className="text-xs text-muted-foreground">Processed daily</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Correlation Strength</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-orange-600">0.87</div>
                                            <p className="text-xs text-muted-foreground">Avg correlation</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Multivariate Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Correlation Matrix</CardTitle>
                                            <CardDescription>Feature correlation analysis for equipment parameters</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Feature Correlations"
                                                type="bar"
                                                data={{
                                                    labels: ['Vibration', 'Temperature', 'Pressure', 'Oil Quality', 'Operating Hours', 'Load'],
                                                    datasets: [{
                                                        label: 'Correlation with Vibration',
                                                        data: [1.0, 0.75, 0.62, -0.45, 0.38, 0.82],
                                                        backgroundColor: [
                                                            '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                                                        ]
                                                    }]
                                                }}
                                                height={400}
                                                customOptions={{
                                                    indexAxis: 'y',
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Correlation Coefficient'
                                                            },
                                                            min: -1,
                                                            max: 1
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Principal Component Analysis</CardTitle>
                                            <CardDescription>Dimensionality reduction and feature importance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="PCA Components"
                                                type="scatter"
                                                data={{
                                                    datasets: [{
                                                        label: 'Component 1 vs Component 2',
                                                        data: [
                                                            { x: 0.85, y: 0.32 }, { x: 0.72, y: 0.45 }, { x: 0.68, y: 0.28 },
                                                            { x: 0.45, y: 0.78 }, { x: 0.38, y: 0.82 }, { x: 0.52, y: 0.65 },
                                                            { x: 0.28, y: 0.92 }, { x: 0.35, y: 0.88 }, { x: 0.42, y: 0.75 }
                                                        ],
                                                        backgroundColor: [
                                                            '#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4',
                                                            '#10b981', '#84cc16', '#22c55e'
                                                        ],
                                                        pointRadius: 8
                                                    }]
                                                }}
                                                height={400}
                                                customOptions={{
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Principal Component 1 (45.2%)'
                                                            },
                                                            min: 0,
                                                            max: 1
                                                        },
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Principal Component 2 (28.7%)'
                                                            },
                                                            min: 0,
                                                            max: 1
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Time Series Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Time Series Decomposition</CardTitle>
                                        <CardDescription>Trend, seasonal, and residual analysis of equipment data</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EnhancedChart
                                            title="Time Series Components"
                                            type="line"
                                            data={{
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                                datasets: [{
                                                    label: 'Original Data',
                                                    data: [85, 87, 89, 88, 90, 92, 91, 93, 94, 92, 95, 96],
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    tension: 0.4
                                                }, {
                                                    label: 'Trend Component',
                                                    data: [83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94],
                                                    borderColor: '#10b981',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    tension: 0.4
                                                }, {
                                                    label: 'Seasonal Component',
                                                    data: [2, 3, 4, 2, 3, 4, 2, 3, 3, 0, 2, 2],
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    tension: 0.4
                                                }, {
                                                    label: 'Residual Component',
                                                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    borderColor: '#ef4444',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    tension: 0.4
                                                }]
                                            }}
                                            height={400}
                                            customOptions={{
                                                scales: {
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Value'
                                                        },
                                                        min: 0,
                                                        max: 100
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Statistical Control Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Control Chart (X-Bar)</CardTitle>
                                            <CardDescription>Statistical process control for equipment performance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="X-Bar Control Chart"
                                                type="line"
                                                data={{
                                                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
                                                    datasets: [{
                                                        label: 'Sample Mean',
                                                        data: [85.2, 86.1, 84.8, 87.2, 85.9, 86.8, 84.5, 87.1, 85.7, 86.3, 84.9, 87.5, 85.4, 86.7, 84.6],
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Upper Control Limit',
                                                        data: Array(15).fill(88.5),
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                        borderDash: [5, 5],
                                                        fill: false
                                                    }, {
                                                        label: 'Lower Control Limit',
                                                        data: Array(15).fill(82.5),
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                        borderDash: [5, 5],
                                                        fill: false
                                                    }, {
                                                        label: 'Center Line',
                                                        data: Array(15).fill(85.5),
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        borderDash: [3, 3],
                                                        fill: false
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Value'
                                                            },
                                                            min: 80,
                                                            max: 90
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Range Control Chart</CardTitle>
                                            <CardDescription>Variability control chart for process stability</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <EnhancedChart
                                                title="Range Control Chart"
                                                type="line"
                                                data={{
                                                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
                                                    datasets: [{
                                                        label: 'Sample Range',
                                                        data: [2.1, 1.8, 2.3, 1.9, 2.0, 1.7, 2.2, 1.8, 2.1, 1.9, 2.0, 1.8, 2.2, 1.9, 2.1],
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        tension: 0.4
                                                    }, {
                                                        label: 'Upper Control Limit',
                                                        data: Array(15).fill(3.2),
                                                        borderColor: '#ef4444',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                        borderDash: [5, 5],
                                                        fill: false
                                                    }, {
                                                        label: 'Center Line',
                                                        data: Array(15).fill(2.0),
                                                        borderColor: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        borderDash: [3, 3],
                                                        fill: false
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Range'
                                                            },
                                                            min: 0,
                                                            max: 4
                                                        }
                                                    }
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Distribution Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Statistical Distribution Analysis</CardTitle>
                                        <CardDescription>Probability distributions and goodness-of-fit tests</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <EnhancedChart
                                                title="Vibration Distribution"
                                                type="bar"
                                                data={{
                                                    labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80'],
                                                    datasets: [{
                                                        label: 'Observed Frequency',
                                                        data: [12, 25, 38, 45, 32, 18, 8, 2],
                                                        backgroundColor: '#3b82f6'
                                                    }, {
                                                        label: 'Expected (Normal)',
                                                        data: [8, 22, 42, 48, 35, 20, 10, 3],
                                                        backgroundColor: '#10b981',
                                                        borderColor: '#10b981',
                                                        borderWidth: 2,
                                                        fill: false,
                                                        type: 'line'
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Frequency'
                                                            },
                                                            min: 0
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="space-y-4">
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-2">Goodness-of-Fit Test Results</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Chi-Square Test:</span>
                                                            <span className="font-medium text-green-600">Passed (p = 0.087)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Kolmogorov-Smirnov:</span>
                                                            <span className="font-medium text-green-600">Passed (p = 0.124)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Anderson-Darling:</span>
                                                            <span className="font-medium text-green-600">Passed (p = 0.156)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Distribution Type:</span>
                                                            <span className="font-medium text-blue-600">Normal (μ=35, σ=12)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-2">Statistical Summary</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Mean:</span>
                                                            <span className="font-medium">35.2 mm/s</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Standard Deviation:</span>
                                                            <span className="font-medium">12.1 mm/s</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Skewness:</span>
                                                            <span className="font-medium">0.15</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Kurtosis:</span>
                                                            <span className="font-medium">2.98</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Regression Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Multiple Regression Analysis</CardTitle>
                                        <CardDescription>Predictive modeling for equipment failure</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <EnhancedChart
                                                title="Regression Model Performance"
                                                type="scatter"
                                                data={{
                                                    datasets: [{
                                                        label: 'Actual vs Predicted',
                                                        data: [
                                                            { x: 85, y: 87 }, { x: 78, y: 76 }, { x: 92, y: 94 },
                                                            { x: 88, y: 89 }, { x: 95, y: 93 }, { x: 82, y: 84 },
                                                            { x: 90, y: 91 }, { x: 87, y: 88 }, { x: 93, y: 95 },
                                                            { x: 89, y: 90 }, { x: 91, y: 92 }, { x: 86, y: 87 }
                                                        ],
                                                        backgroundColor: '#3b82f6',
                                                        pointRadius: 6
                                                    }, {
                                                        label: 'Perfect Prediction Line',
                                                        data: [
                                                            { x: 75, y: 75 }, { x: 100, y: 100 }
                                                        ],
                                                        borderColor: '#ef4444',
                                                        borderWidth: 2,
                                                        pointRadius: 0,
                                                        showLine: true
                                                    }]
                                                }}
                                                height={300}
                                                customOptions={{
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Actual Values'
                                                            },
                                                            min: 70,
                                                            max: 100
                                                        },
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Predicted Values'
                                                            },
                                                            min: 70,
                                                            max: 100
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="space-y-4">
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-2">Model Performance Metrics</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>R² (Coefficient of Determination):</span>
                                                            <span className="font-medium text-green-600">0.894</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Adjusted R²:</span>
                                                            <span className="font-medium text-green-600">0.887</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Root Mean Square Error:</span>
                                                            <span className="font-medium text-blue-600">2.34</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Mean Absolute Error:</span>
                                                            <span className="font-medium text-blue-600">1.87</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-medium mb-2">Feature Coefficients</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Vibration RMS:</span>
                                                            <span className="font-medium text-red-600">0.452</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Temperature:</span>
                                                            <span className="font-medium text-orange-600">0.287</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Pressure:</span>
                                                            <span className="font-medium text-yellow-600">0.198</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Operating Hours:</span>
                                                            <span className="font-medium text-blue-600">0.063</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdvancedPredictiveAnalytics; 