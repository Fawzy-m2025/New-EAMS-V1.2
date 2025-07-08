
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Civil = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Civil Engineering</h1>
        <Card>
          <CardHeader>
            <CardTitle>Civil Infrastructure</CardTitle>
            <CardDescription>Civil engineering projects and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Civil engineering content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Civil;
