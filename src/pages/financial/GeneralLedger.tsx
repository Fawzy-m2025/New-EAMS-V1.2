
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, DollarSign, Search, Filter, Plus, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GeneralLedger = () => {
  const ledgerEntries = [
    { id: "GL-001", date: "2024-01-15", account: "1001 - Cash", description: "Equipment Purchase", debit: 25000, credit: 0, balance: 125000 },
    { id: "GL-002", date: "2024-01-15", account: "5001 - Equipment", description: "Equipment Purchase", debit: 0, credit: 25000, balance: 850000 },
    { id: "GL-003", date: "2024-01-14", account: "4001 - Revenue", description: "Service Income", debit: 0, credit: 15000, balance: 325000 },
    { id: "GL-004", date: "2024-01-14", account: "1001 - Cash", description: "Service Income", debit: 15000, credit: 0, balance: 150000 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
            <p className="text-muted-foreground">Complete financial transaction records</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Assets"
            value="$5.2M"
            icon={<DollarSign className="text-green-600 h-4 w-4" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            title="Total Liabilities"
            value="$1.8M"
            icon={<DollarSign className="text-red-600 h-4 w-4" />}
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard 
            title="Equity"
            value="$3.4M"
            icon={<TrendingUp className="text-primary h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Monthly Entries"
            value="1,247"
            icon={<FileText className="text-blue-600 h-4 w-4" />}
            description="This month"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ledger Search</CardTitle>
            <CardDescription>Search transactions and accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search ledger entries..." className="pl-10" />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest general ledger entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ledgerEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{entry.description}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{entry.id}</span>
                        <span>•</span>
                        <span>{entry.account}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">Debit</div>
                      <div className="text-sm text-muted-foreground">${entry.debit.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Credit</div>
                      <div className="text-sm text-muted-foreground">${entry.credit.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Balance</div>
                      <div className="text-sm text-muted-foreground">${entry.balance.toLocaleString()}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default GeneralLedger;
