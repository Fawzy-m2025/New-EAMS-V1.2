import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { BarChart } from "@/components/dashboard/BarChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { PieChart, TrendingUp, TrendingDown, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ChatAssistant } from "@/components/ChatAssistant";

const revenueData = [
  { name: 'Jan', Revenue: 4000, Expenses: 2400 },
  { name: 'Feb', Revenue: 3000, Expenses: 1398 },
  { name: 'Mar', Revenue: 2000, Expenses: 9800 },
  { name: 'Apr', Revenue: 2780, Expenses: 3908 },
  { name: 'May', Revenue: 1890, Expenses: 4800 },
  { name: 'Jun', Revenue: 2390, Expenses: 3800 },
  { name: 'Jul', Revenue: 3490, Expenses: 4300 },
  { name: 'Aug', Revenue: 4000, Expenses: 2400 },
  { name: 'Sep', Revenue: 3000, Expenses: 1398 },
  { name: 'Oct', Revenue: 2000, Expenses: 9800 },
  { name: 'Nov', Revenue: 2780, Expenses: 3908 },
  { name: 'Dec', Revenue: 1890, Expenses: 4800 },
];

const expenseCategories = [
  { name: 'Casual Labor', value: 320500, color: '#1E88E5' },
  { name: 'Car Rent', value: 250000, color: '#42A5F5' },
  { name: 'Raw Materials', value: 180300, color: '#64B5F6' },
  { name: 'Equipment', value: 420000, color: '#90CAF9' },
  { name: 'Utilities', value: 85000, color: '#BBDEFB' },
];

const monthlyExpensesData = [
  { name: 'Jan', Labor: 40000, Materials: 24000, Equipment: 18000 },
  { name: 'Feb', Labor: 30000, Materials: 13980, Equipment: 25000 },
  { name: 'Mar', Labor: 20000, Materials: 98000, Equipment: 12000 },
  { name: 'Apr', Labor: 27800, Materials: 39080, Equipment: 15000 },
  { name: 'May', Labor: 18900, Materials: 48000, Equipment: 22000 },
  { name: 'Jun', Labor: 23900, Materials: 38000, Equipment: 19000 },
];

const transformedMonthlyExpenses = monthlyExpensesData.flatMap(entry => {
  return [
    { name: entry.name, category: 'Labor', value: entry.Labor },
    { name: entry.name, category: 'Materials', value: entry.Materials },
    { name: entry.name, category: 'Equipment', value: entry.Equipment }
  ];
});

const Financial = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
    toast.success(
      chatOpen ? "Chat assistant closed" : "Chat assistant ready to help",
      {
        description: chatOpen ? "Chat session ended" : "Ask any questions about financial data",
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Revenue"
            value="$2,456,800"
            icon={<TrendingUp className="text-green-600 h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Total Expenses"
            value="$1,256,300"
            icon={<TrendingDown className="text-red-600 h-4 w-4" />}
            trend={{ value: 8, isPositive: false }}
          />
          <StatCard 
            title="Net Income"
            value="$1,200,500"
            icon={<DollarSign className="text-primary h-4 w-4" />}
            trend={{ value: 23, isPositive: true }}
          />
          <StatCard 
            title="Total Pump Stations"
            value="12"
            icon={<PieChart className="text-primary h-4 w-4" />}
            description="Active monitoring stations"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AreaChart 
            title="Revenue vs. Expenses"
            description="Monthly financial performance"
            data={revenueData}
            categories={[
              { name: 'Revenue', color: '#1E88E5' },
              { name: 'Expenses', color: '#EF5350' }
            ]}
          />
          
          <DonutChart
            title="Expense Breakdown"
            description="Current period expense allocation"
            data={expenseCategories}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <BarChart 
            title="Monthly Expense Categories"
            description="Breakdown of main expense categories by month"
            data={transformedMonthlyExpenses}
            categories={[
              { name: 'Labor', color: '#1E88E5' },
              { name: 'Materials', color: '#42A5F5' },
              { name: 'Equipment', color: '#64B5F6' }
            ]}
          />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight mt-8">Expense Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ProgressCard 
            title="Casual Labor"
            currentValue={320500}
            maxValue={500000}
            prefix="$"
            color="bg-toshka-teal"
          />
          <ProgressCard 
            title="Car Rent"
            currentValue={250000}
            maxValue={300000}
            prefix="$"
            color="bg-sky-500"
          />
          <ProgressCard 
            title="Raw Materials"
            currentValue={180300}
            maxValue={250000}
            prefix="$"
            color="bg-blue-400"
          />
          <ProgressCard 
            title="Equipment"
            currentValue={420000}
            maxValue={500000}
            prefix="$"
            color="bg-toshka-blue"
          />
          <ProgressCard 
            title="Utilities"
            currentValue={85000}
            maxValue={120000}
            prefix="$"
            color="bg-indigo-500"
          />
        </div>
      </div>

      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg animate-bounce hover:animate-none p-0 h-14 w-14 flex items-center justify-center bg-primary hover:bg-primary/90 z-50"
        onClick={toggleChat}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <ChatAssistant 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
      />
    </AppLayout>
  );
};

export default Financial;
