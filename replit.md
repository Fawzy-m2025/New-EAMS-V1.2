# Enterprise Asset Management System (EAMS)

## Overview

This is a comprehensive full-stack Enterprise Asset Management System built with React frontend and Express.js backend. The system provides advanced functionality for managing physical assets, equipment maintenance, financial tracking, and predictive analytics. It features a modern UI built with shadcn/ui components and implements real-time monitoring capabilities for industrial equipment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API with custom hooks
- **Routing**: React Router v6 for single-page application navigation
- **Data Fetching**: TanStack React Query for server state management
- **Charts**: Custom chart components with Chart.js integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for development server with hot reload
- **Build**: esbuild for production bundling
- **API**: RESTful API design with /api prefix routing
- **Middleware**: Custom logging and error handling middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Local Storage**: Browser localStorage for client-side data persistence
- **In-Memory Storage**: MemStorage class for development/testing

## Key Components

### Asset Management
- **Hierarchical Asset Structure**: Zone → Station → Line → System → Equipment organization
- **Equipment Registry**: Comprehensive equipment tracking with manufacturers, models, specifications
- **Asset Lifecycle Management**: Purchase, deployment, maintenance, disposal tracking
- **Condition Monitoring**: Real-time vibration, temperature, and performance monitoring
- **QR Code Integration**: Asset identification and mobile access

### Maintenance Management
- **Work Orders**: Creation, assignment, and tracking of maintenance tasks
- **Predictive Maintenance**: ML-powered failure prediction and RUL (Remaining Useful Life) calculations
- **Preventive Maintenance**: Scheduled maintenance based on time, usage, or condition
- **Spare Parts Management**: Inventory tracking for maintenance components
- **Condition Monitoring**: ISO 10816 compliant vibration analysis

### Financial Management
- **Asset Depreciation**: Multiple depreciation methods with automated calculations
- **Budget Tracking**: Expense monitoring and budget variance analysis
- **Cost Centers**: Department-based cost allocation
- **ROI Analysis**: Asset performance and return on investment metrics

### Analytics and Reporting
- **Vibration Analysis**: Advanced failure detection using 17+ failure modes
- **Health Scoring**: Equipment health assessment with trending
- **Performance Dashboards**: Real-time KPI monitoring
- **Compliance Reporting**: Regulatory compliance tracking and documentation

## Data Flow

### Frontend Data Flow
1. **User Interaction**: UI components capture user input
2. **Context Updates**: AssetContext manages global state
3. **Local Storage**: Client-side persistence for offline capability
4. **API Calls**: React Query manages server communication
5. **Real-time Updates**: Context triggers re-renders for data changes

### Backend Data Flow
1. **Request Processing**: Express middleware handles incoming requests
2. **Route Handling**: Modular route handlers process business logic
3. **Data Layer**: Storage interface abstracts database operations
4. **Response Formation**: Structured JSON responses with error handling
5. **Logging**: Request/response logging for monitoring

### Database Schema
- **Users Table**: Authentication and user management
- **Equipment Tables**: Asset registry and specifications
- **Maintenance Tables**: Work orders, schedules, and history
- **Monitoring Tables**: Condition monitoring data and alerts

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js for data visualization
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL driver
- **Validation**: Zod for runtime type validation
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development Tools**: tsx for TypeScript execution

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (configuration implied)
- **Development Server**: Vite dev server with HMR

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API server
- **Hot Reload**: Both frontend and backend support hot reloading
- **Environment Variables**: Database URL and configuration through env vars
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend Build**: Vite builds optimized React application
- **Backend Build**: esbuild creates bundled Express server
- **Static Assets**: Frontend assets served from dist/public
- **Database**: PostgreSQL database with connection pooling

### Environment Configuration
- **Database**: Requires DATABASE_URL environment variable
- **Node Environment**: NODE_ENV for development/production switching
- **Asset Paths**: Configurable paths for static asset serving

## Changelog

- July 08, 2025. Initial setup with PostgreSQL database integration
- July 08, 2025. Successfully migrated enterprise application from Lovable to Replit
- July 08, 2025. Added PostgreSQL database with Drizzle ORM, replaced MemStorage with DatabaseStorage
- July 08, 2025. Enhanced Vibration Form Analytics and Review components integrated with consistent theme system
- July 08, 2025. Complete dark mode theme integration for failure mode cards and AI assessment center components

## User Preferences

Preferred communication style: Simple, everyday language.