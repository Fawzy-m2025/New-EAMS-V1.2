
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FleetMaintenance = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Fleet Maintenance</h1>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Maintenance</CardTitle>
            <CardDescription>Fleet maintenance scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Fleet maintenance content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FleetMaintenance;
