
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Vehicles = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Fleet Vehicles</CardTitle>
            <CardDescription>Vehicle inventory and tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Vehicle content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Vehicles;
