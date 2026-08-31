import { 
  Vehicle, Driver, Trip, FuelEntry, FleetExpense, MaintenanceRecord, 
  FleetDocument, InspectionChecklist, DailyLogbook, FleetIncident, 
  FleetActivity, AuditLogEntry, FleetSettings 
} from '../types/fleet';

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-kl65s7466',
    number: 'KL65S7466',
    name: 'Mahindra Bolero Neo / Pik-Up',
    type: 'Pickup',
    category: 'Field Operations & Logistics',
    make: 'Mahindra',
    model: 'Bolero Neo',
    variant: 'N10 (O) 1.5L mHawk75',
    manufacturingYear: 2023,
    purchaseDate: '2023-04-12',
    purchasePrice: 1180000,
    currentStatus: 'Active',
    fuelType: 'Diesel',
    tankCapacity: 60,
    expectedMileage: 13.5,
    initialOdometer: 0,
    currentOdometer: 28450,
    ownership: 'Company Owned',
    primaryDriverId: 'drv-1',
    primaryDriverName: 'Suresh Kumar',
    department: 'Field Operations',
    responsibleManager: 'Rajiv Singh',
    location: 'Kerala Fleet Yard (Tirur / Kochi)',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60',
    notes: 'Primary operational utility vehicle assigned for field engineering, equipment delivery, and site inspections.',
    createdAt: '2023-04-12T10:00:00Z',
    updatedAt: '2026-08-29T14:30:00Z',
    insuranceExpiry: '2027-04-11',
    pucExpiry: '2026-10-15',
    permitExpiry: '2028-04-10',
    fitnessExpiry: '2028-04-10',
    taxExpiry: '2028-04-10',
    lastServiceDate: '2026-05-18',
    lastServiceOdometer: 25000,
    nextServiceDate: '2026-11-18',
    nextServiceOdometer: 30000
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'drv-1',
    employeeId: 'EMP-001',
    name: 'Suresh Kumar',
    mobile: '+91 97455 33441',
    email: 'suresh.k@enerpack.com',
    department: 'Field Operations',
    licenceNumber: 'KL-65-2016-0099882',
    licenceType: 'Commercial',
    licenceExpiry: '2030-11-20',
    assignedVehicleId: 'veh-kl65s7466',
    assignedVehicleNumber: 'KL65S7466',
    status: 'Active',
    emergencyContact: 'Radha Kumar (+91 97455 33442)',
    joinDate: '2022-02-15',
    totalTrips: 186,
    totalKm: 28450,
    notes: 'Designated primary driver for KL65S7466. Experienced across Kerala regional highways and solar project terrain.'
  }
];

export const initialTrips: Trip[] = [
  {
    id: 'trp-1',
    tripNumber: 'TRP-2026-0001',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    tripDate: '2026-08-29',
    tripPurpose: 'Site Inspection & Inverter Delivery for 250kW Solar Project',
    customerDepartment: 'Field Operations',
    startLocation: 'Enerpack Central Yard',
    destination: 'Tirur Solar Substation Site',
    startOdometer: 28240,
    endOdometer: 28450,
    distance: 210,
    startTime: '07:30 AM',
    endTime: '05:45 PM',
    tripType: 'Customer Visit',
    passengerLoadDetails: 'Field Engineer Team + 2x Inverter Test Units',
    tollExpense: 180,
    parkingExpense: 60,
    otherTripExpense: 0,
    notes: 'Trip completed on schedule. Inspection approved by site in-charge.',
    status: 'Completed',
    createdAt: '2026-08-29T07:00:00Z'
  },
  {
    id: 'trp-2',
    tripNumber: 'TRP-2026-0002',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    tripDate: '2026-08-27',
    tripPurpose: 'Battery Energy Storage Pack Dispatch & Maintenance Check',
    customerDepartment: 'Logistics & Support',
    startLocation: 'Enerpack Yard',
    destination: 'Kochi Tech Park Site',
    startOdometer: 28060,
    endOdometer: 28240,
    distance: 180,
    startTime: '08:15 AM',
    endTime: '04:30 PM',
    tripType: 'Delivery',
    passengerLoadDetails: 'Solar Battery Packs (420kg payload)',
    tollExpense: 140,
    parkingExpense: 40,
    otherTripExpense: 0,
    notes: 'Fastag automated toll deducted smoothly.',
    status: 'Completed',
    createdAt: '2026-08-27T08:00:00Z'
  },
  {
    id: 'trp-3',
    tripNumber: 'TRP-2026-0003',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    tripDate: '2026-09-02',
    tripPurpose: 'Scheduled Commercial Site Survey & Energy Audit',
    customerDepartment: 'Field Operations',
    startLocation: 'Enerpack Yard',
    destination: 'Calicut Industrial Complex',
    startOdometer: 28450,
    endOdometer: 28690,
    distance: 240,
    startTime: '06:30 AM',
    endTime: '07:00 PM',
    tripType: 'Official Travel',
    passengerLoadDetails: 'Audit Team (3 Members) + Measurement Equipment',
    tollExpense: 220,
    parkingExpense: 80,
    status: 'Planned',
    createdAt: '2026-08-30T09:00:00Z'
  }
];

