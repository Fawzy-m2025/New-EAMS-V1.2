import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bot, Zap, AlertTriangle, CheckCircle, Clock, Settings,
  Lightbulb, Target, TrendingUp, Activity, Wrench
} from 'lucide-react';
import type { WorkOrder, Priority, Equipment } from '@/types/eams';
import { useAssetContext } from '@/contexts/AssetContext';

interface AIWorkOrderCreatorProps {
  onSubmit: (workOrder: Partial<WorkOrder>) => void;
  onClose: () => void;
}

export function AIWorkOrderCreator({ onSubmit, onClose }: AIWorkOrderCreatorProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    procedures: [] as string[],
    estimatedHours: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    assignedTo: '',
    estimatedHours: 0
  });

  const { monitoredEquipment, vibrationHistory } = useAssetContext();

  const analyzeEquipment = async (equipment: Equipment) => {
    setIsAnalyzing(true);

    // Simulate AI analysis based on condition monitoring data
    setTimeout(() => {
      const alerts = equipment.conditionMonitoring.alerts;
      const condition = equipment.conditionMonitoring.overallCondition;

      let suggestions = {
        title: '',
        description: '',
        priority: 'medium' as Priority,
        procedures: [] as string[],
        estimatedHours: 4
      };

      if (alerts.length > 0) {
        const vibrationAlert = alerts.find(a => a.type === 'vibration');
        if (vibrationAlert) {
          suggestions = {
            title: `${equipment.name} - Vibration Analysis and Correction`,
            description: `AI Analysis: Elevated vibration levels (${vibrationAlert.actualValue} mm/s) detected on ${equipment.name}. Condition monitoring indicates ISO 10816 Zone B operation with potential alignment issues. Immediate investigation recommended to prevent catastrophic failure.`,
            priority: vibrationAlert.severity === 'critical' ? 'critical' : 'high',
            procedures: [
              'Perform detailed vibration analysis using spectrum analyzer',
              'Check motor-pump alignment using laser alignment tools',
              'Inspect coupling for wear and proper installation',
              'Verify foundation bolts are properly torqued',
              'Check for cavitation or flow-related issues',
              'Review recent maintenance history for correlation',
              'Update condition monitoring baseline if corrected'
            ],
            estimatedHours: 6
          };
        }
      } else if (condition === 'fair') {
        suggestions = {
          title: `${equipment.name} - Preventive Maintenance`,
          description: `AI Recommendation: Equipment condition trending toward maintenance threshold. Proactive maintenance recommended to optimize performance and prevent unplanned downtime.`,
          priority: 'medium',
          procedures: [
            'Perform comprehensive visual inspection',
            'Check and record operating parameters',
            'Lubricate bearings per manufacturer schedule',
            'Inspect and clean cooling systems',
            'Test protective systems and alarms',
            'Update maintenance records and schedule next service'
          ],
          estimatedHours: 4
        };
      } else {
        suggestions = {
          title: `${equipment.name} - Routine Inspection`,
          description: `AI Assessment: Equipment operating within normal parameters. Routine inspection to maintain optimal performance and early detection of potential issues.`,
          priority: 'low',
          procedures: [
            'Visual inspection for leaks, unusual noise, or vibration',
            'Record operating parameters and compare to baseline',
            'Check lubrication levels and condition',
            'Verify safety systems are functional',
            'Clean equipment and surrounding area',
            'Document findings in maintenance log'
          ],
          estimatedHours: 2
        };
      }

      setAiSuggestions(suggestions);
      setFormData(prev => ({
        ...prev,
        title: suggestions.title,
        description: suggestions.description,
        priority: suggestions.priority,
        estimatedHours: suggestions.estimatedHours
      }));
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    const equipment = monitoredEquipment.find(eq => eq.id === equipmentId);
    if (equipment) {
      setSelectedEquipment(equipment);
      analyzeEquipment(equipment);
    }
  };

  const handleSubmit = () => {
    const workOrderData: Partial<WorkOrder> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      equipmentId: selectedEquipment?.id || '',
      equipmentName: selectedEquipment?.name || '',
      location: selectedEquipment ? `${selectedEquipment.location.building} - ${selectedEquipment.location.room}` : '',
      type: 'Corrective',
      estimatedHours: formData.estimatedHours,
      procedures: aiSuggestions.procedures
    };

    onSubmit(workOrderData);
    onClose();
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI-Powered Work Order Creation
          </CardTitle>
          <CardDescription>
            Select equipment for intelligent analysis and automated work order generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Equipment Selection */}
          <div className="space-y-4">
            <Label>Select Equipment</Label>
            <Select onValueChange={handleEquipmentSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose equipment for analysis..." />
              </SelectTrigger>
              <SelectContent>
                {monitoredEquipment.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{equipment.name}</span>
                      <Badge className={getConditionColor(equipment.condition)}>
                        {equipment.condition}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Equipment Analysis */}
          {selectedEquipment && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Equipment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedEquipment.conditionMonitoring.overallCondition}</div>
                    <div className="text-sm text-muted-foreground">Overall Condition</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedEquipment.conditionMonitoring.alerts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedEquipment.conditionMonitoring.vibration?.rmsVelocity || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Vibration (mm/s)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedEquipment.specifications.ratedPower || 'N/A'}kW
                    </div>
                    <div className="text-sm text-muted-foreground">Rated Power</div>
                  </div>
                </div>

                {selectedEquipment.conditionMonitoring.alerts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Active Alerts</Label>
                    {selectedEquipment.conditionMonitoring.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{alert.message}</span>
                        <Badge variant="outline" className="ml-auto">
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Loading */}
          {isAnalyzing && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-primary animate-pulse" />
                  <div className="space-y-1">
                    <div className="font-medium">AI Analyzing Equipment Condition...</div>
                    <div className="text-sm text-muted-foreground">
                      Processing vibration data, maintenance history, and operational parameters
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.title && !isAnalyzing && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Priority</div>
                      <Badge className={
                        aiSuggestions.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          aiSuggestions.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            aiSuggestions.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                      }>
                        {aiSuggestions.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Estimated Time</div>
                      <div className="text-sm">{aiSuggestions.estimatedHours} hours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Procedures</div>
                      <div className="text-sm">{aiSuggestions.procedures.length} steps</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recommended Procedures</Label>
                  <div className="space-y-1">
                    {aiSuggestions.procedures.slice(0, 3).map((procedure, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                        {procedure}
                      </div>
                    ))}
                    {aiSuggestions.procedures.length > 3 && (
                      <div className="text-sm text-muted-foreground italic">
                        +{aiSuggestions.procedures.length - 3} more procedures...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Order Form */}
          {aiSuggestions.title && !isAnalyzing && (
            <Card>
              <CardHeader>
                <CardTitle>Work Order Details</CardTitle>
                <CardDescription>Review and customize the AI-generated work order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Priority }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="Technician name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Create AI-Generated Work Order
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
