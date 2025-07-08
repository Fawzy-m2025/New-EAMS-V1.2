// Multi-Equipment Specifications Display Component
// Dynamically shows specifications for all selected equipment items

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Cpu, 
    Zap, 
    Settings, 
    MapPin, 
    Hash, 
    Calendar, 
    Wrench,
    Gauge,
    Thermometer,
    Activity,
    Info
} from 'lucide-react';
import { allHierarchicalEquipment } from '@/data/hierarchicalAssetData';

interface MultiEquipmentSpecificationsProps {
    selectedEquipmentIds: string[];
    className?: string;
}

interface EquipmentSpecification {
    id: string;
    name: string;
    category: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    assetTag?: string;
    locationPath: string;
    zone: string;
    station: string;
    line?: string;
    specifications: Record<string, any>;
    status: string;
    condition: string;
    installationDate?: string;
    lastMaintenance?: string;
}

const CATEGORY_ICONS = {
    pump: Cpu,
    motor: Zap,
    compressor: Settings,
    valve: Wrench,
    strainer: Activity,
    tank: Gauge,
    default: Info
};

const CATEGORY_COLORS = {
    pump: 'bg-blue-500',
    motor: 'bg-green-500',
    compressor: 'bg-purple-500',
    valve: 'bg-orange-500',
    strainer: 'bg-cyan-500',
    tank: 'bg-indigo-500',
    default: 'bg-gray-500'
};

export function MultiEquipmentSpecifications({ selectedEquipmentIds, className = '' }: MultiEquipmentSpecificationsProps) {
    // Memoized equipment specifications to optimize performance
    const equipmentSpecifications = useMemo(() => {
        return selectedEquipmentIds.map(equipmentId => {
            const equipment = allHierarchicalEquipment.find(eq => eq.id === equipmentId);
            if (!equipment) return null;

            // Build location path
            const locationPath = [equipment.zone, equipment.station, equipment.line, equipment.name]
                .filter(Boolean)
                .join(' → ');

            // Extract specifications based on equipment type
            const specifications: Record<string, any> = {};
            
            // Common specifications
            if (equipment.manufacturer) specifications['Manufacturer'] = equipment.manufacturer;
            if (equipment.model) specifications['Model'] = equipment.model;
            if (equipment.serialNumber) specifications['Serial Number'] = equipment.serialNumber;
            if (equipment.assetTag) specifications['Asset Tag'] = equipment.assetTag;
            if (equipment.power) specifications['Power'] = `${equipment.power} kW`;
            if (equipment.voltage) specifications['Voltage'] = `${equipment.voltage} V`;
            if (equipment.current) specifications['Current'] = `${equipment.current} A`;
            if (equipment.frequency) specifications['Frequency'] = `${equipment.frequency} Hz`;
            if (equipment.speed) specifications['Speed'] = `${equipment.speed} RPM`;
            
            // Pump-specific specifications
            if (equipment.category === 'pump') {
                if (equipment.flowRate) specifications['Flow Rate'] = `${equipment.flowRate} m³/h`;
                if (equipment.head) specifications['Head'] = `${equipment.head} m`;
                if (equipment.efficiency) specifications['Efficiency'] = `${equipment.efficiency}%`;
                if (equipment.suctionSize) specifications['Suction Size'] = equipment.suctionSize;
                if (equipment.dischargeSize) specifications['Discharge Size'] = equipment.dischargeSize;
                if (equipment.impellerDiameter) specifications['Impeller Diameter'] = `${equipment.impellerDiameter} mm`;
            }
            
            // Motor-specific specifications
            if (equipment.category === 'motor') {
                if (equipment.poles) specifications['Poles'] = equipment.poles;
                if (equipment.frame) specifications['Frame'] = equipment.frame;
                if (equipment.enclosure) specifications['Enclosure'] = equipment.enclosure;
                if (equipment.insulation) specifications['Insulation Class'] = equipment.insulation;
                if (equipment.bearingDE) specifications['Bearing DE'] = equipment.bearingDE;
                if (equipment.bearingNDE) specifications['Bearing NDE'] = equipment.bearingNDE;
            }
            
            // Valve-specific specifications
            if (equipment.category === 'valve') {
                if (equipment.dn) specifications['DN (Diameter Nominal)'] = `DN ${equipment.dn}`;
                if (equipment.pn) specifications['PN (Pressure Nominal)'] = `PN ${equipment.pn}`;
                if (equipment.material) specifications['Material'] = equipment.material;
                if (equipment.connection) specifications['Connection'] = equipment.connection;
                if (equipment.operation) specifications['Operation'] = equipment.operation;
            }
            
            // Compressor-specific specifications
            if (equipment.category === 'compressor') {
                if (equipment.capacity) specifications['Capacity'] = `${equipment.capacity} m³`;
                if (equipment.pressure) specifications['Pressure'] = `${equipment.pressure} bar`;
                if (equipment.displacement) specifications['Displacement'] = `${equipment.displacement} m³/min`;
                if (equipment.stages) specifications['Stages'] = equipment.stages;
            }

            return {
                id: equipment.id,
                name: equipment.name,
                category: equipment.category,
                manufacturer: equipment.manufacturer,
                model: equipment.model,
                serialNumber: equipment.serialNumber,
                assetTag: equipment.assetTag,
                locationPath,
                zone: equipment.zone,
                station: equipment.station,
                line: equipment.line,
                specifications,
                status: equipment.status || 'operational',
                condition: equipment.condition || 'good',
                installationDate: equipment.installationDate,
                lastMaintenance: equipment.lastMaintenance
            } as EquipmentSpecification;
        }).filter(Boolean) as EquipmentSpecification[];
    }, [selectedEquipmentIds]);

    if (selectedEquipmentIds.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Equipment Specifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select equipment to view specifications</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Equipment Specifications ({equipmentSpecifications.length} selected)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {equipmentSpecifications.map((equipment, index) => {
                    const IconComponent = CATEGORY_ICONS[equipment.category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
                    const categoryColor = CATEGORY_COLORS[equipment.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default;
                    
                    return (
                        <div key={equipment.id}>
                            {index > 0 && <Separator className="my-4" />}
                            
                            {/* Equipment Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${categoryColor} text-white`}>
                                        <IconComponent className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{equipment.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {equipment.category.toUpperCase()}
                                            </Badge>
                                            <Badge 
                                                variant={equipment.status === 'operational' ? 'default' : 'destructive'}
                                                className="text-xs"
                                            >
                                                {equipment.status}
                                            </Badge>
                                            <Badge 
                                                variant={equipment.condition === 'good' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {equipment.condition}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Path */}
                            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{equipment.locationPath}</span>
                            </div>

                            {/* Specifications Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(equipment.specifications).map(([key, value]) => (
                                    <div key={key} className="bg-muted/30 p-2 rounded text-xs">
                                        <div className="font-medium text-muted-foreground mb-1">{key}</div>
                                        <div className="font-mono">{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Information */}
                            {(equipment.installationDate || equipment.lastMaintenance) && (
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    {equipment.installationDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Installed: {equipment.installationDate}</span>
                                        </div>
                                    )}
                                    {equipment.lastMaintenance && (
                                        <div className="flex items-center gap-1">
                                            <Wrench className="h-3 w-3" />
                                            <span>Last Maintenance: {equipment.lastMaintenance}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default MultiEquipmentSpecifications;
