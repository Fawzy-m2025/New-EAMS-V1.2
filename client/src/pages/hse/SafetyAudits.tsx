
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SafetyAudits = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Safety Audits</h1>
        <Card>
          <CardHeader>
            <CardTitle>Audit Management</CardTitle>
            <CardDescription>Safety inspection and audit tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Safety audit content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SafetyAudits;
