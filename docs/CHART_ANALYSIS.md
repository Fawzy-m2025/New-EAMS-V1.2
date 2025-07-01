# Chart Analysis - Toshka Financial Insight Hub

This document provides a comprehensive analysis of all charts and visualizations used throughout the project.

## Overview

The project uses **Recharts** as the primary charting library, with custom themed components and specialized chart types for different use cases. The chart system is designed to be responsive, accessible, and integrated with the theme system.

## Chart Library Architecture

### Core Chart Components

#### 1. **Base Chart Components** (`src/components/ui/chart.tsx`)
- **ChartContainer**: Wrapper component for all charts with theme integration
- **ChartTooltip**: Customizable tooltip component
- **ChartTooltipContent**: Advanced tooltip with glass morphism effects
- **ChartLegend**: Legend component with icon support
- **ChartLegendContent**: Customizable legend content

#### 2. **Theme Integration**
- Charts automatically adapt to the selected theme color
- Glass morphism effects for modern UI
- Responsive design with proper mobile optimization
- Accessibility features built-in

## Chart Types and Implementations

### 1. **Bar Charts**

#### Standard Bar Chart (`src/components/dashboard/BarChart.tsx`)
- **Usage**: General data visualization
- **Features**: 
  - Responsive design
  - Custom tooltips with glass morphism
  - Theme color integration
  - Animated data loading
- **Used in**: Project analytics, financial reports, asset reports

#### Themed Bar Chart (`src/components/dashboard/ThemedBarChart.tsx`)
- **Usage**: Theme-aware bar charts
- **Features**:
  - Automatic theme color application
  - Glass card styling
  - Enhanced tooltips
- **Used in**: Asset performance, maintenance analytics

#### Advanced Statistical Bar Charts (`src/components/maintenance/AdvancedStatisticalCharts.tsx`)
- **Usage**: Complex maintenance analytics
- **Features**:
  - Multiple chart types in one component
  - Asset utilization analysis
  - Cost analysis with stacked bars
  - Efficiency metrics comparison
- **Chart Types**: Bar, Area, Line, Pie, Radar, Scatter, Treemap

### 2. **Area Charts**

#### Standard Area Chart (`src/components/dashboard/AreaChart.tsx`)
- **Usage**: Trend visualization over time
- **Features**:
  - Gradient fills
  - Smooth animations
  - Custom tooltips
- **Used in**: Financial trends, asset performance over time

#### Themed Area Chart (`src/components/dashboard/ThemedAreaChart.tsx`)
- **Usage**: Theme-aware area charts
- **Features**:
  - Theme color gradients
  - Glass morphism tooltips
  - Responsive design
- **Used in**: Asset performance, maintenance trends

### 3. **Donut/Pie Charts**

#### Standard Donut Chart (`src/components/dashboard/DonutChart.tsx`)
- **Usage**: Proportional data visualization
- **Features**:
  - Animated data loading
  - Custom colors
  - Responsive design
- **Used in**: Asset distribution, financial breakdowns

#### Themed Donut Chart (`src/components/dashboard/ThemedDonutChart.tsx`)
- **Usage**: Theme-aware donut charts
- **Features**:
  - Theme color integration
  - Glass card styling
  - Enhanced animations
- **Used in**: Asset performance, maintenance analytics

### 4. **Line Charts**

#### Interactive Time Series Chart (`src/components/assets/InteractiveTimeSeriesChart.tsx`)
- **Usage**: Asset performance metrics over time
- **Features**:
  - Interactive metric selection
  - Time range filtering
  - Reference lines for targets
  - Brush component for zooming
  - Multiple metrics: utilization, efficiency, availability, MTBF, MTTR, OEE
- **Used in**: Asset performance monitoring

#### Work Order Trends (`src/pages/maintenance/WorkOrders.tsx`)
- **Usage**: Work order completion trends
- **Features**:
  - Simple line chart
  - Trend analysis
  - Real-time data updates

### 5. **Gauge Charts**

#### KPI Gauge Chart (`src/components/assets/KPIGaugeChart.tsx`)
- **Usage**: Single KPI visualization
- **Features**:
  - Circular progress indicator
  - Target indicators
  - Status-based color coding
  - Multiple sizes (sm, md, lg)
  - Animated progress
  - Status badges
- **Used in**: Asset performance KPIs, maintenance metrics

#### Enhanced KPI Dashboard (`src/components/maintenance/EnhancedKPIDashboard.tsx`)
- **Usage**: Comprehensive maintenance KPIs
- **Features**:
  - Multiple KPI metrics
  - ISO compliance indicators
  - Real-time updates
  - Trend analysis
  - Compliance gauges
- **Metrics**: OTCR, MTTR, Maintenance Backlog, FPY, Technician Utilization, Predictive Success Rate, Compliance Adherence

### 6. **Specialized Charts**

