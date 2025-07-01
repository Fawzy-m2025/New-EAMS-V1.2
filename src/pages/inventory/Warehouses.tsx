
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Warehouses = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Operations</CardTitle>
            <CardDescription>Multi-location inventory management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Warehouse content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Warehouses;
