import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, glassCardClass } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { WorkOrderFormModal } from "@/components/maintenance/WorkOrderFormModal";
import { AIInsightsPanel } from "@/components/maintenance/AIInsightsPanel";
import { MobileWorkOrderCard } from "@/components/maintenance/MobileWorkOrderCard";
import { WorkOrderAnalytics } from "@/components/maintenance/WorkOrderAnalytics";
import { WorkOrderReports } from "@/components/maintenance/WorkOrderReports";
import { AIWorkOrderCreator } from "@/components/maintenance/AIWorkOrderCreator";
import { AdvancedStatistics } from "@/components/maintenance/AdvancedStatistics";
import { SmartNavigation } from "@/components/maintenance/SmartNavigation";
import { EnhancedDashboard } from "@/components/maintenance/EnhancedDashboard";
import { EnhancedKPIDashboard } from "@/components/maintenance/EnhancedKPIDashboard";
import { testWorkOrders } from "@/data/testWorkOrders";
import { useState, useEffect, useRef } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';
import {
  Plus, Search, Filter, Calendar, User, Wrench, AlertTriangle, Clock, CheckCircle,
  MapPin, DollarSign, Bot, Camera, Mic, Navigation, ChevronRight, Keyboard, Trash2, Pause, Play
} from "lucide-react";
import type { WorkOrder, Priority } from "@/types/eams";
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsDialog } from '@/components/maintenance/KeyboardShortcutsDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import WorkOrderCardCarousel from '@/components/maintenance/WorkOrderCardCarousel';

