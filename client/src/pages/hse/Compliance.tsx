
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Compliance = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance</CardTitle>
            <CardDescription>Compliance tracking and reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Compliance content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Compliance;
