import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Asset } from "@/types/asset";
import { Equipment } from "@/types/eams";
import { 
  Edit, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Settings, 
  Activity, 
  AlertTriangle,
  Thermometer,
  Zap,
  Gauge,
  Clock,
  Wrench,
  FileText,
  TrendingUp,
  Battery
} from "lucide-react";

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | Equipment | null;
  onEdit: (asset: Asset | Equipment) => void;
  type?: 'asset' | 'equipment';
}

export function AssetDetailModal({ isOpen, onClose, asset, onEdit, type = 'asset' }: AssetDetailModalProps) {
  if (!asset) return null;

  const isEquipment = 'type' in asset;
  const equipment = asset as Equipment;
  const assetData = asset as Asset;

  const getAssetTag = () => {
    if (isEquipment) {
      return equipment.assetTag;
    }
    return (assetData as any).assetTag || 'N/A';
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      // Equipment statuses
      operational: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      fault: "bg-red-100 text-red-800",
      offline: "bg-gray-100 text-gray-800",
      // Asset statuses
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
      Maintenance: "bg-yellow-100 text-yellow-800",
      "Under Repair": "bg-orange-100 text-orange-800",
      Disposed: "bg-red-100 text-red-800"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getConditionColor = (condition: string) => {
    const conditionColors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
      Excellent: "bg-green-100 text-green-800",
      Good: "bg-blue-100 text-blue-800",
      Fair: "bg-yellow-100 text-yellow-800",
      Poor: "bg-orange-100 text-orange-800",
      Critical: "bg-red-100 text-red-800"
    };
    return conditionColors[condition as keyof typeof conditionColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isEquipment ? <Settings className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              {asset.name}
            </DialogTitle>
            <Button onClick={() => onEdit(asset)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            {isEquipment && <TabsTrigger value="monitoring">Monitoring</TabsTrigger>}
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono">{asset.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isEquipment ? 'Type:' : 'Category:'}
                    </span>
                    <Badge variant="outline">
                      {isEquipment ? equipment.type : assetData.category}
                    </Badge>
                  </div>
                  {isEquipment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">{equipment.category}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span>{asset.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{asset.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="font-mono">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Tag:</span>
                    <span className="font-mono">{getAssetTag()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Condition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Status & Condition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Condition:</span>
                    <Badge className={getConditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </div>
                  {isEquipment && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Operating Hours:</span>
                        <span>{equipment.operatingHours?.toLocaleString() || 0}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Installation Date:</span>
                        <span>{equipment.installationDate}</span>
                      </div>
                    </>
                  )}
                  {!isEquipment && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Criticality:</span>
                        <Badge variant="outline">{assetData.criticalityLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned User:</span>
                        <span>{assetData.assignedUser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span>{assetData.department}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEquipment ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pump Station:</span>
                        <span>{equipment.location.pumpStation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Building:</span>
                        <span>{equipment.location.building}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span>{equipment.location.floor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room:</span>
                        <span>{equipment.location.room}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Site:</span>
                        <span>{assetData.location.site}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Building:</span>
                        <span>{assetData.location.building}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room:</span>
                        <span>{assetData.location.room}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isEquipment && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Cost:</span>
                        <span className="font-medium">
                          {assetData.currency} {assetData.purchaseCost?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Value:</span>
                        <span className="font-medium">
                          {assetData.currency} {assetData.currentValue?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Date:</span>
                        <span>{assetData.purchaseDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warranty Expiry:</span>
                        <span>{assetData.warrantyExpiration}</span>
                      </div>
                    </>
                  )}
                  {isEquipment && (
                    <div className="text-center text-muted-foreground py-4">
                      Financial data not available for equipment
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-6">
            {isEquipment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.specifications.ratedPower && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{equipment.specifications.ratedPower}kW</div>
                        <div className="text-sm text-muted-foreground">Rated Power</div>
                      </div>
                    )}
                    {equipment.specifications.ratedVoltage && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Battery className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{equipment.specifications.ratedVoltage}V</div>
                        <div className="text-sm text-muted-foreground">Rated Voltage</div>
                      </div>
                    )}
                    {equipment.specifications.efficiency && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{equipment.specifications.efficiency}%</div>
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                      </div>
                    )}
                    {equipment.specifications.flowRate && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{equipment.specifications.flowRate}m³/h</div>
                        <div className="text-sm text-muted-foreground">Flow Rate</div>
                      </div>
                    )}
                    {equipment.specifications.pressure && (
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Gauge className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{equipment.specifications.pressure}bar</div>
                        <div className="text-sm text-muted-foreground">Pressure</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Asset Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Detailed specifications not available for this asset type
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isEquipment && (
            <TabsContent value="monitoring" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condition Monitoring */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Condition Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Condition</span>
                      <Badge className={getConditionColor(equipment.conditionMonitoring.overallCondition)}>
                        {equipment.conditionMonitoring.overallCondition}
                      </Badge>
                    </div>
                    
                    {equipment.conditionMonitoring.vibration && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vibration (RMS)</span>
                          <span>{equipment.conditionMonitoring.vibration.rmsVelocity} mm/s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>ISO 10816 Zone</span>
                          <Badge variant="outline">{equipment.conditionMonitoring.vibration.iso10816Zone}</Badge>
                        </div>
                      </div>
                    )}

                    {equipment.conditionMonitoring.thermography && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Max Temperature</span>
                          <span>{equipment.conditionMonitoring.thermography.maxTemperature}°C</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Temperature</span>
                          <span>{equipment.conditionMonitoring.thermography.avgTemperature}°C</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Last Updated: {equipment.conditionMonitoring.lastUpdated}
                    </div>
                  </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {equipment.conditionMonitoring.alerts.length > 0 ? (
                      <div className="space-y-2">
                        {equipment.conditionMonitoring.alerts.map((alert, index) => (
                          <div key={index} className="p-2 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{alert.type}</span>
                              <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {alert.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No active alerts
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEquipment ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Maintenance:</span>
                        <span>{equipment.lastMaintenanceDate || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Maintenance:</span>
                        <span>{equipment.nextMaintenanceDate || 'Not scheduled'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Maintenance:</span>
                        <span>{assetData.lastMaintenanceDate || 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Maintenance:</span>
                        <span>{assetData.nextMaintenanceDate || 'Not scheduled'}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Maintenance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-4">
                    No maintenance records available
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            {!isEquipment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Asset Valuation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Cost:</span>
                      <span className="font-medium">
                        {assetData.currency} {assetData.purchaseCost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Value:</span>
                      <span className="font-medium">
                        {assetData.currency} {assetData.currentValue?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depreciation:</span>
                      <span className="text-red-600">
                        {assetData.currency} {((assetData.purchaseCost || 0) - (assetData.currentValue || 0)).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-4">
                      Detailed cost analysis not available
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Financial tracking not configured for equipment items
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
