# New-EAMS-V1.2 Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Complete Feature Analysis](#complete-feature-analysis)
5. [Technical Documentation](#technical-documentation)
6. [Database Schema](#database-schema)
7. [Installation and Setup](#installation-and-setup)
8. [Usage Documentation](#usage-documentation)
9. [API Documentation](#api-documentation)
10. [Development Guidelines](#development-guidelines)

## Project Overview

### Project Name
**New-EAMS-V1.2** (Enhanced Enterprise Asset Management System - Version 1.2)

### Purpose and Description
New-EAMS-V1.2 is a comprehensive enterprise asset management system designed for industrial operations, specifically tailored for pump stations and critical infrastructure management. The system provides real-time monitoring, predictive maintenance, financial tracking, and comprehensive analytics for enterprise-level asset management.

**Key Objectives:**
- Centralized asset lifecycle management
- Predictive maintenance using AI/ML algorithms
- Real-time condition monitoring with ISO 10816 compliance
- Financial tracking and ROI analysis
- Comprehensive reporting and analytics
- Mobile-first design for field operations

### Target Users and Use Cases

**Primary Users:**
- **Maintenance Technicians**: Field workers managing equipment maintenance and repairs
- **Operations Managers**: Supervisors overseeing daily operations and resource allocation
- **Financial Controllers**: Personnel managing budgets, costs, and financial reporting
- **Asset Managers**: Specialists responsible for asset lifecycle and performance optimization
- **Safety Officers**: Personnel ensuring compliance and safety standards
- **Executive Management**: Leadership requiring high-level dashboards and KPIs

**Key Use Cases:**
- Preventive and predictive maintenance scheduling
- Real-time vibration analysis and condition monitoring
- Work order management and tracking
- Asset depreciation and financial reporting
- Compliance monitoring and safety management
- Resource planning and optimization
- Performance analytics and KPI tracking

## Technology Stack

### Frontend Technologies
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1 with SWC plugin
- **UI Framework**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS 3.4.11 with custom animations
- **State Management**: React Context API with custom hooks
- **Routing**: React Router DOM 6.26.2
- **Data Fetching**: TanStack Query 5.56.2
- **Charts**: Chart.js 4.5.0 with React Chart.js 2
- **3D Graphics**: Three.js 0.177.0 with React Three Fiber
- **Animations**: Framer Motion 12.19.0 and GSAP 3.13.0
- **Form Handling**: React Hook Form 7.53.0 with Zod validation

### Backend Technologies
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM with Drizzle Kit
- **Authentication**: Passport.js with local strategy
- **Session Management**: Express Session with PostgreSQL store
- **API Architecture**: RESTful APIs with Express middleware

### Development Tools
- **Language**: TypeScript 5.5.3
- **Linting**: ESLint 9.9.0 with React hooks plugin
- **Testing**: Vitest 3.2.4 with Testing Library
- **Package Manager**: npm with package-lock.json
- **Environment**: Cross-platform with cross-env

### Key Dependencies
- **UI Components**: 40+ Radix UI components for accessibility
- **Icons**: Lucide React 0.462.0 (comprehensive icon library)
- **Date Handling**: date-fns 3.6.0
- **Notifications**: Sonner 1.5.0 for toast notifications
- **Theming**: next-themes 0.3.0 for dark/light mode
- **Utilities**: clsx, tailwind-merge for conditional styling

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Express API   │    │   PostgreSQL    │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (Neon DB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Static Files  │              │
                        │   (Vite Build)  │              │
                        └─────────────────┘              │
                                 │                       │
                        ┌─────────────────┐              │
                        │   ML Services   │              │
                        │   (Python)      │◄─────────────┘
                        └─────────────────┘
```

### Component Architecture
- **Presentation Layer**: React components with TypeScript
- **Business Logic Layer**: Custom hooks and context providers
- **Data Access Layer**: Drizzle ORM with PostgreSQL
- **API Layer**: Express.js RESTful endpoints
- **Authentication Layer**: Passport.js with session management
- **ML/Analytics Layer**: Python services for predictive analytics

### Data Flow
1. **User Interaction**: React components handle user inputs
2. **State Management**: Context providers manage application state
3. **API Communication**: TanStack Query handles server communication
4. **Data Processing**: Express middleware processes requests
5. **Database Operations**: Drizzle ORM executes database queries
6. **Response Handling**: Structured JSON responses with error handling

## Complete Feature Analysis

### 1. Asset Management Module

#### Enhanced Asset Registry
- **Comprehensive Asset Tracking**: Complete lifecycle management from acquisition to disposal
- **Multi-level Categorization**: Hierarchical organization by zones, stations, lines, and systems
- **Advanced Search and Filtering**: Real-time search with multiple filter criteria
- **QR Code Integration**: Automated asset identification and tracking
- **Depreciation Management**: Multiple depreciation methods with automated calculations
- **Compliance Tracking**: FDA, CE, ISO compliance monitoring
- **Insurance Management**: Policy tracking and claims history

#### Asset Performance Monitoring
- **Real-time KPIs**: Utilization rates, efficiency scores, uptime percentages
- **Performance Analytics**: Trend analysis and predictive insights
- **Cost Tracking**: Maintenance costs, operational expenses, ROI analysis
- **Environmental Impact**: Carbon footprint and sustainability metrics
- **Safety Classification**: Risk assessment and safety compliance

### 2. Maintenance Management Module

#### Work Order Management
- **Comprehensive Work Order System**: Creation, assignment, tracking, and completion
- **Mobile-Optimized Interface**: Field technician tools with offline capabilities
- **Priority-Based Scheduling**: Critical, high, medium, low priority classification
- **Resource Management**: Technician assignment and skill matching
- **Cost Tracking**: Labor, parts, and external service cost management
- **Photo and Voice Documentation**: Multimedia work order documentation

#### Condition Monitoring
- **ISO 10816 Compliant Vibration Analysis**: Professional vibration monitoring standards
- **AI-Enhanced Assessment**: Machine learning-powered condition assessment
- **Real-time Alerts**: Automated threshold-based alerting system
- **Trend Analysis**: Historical data analysis and pattern recognition
- **Predictive Insights**: Failure prediction and maintenance recommendations

#### Enhanced Vibration Analysis
- **Multi-Point Measurement**: Comprehensive vibration data collection
- **Frequency Analysis**: FFT analysis and spectral monitoring
- **Bearing Condition Assessment**: Specialized bearing health monitoring
- **Temperature Correlation**: Combined vibration and thermal analysis
- **Automated Reporting**: Professional vibration analysis reports

#### Predictive Maintenance
- **ML-Powered Predictions**: Advanced machine learning algorithms
- **Remaining Useful Life (RUL)**: Equipment lifespan predictions
- **Failure Mode Analysis**: RCFA and PFMEA integration
- **Maintenance Optimization**: Cost-effective maintenance scheduling
- **Risk Assessment**: Equipment risk scoring and prioritization

### 3. Financial Management Module

#### Comprehensive Financial Tracking
- **Multi-Currency Support**: Global financial operations
- **Budget Management**: Department-wise budget allocation and tracking
- **Expense Categorization**: Detailed expense breakdown and analysis
- **Revenue Tracking**: Multiple revenue stream monitoring
- **Cost Center Management**: Department-based cost allocation

#### Financial Reporting
- **Real-time Dashboards**: Live financial KPIs and metrics
- **Automated Reports**: Scheduled financial report generation
- **Variance Analysis**: Budget vs. actual performance tracking
- **ROI Calculations**: Asset return on investment analysis
- **Depreciation Schedules**: Automated depreciation calculations

### 4. Analytics and Reporting Module

#### Advanced Analytics Dashboard
- **Real-time KPIs**: Live performance indicators across all modules
- **Predictive Analytics**: ML-powered insights and forecasting
- **Custom Dashboards**: User-configurable dashboard layouts
- **Interactive Charts**: Dynamic data visualization with drill-down capabilities
- **Export Capabilities**: PDF, Excel, and CSV export options

#### Comprehensive Reporting
- **Automated Report Generation**: Scheduled report delivery
- **Custom Report Builder**: User-defined report creation
- **Multi-format Output**: PDF, Excel, Word, and web formats
- **Data Visualization**: Charts, graphs, and infographics
- **Historical Analysis**: Trend analysis and comparative reporting

### 5. Human Resources Module

#### Employee Management
- **Comprehensive Employee Profiles**: Complete personnel information management
- **Skill Tracking**: Competency and certification management
- **Performance Management**: Employee evaluation and development tracking
- **Training Management**: Training program administration and tracking
- **Attendance Monitoring**: Time and attendance tracking system

### 6. Inventory Management Module

#### Stock Management
- **Real-time Inventory Tracking**: Live stock level monitoring
- **Automated Reordering**: Intelligent stock replenishment
- **Supplier Management**: Vendor relationship and performance tracking
- **Warehouse Management**: Multi-location inventory control
- **Parts Integration**: Maintenance parts inventory integration

### 7. Project Management Module

#### Project Lifecycle Management
- **Project Planning**: Comprehensive project planning tools
- **Resource Allocation**: Personnel and equipment resource management
- **Timeline Management**: Gantt charts and milestone tracking
- **Budget Tracking**: Project financial management
- **Progress Monitoring**: Real-time project status updates

### 8. Fleet Management Module

#### Vehicle Management
- **Fleet Tracking**: Comprehensive vehicle management
- **Maintenance Scheduling**: Vehicle maintenance planning
- **Fuel Management**: Fuel consumption tracking and optimization
- **Driver Management**: Driver assignment and performance tracking
- **Route Optimization**: Efficient route planning and tracking

### 9. Health, Safety & Environment (HSE) Module

#### Safety Management
- **Incident Tracking**: Comprehensive incident management system
- **Safety Audits**: Audit planning and execution
- **Compliance Monitoring**: Regulatory compliance tracking
- **Training Management**: Safety training program administration
- **Risk Assessment**: Safety risk evaluation and mitigation

### 10. Engineering Module

#### Multi-Discipline Engineering
- **Mechanical Engineering**: Mechanical system management
- **Electrical Engineering**: Electrical system monitoring
- **Civil Engineering**: Infrastructure management
- **Instrumentation**: Control system management
- **Technical Documentation**: Engineering document management

## Technical Documentation

### Frontend Component Structure

#### Core Layout Components
- **AppLayout**: Main application wrapper with responsive design
- **Sidebar**: Collapsible navigation with hierarchical menu structure
- **Navbar**: Top navigation bar with user controls and notifications
- **BottomNav**: Mobile-optimized bottom navigation

#### Dashboard Components
- **StatCard**: Reusable KPI display component with trend indicators
- **EnhancedChart**: Advanced charting component with multiple visualization types
- **CinematicKPICarousel**: Animated KPI display with auto-rotation
- **NotificationSystem**: Real-time notification management

#### Maintenance Components
- **EnhancedVibrationForm**: ISO 10816 compliant vibration analysis interface
- **ConditionMonitoring**: Real-time equipment condition dashboard
- **WorkOrderManagement**: Comprehensive work order interface
- **PredictiveAnalytics**: ML-powered maintenance predictions
- **AdvancedMLPipelines**: Machine learning pipeline management

#### Asset Components
- **AssetRegistry**: Comprehensive asset management interface
- **AssetTracking**: Real-time asset location and status tracking
- **AssetPerformance**: Performance analytics and reporting
- **DepreciationCalculator**: Automated depreciation calculations

#### Financial Components
- **FinancialDashboard**: Real-time financial KPIs and metrics
- **BudgetTracker**: Budget management and variance analysis
- **ExpenseAnalyzer**: Detailed expense categorization and analysis
- **ROICalculator**: Return on investment analysis tools

### Backend Services Architecture

#### Core Services
- **Express Server**: Main application server with middleware stack
- **Authentication Service**: Passport.js-based user authentication
- **Session Management**: PostgreSQL-backed session storage
- **Database Service**: Drizzle ORM with connection pooling

#### API Structure
- **RESTful Endpoints**: Standardized API design patterns
- **Middleware Stack**: Request logging, error handling, CORS
- **Data Validation**: Zod schema validation for all inputs
- **Error Handling**: Centralized error management system

#### ML Services
- **Python Integration**: Machine learning service integration
- **Predictive Models**: Equipment failure prediction algorithms
- **Data Processing**: Real-time data analysis and processing
- **Background Tasks**: Automated maintenance scheduling

### Key Dependencies and Libraries

#### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "typescript": "^5.5.3",
  "vite": "^5.4.1",
  "tailwindcss": "^3.4.11",
  "@radix-ui/react-*": "Latest versions",
  "chart.js": "^4.5.0",
  "framer-motion": "^12.19.0",
  "three": "^0.177.0",
  "@tanstack/react-query": "^5.56.2"
}
```

#### Backend Dependencies
```json
{
  "express": "Latest",
  "drizzle-orm": "Latest",
  "@neondatabase/serverless": "Latest",
  "passport": "Latest",
  "express-session": "Latest"
}
```

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

### Data Models

#### Asset Interface
```typescript
interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: AssetLocation;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  // ... additional 40+ properties
}
```

#### Work Order Interface
```typescript
interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedTo: string | string[];
  equipmentId: string;
  createdDate: string;
  dueDate: string;
  estimatedHours: number;
  cost?: WorkOrderCost;
}
```

#### Vibration Data Interface
```typescript
interface VibrationData {
  equipmentId: string;
  measurementDate: string;
  overallVibration: number;
  frequency: number;
  amplitude: number;
  phase: number;
  temperature: number;
  isoZone: 'A' | 'B' | 'C' | 'D';
  condition: ConditionLevel;
}
```

## Installation and Setup

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **PostgreSQL**: Version 13.0 or higher (or Neon serverless)
- **Git**: For version control

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: 2GB free disk space
- **Network**: Internet connection for dependencies and database

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Fawzy-m2025/New-EAMS-V1.2.git
cd New-EAMS-V1.2
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
SESSION_SECRET=your_session_secret
```

#### 4. Database Setup
```bash
# Generate database migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

#### 5. Development Server
```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Deployment

#### Build for Production
```bash
npm run build
```

#### Environment Variables
```env
DATABASE_URL=production_database_url
NODE_ENV=production
SESSION_SECRET=secure_session_secret
```

## Usage Documentation

### User Roles and Permissions

#### Administrator
- Full system access and configuration
- User management and role assignment
- System settings and maintenance
- Advanced analytics and reporting

#### Operations Manager
- Asset and maintenance management
- Work order oversight and approval
- Performance monitoring and reporting
- Resource allocation and planning

#### Maintenance Technician
- Work order execution and updates
- Equipment condition monitoring
- Maintenance documentation
- Mobile interface access

#### Financial Controller
- Financial data access and reporting
- Budget management and analysis
- Cost tracking and optimization
- ROI analysis and forecasting

### Key Workflows

#### Asset Registration Workflow
1. Navigate to Assets → Registry
2. Click "Add New Asset"
3. Complete asset information form
4. Upload supporting documents
5. Generate QR code for tracking
6. Assign to location and user

#### Work Order Creation Workflow
1. Navigate to Maintenance → Work Orders
2. Click "Create Work Order"
3. Select equipment and define scope
4. Assign priority and technician
5. Set schedule and estimated hours
6. Submit for approval and execution

#### Condition Monitoring Workflow
1. Navigate to Maintenance → Condition Monitoring
2. Select equipment for analysis
3. Enter vibration measurements
4. Review AI-generated assessment
5. Generate maintenance recommendations
6. Create work orders if required

### Navigation Guide

#### Main Dashboard
- **Quick Actions**: Frequently used operations
- **KPI Cards**: Real-time performance metrics
- **Charts**: Visual data representation
- **Alerts**: System notifications and warnings

#### Module Navigation
- **Sidebar Menu**: Hierarchical module organization
- **Breadcrumbs**: Current location tracking
- **Search**: Global search functionality
- **Filters**: Data filtering and sorting options

## API Documentation

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### Asset Management Endpoints
```
GET /api/assets
POST /api/assets
PUT /api/assets/:id
DELETE /api/assets/:id
GET /api/assets/:id/history
```

### Work Order Endpoints
```
GET /api/work-orders
POST /api/work-orders
PUT /api/work-orders/:id
DELETE /api/work-orders/:id
GET /api/work-orders/analytics
```

### Condition Monitoring Endpoints
```
GET /api/condition-monitoring
POST /api/condition-monitoring/vibration
GET /api/condition-monitoring/analysis
POST /api/condition-monitoring/alerts
```

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Enforced code quality rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Critical user workflow testing
- **Performance Tests**: Load and stress testing

### Deployment Process
1. **Development**: Feature development and testing
2. **Staging**: Integration testing and validation
3. **Production**: Deployment and monitoring
4. **Monitoring**: Performance and error tracking

---

**Project Repository**: https://github.com/Fawzy-m2025/New-EAMS-V1.2
**Documentation Version**: 1.2.0
**Last Updated**: December 2024
