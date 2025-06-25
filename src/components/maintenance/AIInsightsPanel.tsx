
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, TrendingUp, AlertTriangle, Clock, Target, 
  Brain, Zap, Activity, BarChart3 
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'alert' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  timestamp: string;
}

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'prediction',
    title: 'Pump P-001 Bearing Failure Predicted',
    description: 'ML model predicts 85% probability of bearing failure within 14 days based on vibration patterns',
    confidence: 85,
    impact: 'high',
    actionable: true,
    timestamp: '2024-12-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'optimization',
    title: 'Schedule Optimization Available',
    description: 'Rearranging 3 maintenance tasks could reduce downtime by 40% and save 12 labor hours',
    confidence: 92,
    impact: 'medium',
    actionable: true,
    timestamp: '2024-12-15T09:15:00Z'
  },
  {
    id: '3',
    type: 'alert',
    title: 'Technician Workload Imbalance',
    description: 'John Smith has 150% normal workload this week while others are below capacity',
    confidence: 98,
    impact: 'medium',
    actionable: true,
    timestamp: '2024-12-15T08:45:00Z'
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Preventive Maintenance Window',
    description: 'Optimal time for PM tasks: Dec 20-22 during low production period',
    confidence: 78,
    impact: 'low',
    actionable: true,
    timestamp: '2024-12-15T07:30:00Z'
  }
];

export function AIInsightsPanel() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation': return <TrendingUp className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-purple-600 bg-purple-100';
      case 'optimization': return 'text-blue-600 bg-blue-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'recommendation': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 gradient-text">
          <Bot className="h-5 w-5 text-primary" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-xs text-muted-foreground">Active Insights</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-xs text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-xs text-muted-foreground">Actionable</div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {mockInsights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getTypeColor(insight.type)}`}>
                      {getTypeIcon(insight.type)}
                    </div>
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Confidence: {insight.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(insight.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" className="hover-scale">
                        <Zap className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI Performance Metrics */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              AI Performance This Month
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">94%</div>
                <div className="text-xs text-muted-foreground">Prediction Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">$45K</div>
                <div className="text-xs text-muted-foreground">Cost Savings</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">-22%</div>
                <div className="text-xs text-muted-foreground">Downtime Reduction</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
