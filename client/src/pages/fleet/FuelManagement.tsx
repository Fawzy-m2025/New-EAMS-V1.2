
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FuelManagement = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Fuel Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Fuel Tracking</CardTitle>
            <CardDescription>Fuel consumption and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Fuel management content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FuelManagement;