const WorkOrders = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([]);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [drawerWorkOrder, setDrawerWorkOrder] = useState<WorkOrder | null>(null);
  const detailTabRef = useRef<HTMLDivElement>(null);

  // Initialize with test data or load from local storage
  const initialWorkOrders = loadFromLocalStorage('workOrders', testWorkOrders);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  const { getShortcutList } = useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      description: 'Create new work order',
      handler: () => setShowWorkOrderModal(true)
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Focus search',
      handler: () => {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus();
        }
      }
    },
    {
      key: '1',
      altKey: true,
      description: 'Switch to Dashboard view',
      handler: () => setActiveTab('dashboard')
    },
    {
      key: '2',
      altKey: true,
      description: 'Switch to Mobile view',
      handler: () => setActiveTab('mobile')
    },
    {
      key: '3',
      altKey: true,
      description: 'Switch to AI Insights',
      handler: () => setActiveTab('ai-insights')
    },
    {
      key: '4',
      altKey: true,
      description: 'Switch to Analytics',
      handler: () => setActiveTab('analytics')
    },
    {
      key: 'a',
      ctrlKey: true,
      description: 'Show AI Creator',
      handler: () => setShowAICreator(true)
    },
    {
      key: '/',
      description: 'Show keyboard shortcuts',
      handler: () => setShowShortcutsDialog(true)
    }
  ]);

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || wo.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || wo.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate KPIs
  const totalWorkOrders = workOrders.length;
  const openOrders = workOrders.filter(wo => wo.status === 'open').length;
  const inProgressOrders = workOrders.filter(wo => wo.status === 'in-progress').length;
  const completedThisMonth = workOrders.filter(wo =>
    wo.status === 'completed' &&
    new Date(wo.completedDate || '').getMonth() === new Date().getMonth()
  ).length;
  const criticalHighPriority = workOrders.filter(wo =>
    wo.priority === 'critical' || wo.priority === 'high'
  ).length;

  const getStatusBadgeBg = (status: string) => {
    switch (status) {
      case "open": return "#1E88E5";
      case "in-progress": return "#4DB6AC";
      case "closed": return "#9E9E9E";
      case "completed": return "#4CAF50";
      case "assigned": return "#1E88E5";
      case "scheduled": return "#1E88E5";
      case "cancelled": return "#9E9E9E";
      default: return "#9E9E9E";
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case "open": return "#FFFFFF";
      case "in-progress": return "#FFFFFF";
      case "closed": return "#1A1A1A";
      case "completed": return "#FFFFFF";
      case "assigned": return "#FFFFFF";
      case "scheduled": return "#FFFFFF";
      case "cancelled": return "#1A1A1A";
      default: return "#1A1A1A";
    }
  };

  const getStatusBadgeGlow = (status: string) => {
    switch (status) {
      case "open": return "rgba(30, 136, 229, 0.3)";
      case "in-progress": return "rgba(77, 182, 172, 0.3)";
      case "closed": return "rgba(158, 158, 158, 0.2)";
      case "completed": return "rgba(76, 175, 80, 0.3)";
      case "assigned": return "rgba(30, 136, 229, 0.3)";
      case "scheduled": return "rgba(30, 136, 229, 0.3)";
      case "cancelled": return "rgba(158, 158, 158, 0.2)";
      default: return "rgba(158, 158, 158, 0.2)";
    }
  };

  const getPriorityBadgeBg = (priority: Priority) => {
    switch (priority) {
      case "emergency": return "#FF4B4B";
      case "critical": return "#FF4B4B";
      case "high": return "#FF9C1A";
      case "medium": return "#D6A500";
      case "low": return "#4CAF50";
      default: return "#9E9E9E";
    }
  };

  const getPriorityBadgeText = (priority: Priority) => {
    switch (priority) {
      case "emergency": return "#FFFFFF";
      case "critical": return "#FFFFFF";
      case "high": return "#1A1A1A";
      case "medium": return "#1A1A1A";
      case "low": return "#FFFFFF";
      default: return "#1A1A1A";
    }
  };

  const getPriorityBadgeGlow = (priority: Priority) => {
    switch (priority) {
      case "emergency": return "rgba(255, 75, 75, 0.3)";
      case "critical": return "rgba(255, 75, 75, 0.3)";
      case "high": return "rgba(255, 156, 26, 0.3)";
      case "medium": return "rgba(214, 165, 0, 0.3)";
      case "low": return "rgba(76, 175, 80, 0.3)";
      default: return "rgba(158, 158, 158, 0.2)";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "emergency": return "bg-red-100 text-red-800";
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateWorkOrder = (workOrderData: Partial<WorkOrder>) => {
    let updatedWorkOrders;
    if (workOrderData.id) {
      // Update existing work order (edit mode)
      updatedWorkOrders = workOrders.map(wo =>
        wo.id === workOrderData.id ? { ...wo, ...workOrderData } as WorkOrder : wo
      );
    } else {
      // Create new work order
      const newWorkOrder: WorkOrder = {
        ...workOrderData,
        id: `WO-${Date.now()}`,
        status: 'open',
        createdDate: new Date().toISOString().split('T')[0]
      } as WorkOrder;
      updatedWorkOrders = [newWorkOrder, ...workOrders];
    }

    setWorkOrders(updatedWorkOrders);
    // Save updated work orders to local storage to persist across page refreshes
    saveToLocalStorage('workOrders', updatedWorkOrders);
  };

  const handleStartWork = (orderId: string) => {
    setWorkOrders(prev =>
      prev.map(wo =>
        wo.id === orderId
          ? { ...wo, status: 'in-progress' as const, actualHours: 0 }
          : wo
      )
    );
  };

  const handleCompleteWork = (orderId: string) => {
    setWorkOrders(prev =>
      prev.map(wo =>
        wo.id === orderId
          ? { ...wo, status: 'completed' as const, completedDate: new Date().toISOString().split('T')[0] }
          : wo
      )
    );
  };

  const handleTakePhoto = (orderId: string) => {
    console.log(`Taking photo for work order ${orderId}`);
  };

  const handleRecordVoice = (orderId: string) => {
    console.log(`Recording voice note for work order ${orderId}`);
  };

  const handleNavigate = (orderId: string) => {
    console.log(`Navigating to work order ${orderId} location`);
  };

  const handleNavigateToAnalytics = (tab: string) => {
    console.log("Navigating to analytics tab:", tab);
    setActiveTab(tab);
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkOrders(filteredWorkOrders.map(wo => wo.id));
    } else {
      setSelectedWorkOrders([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedWorkOrders(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  // Bulk actions (UI only for now)
  const handleBulkDelete = () => {
    setWorkOrders(prev => prev.filter(wo => !selectedWorkOrders.includes(wo.id)));
    setSelectedWorkOrders([]);
  };

  const handleBulkStatusUpdate = (status: WorkOrder['status']) => {
    setWorkOrders(prev =>
      prev.map(wo =>
        selectedWorkOrders.includes(wo.id) ? { ...wo, status } : wo
      )
    );
    setSelectedWorkOrders([]);
  };

  // KPI data for dashboard
  const kpiData = [
    {
      title: 'Total Work Orders',
      value: totalWorkOrders,
      icon: <Wrench className="text-primary h-5 w-5" />
    },
    {
      title: 'In Progress',
      value: inProgressOrders,
      icon: <Clock className="text-primary h-5 w-5" />
    },
    {
      title: 'Critical/High Priority',
      value: criticalHighPriority,
      icon: <AlertTriangle className="text-primary h-5 w-5" />
    },
    {
      title: 'On-Time Completion',
      value: '94%',
      icon: <CheckCircle className="text-primary h-5 w-5" />
    }
  ];

  // Mock trend data for chart
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Created',
        data: [15, 20, 25, 19, 28, 22],
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6' + '20',
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: [12, 18, 22, 17, 25, 20],
        borderColor: '#10b981',
        backgroundColor: '#10b981' + '20',
        tension: 0.4,
      }
    ],
  };

  // Use the imported WorkOrderCardCarousel component

  // Work Order Detail Drawer
  const WorkOrderDetailDrawer = () => (
    <Drawer open={showDetailDrawer} onOpenChange={setShowDetailDrawer}>
      <DrawerContent className="max-w-2xl w-full ml-auto">
        <DrawerHeader>
          <DrawerTitle>{drawerWorkOrder?.title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-2">
                <div><b>Status:</b> <Badge style={{ background: getStatusBadgeBg(drawerWorkOrder?.status || 'open'), color: getStatusBadgeText(drawerWorkOrder?.status || 'open') }}>{drawerWorkOrder?.status}</Badge></div>
                <div><b>Priority:</b> <Badge className={getPriorityColor(drawerWorkOrder?.priority || 'medium')}>{drawerWorkOrder?.priority}</Badge></div>
                <div><b>Description:</b> <div className="text-muted-foreground text-sm">{drawerWorkOrder?.description}</div></div>
                <div><b>Assigned To:</b> {Array.isArray(drawerWorkOrder?.assignedTo) ? drawerWorkOrder?.assignedTo.join(', ') : drawerWorkOrder?.assignedTo}</div>
                <div><b>Location:</b> {drawerWorkOrder?.location}</div>
                <div><b>Equipment:</b> {drawerWorkOrder?.equipmentName}</div>
                <div><b>Due Date:</b> {drawerWorkOrder?.dueDate}</div>
                <div><b>Estimated Hours:</b> {drawerWorkOrder?.estimatedHours}</div>
                <div><b>Actual Hours:</b> {drawerWorkOrder?.actualHours}</div>
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="text-muted-foreground text-sm">(History timeline coming soon...)</div>
            </TabsContent>
            <TabsContent value="comments">
              <div className="text-muted-foreground text-sm">(Comments section coming soon...)</div>
            </TabsContent>
            <TabsContent value="attachments">
              <div className="text-muted-foreground text-sm">(Attachments section coming soon...)</div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <EnhancedDashboard
            workOrders={workOrders}
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
        );

      case 'ai-creator':
        return (
          <AIWorkOrderCreator
            onSubmit={handleCreateWorkOrder}
            onClose={() => setActiveTab('dashboard')}
          />
        );

      case 'work-orders':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Work Order Management</CardTitle>
              <CardDescription>Search, filter, and manage maintenance work orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search work orders..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <BulkActionsBar />
                <WorkOrderList />
              </div>
            </CardContent>
          </Card>
        );

      case 'mobile':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Mobile Work Orders
              </CardTitle>
              <CardDescription>
                Optimized mobile interface for field technicians
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWorkOrders.slice(0, 4).map((order) => {
                  const priorityStyles = {
                    bg: getPriorityBadgeBg(order.priority),
                    text: getPriorityBadgeText(order.priority),
                    glow: getPriorityBadgeGlow(order.priority)
                  };
                  return (
                    <div key={order.id} className="border-2 rounded-lg overflow-hidden" style={{
                      borderColor: priorityStyles.bg,
                      boxShadow: `0 0 8px ${priorityStyles.glow}`
                    }}>
                      <MobileWorkOrderCard
                        workOrder={order}
                        onStartWork={handleStartWork}
                        onCompleteWork={handleCompleteWork}
                        onTakePhoto={handleTakePhoto}
                        onRecordVoice={handleRecordVoice}
                        onNavigate={handleNavigate}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 'ai-insights':
        return <AIInsightsPanel />;

      case 'analytics':
        return <WorkOrderAnalytics workOrders={workOrders} />;

      case 'advanced-stats':
        return <AdvancedStatistics workOrders={workOrders} />;

      case 'kpi-dashboard':
        console.log('Navigating to KPI Dashboard with workOrders:', workOrders.length);
        return <EnhancedKPIDashboard workOrders={workOrders} />;

      case 'reports':
        return <WorkOrderReports workOrders={workOrders} />;

      default:
        return (
          <EnhancedDashboard
            workOrders={workOrders}
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
        );
    }
  };

  // Bulk actions bar
  const BulkActionsBar = () => (
    selectedWorkOrders.length > 0 && (
      <div className="flex items-center gap-4 p-2 bg-accent rounded mb-2 border">
        <span>{selectedWorkOrders.length} selected</span>
        <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
        <Button size="sm" onClick={() => handleBulkStatusUpdate('completed')}>Mark as Completed</Button>
        <Button size="sm" onClick={() => handleBulkStatusUpdate('in-progress')}>Mark as In Progress</Button>
        <Button size="sm" onClick={() => handleBulkStatusUpdate('open')}>Mark as Open</Button>
        <Button size="sm" variant="outline" onClick={() => setSelectedWorkOrders([])}>Clear</Button>
      </div>
    )
  );

  // Responsive work order list with enhanced modern styling
  const WorkOrderList = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full border border-muted/30 rounded-xl overflow-hidden shadow-lg bg-background">
        <thead className="bg-muted/90 backdrop-blur-md">
          <tr className="border-b border-muted/40">
            <th className="p-4 w-12"><input type="checkbox" checked={selectedWorkOrders.length === filteredWorkOrders.length && filteredWorkOrders.length > 0} onChange={e => handleSelectAll(e.target.checked)} aria-label="Select all work orders" className="cursor-pointer" /></th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Title</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Description</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Assigned To</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Location</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Due Date</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Priority</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors duration-200">Status</th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-muted/30">
          {filteredWorkOrders.map((order, index) => (
            <tr key={order.id} className={`transition-all duration-300 hover:bg-muted/40 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/15'} h-24`}>
              <td className="p-4 w-12"><input type="checkbox" checked={selectedWorkOrders.includes(order.id)} onChange={e => handleSelectOne(order.id, e.target.checked)} aria-label={`Select work order ${order.title}`} className="cursor-pointer" /></td>
              <td className="p-4 font-medium text-foreground align-top">{order.title}</td>
              <td className="p-4 text-sm text-muted-foreground align-top leading-relaxed">{order.description}</td>
              <td className="p-4 text-sm text-muted-foreground align-middle">{Array.isArray(order.assignedTo) ? order.assignedTo.join(', ') : order.assignedTo}</td>
              <td className="p-4 text-sm text-muted-foreground align-middle">{order.location}</td>
              <td className="p-4 text-sm text-muted-foreground align-middle">{order.dueDate}</td>
              <td className="p-4"><Badge className={`${getPriorityColor(order.priority)} transform transition-transform hover:scale-105 shadow-sm`}>{order.priority}</Badge></td>
              <td className="p-4"><Badge style={{ background: getStatusBadgeBg(order.status), color: getStatusBadgeText(order.status), transition: 'transform 0.2s', transform: 'scale(1)' }} className="hover:scale-105 shadow-sm">{order.status}</Badge></td>
              <td className="p-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSelectedWorkOrder(order); setShowWorkOrderModal(true); }} className="hover:bg-primary/20 transition-colors duration-200 border-muted/50">Edit</Button>
                <Button size="sm" variant="outline" className="hover:bg-primary/20 transition-colors duration-200 border-muted/50">View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Work Order Management</h1>
            <p className="text-muted-foreground">AI-powered maintenance work order system with advanced analytics</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowShortcutsDialog(true)}
              className="hidden md:flex"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
              onClick={() => setShowAICreator(true)}
            >
              <Bot className="h-4 w-4" />
              AI Creator
            </Button>
            <Button className="gap-2 hover-scale" onClick={() => setShowWorkOrderModal(true)}>
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </div>
        </div>

        {/* Dashboard Section: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {kpiData.map((kpi, idx) => (
            <Card key={idx} className="flex flex-col items-start p-4 gap-2 bg-primary/10 text-primary shadow-sm">
              <div className="flex items-center gap-2">{kpi.icon}<span className="text-lg font-bold">{kpi.value}</span></div>
              <div className="text-sm text-muted-foreground">{kpi.title}</div>
            </Card>
          ))}
        </div>
        {/* Trends Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Work Order Trends</CardTitle>
            <CardDescription>Monthly created vs. completed</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedChart
              title=""
              type="line"
              data={trendData}
              height={250}
              preset="analytics"
              colorScheme="gradient"
              animation="fade"
              showControls={true}
              showLegend={true}
              interactive={true}
              exportable={true}
              refreshable={true}
            />
          </CardContent>
        </Card>
        {/* Bulk Actions Bar */}
        <BulkActionsBar />
        {/* Enhanced Work Order Card List as Carousel */}
        <WorkOrderCardCarousel
          workOrders={filteredWorkOrders}
          setWorkOrders={setWorkOrders}
          setSelectedWorkOrder={setSelectedWorkOrder}
          setShowWorkOrderModal={setShowWorkOrderModal}
          setDrawerWorkOrder={setDrawerWorkOrder}
          setShowDetailDrawer={setShowDetailDrawer}
          getPriorityBadgeBg={getPriorityBadgeBg}
          getPriorityBadgeText={getPriorityBadgeText}
          getPriorityBadgeGlow={getPriorityBadgeGlow}
          getStatusBadgeBg={getStatusBadgeBg}
          getStatusBadgeText={getStatusBadgeText}
          getStatusBadgeGlow={getStatusBadgeGlow}
        />
        {/* Work Order Detail Drawer */}
        {drawerWorkOrder && <WorkOrderDetailDrawer />}
        {/* Smart Navigation */}
        <SmartNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>

        {/* Work Order Form Modal */}
        <WorkOrderFormModal
          open={showWorkOrderModal}
          onOpenChange={setShowWorkOrderModal}
          onSubmit={handleCreateWorkOrder}
          workOrder={selectedWorkOrder}
          mode={selectedWorkOrder ? 'edit' : 'create'}
        />

        {/* AI Creator Modal */}
        {showAICreator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">AI-Powered Work Order Creation</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowAICreator(false)}>
                    Close
                  </Button>
                </div>
                <AIWorkOrderCreator
                  onSubmit={(workOrder) => {
                    handleCreateWorkOrder(workOrder);
                    setShowAICreator(false);
                  }}
                  onClose={() => setShowAICreator(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          open={showShortcutsDialog}
          onOpenChange={setShowShortcutsDialog}
          shortcuts={getShortcutList()}
        />
      </div>
    </AppLayout>
  );
};

export default WorkOrders;
