
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AccountsPayable = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts Payable</h1>
            <p className="text-muted-foreground">Manage vendor payments and outstanding bills</p>
          </div>
          <Button>Add Invoice</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Outstanding Balance"
            value="$847K"
            icon={<DollarSign className="text-red-600 h-4 w-4" />}
          />
          <StatCard 
            title="Due This Week"
            value="$124K"
            icon={<Calendar className="text-orange-600 h-4 w-4" />}
          />
          <StatCard 
            title="Overdue Amount"
            value="$23K"
            icon={<AlertCircle className="text-red-600 h-4 w-4" />}
          />
          <StatCard 
            title="Vendor Count"
            value="156"
            icon={<CreditCard className="text-primary h-4 w-4" />}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest accounts payable entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Accounts payable content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AccountsPayable;
