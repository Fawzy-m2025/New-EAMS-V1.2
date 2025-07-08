
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Performance = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Employee Performance</CardTitle>
            <CardDescription>Performance reviews and goal tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Performance content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Performance;
