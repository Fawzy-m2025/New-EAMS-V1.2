
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Plus, Search, Filter, Package, AlertTriangle, TrendingDown, TrendingUp, Warehouse } from "lucide-react";
import { useState } from "react";

const StockManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");

  const inventory = [
    {
      id: "INV-001",
      name: "Hydraulic Oil SAE 10W",
      category: "Fluids",
      sku: "HO-SAE10W-55G",
      warehouse: "Main Warehouse",
      currentStock: 45,
      minLevel: 20,
      maxLevel: 100,
      unitCost: 25.50,
      totalValue: 1147.50,
      supplier: "Industrial Supplies Co.",
      lastRestocked: "2024-01-10"
    },
    {
      id: "INV-002", 
      name: "Bearing SKF 6205",
      category: "Mechanical Parts",
      sku: "BRG-SKF-6205",
      warehouse: "Parts Storage",
      currentStock: 8,
      minLevel: 15,
      maxLevel: 50,
      unitCost: 45.00,
      totalValue: 360.00,
      supplier: "SKF Bearings",
      lastRestocked: "2024-01-05"
    },
    {
      id: "INV-003",
      name: "Safety Gloves - Medium",
      category: "Safety Equipment",
      sku: "SF-GLV-MED",
      warehouse: "Safety Storage",
      currentStock: 150,
      minLevel: 50,
      maxLevel: 200,
      unitCost: 3.25,
      totalValue: 487.50,
      supplier: "Safety First Corp",
      lastRestocked: "2024-01-12"
    },
    {
      id: "INV-004",
      name: "Electrical Wire 12 AWG",
      category: "Electrical",
      sku: "EW-12AWG-100FT",
      warehouse: "Electrical Storage",
      currentStock: 25,
      minLevel: 30,
      maxLevel: 80,
      unitCost: 85.00,
      totalValue: 2125.00,
      supplier: "ElectroCorp",
      lastRestocked: "2024-01-08"
    }
  ];

  const getStockStatus = (current: number, min: number, max: number) => {
    if (current <= min) return { status: "low", color: "text-red-600 bg-red-100" };
    if (current >= max * 0.9) return { status: "high", color: "text-blue-600 bg-blue-100" };
    return { status: "normal", color: "text-green-600 bg-green-100" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minLevel).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
            <p className="text-muted-foreground">Inventory control and stock level monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Stock In
            </Button>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Stock Out
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value="1,847"
            icon={<Package className="text-blue-600 h-4 w-4" />}
            description="In inventory"
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(totalValue)}
            icon={<TrendingUp className="text-green-600 h-4 w-4" />}
            description="Current stock value"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.toString()}
            icon={<AlertTriangle className="text-red-600 h-4 w-4" />}
            description="Need reordering"
          />
          <StatCard
            title="Warehouses"
            value="4"
            icon={<Warehouse className="text-purple-600 h-4 w-4" />}
            description="Storage locations"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Filters</CardTitle>
            <CardDescription>Filter inventory by category, warehouse, and stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search inventory..." className="pl-10" />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fluids">Fluids</SelectItem>
                  <SelectItem value="mechanical">Mechanical Parts</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="safety">Safety Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  <SelectItem value="main">Main Warehouse</SelectItem>
                  <SelectItem value="parts">Parts Storage</SelectItem>
                  <SelectItem value="safety">Safety Storage</SelectItem>
                  <SelectItem value="electrical">Electrical Storage</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Current stock levels and inventory details</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock, item.minLevel, item.maxLevel);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.currentStock}</div>
                        <div className="text-sm text-muted-foreground">
                          Min: {item.minLevel} | Max: {item.maxLevel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StockManagement;
