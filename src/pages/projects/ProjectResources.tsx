
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProjectResources = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Project Resources</h1>
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Project resource management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Project resources content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProjectResources;
