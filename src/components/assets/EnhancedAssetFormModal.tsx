import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Equipment, EquipmentType, EquipmentCategory } from "@/types/eams";
import { Save, X } from "lucide-react";

interface EnhancedAssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSave: (equipment: Equipment) => void;
}

export function EnhancedAssetFormModal({
  open,
  onOpenChange,
  equipment,
  onSave
}: EnhancedAssetFormModalProps) {
  const [formData, setFormData] = useState<Partial<Equipment>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!equipment;

  useEffect(() => {
    if (equipment) {
      setFormData(equipment);
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
    }
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
    if (!formData.location?.pumpStation) newErrors['location.pumpStation'] = 'Pump Station is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
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

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSave = () => {
    let isValid = true;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();

    if (isValid) {
      if (formData.conditionMonitoring) {
        formData.conditionMonitoring.lastUpdated = new Date().toISOString();
      }
      onSave(formData as Equipment);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4">
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
                      <SelectItem value="valve">Valve</SelectItem>
                      <SelectItem value="motor">Motor</SelectItem>
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
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <Label htmlFor="pumpStation">Pump Station</Label>
                  <Input
                    type="text"
                    id="location.pumpStation"
                    name="pumpStation"
                    value={(formData.location?.pumpStation || '') as string}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, pumpStation: e.target.value }
                      }));
                    }}
                  />
                  {errors['location.pumpStation'] && <p className="text-red-500 text-sm">{errors['location.pumpStation']}</p>}
                </div>
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
                  />
                </div>
              </CardContent>
            </Card>
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
