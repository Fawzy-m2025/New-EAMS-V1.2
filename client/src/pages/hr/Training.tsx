
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Training = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Training Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Employee Training</CardTitle>
            <CardDescription>Training programs and certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Training content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Training;
