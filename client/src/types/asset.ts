
export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subCategory: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  sku?: string;
  barcode?: string;
  rfidTagId?: string;
  assetClassification: AssetClassification;
  location: AssetLocation;
  department: string;
  costCenter?: string;
  projectCode?: string;
  assignedUser: string;
  assignedUserRole: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  currency: string;
  warrantyExpiration: string;
  status: AssetStatus;
  condition: AssetCondition;
  criticalityLevel: CriticalityLevel;
  tags: string[];
  notes: string;
  attachments: AssetAttachment[];
  createdAt: string;
  updatedAt: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  lastInspectionDate?: string;
  calibrationDueDate?: string;
  utilizationRate?: number;
  uptimePercentage?: number;
  efficiencyScore?: number;
  depreciationMethod?: DepreciationMethod;
  insuranceDetails?: InsuranceDetails;
  vendorContact?: VendorContact;
  customFields?: Record<string, any>;
  qrCode?: string;
  imageUrl?: string;
  checkoutHistory?: CheckoutRecord[];
  maintenanceHistory?: MaintenanceRecord[];
  complianceStatus?: ComplianceStatus;
  environmentalImpact?: EnvironmentalImpact;
  safetyClassification?: SafetyClassification;
  dataPrivacyClassification?: DataPrivacyClassification;
}

export type AssetCategory = 
  | 'IT Equipment'
  | 'Machinery'
  | 'Vehicles'
  | 'Furniture'
  | 'Tools'
  | 'Safety Equipment'
  | 'Medical Equipment'
  | 'Laboratory Equipment'
  | 'Office Equipment'
  | 'Manufacturing Equipment'
  | 'HVAC Systems'
  | 'Security Systems'
  | 'Communication Equipment'
  | 'Building Infrastructure'
  | 'Audio Visual'
  | 'Kitchen Equipment'
  | 'Cleaning Equipment'
  | 'Sports Equipment'
  | 'Emergency Equipment'
  | 'Scientific Instruments'
  | 'Construction Equipment'
  | 'Energy Systems'
  | 'Warehouse Equipment'
  | 'Textile Equipment'
  | 'Other';

export type AssetStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Under Repair' | 'Disposed' | 'Reserved' | 'Retired' | 'Lost' | 'Stolen' | 'Storage';
export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
export type CriticalityLevel = 'Mission Critical' | 'High' | 'Medium' | 'Low';
export type DepreciationMethod = 'Straight-line' | 'Declining Balance' | 'Sum-of-Years-Digits' | 'Units of Production';
export type AssetClassification = 'Fixed Asset' | 'Current Asset' | 'Tangible' | 'Intangible';
export type DataPrivacyClassification = 'PII' | 'Confidential' | 'Internal' | 'Public';

export interface AssetLocation {
  country: string;
  state: string;
  city: string;
  site: string;
  building: string;
  floor: string;
  room: string;
  zone?: string;
  fullPath: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AssetAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  expirationDate: string;
  deductible: number;
  claimsHistory?: InsuranceClaim[];
}

export interface InsuranceClaim {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

export interface VendorContact {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  contractDetails?: {
    contractNumber: string;
    startDate: string;
    endDate: string;
    renewalTerms: string;
  };
}

export interface CheckoutRecord {
  id: string;
  userId: string;
  userName: string;
  checkoutDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  status: 'Checked Out' | 'Returned' | 'Overdue';
  notes?: string;
  digitalSignature?: string;
  photoVerification?: string;
}

export interface MaintenanceRecord {
  id: string;
  type: 'Preventive' | 'Corrective' | 'Emergency' | 'Predictive';
  description: string;
  performedBy: string;
  performedDate: string;
  cost: number;
  nextDueDate?: string;
  parts?: string[];
  notes?: string;
  workOrderId?: string;
}

export interface ComplianceStatus {
  fdaCompliant?: boolean;
  ceMarking?: boolean;
  isoCompliant?: boolean;
  certifications: string[];
  lastAuditDate?: string;
  nextAuditDate?: string;
}

export interface EnvironmentalImpact {
  carbonFootprint: number;
  energyConsumption: number;
  recyclingInformation?: string;
  sustainabilityScore?: number;
}

export interface SafetyClassification {
  hazardousMaterial: boolean;
  safetyRating: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';
  requiredTraining?: string[];
  emergencyProcedures?: string;
}

export interface AssetFilter {
  search: string;
  category: AssetCategory | 'all';
  status: AssetStatus | 'all';
  condition: AssetCondition | 'all';
  criticalityLevel: CriticalityLevel | 'all';
  department: string;
  site: string;
  building: string;
  assignedUser: string;
  dateFrom: string;
  dateTo: string;
  valueMin: number;
  valueMax: number;
  tags: string[];
  maintenanceDue: boolean;
  warrantyExpiring: boolean;
  complianceIssues: boolean;
}

export interface AssetFormData extends Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'qrCode'> {}

export interface AssetAnalytics {
  totalAssets: number;
  totalValue: number;
  byCategory: Record<AssetCategory, number>;
  byStatus: Record<AssetStatus, number>;
  byCondition: Record<AssetCondition, number>;
  byLocation: Record<string, number>;
  byCriticality: Record<CriticalityLevel, number>;
  maintenanceDue: number;
  warrantyExpiring: number;
  complianceIssues: number;
  utilizationTrend: Array<{
    month: string;
    utilization: number;
    value: number;
  }>;
  costTrend: Array<{
    month: string;
    maintenance: number;
    acquisition: number;
    disposal: number;
  }>;
  predictiveInsights: Array<{
    assetId: string;
    assetName: string;
    insight: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    recommendedAction: string;
  }>;
}

export interface DepreciationSchedule {
  assetId: string;
  method: DepreciationMethod;
  originalValue: number;
  salvageValue: number;
  usefulLife: number;
  yearlyDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  remainingLife: number;
  schedule: Array<{
    year: number;
    depreciation: number;
    accumulated: number;
    bookValue: number;
  }>;
}

// Asset Tracking specific types
export interface AssetTracking {
  assetId: string;
  currentLocation: AssetLocation;
  locationHistory: LocationHistoryEntry[];
  realTimeData?: IoTSensorData;
  geofenceAlerts: GeofenceAlert[];
  movementPredictions?: MovementPrediction[];
}

export interface LocationHistoryEntry {
  id: string;
  location: AssetLocation;
  timestamp: string;
  movedBy: string;
  reason: string;
  method: 'Manual' | 'RFID' | 'GPS' | 'Barcode' | 'IoT';
}

export interface IoTSensorData {
  temperature?: number;
  humidity?: number;
  vibration?: number;
  usageHours?: number;
  batteryLevel?: number;
  lastUpdate: string;
  alerts: IoTAlert[];
}

export interface IoTAlert {
  id: string;
  type: 'Temperature' | 'Humidity' | 'Vibration' | 'Battery' | 'Offline';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface GeofenceAlert {
  id: string;
  assetId: string;
  alertType: 'Entry' | 'Exit' | 'Unauthorized Movement';
  location: AssetLocation;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High';
  acknowledged: boolean;
}

export interface MovementPrediction {
  assetId: string;
  predictedLocation: AssetLocation;
  confidence: number;
  predictedDate: string;
  reason: string;
}
