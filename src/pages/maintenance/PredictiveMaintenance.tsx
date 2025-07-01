
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Brain, Search, Filter, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PredictiveMaintenance = () => {
  const predictions = [
    { id: "PD-001", asset: "Pump Station Alpha", condition: "Vibration Anomaly", probability: 78, daysToFailure: 45, severity: "Medium", confidence: 92 },
    { id: "PD-002", asset: "Generator Unit 1", condition: "Temperature Rise", probability: 92, daysToFailure: 12, severity: "High", confidence: 89 },
    { id: "PD-003", asset: "Control Panel CP-01", condition: "Normal Operation", probability: 15, daysToFailure: 180, severity: "Low", confidence: 95 },
    { id: "PD-004", asset: "Valve Assembly V-12", condition: "Pressure Drop", probability: 65, daysToFailure: 30, severity: "Medium", confidence: 87 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Predictive Maintenance</h1>
            <p className="text-muted-foreground">AI-powered failure prediction and condition monitoring</p>
          </div>
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            Run Analysis
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Monitored Assets"
            value="1,089"
            icon={<Activity className="text-primary h-4 w-4" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            title="High Risk Assets"
            value="23"
            icon={<AlertTriangle className="text-red-600 h-4 w-4" />}
            description="Require attention"
          />
          <StatCard 
            title="Prediction Accuracy"
            value="91.4%"
            icon={<Brain className="text-purple-600 h-4 w-4" />}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard 
            title="Cost Savings"
            value="$456K"
            icon={<TrendingUp className="text-green-600 h-4 w-4" />}
            description="This year"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Analysis</CardTitle>
            <CardDescription>Search and filter predictive insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search predictions..." className="pl-10" />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failure Predictions</CardTitle>
            <CardDescription>AI-generated maintenance predictions and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{prediction.asset}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{prediction.id}</span>
                        <span>•</span>
                        <span>{prediction.condition}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">Failure Risk</div>
                      <div className="text-sm text-muted-foreground">{prediction.probability}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Time to Failure</div>
                      <div className="text-sm text-muted-foreground">{prediction.daysToFailure} days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Confidence</div>
                      <div className="text-sm text-muted-foreground">{prediction.confidence}%</div>
                    </div>
                    <Badge variant={prediction.severity === 'High' ? 'destructive' : prediction.severity === 'Medium' ? 'secondary' : 'outline'}>
                      {prediction.severity}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PredictiveMaintenance;
