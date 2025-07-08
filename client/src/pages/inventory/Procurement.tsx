
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Procurement = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Procurement</h1>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Management</CardTitle>
            <CardDescription>Purchase orders and vendor management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Procurement content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Procurement;
