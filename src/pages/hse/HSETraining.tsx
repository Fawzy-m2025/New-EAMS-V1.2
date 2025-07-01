
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HSETraining = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">HSE Training</h1>
        <Card>
          <CardHeader>
            <CardTitle>Safety Training</CardTitle>
            <CardDescription>Health, safety and environment training</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">HSE training content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HSETraining;
