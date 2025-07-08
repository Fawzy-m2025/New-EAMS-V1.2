import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrderFormModal } from "@/components/maintenance/WorkOrderFormModal";
import { AIInsightsPanel } from "@/components/maintenance/AIInsightsPanel";
import { MobileWorkOrderCard } from "@/components/maintenance/MobileWorkOrderCard";
import { WorkOrderAnalytics } from "@/components/maintenance/WorkOrderAnalytics";
import { WorkOrderReports } from "@/components/maintenance/WorkOrderReports";
import { useState } from "react";
import { 
  Wrench, Clock, CheckCircle, AlertCircle, Calendar, Plus, Search, Filter,
  User, MapPin, DollarSign, Settings, Bot, Smartphone, BarChart3, Target,
  TrendingUp, Activity, Zap, Camera, Mic, Navigation, Users, FileText
} from "lucide-react";
import type { WorkOrder, Priority } from "@/types/eams";

const EnhancedWorkManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: "WO-001",
      title: "Pump Impeller Replacement",
      description: "Replace worn impeller on main circulation pump due to decreased efficiency and elevated vibration levels detected by condition monitoring",
      priority: "high",
      status: "in-progress",
      assignedTo: "John Smith",
      equipmentId: "EQ-001",
      equipmentName: "Main Centrifugal Pump P-001",
      location: "Pump House 1 - Room A",
      type: "Corrective",
      createdDate: "2024-12-01",
      dueDate: "2024-12-15",
      scheduledDate: "2024-12-10",
      estimatedHours: 8,
      actualHours: 6,
      cost: {
        labor: 480,
        parts: 350,
        external: 0,
        total: 830
      },
      procedures: [
        "Isolate pump from electrical supply and lock out",
        "Drain pump casing and connecting piping",
        "Remove coupling and impeller assembly",
        "Extract worn impeller using proper tools",
        "Install new impeller with correct torque specs",
        "Reassemble components and perform alignment check",
        "Test operation and verify performance parameters"
      ]
    },
    {
      id: "WO-002",
      title: "Generator Preventive Maintenance",
      description: "Monthly preventive maintenance including oil change, filter replacement, battery check, and comprehensive inspection per manufacturer specifications",
      priority: "medium",
      status: "assigned",
      assignedTo: "Mike Johnson",
      equipmentId: "EQ-002",
      equipmentName: "Emergency Generator G-001",
      location: "Generator Room - Building B",
      type: "Preventive",
      createdDate: "2024-12-05",
      dueDate: "2024-12-20",
      scheduledDate: "2024-12-18",
      estimatedHours: 4,
      cost: {
        labor: 320,
        parts: 150,
        external: 0,
        total: 470
      },
      procedures: [
        "Check and record oil levels and condition",
        "Replace engine oil filter and air filter",
        "Inspect and test battery condition and connections",
        "Check coolant levels and test operation",
        "Record all readings and update maintenance log"
      ]
    },
    {
      id: "WO-003",
      title: "HVAC Filter Replacement",
      description: "Quarterly filter replacement and system performance check for optimal air quality and energy efficiency",
      priority: "medium",
      status: "open",
      assignedTo: "Sarah Wilson",
      equipmentId: "EQ-004",
      equipmentName: "HVAC Unit 12",
      location: "Office Building - Roof Level",
      type: "Preventive",
      createdDate: "2024-12-08",
      dueDate: "2024-12-22",
      scheduledDate: "2024-12-20",
      estimatedHours: 2,
      cost: {
        labor: 160,
        parts: 75,
        external: 0,
        total: 235
      },
      procedures: [
        "Turn off HVAC system and lock out controls",
        "Remove and inspect old filters",
        "Install new filters with correct orientation",
        "Check system airflow and pressure readings",
        "Restart system and verify proper operation"
      ]
    },
    {
      id: "WO-004",
      title: "Emergency Valve Repair",
      description: "Critical butterfly valve showing signs of leakage - immediate repair required to prevent safety hazard and production impact",
      priority: "critical",
      status: "assigned",
      assignedTo: "Emergency Team",
      equipmentId: "EQ-003",
      equipmentName: "Butterfly Valve BV-101",
      location: "Process Area - Line 1",
      type: "Emergency",
      createdDate: "2024-12-15",
      dueDate: "2024-12-15",
      scheduledDate: "2024-12-15",
      estimatedHours: 6,
      cost: {
        labor: 600,
        parts: 200,
        external: 0,
        total: 800
      },
      procedures: [
        "Isolate valve and depressurize system",
        "Remove valve actuator and bonnet",
        "Inspect and replace damaged seals",
        "Reassemble valve with new gaskets",
        "Pressure test and return to service"
      ]
    }
  ]);

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    
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

  // Calculate efficiency metrics
  const avgCompletionTime = 6.2; // hours
  const onTimeCompletionRate = 94; // percentage
  const costVariance = 8; // percentage over budget
  const technicianUtilization = 87; // percentage

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateWorkOrder = (workOrderData: Partial<WorkOrder>) => {
    const newWorkOrder: WorkOrder = {
      ...workOrderData,
      id: workOrderData.id || `WO-${Date.now()}`,
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0]
    } as WorkOrder;
    
    setWorkOrders(prev => [newWorkOrder, ...prev]);
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
    // In a real app, this would open camera functionality
  };

  const handleRecordVoice = (orderId: string) => {
    console.log(`Recording voice note for work order ${orderId}`);
    // In a real app, this would start voice recording
  };

  const handleNavigate = (orderId: string) => {
    console.log(`Navigating to work order ${orderId} location`);
    // In a real app, this would open navigation/maps
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Advanced Work Management</h1>
            <p className="text-muted-foreground">AI-powered maintenance work order system with advanced analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
            <Button className="gap-2 hover-scale" onClick={() => setShowWorkOrderModal(true)}>
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </div>
        </div>

        {/* Enhanced KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Work Orders"
            value={totalWorkOrders.toString()}
            icon={<Wrench className="text-primary h-4 w-4" />}
            trend={{ value: 15, isPositive: true }}
            description="Active in system"
          />
          <StatCard 
            title="In Progress"
            value={inProgressOrders.toString()}
            icon={<Clock className="text-blue-600 h-4 w-4" />}
            description="Currently active"
          />
          <StatCard 
            title="Critical/High Priority"
            value={criticalHighPriority.toString()}
            icon={<AlertCircle className="text-red-600 h-4 w-4" />}
            description="Urgent attention needed"
          />
          <StatCard 
            title="On-Time Completion"
            value={`${onTimeCompletionRate}%`}
            icon={<CheckCircle className="text-green-600 h-4 w-4" />}
            trend={{ value: 5, isPositive: true }}
            description="Performance metric"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
            <TabsTrigger value="mobile">Mobile View</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Work Orders */}
              <Card className="lg:col-span-2 glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Work Orders
                  </CardTitle>
                  <CardDescription>Latest maintenance activities and priorities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{order.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.equipmentName}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {Array.isArray(order.assignedTo) ? order.assignedTo.join(', ') : order.assignedTo}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Completion Time</span>
                      <span className="font-semibold">{avgCompletionTime}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technician Utilization</span>
                      <span className="font-semibold text-green-600">{technicianUtilization}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost Variance</span>
                      <span className="font-semibold text-orange-600">+{costVariance}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Work Orders This Month</span>
                      <span className="font-semibold">{totalWorkOrders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="text-sm">AI Scheduler</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
                    <Users className="h-6 w-6 text-primary" />
                    <span className="text-sm">Team Status</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
                    <Target className="h-6 w-6 text-primary" />
                    <span className="text-sm">Optimize Schedule</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="text-sm">Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Orders Tab */}
          <TabsContent value="work-orders" className="space-y-4">
            {/* Search and Filters */}
            <Card className="glass-card">
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
                  {filteredWorkOrders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{order.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{order.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{Array.isArray(order.assignedTo) ? order.assignedTo.join(', ') : order.assignedTo}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{order.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Due: {order.dueDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Est: {order.estimatedHours}h</span>
                          </div>
                          {order.actualHours && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Actual: {order.actualHours}h</span>
                            </div>
                          )}
                          {order.cost && typeof order.cost === 'object' && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${order.cost.total}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'assigned' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStartWork(order.id)}
                              className="hover-scale"
                            >
                              Start Work
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedWorkOrder(order);
                              setShowWorkOrderModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile View Tab */}
          <TabsContent value="mobile" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Mobile Work Orders
                </CardTitle>
                <CardDescription>
                  Optimized mobile interface for field technicians with AR guidance and offline capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWorkOrders.slice(0, 4).map((order) => (
                    <MobileWorkOrderCard
                      key={order.id}
                      workOrder={order}
                      onStartWork={handleStartWork}
                      onCompleteWork={handleCompleteWork}
                      onTakePhoto={handleTakePhoto}
                      onRecordVoice={handleRecordVoice}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-4">
            <AIInsightsPanel />
          </TabsContent>

          {/* Analytics Tab - New */}
          <TabsContent value="analytics" className="space-y-4">
            <WorkOrderAnalytics workOrders={workOrders} />
          </TabsContent>

          {/* Reports Tab - New */}
          <TabsContent value="reports" className="space-y-4">
            <WorkOrderReports workOrders={workOrders} />
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Work Order Completion Rate</span>
                      <span className="font-semibold text-green-600">{onTimeCompletionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <span className="font-semibold">1.2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Technician Efficiency</span>
                      <span className="font-semibold text-blue-600">{technicianUtilization}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Equipment Uptime</span>
                      <span className="font-semibold text-green-600">98.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Labor Cost</span>
                      <span className="font-semibold">$12,840</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Parts & Materials</span>
                      <span className="font-semibold">$3,225</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>External Services</span>
                      <span className="font-semibold">$850</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-semibold">Total Monthly Cost</span>
                      <span className="font-semibold text-lg">$16,915</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Work Order Form Modal */}
        <WorkOrderFormModal
          open={showWorkOrderModal}
          onOpenChange={setShowWorkOrderModal}
          onSubmit={handleCreateWorkOrder}
          workOrder={selectedWorkOrder}
          mode={selectedWorkOrder ? 'edit' : 'create'}
        />
      </div>
    </AppLayout>
  );
};

export default EnhancedWorkManagement;