export const initialFuelEntries: FuelEntry[] = [
  {
    id: 'fl-1',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    date: '2026-08-29',
    time: '07:15 AM',
    fuelStation: 'Indian Oil Corporation, Highway Retail Outlet',
    fuelType: 'Diesel',
    quantity: 42.5,
    pricePerLitre: 94.8,
    totalAmount: 4029.0,
    odometer: 28240,
    paymentMethod: 'FASTag / Fuel Card',
    receiptNumber: 'IOC-KL65-8829',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    calculatedMileage: 13.6,
    costPerKm: 6.97,
    isAnomaly: false,
    notes: 'Full tank top-up before site dispatch trip.',
    createdAt: '2026-08-29T07:20:00Z'
  },
  {
    id: 'fl-2',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    date: '2026-08-22',
    time: '08:30 AM',
    fuelStation: 'Bharat Petroleum Retail Station',
    fuelType: 'Diesel',
    quantity: 45.0,
    pricePerLitre: 94.5,
    totalAmount: 4252.5,
    odometer: 27660,
    paymentMethod: 'Company Card',
    receiptNumber: 'BPCL-KL65-4419',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    calculatedMileage: 13.2,
    costPerKm: 7.16,
    isAnomaly: false,
    notes: 'Regular weekly diesel fill.',
    createdAt: '2026-08-22T08:35:00Z'
  }
];

