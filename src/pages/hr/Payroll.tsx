
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Payroll = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Payroll Processing</CardTitle>
            <CardDescription>Employee compensation and benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Payroll content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Payroll;
