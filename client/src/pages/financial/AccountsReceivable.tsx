
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AccountsReceivable = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Accounts Receivable</h1>
        <Card>
          <CardHeader>
            <CardTitle>Accounts Receivable</CardTitle>
            <CardDescription>Customer invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Accounts receivable content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AccountsReceivable;