export const initialFleetExpenses: FleetExpense[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-KL65-2026-001',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    date: '2026-08-29',
    category: 'Toll',
    amount: 180,
    vendor: 'NHAI FASTag Electronic Toll',
    invoiceNumber: 'FASTAG-TXN-88219',
    paymentMethod: 'FASTag / Fuel Card',
    paidBy: 'Company FASTag Wallet',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    odometer: 28450,
    description: 'Highway toll plaza deduction for site survey trip.',
    status: 'Paid',
    approvedBy: 'Rajiv Singh',
    approvalDate: '2026-08-29',
    createdAt: '2026-08-29T18:00:00Z'
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-KL65-2026-002',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    date: '2026-08-25',
    category: 'Washing',
    amount: 750,
    vendor: 'Express Auto Spa & Detailing',
    invoiceNumber: 'EAS-2026-551',
    paymentMethod: 'Cash',
    paidBy: 'Suresh Kumar',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    odometer: 28060,
    description: 'Complete underbody water wash and cabin vacuuming.',
    status: 'Paid',
    approvedBy: 'Rajiv Singh',
    approvalDate: '2026-08-26',
    createdAt: '2026-08-25T16:00:00Z'
  },
  {
    id: 'exp-3',
    expenseNumber: 'EXP-KL65-2026-003',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    date: '2026-08-15',
    category: 'FASTag',
    amount: 3000,
    vendor: 'ICICI FASTag Commercial Recharge',
    invoiceNumber: 'FASTAG-REC-9912',
    paymentMethod: 'Net Banking',
    paidBy: 'Rajiv Singh',
    description: 'Monthly automated FASTag balance recharge.',
    status: 'Paid',
    approvedBy: 'Rajiv Singh',
    approvalDate: '2026-08-15',
    createdAt: '2026-08-15T10:00:00Z'
  }
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'mnt-1',
    recordNumber: 'SRV-2026-001',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    serviceType: 'Regular Service',
    title: '25,000 KM Periodic Maintenance & Inspection',
    date: '2026-05-18',
    odometer: 25000,
    workshop: 'Mahindra Authorized Service Hub',
    technician: 'Ramesh Mohan',
    invoiceNumber: 'MAH-SRV-2026-881',
    labourCost: 3200,
    partsCost: 6800,
    totalCost: 10000,
    nextServiceDate: '2026-11-18',
    nextServiceOdometer: 30000,
    status: 'Completed',
    notes: 'Engine oil replaced (15W-40), oil filter replaced, brake check & wheel alignment completed.',
    createdAt: '2026-05-18T16:00:00Z'
  }
];

export const initialFleetDocuments: FleetDocument[] = [
  {
    id: 'doc-1',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    documentType: 'Registration Certificate',
    documentNumber: 'RC-KL65S7466',
    issueDate: '2023-04-12',
    expiryDate: '2038-04-11',
    issuingAuthority: 'Sub Regional Transport Office, Tirur (KL-65)',
    fileName: 'KL65S7466_SmartCard_RC.pdf',
    fileSize: '1.2 MB',
    notes: 'Original Registration Smart Card securely archived at fleet office.',
    createdAt: '2023-04-12T11:00:00Z'
  },
  {
    id: 'doc-2',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    documentType: 'Insurance',
    documentNumber: 'POL-NEW-INDIA-KL65-8812',
    issueDate: '2026-04-12',
    expiryDate: '2027-04-11',
    issuingAuthority: 'The New India Assurance Co. Ltd.',
    fileName: 'KL65S7466_Comprehensive_Insurance.pdf',
    fileSize: '1.6 MB',
    notes: 'Comprehensive Commercial Goods & Utility Insurance with Roadside Assistance.',
    createdAt: '2026-04-12T09:00:00Z'
  },
  {
    id: 'doc-3',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    documentType: 'PUC',
    documentNumber: 'PUCC-KL65-2026-19283',
    issueDate: '2026-04-16',
    expiryDate: '2026-10-15',
    issuingAuthority: 'Kerala Motor Vehicles Department',
    fileName: 'KL65S7466_Pollution_Certificate.pdf',
    fileSize: '510 KB',
    notes: 'BS-VI diesel emission test passed and verified.',
    createdAt: '2026-04-16T14:00:00Z'
  },
  {
    id: 'doc-4',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    documentType: 'Fitness Certificate',
    documentNumber: 'FC-KL65-2026-4491',
    issueDate: '2026-04-11',
    expiryDate: '2028-04-10',
    issuingAuthority: 'MVD Kerala Heavy & Commercial Vehicle Testing Station',
    fileName: 'KL65S7466_Fitness_Certificate.pdf',
    fileSize: '890 KB',
    notes: 'Fitness test verified and valid until April 2028.',
    createdAt: '2026-04-11T12:00:00Z'
  }
];

