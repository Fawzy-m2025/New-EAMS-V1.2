import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Equipment, EquipmentType, EquipmentCategory, Zone } from "@/types/eams";
import { HierarchySelector } from "./HierarchySelector";
import { HierarchyBreadcrumb } from "./HierarchyBreadcrumb";
import { Save, X, MapPin, Building, Layers, Factory } from "lucide-react";

interface EnhancedAssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSave: (equipment: Equipment) => void;
  zones?: Zone[]; // Hierarchical data for location selection
  parentNodeId?: string; // Pre-selected parent node
}

export function EnhancedAssetFormModal({
  open,
  onOpenChange,
  equipment,
  onSave,
  zones = [],
  parentNodeId
}: EnhancedAssetFormModalProps) {
  const [formData, setFormData] = useState<Partial<Equipment>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hierarchySelection, setHierarchySelection] = useState<any>(null);

  const isEditMode = !!equipment;

  useEffect(() => {
    console.log('📝 EnhancedAssetFormModal opened:', { open, equipment, zones: zones.length });

    if (equipment) {
      setFormData(equipment);
      // Set hierarchy selection from existing equipment
      if (equipment.zoneId || equipment.stationId) {
        setHierarchySelection({
          zoneId: equipment.zoneId,
          stationId: equipment.stationId,
          lineId: equipment.lineId,
          systemId: equipment.systemId,
          level: equipment.lineId ? 'line' : 'system',
          path: equipment.path || ''
        });
      }
    } else {
      setFormData({
        type: 'mechanical',
        category: 'pump',
        status: 'operational',
        condition: 'good',
        location: {},
        specifications: {},
        conditionMonitoring: {
          lastUpdated: new Date().toISOString(),
          overallCondition: 'good',
          alerts: []
        },
        failureHistory: [],
        maintenanceHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setHierarchySelection(null);
    }
    setCurrentStep(1);
    setErrors({});
  }, [equipment, open]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.serialNumber) newErrors.serialNumber = 'Serial Number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!hierarchySelection) {
      newErrors.hierarchy = 'Location selection is required';
    } else {
      if (!hierarchySelection.zoneId) newErrors.hierarchy = 'Zone selection is required';
      if (!hierarchySelection.stationId) newErrors.hierarchy = 'Station selection is required';
      if (!hierarchySelection.lineId && !hierarchySelection.systemId) {
        newErrors.hierarchy = 'Line or System selection is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('📝 handleNext clicked, currentStep:', currentStep);

    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    console.log('📝 Step validation result:', isValid);

    if (isValid) {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        console.log('📝 Moving to step:', newStep);
        return newStep;
      });
    }
  };

  const generateAssetCode = () => {
    if (!hierarchySelection || !formData.category) return '';

    const categoryCode = formData.category.charAt(0).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);

    // Extract codes from hierarchy
    const zoneCode = hierarchySelection.path.split('/')[0]?.replace('Zone ', '') || 'Z';
    const stationCode = hierarchySelection.path.split('/')[1]?.replace('Pump Station ', '') || 'S';
    const lineOrSystemCode = hierarchySelection.lineId ?
      hierarchySelection.path.split('/')[2]?.replace('Line ', 'L') :
      hierarchySelection.path.split('/')[2]?.replace(' System', 'S');

    return `${categoryCode}-${zoneCode}-${stationCode}-${lineOrSystemCode}-${timestamp}`;
  };

  const handleSave = () => {
    let isValid = true;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();

    if (isValid && hierarchySelection) {
      const equipmentData: Equipment = {
        ...formData,
        id: isEditMode ? formData.id! : `EQ-${Date.now()}`,
        name: formData.name!,
        level: 'equipment',
        parentId: hierarchySelection.lineId || hierarchySelection.systemId,
        zoneId: hierarchySelection.zoneId,
        stationId: hierarchySelection.stationId,
        lineId: hierarchySelection.lineId,
        systemId: hierarchySelection.systemId,
        path: `${hierarchySelection.path}/${formData.name}`,
        breadcrumbs: [
          ...hierarchySelection.path.split('/').map((part: string, index: number) => ({
            id: `breadcrumb-${index}`,
            name: part,
            level: index === 0 ? 'zone' : index === 1 ? 'station' : index === 2 ? 'line' : 'equipment',
            path: hierarchySelection.path.split('/').slice(0, index + 1).join('/')
          })),
          {
            id: `breadcrumb-equipment`,
            name: formData.name!,
            level: 'equipment',
            path: `${hierarchySelection.path}/${formData.name}`
          }
        ],
        assetTag: formData.assetTag || generateAssetCode(),
        location: {
          ...formData.location,
          zone: hierarchySelection.path.split('/')[0],
          station: hierarchySelection.path.split('/')[1],
          line: hierarchySelection.lineId ? hierarchySelection.path.split('/')[2] : undefined,
          system: hierarchySelection.systemId ? hierarchySelection.path.split('/')[2] : undefined
        },
        conditionMonitoring: {
          ...formData.conditionMonitoring,
          lastUpdated: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      } as Equipment;

      onSave(equipmentData);
      onOpenChange(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Split the name to handle nested fields like location.pumpStation
      const nameParts = name.split('.');
      if (nameParts.length === 1) {
        return { ...prev, [name]: value };
      } else {
        // For nested fields, we need to update the nested object
        const [topLevelKey, ...nestedKeys] = nameParts;

        // Helper function to safely update nested objects
        const updateNestedField = (obj: any, keys: string[], val: any): any => {
          if (keys.length === 1) {
            return { ...obj, [keys[0]]: val };
          } else {
            const currentKey = keys[0];
            return {
              ...obj,
              [currentKey]: updateNestedField(obj[currentKey] || {}, keys.slice(1), val)
            };
          }
        };

        return updateNestedField(prev, nameParts, value);
      }
    });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }));
  };

  const handleSpecificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [name]: value }
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        console.log('📝 Dialog onOpenChange:', newOpen);
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submit prevented');
          }}
        >
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={(formData.name || '') as string}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="type">Equipment Type</Label>
                  <Select
                    value={(formData.type || '') as string}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EquipmentType }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="instrumentation">Instrumentation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Equipment Category</Label>
                  <Select
                    value={(formData.category || '') as string}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as EquipmentCategory }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pump">Pump</SelectItem>
                      <SelectItem value="motor">Motor</SelectItem>
                      <SelectItem value="valve">Valve</SelectItem>
                      <SelectItem value="strainer">Strainer</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="actuator">Actuator</SelectItem>
                      <SelectItem value="tank">Tank</SelectItem>
                      <SelectItem value="compressor">Compressor</SelectItem>
                      <SelectItem value="transformer">Transformer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Manufacturer Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={(formData.manufacturer || '') as string}
                    onChange={handleChange}
                  />
                  {errors.manufacturer && <p className="text-red-500 text-sm">{errors.manufacturer}</p>}
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    type="text"
                    id="model"
                    name="model"
                    value={(formData.model || '') as string}
                    onChange={handleChange}
                  />
                  {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    value={(formData.serialNumber || '') as string}
                    onChange={handleChange}
                  />
                  {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="assetTag">Asset Tag</Label>
                  <Input
                    type="text"
                    id="assetTag"
                    name="assetTag"
                    value={(formData.assetTag || '') as string}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Hierarchy Selection */}
              <HierarchySelector
                zones={zones}
                selectedHierarchy={hierarchySelection}
                onSelectionChange={setHierarchySelection}
                allowedLevels={['line', 'system']}
              />

              {errors.hierarchy && (
                <p className="text-red-500 text-sm">{errors.hierarchy}</p>
              )}

              {/* Additional Location Details */}
              {hierarchySelection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Additional Location Details
                    </CardTitle>
                    {/* Show selected hierarchy path */}
                    <div className="mt-2">
                      <HierarchyBreadcrumb
                        breadcrumbs={hierarchySelection.path.split('/').map((part: string, index: number) => ({
                          id: `breadcrumb-${index}`,
                          name: part,
                          level: index === 0 ? 'zone' : index === 1 ? 'station' : index === 2 ? 'line' : 'equipment',
                          path: hierarchySelection.path.split('/').slice(0, index + 1).join('/')
                        }))}
                        onNavigate={() => { }} // Read-only in form
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <Label htmlFor="building">Building</Label>
                      <Input
                        type="text"
                        id="building"
                        name="building"
                        value={(formData.location?.building || '') as string}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, building: e.target.value }
                          }));
                        }}
                        placeholder="e.g., Pump House, Control Room"
                      />
                    </div>
                    <div>
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        type="text"
                        id="floor"
                        name="floor"
                        value={(formData.location?.floor || '') as string}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, floor: e.target.value }
                          }));
                        }}
                        placeholder="e.g., Ground Floor, First Floor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="room">Room</Label>
                      <Input
                        type="text"
                        id="room"
                        name="room"
                        value={(formData.location?.room || '') as string}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, room: e.target.value }
                          }));
                        }}
                        placeholder="e.g., Pump Room 1, Motor Room"
                      />
                    </div>

                    {/* Auto-generated Asset Tag Preview */}
                    <div>
                      <Label>Auto-generated Asset Tag</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        <Badge variant="outline" className="text-sm">
                          {generateAssetCode() || 'Will be generated on save'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={(formData.status || '') as string}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="fault">Fault</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="decommissioned">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={(formData.condition || '') as string}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as any }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={(formData.notes || '') as string}
                    onChange={handleChange}
                    placeholder="Additional notes about the equipment"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        <DialogFooter className="mt-6 pt-4 border-t">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Asset' : 'Create Asset'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
