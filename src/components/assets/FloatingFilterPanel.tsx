
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import type { EquipmentType, EquipmentCategory, EquipmentStatus, ConditionStatus, EAMSFilter } from "@/types/eams";
import { assetCategories, assetManufacturers, pumpStations } from "@/data/enhancedAssetData";

interface FloatingFilterPanelProps {
  filters: EAMSFilter;
  onFiltersChange: (filters: EAMSFilter) => void;
  children: React.ReactNode;
}

export function FloatingFilterPanel({ filters, onFiltersChange, children }: FloatingFilterPanelProps) {
  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value
  ).length;

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      equipmentTypes: [],
      categories: [],
      status: [],
      conditions: [],
      locations: [],
      manufacturers: []
    });
  };

  const handleEquipmentTypeToggle = (type: EquipmentType) => {
    const current = filters.equipmentTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, equipmentTypes: updated });
  };

  const handleCategoryToggle = (category: EquipmentCategory) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, categories: updated });
  };

  const handleStatusToggle = (status: EquipmentStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated });
  };

  const handleConditionToggle = (condition: ConditionStatus) => {
    const current = filters.conditions || [];
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    onFiltersChange({ ...filters, conditions: updated });
  };

  const handleLocationToggle = (location: string) => {
    const current = filters.locations || [];
    const updated = current.includes(location)
      ? current.filter(l => l !== location)
      : [...current, location];
    onFiltersChange({ ...filters, locations: updated });
  };

  const handleManufacturerToggle = (manufacturer: string) => {
    const current = filters.manufacturers || [];
    const updated = current.includes(manufacturer)
      ? current.filter(m => m !== manufacturer)
      : [...current, manufacturer];
    onFiltersChange({ ...filters, manufacturers: updated });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start" side="bottom">
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <h3 className="font-semibold">Filter Assets</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2 text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Clear All
            </Button>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search assets, models, tags..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Equipment Types */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Equipment Types</label>
            <div className="grid grid-cols-1 gap-2">
              {(['mechanical', 'electrical', 'instrumentation'] as EquipmentType[]).map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.equipmentTypes?.includes(type) || false}
                    onCheckedChange={() => handleEquipmentTypeToggle(type)}
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {assetCategories.map(category => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={filters.categories?.includes(category.value as EquipmentCategory) || false}
                    onCheckedChange={() => handleCategoryToggle(category.value as EquipmentCategory)}
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['operational', 'maintenance', 'fault', 'offline'] as EquipmentStatus[]).map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status?.includes(status) || false}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Conditions</label>
            <div className="grid grid-cols-2 gap-2">
              {(['excellent', 'good', 'fair', 'poor', 'critical'] as ConditionStatus[]).map(condition => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={filters.conditions?.includes(condition) || false}
                    onCheckedChange={() => handleConditionToggle(condition)}
                  />
                  <label
                    htmlFor={`condition-${condition}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Locations</label>
            <div className="grid grid-cols-1 gap-2">
              {pumpStations.map(station => (
                <div key={station} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${station}`}
                    checked={filters.locations?.includes(station) || false}
                    onCheckedChange={() => handleLocationToggle(station)}
                  />
                  <label
                    htmlFor={`location-${station}`}
                    className="text-sm cursor-pointer"
                  >
                    {station}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Manufacturers */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Manufacturers</label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {assetManufacturers.slice(0, 8).map(manufacturer => (
                <div key={manufacturer} className="flex items-center space-x-2">
                  <Checkbox
                    id={`manufacturer-${manufacturer}`}
                    checked={filters.manufacturers?.includes(manufacturer) || false}
                    onCheckedChange={() => handleManufacturerToggle(manufacturer)}
                  />
                  <label
                    htmlFor={`manufacturer-${manufacturer}`}
                    className="text-sm cursor-pointer"
                  >
                    {manufacturer}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.search && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {filters.search}
                  </Badge>
                )}
                {filters.equipmentTypes?.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {filters.categories?.map(category => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {filters.status?.map(status => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {status}
                  </Badge>
                ))}
                {filters.conditions?.map(condition => (
                  <Badge key={condition} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
                {filters.locations?.map(location => (
                  <Badge key={location} variant="secondary" className="text-xs">
                    {location}
                  </Badge>
                ))}
                {filters.manufacturers?.map(manufacturer => (
                  <Badge key={manufacturer} variant="secondary" className="text-xs">
                    {manufacturer}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
