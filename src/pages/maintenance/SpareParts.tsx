
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package2, AlertCircle, Search, Filter, Plus, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SpareParts = () => {
  const spareParts = [
    { id: "SP-001", name: "Pump Impeller", category: "Pumping Equipment", inStock: 12, minLevel: 5, maxLevel: 20, cost: 450, status: "In Stock" },
    { id: "SP-002", name: "Generator Belt", category: "Power Generation", inStock: 2, minLevel: 5, maxLevel: 15, cost: 125, status: "Low Stock" },
    { id: "SP-003", name: "Control Circuit Board", category: "Electronics", inStock: 0, minLevel: 3, maxLevel: 10, cost: 890, status: "Out of Stock" },
    { id: "SP-004", name: "Valve Seal Kit", category: "Valves", inStock: 25, minLevel: 10, maxLevel: 30, cost: 75, status: "In Stock" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spare Parts Management</h1>
            <p className="text-muted-foreground">Inventory management for maintenance parts</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Parts"
            value="2,847"
            icon={<Package2 className="text-primary h-4 w-4" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard 
            title="Low Stock Items"
            value="23"
            icon={<AlertCircle className="text-orange-600 h-4 w-4" />}
            description="Need reorder"
          />
          <StatCard 
            title="Out of Stock"
            value="7"
            icon={<TrendingDown className="text-red-600 h-4 w-4" />}
            description="Critical items"
          />
          <StatCard 
            title="Inventory Value"
            value="$1.2M"
            icon={<Package2 className="text-primary h-4 w-4" />}
            description="Current stock"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parts Search</CardTitle>
            <CardDescription>Find spare parts by name or category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search spare parts..." className="pl-10" />
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
            <CardTitle>Spare Parts Inventory</CardTitle>
            <CardDescription>Current stock levels and part information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spareParts.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{part.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{part.id}</span>
                        <span>•</span>
                        <span>{part.category}</span>
                        <span>•</span>
                        <span>${part.cost} each</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">In Stock</div>
                      <div className="text-sm text-muted-foreground">{part.inStock} units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Min/Max</div>
                      <div className="text-sm text-muted-foreground">{part.minLevel}/{part.maxLevel}</div>
                    </div>
                    <Badge variant={part.status === 'Out of Stock' ? 'destructive' : part.status === 'Low Stock' ? 'secondary' : 'default'}>
                      {part.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Manage
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

export default SpareParts;
