import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssetProvider } from "./contexts/AssetContext";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import Financial from "./pages/Financial";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";

// Asset Management Pages
import EnhancedAssetRegistry from "./pages/assets/EnhancedAssetRegistry";
import AssetTracking from "./pages/assets/AssetTracking";
import AssetDepreciation from "./pages/assets/AssetDepreciation";
import AssetPerformance from "./pages/assets/AssetPerformance";

// Maintenance Pages
import WorkOrders from "./pages/maintenance/WorkOrders";
import ConditionMonitoring from "./pages/maintenance/ConditionMonitoring";
import PreventiveMaintenance from "./pages/maintenance/PreventiveMaintenance";
import PredictiveMaintenance from "./pages/maintenance/PredictiveMaintenance";
import SpareParts from "./pages/maintenance/SpareParts";

// Financial Pages
import GeneralLedger from "./pages/financial/GeneralLedger";
import AccountsPayable from "./pages/financial/AccountsPayable";
import AccountsReceivable from "./pages/financial/AccountsReceivable";
import Budgeting from "./pages/financial/Budgeting";

// HR Pages
import Employees from "./pages/hr/Employees";
import Payroll from "./pages/hr/Payroll";
import Attendance from "./pages/hr/Attendance";
import Performance from "./pages/hr/Performance";
import Training from "./pages/hr/Training";

// Inventory Pages
import StockManagement from "./pages/inventory/StockManagement";
import Procurement from "./pages/inventory/Procurement";
import Warehouses from "./pages/inventory/Warehouses";
import Suppliers from "./pages/inventory/Suppliers";

// Project Pages
import ProjectList from "./pages/projects/ProjectList";
import ProjectPlanning from "./pages/projects/ProjectPlanning";
import ProjectResources from "./pages/projects/ProjectResources";
import ProjectTimeline from "./pages/projects/ProjectTimeline";

// Fleet Pages
import Vehicles from "./pages/fleet/Vehicles";
import FleetMaintenance from "./pages/fleet/FleetMaintenance";
import FuelManagement from "./pages/fleet/FuelManagement";
import DriverManagement from "./pages/fleet/DriverManagement";

// HSE Pages
import Incidents from "./pages/hse/Incidents";
import SafetyAudits from "./pages/hse/SafetyAudits";
import Compliance from "./pages/hse/Compliance";
import HSETraining from "./pages/hse/HSETraining";

// Engineering Pages
import Mechanical from "./pages/engineering/Mechanical";
import Electrical from "./pages/engineering/Electrical";
import Civil from "./pages/engineering/Civil";
import Instrumentation from "./pages/engineering/Instrumentation";

// Analytics Pages
import AnalyticsDashboards from "./pages/analytics/AnalyticsDashboards";
import FinancialReports from "./pages/analytics/FinancialReports";
import AssetReports from "./pages/analytics/AssetReports";
import CustomReports from "./pages/analytics/CustomReports";
import KPIDashboard from "./pages/analytics/KPIDashboard";

// Demo Pages
import { ChartJSDemo } from "./components/examples/ChartJSDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AssetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/financial" element={<Financial />} />

              {/* Demo Routes */}
              <Route path="/demo/charts" element={<ChartJSDemo />} />

              {/* Asset Management Routes */}
              <Route path="/assets/registry" element={<EnhancedAssetRegistry />} />
              <Route path="/assets/tracking" element={<AssetTracking />} />
              <Route path="/assets/depreciation" element={<AssetDepreciation />} />
              <Route path="/assets/performance" element={<AssetPerformance />} />

              {/* Maintenance Routes */}
              <Route path="/maintenance/work-orders" element={<WorkOrders />} />
              <Route path="/maintenance/condition-monitoring" element={<ConditionMonitoring />} />
              <Route path="/maintenance/preventive" element={<PreventiveMaintenance />} />
              <Route path="/maintenance/predictive" element={<PredictiveMaintenance />} />
              <Route path="/maintenance/spare-parts" element={<SpareParts />} />

              {/* Financial Routes */}
              <Route path="/financial/gl" element={<GeneralLedger />} />
              <Route path="/financial/ap" element={<AccountsPayable />} />
              <Route path="/financial/ar" element={<AccountsReceivable />} />
              <Route path="/financial/budgeting" element={<Budgeting />} />

              {/* HR Routes */}
              <Route path="/hr/employees" element={<Employees />} />
              <Route path="/hr/payroll" element={<Payroll />} />
              <Route path="/hr/attendance" element={<Attendance />} />
              <Route path="/hr/performance" element={<Performance />} />
              <Route path="/hr/training" element={<Training />} />

              {/* Inventory Routes */}
              <Route path="/inventory/stock" element={<StockManagement />} />
              <Route path="/inventory/procurement" element={<Procurement />} />
              <Route path="/inventory/warehouses" element={<Warehouses />} />
              <Route path="/inventory/suppliers" element={<Suppliers />} />

              {/* Project Routes */}
              <Route path="/projects/list" element={<ProjectList />} />
              <Route path="/projects/planning" element={<ProjectPlanning />} />
              <Route path="/projects/resources" element={<ProjectResources />} />
              <Route path="/projects/timeline" element={<ProjectTimeline />} />

              {/* Fleet Routes */}
              <Route path="/fleet/vehicles" element={<Vehicles />} />
              <Route path="/fleet/maintenance" element={<FleetMaintenance />} />
              <Route path="/fleet/fuel" element={<FuelManagement />} />
              <Route path="/fleet/drivers" element={<DriverManagement />} />

              {/* HSE Routes */}
              <Route path="/hse/incidents" element={<Incidents />} />
              <Route path="/hse/audits" element={<SafetyAudits />} />
              <Route path="/hse/compliance" element={<Compliance />} />
              <Route path="/hse/training" element={<HSETraining />} />

              {/* Engineering Routes */}
              <Route path="/engineering/mechanical" element={<Mechanical />} />
              <Route path="/engineering/electrical" element={<Electrical />} />
              <Route path="/engineering/civil" element={<Civil />} />
              <Route path="/engineering/instrumentation" element={<Instrumentation />} />

              {/* Analytics Routes */}
              <Route path="/analytics/dashboards" element={<AnalyticsDashboards />} />
              <Route path="/analytics/kpi-dashboard" element={<KPIDashboard />} />
              <Route path="/analytics/financial" element={<FinancialReports />} />
              <Route path="/analytics/assets" element={<AssetReports />} />
              <Route path="/analytics/custom-reports" element={<CustomReports />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AssetProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
