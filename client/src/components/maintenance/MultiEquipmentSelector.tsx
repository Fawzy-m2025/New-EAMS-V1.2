import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronRight,
    ChevronDown,
    Search,
    MapPin,
    Building,
    Layers,
    Settings,
    Table as TableIcon,
    TreePine,
    CheckCircle,
    X,
    Monitor
} from 'lucide-react';
import { allHierarchicalEquipment } from '@/data/hierarchicalAssetData';
import type { Equipment } from '@/types/eams';

interface MultiEquipmentSelectorProps {
    selectedEquipment: string[];
    onEquipmentSelect: (equipmentIds: string[]) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    className?: string;
    maxSelections?: number;
}

export function MultiEquipmentSelector({
    selectedEquipment,
    onEquipmentSelect,
    searchTerm,
    onSearchChange,
    className = "",
    maxSelections = 10
}: MultiEquipmentSelectorProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');

    // Build tree structure for hierarchical view (zone > station > line > equipment)
    const treeStructure = useMemo(() => {
        const tree: any = {};
        allHierarchicalEquipment.forEach(equipment => {
            const zone = equipment.location?.zone || 'Unknown Zone';
            const station = equipment.location?.station || 'Unknown Station';
            const line = equipment.location?.line || equipment.location?.system || 'Station Equipment';
            if (!tree[zone]) tree[zone] = {};
            if (!tree[zone][station]) tree[zone][station] = {};
            if (!tree[zone][station][line]) tree[zone][station][line] = [];
            tree[zone][station][line].push(equipment);
        });
        return tree;
    }, []);

    // Flat filtered equipment for table view
    const filteredEquipment = useMemo(() => {
        return allHierarchicalEquipment.filter(eq => {
            const matchesSearch =
                !searchTerm ||
                eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (eq.assetTag && eq.assetTag.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [searchTerm]);

    // Handle equipment selection/deselection
    const handleEquipmentToggle = (equipmentId: string) => {
        const isSelected = selectedEquipment.includes(equipmentId);
        let newSelection: string[];

        if (isSelected) {
            // Remove equipment
            newSelection = selectedEquipment.filter(id => id !== equipmentId);
        } else {
            // Add equipment (check max limit)
            if (selectedEquipment.length >= maxSelections) {
                return; // Don't add if at max limit
            }
            newSelection = [...selectedEquipment, equipmentId];
        }

        onEquipmentSelect(newSelection);
    };

    // Remove equipment from selection
    const removeEquipment = (equipmentId: string) => {
        const newSelection = selectedEquipment.filter(id => id !== equipmentId);
        onEquipmentSelect(newSelection);
    };

    // Clear all selections
    const clearAllSelections = () => {
        onEquipmentSelect([]);
    };

    // Tree node rendering (recursive)
    const renderTree = (tree: any, parentId = '', depth = 0) => {
        return Object.entries(tree).map(([nodeName, nodeValue]) => {
            const nodeId = `${parentId ? parentId + '-' : ''}${nodeName}`;
            const isExpanded = expandedNodes.has(nodeId);
            if (Array.isArray(nodeValue)) {
                // Equipment list
                return nodeValue.map((equipment: Equipment) => {
                    const isSelected = selectedEquipment.includes(equipment.id);
                    const isDisabled = !isSelected && selectedEquipment.length >= maxSelections;

                    return (
                        <div
                            key={equipment.id}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group ${isSelected
                                    ? 'bg-primary/10 border border-primary/20'
                                    : isDisabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-muted/50'
                                }`}
                            style={{ paddingLeft: `${depth * 20 + 8}px` }}
                            onClick={() => !isDisabled && handleEquipmentToggle(equipment.id)}
                        >
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className="flex-1 text-sm">
                                {equipment.name}
                                <span className="text-xs text-muted-foreground ml-2">({equipment.assetTag})</span>
                            </span>
                            <Badge variant="outline" className="text-xs">{equipment.category}</Badge>
                            {isSelected && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {isDisabled && !isSelected && (
                                <Badge variant="secondary" className="text-xs">Max Reached</Badge>
                            )}
                        </div>
                    );
                });
            } else {
                // Zone, station, or line
                return (
                    <div key={nodeId}>
                        <div
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isExpanded ? 'bg-muted/30' : 'hover:bg-muted/50'}`}
                            style={{ paddingLeft: `${depth * 20 + 8}px` }}
                            onClick={() => {
                                const newExpanded = new Set(expandedNodes);
                                if (isExpanded) newExpanded.delete(nodeId);
                                else newExpanded.add(nodeId);
                                setExpandedNodes(newExpanded);
                            }}
                        >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            {depth === 0 && <MapPin className="h-4 w-4 text-green-500" />}
                            {depth === 1 && <Building className="h-4 w-4 text-blue-500" />}
                            {depth === 2 && <Layers className="h-4 w-4 text-purple-500" />}
                            <span className="flex-1 text-sm font-medium">{nodeName}</span>
                        </div>
                        {isExpanded && (
                            <div>{renderTree(nodeValue, nodeId, depth + 1)}</div>
                        )}
                    </div>
                );
            }
        });
    };

    return (
        <Card className={`h-full ${className}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Select Equipment for Monitoring
                    {selectedEquipment.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {selectedEquipment.length} selected
                        </Badge>
                    )}
                </CardTitle>

                {/* View Mode Toggle */}
                <div className="flex gap-2 mt-2">
                    <Button
                        variant={viewMode === 'tree' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('tree')}
                        className="gap-2"
                    >
                        <TreePine className="h-4 w-4" /> Tree View
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="gap-2"
                    >
                        <TableIcon className="h-4 w-4" /> List View
                    </Button>
                </div>

                {/* Search Input and Clear Selection */}
                <div className="mt-3 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search equipment by name, manufacturer, or asset tag..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {selectedEquipment.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllSelections}
                            className="whitespace-nowrap"
                        >
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Selected Equipment Display */}
                {selectedEquipment.length > 0 && (
                    <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Selected Equipment:</span>
                            <span className="text-xs text-muted-foreground">
                                {selectedEquipment.length}/{maxSelections}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedEquipment.map(equipmentId => {
                                const equipment = allHierarchicalEquipment.find(eq => eq.id === equipmentId);
                                return equipment ? (
                                    <Badge
                                        key={equipmentId}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        <Settings className="h-3 w-3" />
                                        {equipment.name}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeEquipment(equipmentId);
                                            }}
                                            className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <div className="max-h-[calc(100vh-400px)] overflow-y-auto">

                    {viewMode === 'tree' ? (
                        <div className="p-2 space-y-1">
                            {renderTree(treeStructure)}
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredEquipment.length > 0 ? (
                                filteredEquipment.map(eq => {
                                    const isSelected = selectedEquipment.includes(eq.id);
                                    const isDisabled = !isSelected && selectedEquipment.length >= maxSelections;

                                    return (
                                        <div
                                            key={eq.id}
                                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group ${isSelected
                                                    ? 'bg-primary/10 border border-primary/20'
                                                    : isDisabled
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            onClick={() => !isDisabled && handleEquipmentToggle(eq.id)}
                                        >
                                            <Settings className="h-4 w-4 text-gray-500" />
                                            <span className="flex-1 text-sm">
                                                {eq.name}
                                                <span className="text-xs text-muted-foreground ml-2">({eq.assetTag})</span>
                                            </span>
                                            <Badge variant="outline" className="text-xs">{eq.category}</Badge>
                                            {isSelected && <CheckCircle className="h-4 w-4 text-green-500" />}
                                            {isDisabled && !isSelected && (
                                                <Badge variant="secondary" className="text-xs">Max Reached</Badge>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                    No equipment found matching your search criteria.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 