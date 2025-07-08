
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Calculator } from 'lucide-react';

interface ScheduleEntry {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
  taxDepreciation?: number;
  variance?: number;
}

interface DepreciationScheduleTableProps {
  schedule: ScheduleEntry[];
  assetName: string;
  method: string;
  viewMode: 'annual' | 'quarterly' | 'monthly';
  onViewModeChange: (mode: 'annual' | 'quarterly' | 'monthly') => void;
}

export function DepreciationScheduleTable({ 
  schedule, 
  assetName, 
  method, 
  viewMode,
  onViewModeChange 
}: DepreciationScheduleTableProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredSchedule = selectedYear === 'all' 
    ? schedule 
    : schedule.filter(entry => entry.year === selectedYear);

  const handleExport = (format: 'pdf' | 'excel') => {
    // Placeholder for export functionality
    console.log(`Exporting ${format} for ${assetName}`);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      "straight-line": "bg-blue-100 text-blue-800",
      "declining-balance": "bg-green-100 text-green-800",
      "sum-of-years": "bg-purple-100 text-purple-800",
      "units-of-production": "bg-orange-100 text-orange-800"
    };
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Depreciation Schedule - {assetName}
            </CardTitle>
            <CardDescription>
              Automated schedule using {method} method
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getMethodColor(method)}>
              {method.replace('-', ' ')}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => handleExport('excel')}
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Year:</span>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {schedule.map(entry => (
                  <SelectItem key={entry.year} value={entry.year.toString()}>
                    {entry.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Beginning Book Value</TableHead>
                <TableHead>Depreciation Expense</TableHead>
                <TableHead>Accumulated Depreciation</TableHead>
                <TableHead>Ending Book Value</TableHead>
                <TableHead>Tax Depreciation</TableHead>
                <TableHead>Book vs Tax Variance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedule.map((entry) => (
                <TableRow key={entry.year} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    Year {entry.year}
                  </TableCell>
                  <TableCell>{formatCurrency(entry.beginningBookValue)}</TableCell>
                  <TableCell className="font-medium text-red-600">
                    {formatCurrency(entry.depreciationExpense)}
                  </TableCell>
                  <TableCell>{formatCurrency(entry.accumulatedDepreciation)}</TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {formatCurrency(entry.endingBookValue)}
                  </TableCell>
                  <TableCell>
                    {entry.taxDepreciation ? formatCurrency(entry.taxDepreciation) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {entry.variance ? (
                      <span className={entry.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(Math.abs(entry.variance))}
                      </span>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Depreciation:</span>
                <span className="font-medium">
                  {formatCurrency(schedule.reduce((sum, entry) => sum + entry.depreciationExpense, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Book Value:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(schedule[schedule.length - 1]?.endingBookValue || 0)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Tax Impact</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Tax Savings (25%):</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(schedule.reduce((sum, entry) => sum + entry.depreciationExpense, 0) * 0.25)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Variance:</span>
                <span className="font-medium">
                  {formatCurrency(schedule.reduce((sum, entry) => sum + (entry.variance || 0), 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Compliance</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>GAAP Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>SOX Ready</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
