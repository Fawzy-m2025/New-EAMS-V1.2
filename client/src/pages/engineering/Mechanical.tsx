
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Mechanical = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mechanical Engineering</h1>
        <Card>
          <CardHeader>
            <CardTitle>Mechanical Systems</CardTitle>
            <CardDescription>Mechanical engineering documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Mechanical engineering content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Mechanical;
