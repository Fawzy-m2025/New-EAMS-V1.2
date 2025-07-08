
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DriverManagement = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Driver Records</CardTitle>
            <CardDescription>Driver information and licensing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Driver management content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DriverManagement;
