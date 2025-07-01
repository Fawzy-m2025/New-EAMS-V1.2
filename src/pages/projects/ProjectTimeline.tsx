
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProjectTimeline = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Project Timeline</h1>
        <Card>
          <CardHeader>
            <CardTitle>Project Schedules</CardTitle>
            <CardDescription>Timeline and milestone tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Project timeline content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProjectTimeline;
