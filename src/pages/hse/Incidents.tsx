
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Incidents = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Safety Incidents</CardTitle>
            <CardDescription>Incident reporting and tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Incident content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Incidents;
