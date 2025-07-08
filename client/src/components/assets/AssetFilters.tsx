
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { EquipmentType, EquipmentCategory, EquipmentStatus, EAMSFilter } from "@/types/eams";
import { assetCategories, pumpStations } from "@/data/enhancedAssetData";

interface AssetFiltersProps {
  filters: EAMSFilter;
  onFiltersChange: (filters: EAMSFilter) => void;
}

export function AssetFilters({ filters, onFiltersChange }: AssetFiltersProps) {
  const handleClearSearch = () => {
    onFiltersChange({ ...filters, search: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Smart search assets, manufacturers, models, tags..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select 
          value={filters.equipmentTypes?.[0] || 'all'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            equipmentTypes: value === 'all' ? [] : [value as EquipmentType]
          })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Equipment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mechanical">Mechanical</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="instrumentation">Instrumentation</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.categories?.[0] || 'all'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            categories: value === 'all' ? [] : [value as EquipmentCategory]
          })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {assetCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.status?.[0] || 'all'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            status: value === 'all' ? [] : [value as EquipmentStatus]
          })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="fault">Fault</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.locations?.[0] || 'all'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            locations: value === 'all' ? [] : [value]
          })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {pumpStations.map(station => (
              <SelectItem key={station} value={station}>
                {station}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
