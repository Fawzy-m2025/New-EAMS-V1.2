
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Attendance = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Time & Attendance</h1>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Tracking</CardTitle>
            <CardDescription>Employee time and attendance management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Attendance content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Attendance;
