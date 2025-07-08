
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Asset, AssetCategory, AssetStatus, AssetCondition, CriticalityLevel } from "@/types/asset";
import { Equipment, EquipmentType, EquipmentCategory, EquipmentStatus, ConditionStatus } from "@/types/eams";
import { Calendar, MapPin, DollarSign, Tag, Settings, Wrench } from "lucide-react";

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset | Equipment) => void;
  asset?: Asset | Equipment | null;
  mode: 'create' | 'edit';
  formType?: 'asset' | 'equipment';
}

export function AssetFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  asset, 
  mode,
  formType = 'asset'
}: AssetFormModalProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    assetTag: '',
    status: 'Active',
    condition: 'Good',
    location: {
      country: '',
      state: '',
      city: '',
      site: '',
      building: '',
      floor: '',
      room: ''
    },
    assignedUser: '',
    department: '',
    purchaseDate: '',
    purchaseCost: 0,
    currentValue: 0,
    currency: 'USD',
    warrantyExpiration: '',
    criticalityLevel: 'Medium',
    notes: '',
    tags: []
  });

  const [eamsFormData, setEamsFormData] = useState<any>({
    name: '',
    type: 'mechanical',
    category: 'pump',
    manufacturer: '',
    model: '',
    serialNumber: '',
    assetTag: '',
    status: 'operational',
    condition: 'good',
    location: {
      pumpStation: '',
      building: '',
      floor: '',
      room: ''
    },
    specifications: {
      ratedPower: 0,
      ratedVoltage: 0,
      ratedCurrent: 0,
      flowRate: 0,
      pressure: 0,
      speed: 0,
      efficiency: 0
    },
    installationDate: '',
    operatingHours: 0
  });

  useEffect(() => {
    if (asset && mode === 'edit') {
      if (formType === 'equipment' && 'type' in asset) {
        setEamsFormData(asset);
      } else if (formType === 'asset' && 'category' in asset) {
        setFormData(asset);
      }
    }
  }, [asset, mode, formType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = formType === 'equipment' ? {
      ...eamsFormData,
      id: mode === 'edit' ? asset?.id : `EQ-${Date.now()}`,
      conditionMonitoring: {
        lastUpdated: new Date().toISOString().split('T')[0],
        overallCondition: eamsFormData.condition,
        alerts: []
      },
      failureHistory: [],
      maintenanceHistory: [],
      createdAt: mode === 'edit' ? asset?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : {
      ...formData,
      id: mode === 'edit' ? asset?.id : `AST-${Date.now()}`,
      location: {
        ...formData.location,
        fullPath: `${formData.location.country}/${formData.location.state}/${formData.location.city}/${formData.location.site}/${formData.location.building}/${formData.location.floor}/${formData.location.room}`
      },
      createdAt: mode === 'edit' ? asset?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(dataToSubmit);
    onClose();
  };

  const currentData = formType === 'equipment' ? eamsFormData : formData;
  const setCurrentData = formType === 'equipment' ? setEamsFormData : setFormData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formType === 'equipment' ? <Wrench className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
            {mode === 'create' ? 'Add New' : 'Edit'} {formType === 'equipment' ? 'Equipment' : 'Asset'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Create a new' : 'Update the'} {formType} record with detailed information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={currentData.name}
                  onChange={(e) => setCurrentData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {formType === 'equipment' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={currentData.type} 
                      onValueChange={(value) => setCurrentData(prev => ({ ...prev, type: value as EquipmentType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="instrumentation">Instrumentation</SelectItem>
                        <SelectItem value="civil">Civil</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={currentData.category} 
                      onValueChange={(value) => setCurrentData(prev => ({ ...prev, category: value as EquipmentCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pump">Pump</SelectItem>
                        <SelectItem value="valve">Valve</SelectItem>
                        <SelectItem value="transformer">Transformer</SelectItem>
                        <SelectItem value="motor">Motor</SelectItem>
                        <SelectItem value="panel">Panel</SelectItem>
                        <SelectItem value="sensor">Sensor</SelectItem>
                        <SelectItem value="controller">Controller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={currentData.category} 
                    onValueChange={(value) => setCurrentData(prev => ({ ...prev, category: value as AssetCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Machinery">Machinery</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={currentData.manufacturer}
                  onChange={(e) => setCurrentData(prev => ({ ...prev, manufacturer: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={currentData.model}
                  onChange={(e) => setCurrentData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={currentData.serialNumber}
                  onChange={(e) => setCurrentData(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetTag">Asset Tag</Label>
                <Input
                  id="assetTag"
                  value={currentData.assetTag}
                  onChange={(e) => setCurrentData(prev => ({ ...prev, assetTag: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status and Condition */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status & Condition</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={currentData.status} 
                  onValueChange={(value) => setCurrentData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formType === 'equipment' ? (
                      <>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="fault">Fault</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="decommissioned">Decommissioned</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Under Repair">Under Repair</SelectItem>
                        <SelectItem value="Disposed">Disposed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select 
                  value={currentData.condition} 
                  onValueChange={(value) => setCurrentData(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formType === 'equipment' ? (
                      <>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Location</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formType === 'equipment' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pumpStation">Pump Station</Label>
                    <Input
                      id="pumpStation"
                      value={currentData.location?.pumpStation || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, pumpStation: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <Input
                      id="building"
                      value={currentData.location?.building || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, building: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      value={currentData.location?.floor || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, floor: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      value={currentData.location?.room || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, room: e.target.value }
                      }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Input
                      id="site"
                      value={currentData.location?.site || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, site: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <Input
                      id="building"
                      value={currentData.location?.building || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, building: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      value={currentData.location?.room || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, room: e.target.value }
                      }))}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Equipment Specifications (EAMS only) */}
          {formType === 'equipment' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technical Specifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ratedPower">Rated Power (kW)</Label>
                    <Input
                      id="ratedPower"
                      type="number"
                      step="0.1"
                      value={currentData.specifications?.ratedPower || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        specifications: { ...prev.specifications, ratedPower: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ratedVoltage">Rated Voltage (V)</Label>
                    <Input
                      id="ratedVoltage"
                      type="number"
                      value={currentData.specifications?.ratedVoltage || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        specifications: { ...prev.specifications, ratedVoltage: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="efficiency">Efficiency (%)</Label>
                    <Input
                      id="efficiency"
                      type="number"
                      step="0.1"
                      value={currentData.specifications?.efficiency || ''}
                      onChange={(e) => setCurrentData(prev => ({ 
                        ...prev, 
                        specifications: { ...prev.specifications, efficiency: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Financial Information (Asset only) */}
          {formType === 'asset' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Financial Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseCost">Purchase Cost</Label>
                    <Input
                      id="purchaseCost"
                      type="number"
                      step="0.01"
                      value={currentData.purchaseCost}
                      onChange={(e) => setCurrentData(prev => ({ ...prev, purchaseCost: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      value={currentData.currentValue}
                      onChange={(e) => setCurrentData(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={currentData.notes || ''}
                onChange={(e) => setCurrentData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create' : 'Update'} {formType === 'equipment' ? 'Equipment' : 'Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
