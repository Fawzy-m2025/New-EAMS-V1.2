// Dynamic Equipment Specifications Component for Enhanced Vibration Form
// Displays detailed specifications for multiple selected equipment items

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Factory, 
    Settings, 
    MapPin, 
    Hash, 
    Calendar, 
    Wrench, 
    Gauge,
    Zap,
    Droplets,
    Thermometer,
    BarChart3,
    Info
} from 'lucide-react';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface EquipmentSpecification {
    id: string;
    name: string;
    category: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    assetTag: string;
    location: {
        zone?: string;
        station?: string;
        line?: string;
        system?: string;
        [key: string]: any;
    };
    specifications: {
        ratedPower?: number;
        operatingSpeed?: number;
        flowRate?: number;
        head?: number;
        efficiency?: number;
        voltage?: number;
        current?: number;
        frequency?: number;
        temperature?: number;
        pressure?: number;
        [key: string]: any;
    };
    installationDate?: string;
    warrantyExpiry?: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    operatingHours?: number;
    status?: string;
    condition?: string;
}

interface EquipmentSpecificationsProps {
    selectedEquipmentIds: string[];
    equipmentData: EquipmentSpecification[];
    className?: string;
}

const EquipmentSpecifications: React.FC<EquipmentSpecificationsProps> = ({
    selectedEquipmentIds,
    equipmentData,
    className = ''
}) => {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    // Filter equipment based on selected IDs
    const selectedEquipment = equipmentData.filter(eq => 
        selectedEquipmentIds.includes(eq.id)
    );

    if (selectedEquipment.length === 0) {
        return (
            <Card className={`${className} border-dashed`}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <Factory className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                        No equipment selected.<br />
                        <span className="text-sm">Select equipment to view specifications.</span>
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Get category icon
    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'pump': return <Droplets className="h-4 w-4" />;
            case 'motor': return <Zap className="h-4 w-4" />;
            case 'compressor': return <Settings className="h-4 w-4" />;
            default: return <Factory className="h-4 w-4" />;
        }
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'pump': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'motor': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'compressor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    // Format location path
    const formatLocationPath = (location: any) => {
        const parts = [];
        if (location.zone) parts.push(`Zone ${location.zone}`);
        if (location.station) parts.push(location.station);
        if (location.line) parts.push(location.line);
        if (location.system) parts.push(location.system);
        return parts.join(' → ') || 'Location not specified';
    };

    // Format specification value
    const formatSpecValue = (value: any, unit?: string) => {
        if (value === undefined || value === null || value === '') return 'N/A';
        return unit ? `${value} ${unit}` : value.toString();
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Equipment Specifications
                    <Badge variant="outline" className="ml-2">
                        {selectedEquipment.length} Selected
                    </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Detailed specifications and technical data for selected equipment
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedEquipment.map((equipment, index) => (
                    <div key={equipment.id}>
                        {index > 0 && <Separator className="my-4" />}
                        
                        {/* Equipment Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getCategoryColor(equipment.category)}`}>
                                    {getCategoryIcon(equipment.category)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{equipment.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {equipment.manufacturer} • {equipment.model}
                                    </p>
                                </div>
                            </div>
                            <Badge className={getCategoryColor(equipment.category)}>
                                {equipment.category}
                            </Badge>
                        </div>

                        {/* Equipment Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Basic Information */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                    Basic Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Asset Tag:</span>
                                        <span className="text-sm font-mono">{equipment.assetTag || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Serial:</span>
                                        <span className="text-sm font-mono">{equipment.serialNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Location:</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-5">
                                        {formatLocationPath(equipment.location)}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specifications */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                    Technical Specifications
                                </h4>
                                <div className="space-y-2">
                                    {equipment.specifications.ratedPower && (
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Rated Power:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.specifications.ratedPower, 'kW')}</span>
                                        </div>
                                    )}
                                    {equipment.specifications.operatingSpeed && (
                                        <div className="flex items-center gap-2">
                                            <Gauge className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Speed:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.specifications.operatingSpeed, 'RPM')}</span>
                                        </div>
                                    )}
                                    {equipment.specifications.flowRate && (
                                        <div className="flex items-center gap-2">
                                            <Droplets className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Flow Rate:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.specifications.flowRate, 'm³/h')}</span>
                                        </div>
                                    )}
                                    {equipment.specifications.head && (
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Head:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.specifications.head, 'm')}</span>
                                        </div>
                                    )}
                                    {equipment.specifications.efficiency && (
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Efficiency:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.specifications.efficiency, '%')}</span>
                                        </div>
                                    )}
                                    {equipment.specifications.voltage && (
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Voltage:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.specifications.voltage, 'V')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Maintenance Information */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                    Maintenance Information
                                </h4>
                                <div className="space-y-2">
                                    {equipment.installationDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Installed:</span>
                                            <span className="text-sm">{new Date(equipment.installationDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {equipment.lastMaintenanceDate && (
                                        <div className="flex items-center gap-2">
                                            <Wrench className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Last Maintenance:</span>
                                            <span className="text-sm">{new Date(equipment.lastMaintenanceDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {equipment.nextMaintenanceDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Next Maintenance:</span>
                                            <span className="text-sm">{new Date(equipment.nextMaintenanceDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {equipment.operatingHours !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <Gauge className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Operating Hours:</span>
                                            <span className="text-sm">{formatSpecValue(equipment.operatingHours, 'hrs')}</span>
                                        </div>
                                    )}
                                    {equipment.status && (
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${
                                                equipment.status === 'operational' ? 'bg-green-500' :
                                                equipment.status === 'maintenance' ? 'bg-yellow-500' :
                                                equipment.status === 'offline' ? 'bg-red-500' : 'bg-gray-500'
                                            }`} />
                                            <span className="text-xs text-muted-foreground">Status:</span>
                                            <span className="text-sm capitalize">{equipment.status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default EquipmentSpecifications;
