export type VehicleType = 
  | 'Car' 
  | 'Van' 
  | 'Pickup' 
  | 'Truck' 
  | 'Lorry' 
  | 'Tempo' 
  | 'Bus' 
  | 'Motorcycle' 
  | 'Scooter' 
  | 'Other';

export type FuelType = 
  | 'Petrol' 
  | 'Diesel' 
  | 'CNG' 
  | 'LPG' 
  | 'EV' 
  | 'Hybrid' 
  | 'Other';

export type VehicleStatus = 
  | 'Active' 
  | 'In Trip' 
  | 'Available' 
  | 'Maintenance' 
  | 'Inactive';

export type OwnershipType = 
  | 'Company Owned' 
  | 'Leased' 
  | 'Rented' 
  | 'Employee Owned' 
  | 'Other';

export interface Vehicle {
  id: string;
  number: string; // e.g. KL-01-AB-1234
  name: string; // e.g. Honda City ZX
  type: VehicleType;
  category: string; // Sedan, Commercial, Heavy Vehicle, Staff Transport
  make: string;
  model: string;
  variant?: string;
  manufacturingYear: number;
  purchaseDate: string;
  purchasePrice: number;
  currentStatus: VehicleStatus;
  
  // Fuel & Engine
  fuelType: FuelType;
  tankCapacity: number; // in Litres
  expectedMileage: number; // in KM/L
  initialOdometer: number; // in KM
  currentOdometer: number; // in KM

  // Ownership & Assignment
  ownership: OwnershipType;
  primaryDriverId?: string;
  primaryDriverName?: string;
  department: string;
  responsibleManager: string;
  location: string;
  
  // Visual & Meta
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Key Expiries & Milestones
  insuranceExpiry?: string;
  pucExpiry?: string;
  permitExpiry?: string;
  fitnessExpiry?: string;
  taxExpiry?: string;
  lastServiceDate?: string;
  lastServiceOdometer?: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
}

export type DriverStatus = 'Active' | 'On Leave' | 'Suspended' | 'Inactive';
export type LicenceType = 'LMV' | 'HMV' | 'Commercial' | '2-Wheeler' | 'Hazardous';

export interface Driver {
  id: string;
  employeeId?: string; // Links to Enerpack EMP-001 etc.
  name: string;
  mobile: string;
  email?: string;
  department: string;
  licenceNumber: string;
  licenceType: LicenceType;
  licenceExpiry: string;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  status: DriverStatus;
  emergencyContact: string;
  joinDate: string;
  totalTrips?: number;
  totalKm?: number;
  notes?: string;
}

export type TripType = 
  | 'Delivery' 
  | 'Material Collection' 
  | 'Purchase' 
  | 'Customer Visit' 
  | 'Employee Transport' 
  | 'Official Travel' 
  | 'Maintenance' 
  | 'Emergency' 
  | 'Other';

export type TripStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  tripNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  tripDate: string;
  tripPurpose: string;
  customerDepartment: string;
  startLocation: string;
  destination: string;
  startOdometer: number;
  endOdometer: number;
  distance: number; // auto calculated end - start
  startTime: string;
  endTime: string;
  tripType: TripType;
  passengerLoadDetails?: string;
  tollExpense?: number;
  parkingExpense?: number;
  otherTripExpense?: number;
  notes?: string;
  status: TripStatus;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'Company Card' | 'FASTag / Fuel Card' | 'UPI' | 'Net Banking' | 'Other';

