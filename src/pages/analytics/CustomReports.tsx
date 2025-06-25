
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CustomReports = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
        <Card>
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
            <CardDescription>Create custom reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Custom reports content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CustomReports;
