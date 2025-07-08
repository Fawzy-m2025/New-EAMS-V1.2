import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import {
    AlertTriangle,
    Clock,
    Calendar as CalendarIcon,
    Wrench,
    Shield,
    TrendingUp,
    TrendingDown,
    Activity,
    CheckCircle,
    XCircle,
    Info,
    Settings,
    Bell,
    FileText,
    Users,
    Tool
} from 'lucide-react';
import { useAssetContext } from '@/contexts/AssetContext';
import { getRiskAssessmentsFromHistory, getMaintenanceSchedulesFromHistory } from '@/data/enhancedMLPipelineData';

interface RiskAssessment {
    equipmentId: string;
    equipmentName: string;
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    riskScore: number;
    failureProbability: number;
    impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    timeToFailure: number; // hours
    recommendedActions: string[];
    priority: number;
    lastAssessment: Date;
    nextAssessment: Date;
}

interface MaintenanceSchedule {
    id: string;
    equipmentId: string;
    equipmentName: string;
    maintenanceType: 'Preventive' | 'Predictive' | 'Corrective' | 'Emergency';
    scheduledDate: Date;
    estimatedDuration: number; // hours
    assignedTechnician: string;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
    requiredParts: string[];
    requiredSkills: string[];
}

interface ActionRecommendation {
    id: string;
    equipmentId: string;
    actionType: 'Immediate' | 'Scheduled' | 'Monitor' | 'Investigate';
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    estimatedCost: number;
    estimatedTime: number; // hours
    riskReduction: number; // percentage
    dependencies: string[];
    status: 'Pending' | 'Approved' | 'In Progress' | 'Completed';
}