#### ROI Analysis Chart (`src/components/assets/ROIAnalysisChart.tsx`)
- **Usage**: Return on investment analysis
- **Features**:
  - Composed chart (bars + lines)
  - Dual Y-axes (currency + percentage)
  - Break-even line
  - Cumulative investment vs savings
  - ROI percentage tracking
- **Used in**: Asset investment analysis

#### Depreciation Chart (`src/components/assets/DepreciationChart.tsx`)
- **Usage**: Asset depreciation tracking
- **Features**:
  - Composed chart (lines + bars)
  - Multiple depreciation methods
  - Book value vs tax value
  - Market value comparison
  - Annual depreciation bars
- **Used in**: Asset depreciation analysis

#### Work Order Analytics (`src/components/maintenance/WorkOrderAnalytics.tsx`)
- **Usage**: Comprehensive work order analysis
- **Features**:
  - Advanced tooltips with glass morphism
  - Priority distribution pie charts
  - Status distribution analysis
  - Monthly trends
  - Cost analysis
- **Used in**: Maintenance analytics

## Chart Usage by Module

### 1. **Asset Management**
- **Asset Performance**: Interactive time series, themed area/bar charts, KPI gauges
- **Asset Registry**: Basic charts for asset overview
- **Asset Depreciation**: Specialized depreciation charts
- **Asset Tracking**: Performance trend charts

### 2. **Maintenance Management**
- **Work Orders**: Line charts for trends, advanced statistical charts
- **Condition Monitoring**: Gauge charts for sensor data
- **KPI Dashboard**: Comprehensive gauge and chart combinations
- **Work Order Analytics**: Multi-chart analytics dashboard

### 3. **Financial Management**
- **Financial Reports**: Area charts, bar charts, donut charts
- **ROI Analysis**: Specialized ROI charts
- **Budgeting**: Trend and comparison charts

### 4. **Analytics**
- **Asset Reports**: Multiple chart types for comprehensive analysis
- **Financial Reports**: Financial trend visualization
- **Custom Reports**: Flexible chart combinations

### 5. **Project Management**
- **Project List**: Bar charts, area charts, donut charts for project metrics

## Technical Implementation Details

### 1. **Theme Integration**
```tsx
// Example of theme integration
const { getThemeClasses } = useThemeColors();
const themeClasses = getThemeClasses();

// Applied to chart styling
style={{ 
  backgroundColor: themeClasses.cardBg,
  borderColor: themeClasses.cardBorder 
}}
```

### 2. **Responsive Design**
- All charts use `ResponsiveContainer` from Recharts
- Mobile-optimized tooltips and interactions
- Flexible height and width configurations

### 3. **Animation and Interactivity**
- Smooth data loading animations
- Hover effects with glass morphism
- Interactive tooltips with detailed information
- Zoom and pan capabilities where appropriate

### 4. **Data Handling**
- Mock data generation for development
- Real-time data updates
- Data transformation utilities
- Error handling for missing data

### 5. **Accessibility**
- ARIA labels and descriptions
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader friendly tooltips

## Chart Configuration

### 1. **Color Schemes**
- Theme-based colors for primary charts
- Semantic colors for status indicators
- Gradient fills for area charts
- Consistent color palette across all charts

### 2. **Tooltip Customization**
- Glass morphism effects
- Rich content with icons and trends
- Responsive positioning
- Custom formatting for different data types

### 3. **Legend Integration**
- Icon support for legend items
- Responsive legend positioning
- Theme-aware styling
- Interactive legend items

## Performance Considerations

### 1. **Optimization Techniques**
- Lazy loading for large datasets
- Debounced updates for real-time data
- Efficient re-rendering with React.memo
- Optimized SVG rendering

### 2. **Data Management**
- Efficient data transformation
- Caching for expensive calculations
- Pagination for large datasets
- Virtual scrolling for long lists

## Future Enhancements

### 1. **Planned Features**
- 3D chart visualizations
- Advanced filtering and drill-down capabilities
- Export functionality (PNG, PDF, CSV)
- Real-time collaboration features

### 2. **Integration Opportunities**
- AI-powered chart recommendations
- Automated insights generation
- Predictive analytics visualization
- Mobile-specific chart optimizations

## Best Practices

### 1. **Chart Selection**
- Use bar charts for categorical comparisons
- Use line charts for time series data
- Use area charts for cumulative data
- Use pie/donut charts for proportional data
- Use gauge charts for single KPI metrics

### 2. **Data Visualization**
- Maintain consistent color schemes
- Provide clear labels and titles
- Include appropriate legends
- Use meaningful scales and axes
- Consider accessibility requirements

### 3. **Performance**
- Optimize data transformations
- Use appropriate chart types for data size
- Implement proper loading states
- Handle edge cases and errors gracefully

## Conclusion

The chart system in the Toshka Financial Insight Hub is comprehensive, well-architected, and provides excellent user experience. The integration with the theme system, responsive design, and accessibility features make it suitable for enterprise-level financial applications. The variety of chart types and specialized components ensure that all data visualization needs are met effectively. 