
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Electrical = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Electrical Engineering</h1>
        <Card>
          <CardHeader>
            <CardTitle>Electrical Systems</CardTitle>
            <CardDescription>Electrical engineering documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Electrical engineering content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Electrical;