const RiskBasedActions: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<string>('');

    // Unified analytics data from vibration history
    const { vibrationHistory } = useAssetContext();
    const riskAssessments = getRiskAssessmentsFromHistory(vibrationHistory);
    const maintenanceSchedules = getMaintenanceSchedulesFromHistory(vibrationHistory);

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'Critical': return 'destructive';
            case 'High': return 'secondary';
            case 'Medium': return 'outline';
            case 'Low': return 'default';
            default: return 'outline';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'destructive';
            case 'High': return 'secondary';
            case 'Medium': return 'outline';
            case 'Low': return 'default';
            default: return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500';
            case 'In Progress': return 'bg-blue-500';
            case 'Scheduled': return 'bg-yellow-500';
            case 'Overdue': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const filteredRiskAssessments = riskAssessments.filter(assessment =>
        selectedRiskLevel === 'all' || assessment.riskLevel === selectedRiskLevel
    );

    const criticalEquipment = riskAssessments.filter(assessment =>
        assessment.riskLevel === 'Critical' || assessment.riskLevel === 'High'
    );

    const upcomingMaintenance = maintenanceSchedules.filter(schedule =>
        schedule.status === 'Scheduled' &&
        schedule.scheduledDate > new Date() &&
        schedule.scheduledDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
    );

    return (
        <div className="space-y-6">
            {/* Risk Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Critical Risks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {criticalEquipment.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Require immediate attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            Upcoming Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {upcomingMaintenance.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Next 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Completed Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {/* Assuming actionRecommendations is defined and populated */}
                            {/* {actionRecommendations.filter(ar => ar.status === 'Completed').length} */}
                        </div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            Risk Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {/* Assuming riskAssessments is defined and populated */}
                            {/* {Math.round(riskAssessments.reduce((acc, curr) => acc + curr.riskScore, 0) / riskAssessments.length)} */}
                        </div>
                        <p className="text-xs text-muted-foreground">Average risk score</p>
                    </CardContent>
                </Card>
            </div>

            {/* Risk Assessment Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Risk Assessment & Action Recommendations
                    </CardTitle>
                    <CardDescription>
                        Real-time risk assessment with automated action recommendations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Label htmlFor="risk-filter">Filter by Risk Level:</Label>
                        <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Risk Levels</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 font-medium">Equipment</th>
                                    <th className="text-left p-3 font-medium">Risk Level</th>
                                    <th className="text-left p-3 font-medium">Risk Score</th>
                                    <th className="text-left p-3 font-medium">Time to Failure</th>
                                    <th className="text-left p-3 font-medium">Recommended Actions</th>
                                    <th className="text-left p-3 font-medium">Priority</th>
                                    <th className="text-left p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRiskAssessments.map((assessment, index) => (
                                    <tr key={index} className="border-b hover:bg-muted/30">
                                        <td className="p-3 font-medium">{assessment.equipmentName}</td>
                                        <td className="p-3">
                                            <Badge variant={getRiskColor(assessment.riskLevel)}>
                                                {assessment.riskLevel}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${assessment.riskScore > 80 ? 'bg-red-500' :
                                                            assessment.riskScore > 60 ? 'bg-orange-500' :
                                                                assessment.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${assessment.riskScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-mono">{assessment.riskScore}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`font-mono ${assessment.timeToFailure < 1000 ? 'text-red-600' :
                                                assessment.timeToFailure < 2000 ? 'text-orange-600' : 'text-green-600'
                                                }`}>
                                                {assessment.timeToFailure.toLocaleString()} hours
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="space-y-1">
                                                {assessment.recommendedActions.slice(0, 2).map((action, idx) => (
                                                    <div key={idx} className="text-sm text-muted-foreground">
                                                        • {action}
                                                    </div>
                                                ))}
                                                {assessment.recommendedActions.length > 2 && (
                                                    <div className="text-sm text-blue-600">
                                                        +{assessment.recommendedActions.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={getPriorityColor(assessment.riskLevel)}>
                                                Priority {assessment.priority}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedEquipment(assessment.equipmentId);
                                                        setShowScheduleDialog(true);
                                                    }}
                                                >
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    Schedule
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Maintenance Schedule Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Maintenance Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Upcoming Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingMaintenance.map((schedule, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{schedule.equipmentName}</h4>
                                        <Badge variant={getPriorityColor(schedule.priority)}>
                                            {schedule.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(schedule.status)}`} />
                                        <span className="text-sm text-muted-foreground">
                                            {schedule.maintenanceType} Maintenance
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                        {schedule.scheduledDate.toLocaleDateString()} - {schedule.estimatedDuration}h
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                        Assigned: {schedule.assignedTechnician}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Users className="h-3 w-3 mr-1" />
                                            View Details
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Tool className="h-3 w-3 mr-1" />
                                            Start Work
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Action Recommendations
                    </CardTitle>
                    <CardDescription>
                        AI-generated recommendations based on risk assessment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Assuming actionRecommendations is defined and populated */}
                        {/* {actionRecommendations.map((recommendation, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-medium">{recommendation.description}</h4>
                                        <Badge variant={getPriorityColor(recommendation.priority)}>
                                            {recommendation.priority}
                                        </Badge>
                                    </div>
                                    <Badge variant={recommendation.status === 'Completed' ? 'default' : 'outline'}>
                                        {recommendation.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Estimated Cost:</span>
                                        <div className="font-medium">${recommendation.estimatedCost.toLocaleString()}</div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Time Required:</span>
                                        <div className="font-medium">{recommendation.estimatedTime}h</div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Risk Reduction:</span>
                                        <div className="font-medium">{recommendation.riskReduction}%</div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Action Type:</span>
                                        <div className="font-medium">{recommendation.actionType}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Reject
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Info className="h-3 w-3 mr-1" />
                                        More Info
                                    </Button>
                                </div>
                            </div>
                        ))} */}
                    </div>
                </CardContent>
            </Card>

            {/* Risk Trends Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Risk Trends Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EnhancedChart
                        title="Equipment Risk Score Trends"
                        type="line"
                        data={{
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                            datasets: [{
                                label: 'Reserve Motor Unit',
                                data: [45, 52, 68, 75, 85, 95],
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }, {
                                label: 'Auxiliary Motor Unit',
                                data: [12, 15, 18, 14, 16, 15],
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)'
                            }, {
                                label: 'Secondary Water Pump',
                                data: [35, 42, 58, 65, 72, 75],
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)'
                            }]
                        }}
                        height={300}
                        customOptions={{
                            scales: {
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Risk Score'
                                    },
                                    min: 0,
                                    max: 100
                                }
                            }
                        }}
                    />
                </CardContent>
            </Card>

            {/* Schedule Maintenance Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Schedule Maintenance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="maintenance-type">Maintenance Type</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="predictive">Predictive</SelectItem>
                                        <SelectItem value="preventive">Preventive</SelectItem>
                                        <SelectItem value="corrective">Corrective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea placeholder="Enter maintenance description..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="technician">Assigned Technician</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select technician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="john">John Smith</SelectItem>
                                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                                        <SelectItem value="mike">Mike Davis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="duration">Estimated Duration (hours)</Label>
                                <input type="number" className="w-full p-2 border rounded" placeholder="4" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="notifications" />
                            <Label htmlFor="notifications">Send notifications to stakeholders</Label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setShowScheduleDialog(false)}>
                                Schedule Maintenance
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RiskBasedActions; 