export const initialInspections: InspectionChecklist[] = [
  {
    id: 'insp-1',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    date: '2026-08-29',
    odometer: 28240,
    overallStatus: 'Passed',
    items: {
      engineOil: 'OK',
      coolant: 'OK',
      brakes: 'OK',
      tyres: 'OK',
      battery: 'OK',
      lights: 'OK',
      indicators: 'OK',
      horn: 'OK',
      mirrors: 'OK',
      windshield: 'OK',
      wipers: 'OK',
      seatBelts: 'OK',
      firstAidKit: 'OK',
      fireExtinguisher: 'OK',
      toolKit: 'OK',
      jack: 'OK',
      spareTyre: 'OK',
      cleanliness: 'OK',
      visibleDamage: 'OK'
    },
    remarks: 'Pre-trip 19-point safety checklist completed. Vehicle in peak operational condition.',
    supervisorApproved: true,
    supervisorName: 'Rajiv Singh',
    createdAt: '2026-08-29T07:15:00Z'
  }
];

export const initialDailyLogs: DailyLogbook[] = [
  {
    id: 'log-1',
    date: '2026-08-29',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    openingOdometer: 28240,
    closingOdometer: 28450,
    totalKm: 210,
    fuelAddedLitres: 42.5,
    tripsCount: 1,
    expenseTotal: 180,
    vehicleCondition: 'Good',
    remarks: 'Site inspection & equipment delivery completed smoothly.',
    status: 'Approved',
    approvedBy: 'Rajiv Singh',
    createdAt: '2026-08-29T18:30:00Z'
  }
];

export const initialIncidents: FleetIncident[] = [];

export const initialActivities: FleetActivity[] = [
  {
    id: 'act-1',
    date: '2026-08-29',
    time: '05:45 PM',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    activityType: 'Trip',
    title: 'Trip Completed: Solar Site Inspection',
    description: 'Distance: 210 KM | End Odometer: 28,450 KM | Driver: Suresh Kumar',
    user: 'Suresh Kumar'
  },
  {
    id: 'act-2',
    date: '2026-08-29',
    time: '07:15 AM',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    activityType: 'Fuel',
    title: 'Fuel Added: 42.5 L Diesel',
    description: 'IOC Highway Outlet | ₹4,029.00 | Mileage: 13.6 km/l',
    amount: 4029,
    user: 'Suresh Kumar'
  },
  {
    id: 'act-3',
    date: '2026-08-29',
    time: '07:10 AM',
    vehicleId: 'veh-kl65s7466',
    vehicleNumber: 'KL65S7466',
    activityType: 'Inspection',
    title: 'Daily Pre-Trip Inspection Passed',
    description: '19-point vehicle checklist verified and supervisor approved.',
    user: 'Suresh Kumar'
  }
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-08-29 07:15:20',
    user: 'Suresh Kumar (Driver)',
    module: 'Inspection',
    action: 'CREATE',
    entityId: 'insp-1',
    entityName: 'Pre-trip inspection for KL65S7466',
    newValue: 'Status: Passed, All 19 checklist items OK'
  },
  {
    id: 'aud-2',
    timestamp: '2026-08-29 18:45:10',
    user: 'Rajiv Singh (Manager)',
    module: 'Expenses',
    action: 'APPROVE',
    entityId: 'exp-1',
    entityName: 'Toll Expense ₹180 for KL65S7466',
    previousValue: 'Status: Submitted',
    newValue: 'Status: Paid'
  }
];

export const initialSettings: FleetSettings = {
  serviceIntervalKm: 5000,
  serviceIntervalMonths: 6,
  documentExpiryWarningDays: 30,
  mileageAnomalyDropPercent: 15,
  requireDailyInspection: true,
  autoOdometerSync: true,
  defaultFuelPrice: 95.0
};

export const initialFleetData = {
  vehicles: initialVehicles,
  drivers: initialDrivers,
  trips: initialTrips,
  fuelEntries: initialFuelEntries,
  expenses: initialFleetExpenses,
  maintenanceRecords: initialMaintenanceRecords,
  documents: initialFleetDocuments,
  inspections: initialInspections,
  dailyLogs: initialDailyLogs,
  incidents: initialIncidents,
  activities: initialActivities,
  auditLogs: initialAuditLogs,
  settings: initialSettings
};
