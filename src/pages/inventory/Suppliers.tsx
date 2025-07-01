
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Suppliers = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Supplier Directory</CardTitle>
            <CardDescription>Vendor relationships and contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Supplier content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Suppliers;