export interface FuelEntry {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  date: string;
  time: string;
  fuelStation: string;
  fuelType: FuelType;
  quantity: number; // Litres
  pricePerLitre: number; // ₹
  totalAmount: number; // Quantity * Price
  odometer: number;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  receiptUrl?: string;
  driverId?: string;
  driverName?: string;
  calculatedMileage?: number; // KM/L calculated based on diff with prev odometer
  costPerKm?: number;
  isAnomaly?: boolean;
  anomalyReason?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Fuel' 
  | 'Maintenance' 
  | 'Repair' 
  | 'Insurance' 
  | 'Road Tax' 
  | 'Permit' 
  | 'PUC' 
  | 'Toll' 
  | 'FASTag' 
  | 'Parking' 
  | 'Tyre' 
  | 'Battery' 
  | 'Spare Parts' 
  | 'Washing' 
  | 'Driver Expense' 
  | 'Loading / Unloading' 
  | 'Fine / Penalty' 
  | 'Emergency Repair' 
  | 'Other';

export type ExpenseApprovalStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Rejected' 
  | 'Paid';

export interface FleetExpense {
  id: string;
  expenseNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string;
  invoiceNumber?: string;
  paymentMethod: PaymentMethod;
  paidBy: string;
  driverId?: string;
  driverName?: string;
  odometer?: number;
  description: string;
  receiptUrl?: string;
  status: ExpenseApprovalStatus;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type ServiceType = 
  | 'Regular Service' 
  | 'Engine Oil' 
  | 'Oil Filter' 
  | 'Air Filter' 
  | 'Fuel Filter' 
  | 'Brake' 
  | 'Tyre' 
  | 'Battery' 
  | 'AC' 
  | 'Electrical' 
  | 'Engine' 
  | 'Transmission' 
  | 'Suspension' 
  | 'Body Repair' 
  | 'Other';

export type ServiceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface MaintenanceRecord {
  id: string;
  recordNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  serviceType: ServiceType;
  title: string;
  date: string;
  odometer: number;
  workshop: string;
  technician?: string;
  invoiceNumber?: string;
  labourCost: number;
  partsCost: number;
  totalCost: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  status: ServiceStatus;
  notes?: string;
  createdAt: string;
}

export type DocumentType = 
  | 'Registration Certificate' 
  | 'Insurance' 
  | 'PUC' 
  | 'Fitness Certificate' 
  | 'Permit' 
  | 'Road Tax' 
  | 'National Permit' 
  | 'Pollution Certificate' 
  | 'Driving Licence' 
  | 'Lease Agreement' 
  | 'Purchase Invoice' 
  | 'Other';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface FleetDocument {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  fileName?: string;
  fileSize?: string;
  notes?: string;
  createdAt: string;
}

export type InspectionItemStatus = 'OK' | 'Attention Required' | 'Not OK';

export interface InspectionChecklist {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  date: string;
  odometer: number;
  overallStatus: 'Passed' | 'Attention Needed' | 'Failed';
  items: {
    engineOil: InspectionItemStatus;
    coolant: InspectionItemStatus;
    brakes: InspectionItemStatus;
    tyres: InspectionItemStatus;
    battery: InspectionItemStatus;
    lights: InspectionItemStatus;
    indicators: InspectionItemStatus;
    horn: InspectionItemStatus;
    mirrors: InspectionItemStatus;
    windshield: InspectionItemStatus;
    wipers: InspectionItemStatus;
    seatBelts: InspectionItemStatus;
    firstAidKit: InspectionItemStatus;
    fireExtinguisher: InspectionItemStatus;
    toolKit: InspectionItemStatus;
    jack: InspectionItemStatus;
    spareTyre: InspectionItemStatus;
    cleanliness: InspectionItemStatus;
    visibleDamage: InspectionItemStatus;
  };
  remarks?: string;
  supervisorApproved?: boolean;
  supervisorName?: string;
  createdAt: string;
}

export interface DailyLogbook {
  id: string;
  date: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  openingOdometer: number;
  closingOdometer: number;
  totalKm: number;
  fuelAddedLitres: number;
  tripsCount: number;
  expenseTotal: number;
  vehicleCondition: 'Good' | 'Needs Attention' | 'Poor';
  remarks?: string;
  status: 'Submitted' | 'Approved';
  approvedBy?: string;
  createdAt: string;
}

export type IncidentType = 
  | 'Accident' 
  | 'Breakdown' 
  | 'Traffic Violation' 
  | 'Damage' 
  | 'Theft' 
  | 'Fire' 
  | 'Mechanical Failure' 
  | 'Other';

export type IncidentStatus = 'Reported' | 'Under Investigation' | 'Insurance Claim In Progress' | 'Resolved' | 'Closed';

export interface FleetIncident {
  id: string;
  incidentNumber: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId?: string;
  driverName?: string;
  date: string;
  time: string;
  location: string;
  incidentType: IncidentType;
  description: string;
  injuries: string;
  propertyDamage: string;
  policeReportNumber?: string;
  insuranceClaimStatus: 'Filed' | 'Pending' | 'Not Applicable' | 'Settled';
  estimatedCost: number;
  immediateAction: string;
  managementRemarks?: string;
  status: IncidentStatus;
  createdAt: string;
}

export type ActivityType = 
  | 'Fuel' 
  | 'Trip' 
  | 'Service' 
  | 'Repair' 
  | 'Expense' 
  | 'Document' 
  | 'Accident' 
  | 'Breakdown' 
  | 'Driver' 
  | 'Inspection';

export interface FleetActivity {
  id: string;
  date: string;
  time: string;
  vehicleId: string;
  vehicleNumber: string;
  activityType: ActivityType;
  title: string;
  description: string;
  amount?: number;
  user: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  entityId: string;
  entityName: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
}

export type FleetRole = 
  | 'Super Admin' 
  | 'HR/Admin' 
  | 'Accounts' 
  | 'Fleet/Vehicle Manager' 
  | 'Driver' 
  | 'Management';

export interface FleetSettings {
  serviceIntervalKm: number; // e.g. 5000 KM
  serviceIntervalMonths: number; // e.g. 6 months
  documentExpiryWarningDays: number; // e.g. 30 days
  mileageAnomalyDropPercent: number; // e.g. 15%
  requireDailyInspection: boolean;
  autoOdometerSync: boolean;
  defaultFuelPrice: number;
}
