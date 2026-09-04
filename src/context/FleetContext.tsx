import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { logAuditEvent } from '../lib/auditLogger';
import { 
  Vehicle, Driver, Trip, FuelEntry, FleetExpense, MaintenanceRecord, 
  FleetDocument, InspectionChecklist, DailyLogbook, FleetIncident, 
  FleetActivity, AuditLogEntry, FleetSettings, FleetRole, ExpenseApprovalStatus,
  TripStatus, ServiceStatus, DocumentStatus
} from '../types/fleet';
import { 
  initialVehicles, initialDrivers, initialTrips, initialFuelEntries, 
  initialFleetExpenses, initialMaintenanceRecords, initialFleetDocuments, 
  initialInspections, initialDailyLogs, initialIncidents, initialActivities, 
  initialAuditLogs, initialSettings 
} from '../data/fleetInitialData';

export type QuickModalType = 
  | 'addVehicle'
  | 'editVehicle'
  | 'addFuel'
  | 'addExpense'
  | 'newTrip'
  | 'scheduleService'
  | 'recordRepair'
  | 'uploadDocument'
  | 'inspection'
  | 'reportIncident'
  | 'addDriver'
  | 'dailyLog'
  | null;

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelEntries: FuelEntry[];
  expenses: FleetExpense[];
  maintenanceRecords: MaintenanceRecord[];
  documents: FleetDocument[];
  inspections: InspectionChecklist[];
  dailyLogs: DailyLogbook[];
  incidents: FleetIncident[];
  activities: FleetActivity[];
  auditLogs: AuditLogEntry[];
  settings: FleetSettings;
  role: FleetRole;
  
  // Selected modals
  selectedVehicleId: string | null;
  selectedDriverId: string | null;
  activeQuickModal: QuickModalType;
  modalPrefillData: any;
  
  // Actions for selection & modals
  setSelectedVehicleId: (id: string | null) => void;
  setSelectedDriverId: (id: string | null) => void;
  openQuickModal: (modal: QuickModalType, prefillData?: any) => void;
  closeQuickModal: () => void;
  setRole: (role: FleetRole) => void;
  updateSettings: (newSettings: Partial<FleetSettings>) => void;
  resetAllData: () => void;

  // CRUD Operations
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  addTrip: (trip: Omit<Trip, 'id' | 'tripNumber' | 'createdAt'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  startTrip: (id: string) => void;
  completeTrip: (id: string, endOdometer: number) => void;
  deleteTrip: (id: string) => void;

  addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'createdAt'>) => FuelEntry;
  updateFuelEntry: (id: string, updates: Partial<FuelEntry>) => void;
  deleteFuelEntry: (id: string) => void;

  addExpense: (expense: Omit<FleetExpense, 'id' | 'expenseNumber' | 'createdAt'>) => FleetExpense;
  updateExpense: (id: string, updates: Partial<FleetExpense>) => void;
  updateExpenseStatus: (id: string, status: ExpenseApprovalStatus, reason?: string) => void;
  deleteExpense: (id: string) => void;

  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'recordNumber' | 'createdAt'>) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;

  addDocument: (doc: Omit<FleetDocument, 'id' | 'createdAt'>) => FleetDocument;
  updateDocument: (id: string, updates: Partial<FleetDocument>) => void;
  deleteDocument: (id: string) => void;

  addInspection: (insp: Omit<InspectionChecklist, 'id' | 'createdAt'>) => InspectionChecklist;
  updateInspection: (id: string, updates: Partial<InspectionChecklist>) => void;

  addDailyLog: (log: Omit<DailyLogbook, 'id' | 'createdAt'>) => DailyLogbook;
  updateDailyLog: (id: string, updates: Partial<DailyLogbook>) => void;
  approveDailyLog: (id: string) => void;

  addIncident: (inc: Omit<FleetIncident, 'id' | 'incidentNumber' | 'createdAt'>) => FleetIncident;
  updateIncident: (id: string, updates: Partial<FleetIncident>) => void;
  deleteIncident: (id: string) => void;

  logActivity: (activity: Omit<FleetActivity, 'id'>) => void;
  logAudit: (audit: Omit<AuditLogEntry, 'id' | 'timestamp' | 'user'>) => void;

  // Computed & helpers
  getVehicleById: (id: string) => Vehicle | undefined;
  getDriverById: (id: string) => Driver | undefined;
  getDocumentExpiryStatus: (expiryDateStr?: string) => DocumentStatus;
  getOverdueMaintenanceCount: () => number;
  getExpiringDocumentsCount: () => number;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const FLEET_DATA_VERSION = 'v_kl65s7466_only_v1';

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNewVersion = typeof window !== 'undefined' && localStorage.getItem('enerpack_fleet_data_version') !== FLEET_DATA_VERSION;
  if (isNewVersion && typeof window !== 'undefined') {
    localStorage.setItem('enerpack_fleet_data_version', FLEET_DATA_VERSION);
  }

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    if (isNewVersion) return initialVehicles;
    const saved = localStorage.getItem('enerpack_fleet_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    if (isNewVersion) return initialDrivers;
    const saved = localStorage.getItem('enerpack_fleet_drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    if (isNewVersion) return initialTrips;
    const saved = localStorage.getItem('enerpack_fleet_trips');
    return saved ? JSON.parse(saved) : initialTrips;
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    if (isNewVersion) return initialFuelEntries;
    const saved = localStorage.getItem('enerpack_fleet_fuel');
    return saved ? JSON.parse(saved) : initialFuelEntries;
  });

  const [expenses, setExpenses] = useState<FleetExpense[]>(() => {
    if (isNewVersion) return initialFleetExpenses;
    const saved = localStorage.getItem('enerpack_fleet_expenses');
    return saved ? JSON.parse(saved) : initialFleetExpenses;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    if (isNewVersion) return initialMaintenanceRecords;
    const saved = localStorage.getItem('enerpack_fleet_maintenance');
    return saved ? JSON.parse(saved) : initialMaintenanceRecords;
  });

  const [documents, setDocuments] = useState<FleetDocument[]>(() => {
    if (isNewVersion) return initialFleetDocuments;
    const saved = localStorage.getItem('enerpack_fleet_documents');
    return saved ? JSON.parse(saved) : initialFleetDocuments;
  });

  const [inspections, setInspections] = useState<InspectionChecklist[]>(() => {
    if (isNewVersion) return initialInspections;
    const saved = localStorage.getItem('enerpack_fleet_inspections');
    return saved ? JSON.parse(saved) : initialInspections;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLogbook[]>(() => {
    if (isNewVersion) return initialDailyLogs;
    const saved = localStorage.getItem('enerpack_fleet_dailylogs');
    return saved ? JSON.parse(saved) : initialDailyLogs;
  });

  const [incidents, setIncidents] = useState<FleetIncident[]>(() => {
    if (isNewVersion) return initialIncidents;
    const saved = localStorage.getItem('enerpack_fleet_incidents');
    return saved ? JSON.parse(saved) : initialIncidents;
  });

  const [activities, setActivities] = useState<FleetActivity[]>(() => {
    if (isNewVersion) return initialActivities;
    const saved = localStorage.getItem('enerpack_fleet_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (isNewVersion) return initialAuditLogs;
    const saved = localStorage.getItem('enerpack_fleet_auditlogs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [settings, setSettings] = useState<FleetSettings>(() => {
    if (isNewVersion) return initialSettings;
    const saved = localStorage.getItem('enerpack_fleet_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const { user, userProfile } = useAuth();

  const [role, setRole] = useState<FleetRole>(() => {
    if (userProfile?.role === 'SUPER_ADMIN') return 'Super Admin';
    if (userProfile?.role === 'ADMIN') return 'Admin';
    if (userProfile?.role === 'ACCOUNTANT') return 'Accountant';
    if (userProfile?.role === 'PRODUCTION_MANAGER') return 'Operations Manager';
    if (userProfile?.role === 'DRIVER') return 'Driver';
    const saved = localStorage.getItem('enerpack_fleet_role');
    return (saved as FleetRole) || 'Super Admin';
  });

  useEffect(() => {
    if (userProfile?.role) {
      if (userProfile.role === 'SUPER_ADMIN') setRole('Super Admin');
      else if (userProfile.role === 'ADMIN') setRole('Admin');
      else if (userProfile.role === 'ACCOUNTANT') setRole('Accountant');
      else if (userProfile.role === 'PRODUCTION_MANAGER') setRole('Operations Manager');
      else if (userProfile.role === 'DRIVER') setRole('Driver');
      else setRole('Staff');
    }
  }, [userProfile?.role]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [activeQuickModal, setActiveQuickModal] = useState<QuickModalType>(null);
  const [modalPrefillData, setModalPrefillData] = useState<any>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('enerpack_fleet_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_fuel', JSON.stringify(fuelEntries));
  }, [fuelEntries]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_dailylogs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_auditlogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('enerpack_fleet_role', role);
  }, [role]);

  const openQuickModal = (modal: QuickModalType, prefillData?: any) => {
    setModalPrefillData(prefillData || null);
    setActiveQuickModal(modal);
  };

  const closeQuickModal = () => {
    setActiveQuickModal(null);
    setModalPrefillData(null);
  };

  const updateSettings = (newSettings: Partial<FleetSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    setVehicles(initialVehicles);
    setDrivers(initialDrivers);
    setTrips(initialTrips);
    setFuelEntries(initialFuelEntries);
    setExpenses(initialFleetExpenses);
    setMaintenanceRecords(initialMaintenanceRecords);
    setDocuments(initialFleetDocuments);
    setInspections(initialInspections);
    setDailyLogs(initialDailyLogs);
    setIncidents(initialIncidents);
    setActivities(initialActivities);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    setRole('Super Admin');
  };

  const logActivity = (act: Omit<FleetActivity, 'id'>) => {
    const newAct: FleetActivity = {
      ...act,
      id: 'act-' + Date.now() + Math.random().toString(36).substring(2, 5)
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const logAudit = (aud: Omit<AuditLogEntry, 'id' | 'timestamp' | 'user'>) => {
    const now = new Date();
    const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: AuditLogEntry = {
      ...aud,
      id: 'aud-' + Date.now(),
      timestamp: formatted,
      user: `${role} User`
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Helper: check document expiry status based on current date (2026-08-30)
  const getDocumentExpiryStatus = (expiryDateStr?: string): DocumentStatus => {
    if (!expiryDateStr) return 'Valid';
    const now = new Date('2026-08-30');
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays <= settings.documentExpiryWarningDays) return 'Expiring Soon';
    return 'Valid';
  };

  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  const getDriverById = (id: string) => drivers.find(d => d.id === id);

  const getOverdueMaintenanceCount = () => {
    return vehicles.filter(v => {
      if (v.nextServiceOdometer && v.currentOdometer >= v.nextServiceOdometer) return true;
      if (v.nextServiceDate && new Date(v.nextServiceDate) <= new Date('2026-08-30')) return true;
      return false;
    }).length;
  };

  const getExpiringDocumentsCount = () => {
    return documents.filter(d => {
      const st = getDocumentExpiryStatus(d.expiryDate);
      return st === 'Expired' || st === 'Expiring Soon';
    }).length;
  };

  // CRUD Implementations
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: 'veh-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setVehicles(prev => [newVehicle, ...prev]);
    logActivity({
      date: '2026-08-30',
      time: '12:00 PM',
      vehicleId: newVehicle.id,
      vehicleNumber: newVehicle.number,
      activityType: 'Driver',
      title: `New Vehicle Added: ${newVehicle.number}`,
      description: `${newVehicle.name} (${newVehicle.type}) onboarded into Enerpack fleet.`,
      user: role
    });
    logAudit({
      module: 'Vehicles',
      action: 'CREATE',
      entityId: newVehicle.id,
      entityName: newVehicle.number,
      newValue: `${newVehicle.name} (${newVehicle.fuelType})`
    });
    if (user) {
      setDoc(doc(db, 'vehicles', newVehicle.id), newVehicle).catch(console.warn);
      logAuditEvent({
        action: 'Vehicle Record Modified',
        module: 'Fleet',
        recordId: newVehicle.id,
        newValue: `${newVehicle.number} (${newVehicle.name})`
      });
    }
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return v;
    }));
    const target = vehicles.find(v => v.id === id);
    if (target) {
      logAudit({
        module: 'Vehicles',
        action: 'UPDATE',
        entityId: id,
        entityName: target.number,
        newValue: JSON.stringify(updates)
      });
      if (user) {
        updateDoc(doc(db, 'vehicles', id), updates).catch(console.warn);
        logAuditEvent({
          action: 'Vehicle Record Modified',
          module: 'Fleet',
          recordId: id,
          newValue: JSON.stringify(updates)
        });
      }
    }
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (target) {
      logAudit({
        module: 'Vehicles',
        action: 'DELETE',
        entityId: id,
        entityName: target.number
      });
      if (user) {
        deleteDoc(doc(db, 'vehicles', id)).catch(console.warn);
        logAuditEvent({
          action: 'Vehicle Record Modified',
          module: 'Fleet',
          recordId: id,
          previousValue: target.number,
          newValue: 'Deleted'
        });
      }
    }
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: 'drv-' + Date.now(),
      totalTrips: 0,
      totalKm: 0
    };
    setDrivers(prev => [newDriver, ...prev]);
    logAudit({
      module: 'Drivers',
      action: 'CREATE',
      entityId: newDriver.id,
      entityName: newDriver.name,
      newValue: `Licence: ${newDriver.licenceNumber} (${newDriver.licenceType})`
    });
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    const target = drivers.find(d => d.id === id);
    if (target) {
      logAudit({
        module: 'Drivers',
        action: 'UPDATE',
        entityId: id,
        entityName: target.name,
        newValue: JSON.stringify(updates)
      });
    }
  };

  const deleteDriver = (id: string) => {
    const target = drivers.find(d => d.id === id);
    setDrivers(prev => prev.filter(d => d.id !== id));
    if (target) {
      logAudit({
        module: 'Drivers',
        action: 'DELETE',
        entityId: id,
        entityName: target.name
      });
    }
  };

  const addTrip = (tripData: Omit<Trip, 'id' | 'tripNumber' | 'createdAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: 'trp-' + Date.now(),
      tripNumber: 'TRP-2026-' + (trips.length + 100).toString(),
      distance: tripData.endOdometer > tripData.startOdometer ? tripData.endOdometer - tripData.startOdometer : 0,
      createdAt: new Date().toISOString()
    };
    setTrips(prev => [newTrip, ...prev]);

    // Update vehicle odometer and status if trip is in progress or completed
    if (tripData.status === 'In Progress') {
      updateVehicle(tripData.vehicleId, { currentStatus: 'In Trip' });
    } else if (tripData.status === 'Completed') {
      updateVehicle(tripData.vehicleId, { 
        currentOdometer: Math.max(tripData.endOdometer, tripData.startOdometer),
        currentStatus: 'Active' 
      });
    }

    logActivity({
      date: tripData.tripDate,
      time: tripData.startTime || '09:00 AM',
      vehicleId: tripData.vehicleId,
      vehicleNumber: tripData.vehicleNumber,
      activityType: 'Trip',
      title: `Trip ${newTrip.status}: ${tripData.startLocation} ➔ ${tripData.destination}`,
      description: `${newTrip.distance} KM | Driver: ${tripData.driverName} | Purpose: ${tripData.tripPurpose}`,
      user: role
    });

    logAudit({
      module: 'Trips',
      action: 'CREATE',
      entityId: newTrip.id,
      entityName: newTrip.tripNumber,
      newValue: `${tripData.startLocation} to ${tripData.destination} (${newTrip.distance} KM)`
    });

    return newTrip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(t => {
      if (t.id === id) {
        const distance = (updates.endOdometer ?? t.endOdometer) - (updates.startOdometer ?? t.startOdometer);
        return { ...t, ...updates, distance: distance > 0 ? distance : t.distance };
      }
      return t;
    }));
  };

  const startTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    updateTrip(id, { status: 'In Progress' });
    updateVehicle(trip.vehicleId, { currentStatus: 'In Trip' });
    logActivity({
      date: '2026-08-30',
      time: 'Live',
      vehicleId: trip.vehicleId,
      vehicleNumber: trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Started: ${trip.tripNumber}`,
      description: `Heading from ${trip.startLocation} to ${trip.destination}. Driver: ${trip.driverName}`,
      user: role
    });
  };

  const completeTrip = (id: string, endOdometer: number) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    const distance = Math.max(0, endOdometer - trip.startOdometer);
    updateTrip(id, { status: 'Completed', endOdometer, distance });
    updateVehicle(trip.vehicleId, { 
      currentOdometer: endOdometer,
      currentStatus: 'Active' 
    });
    logActivity({
      date: '2026-08-30',
      time: 'Live',
      vehicleId: trip.vehicleId,
      vehicleNumber: trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Completed: ${trip.tripNumber}`,
      description: `Distance logged: ${distance} KM | Final Odometer: ${endOdometer} KM`,
      user: role
    });
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const addFuelEntry = (entryData: Omit<FuelEntry, 'id' | 'createdAt'>) => {
    // Calculate mileage based on vehicle's previous fuel log or initial odometer
    const prevFuel = fuelEntries.filter(f => f.vehicleId === entryData.vehicleId).sort((a, b) => b.odometer - a.odometer)[0];
    const prevOdo = prevFuel ? prevFuel.odometer : (getVehicleById(entryData.vehicleId)?.initialOdometer || 0);
    const kmDiff = entryData.odometer > prevOdo ? entryData.odometer - prevOdo : 0;
    const calculatedMileage = (kmDiff > 0 && entryData.quantity > 0) ? Number((kmDiff / entryData.quantity).toFixed(1)) : undefined;
    const costPerKm = (kmDiff > 0 && entryData.totalAmount > 0) ? Number((entryData.totalAmount / kmDiff).toFixed(2)) : undefined;
    
    // Anomaly detection
    const veh = getVehicleById(entryData.vehicleId);
    let isAnomaly = false;
    let anomalyReason = '';
    if (veh && calculatedMileage && calculatedMileage < veh.expectedMileage * (1 - settings.mileageAnomalyDropPercent / 100)) {
      isAnomaly = true;
      anomalyReason = `Mileage (${calculatedMileage} km/l) dropped >${settings.mileageAnomalyDropPercent}% below expected (${veh.expectedMileage} km/l).`;
    }

    const newEntry: FuelEntry = {
      ...entryData,
      id: 'fl-' + Date.now(),
      calculatedMileage,
      costPerKm,
      isAnomaly,
      anomalyReason,
      createdAt: new Date().toISOString()
    };

    setFuelEntries(prev => [newEntry, ...prev]);

    // Auto sync vehicle odometer if higher
    if (settings.autoOdometerSync && veh && entryData.odometer > veh.currentOdometer) {
      updateVehicle(veh.id, { currentOdometer: entryData.odometer });
    }

    logActivity({
      date: entryData.date,
      time: entryData.time || '10:00 AM',
      vehicleId: entryData.vehicleId,
      vehicleNumber: entryData.vehicleNumber,
      activityType: 'Fuel',
      title: `Fuel Added: ${entryData.quantity} L ${entryData.fuelType}`,
      description: `${entryData.fuelStation} | ₹${entryData.totalAmount.toLocaleString()} | Odometer: ${entryData.odometer} KM`,
      amount: entryData.totalAmount,
      user: role
    });

    logAudit({
      module: 'Fuel',
      action: 'CREATE',
      entityId: newEntry.id,
      entityName: `${entryData.vehicleNumber} Fuel Refill`,
      newValue: `${entryData.quantity}L @ ₹${entryData.pricePerLitre}/L = ₹${entryData.totalAmount}`
    });

    return newEntry;
  };

  const updateFuelEntry = (id: string, updates: Partial<FuelEntry>) => {
    setFuelEntries(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFuelEntry = (id: string) => {
    setFuelEntries(prev => prev.filter(f => f.id !== id));
  };

  const addExpense = (expenseData: Omit<FleetExpense, 'id' | 'expenseNumber' | 'createdAt'>) => {
    const newExpense: FleetExpense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      expenseNumber: 'EXP-FLT-2026-' + (expenses.length + 50).toString(),
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);

    logActivity({
      date: expenseData.date,
      time: '11:00 AM',
      vehicleId: expenseData.vehicleId,
      vehicleNumber: expenseData.vehicleNumber,
      activityType: 'Expense',
      title: `Expense Logged: ₹${expenseData.amount.toLocaleString()} (${expenseData.category})`,
      description: `${expenseData.description} | Vendor: ${expenseData.vendor}`,
      amount: expenseData.amount,
      user: role
    });

    logAudit({
      module: 'Expenses',
      action: 'CREATE',
      entityId: newExpense.id,
      entityName: newExpense.expenseNumber,
      newValue: `${expenseData.category}: ₹${expenseData.amount} (${expenseData.status})`
    });

    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<FleetExpense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const updateExpenseStatus = (id: string, status: ExpenseApprovalStatus, reason?: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    const updates: Partial<FleetExpense> = {
      status,
      approvedBy: (status === 'Approved' || status === 'Paid') ? `${role}` : exp.approvedBy,
      approvalDate: (status === 'Approved' || status === 'Paid') ? '2026-08-30' : exp.approvalDate,
      rejectionReason: reason
    };
    updateExpense(id, updates);
    logAudit({
      module: 'Expenses',
      action: status === 'Approved' ? 'APPROVE' : status === 'Rejected' ? 'REJECT' : 'UPDATE',
      entityId: id,
      entityName: exp.expenseNumber,
      previousValue: exp.status,
      newValue: status,
      notes: reason
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id' | 'recordNumber' | 'createdAt'>) => {
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: 'mnt-' + Date.now(),
      recordNumber: 'SRV-2026-' + (maintenanceRecords.length + 40).toString(),
      createdAt: new Date().toISOString()
    };
    setMaintenanceRecords(prev => [newRecord, ...prev]);

    // Update vehicle maintenance milestones
    const veh = getVehicleById(recordData.vehicleId);
    if (veh) {
      updateVehicle(veh.id, {
        lastServiceDate: recordData.date,
        lastServiceOdometer: recordData.odometer,
        nextServiceDate: recordData.nextServiceDate || veh.nextServiceDate,
        nextServiceOdometer: recordData.nextServiceOdometer || (recordData.odometer + settings.serviceIntervalKm),
        currentStatus: recordData.status === 'In Progress' ? 'Maintenance' : 'Active'
      });
    }

    logActivity({
      date: recordData.date,
      time: '02:00 PM',
      vehicleId: recordData.vehicleId,
      vehicleNumber: recordData.vehicleNumber,
      activityType: recordData.serviceType === 'Body Repair' ? 'Repair' : 'Service',
      title: `${recordData.serviceType}: ${recordData.title}`,
      description: `Workshop: ${recordData.workshop} | Total Cost: ₹${recordData.totalCost.toLocaleString()}`,
      amount: recordData.totalCost,
      user: role
    });

    logAudit({
      module: 'Maintenance',
      action: 'CREATE',
      entityId: newRecord.id,
      entityName: newRecord.recordNumber,
      newValue: `${recordData.serviceType} @ ₹${recordData.totalCost}`
    });

    return newRecord;
  };

  const updateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(m => m.id !== id));
  };

  const addDocument = (docData: Omit<FleetDocument, 'id' | 'createdAt'>) => {
    const newDoc: FleetDocument = {
      ...docData,
      id: 'doc-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);

    // Update vehicle corresponding document expiry
    const vehUpdates: Partial<Vehicle> = {};
    if (docData.documentType === 'Insurance') vehUpdates.insuranceExpiry = docData.expiryDate;
    if (docData.documentType === 'PUC') vehUpdates.pucExpiry = docData.expiryDate;
    if (docData.documentType === 'Permit') vehUpdates.permitExpiry = docData.expiryDate;
    if (docData.documentType === 'Fitness Certificate') vehUpdates.fitnessExpiry = docData.expiryDate;
    if (docData.documentType === 'Road Tax') vehUpdates.taxExpiry = docData.expiryDate;
    updateVehicle(docData.vehicleId, vehUpdates);

    logActivity({
      date: '2026-08-30',
      time: '03:00 PM',
      vehicleId: docData.vehicleId,
      vehicleNumber: docData.vehicleNumber,
      activityType: 'Document',
      title: `Document Uploaded: ${docData.documentType}`,
      description: `Doc #: ${docData.documentNumber} | Valid until: ${docData.expiryDate}`,
      user: role
    });

    logAudit({
      module: 'Documents',
      action: 'CREATE',
      entityId: newDoc.id,
      entityName: `${docData.documentType} for ${docData.vehicleNumber}`,
      newValue: `Expiry: ${docData.expiryDate}`
    });

    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<FleetDocument>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addInspection = (inspData: Omit<InspectionChecklist, 'id' | 'createdAt'>) => {
    const newInsp: InspectionChecklist = {
      ...inspData,
      id: 'insp-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setInspections(prev => [newInsp, ...prev]);

    logActivity({
      date: inspData.date,
      time: '08:00 AM',
      vehicleId: inspData.vehicleId,
      vehicleNumber: inspData.vehicleNumber,
      activityType: 'Inspection',
      title: `Inspection Completed: ${inspData.overallStatus}`,
      description: `Driver ${inspData.driverName} completed vehicle checklist. Odometer: ${inspData.odometer} KM`,
      user: role
    });

    logAudit({
      module: 'Inspection',
      action: 'CREATE',
      entityId: newInsp.id,
      entityName: `Inspection ${inspData.vehicleNumber}`,
      newValue: `Result: ${inspData.overallStatus}`
    });

    return newInsp;
  };

  const updateInspection = (id: string, updates: Partial<InspectionChecklist>) => {
    setInspections(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addDailyLog = (logData: Omit<DailyLogbook, 'id' | 'createdAt'>) => {
    const newLog: DailyLogbook = {
      ...logData,
      id: 'log-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setDailyLogs(prev => [newLog, ...prev]);

    logActivity({
      date: logData.date,
      time: '08:00 PM',
      vehicleId: logData.vehicleId,
      vehicleNumber: logData.vehicleNumber,
      activityType: 'Trip',
      title: `Daily Logbook Submitted: ${logData.totalKm} KM`,
      description: `Driver: ${logData.driverName} | Trips: ${logData.tripsCount} | Condition: ${logData.vehicleCondition}`,
      user: role
    });

    return newLog;
  };

  const updateDailyLog = (id: string, updates: Partial<DailyLogbook>) => {
    setDailyLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const approveDailyLog = (id: string) => {
    updateDailyLog(id, { status: 'Approved', approvedBy: role });
  };

  const addIncident = (incData: Omit<FleetIncident, 'id' | 'incidentNumber' | 'createdAt'>) => {
    const newIncident: FleetIncident = {
      ...incData,
      id: 'inc-' + Date.now(),
      incidentNumber: 'INC-2026-' + (incidents.length + 10).toString(),
      createdAt: new Date().toISOString()
    };
    setIncidents(prev => [newIncident, ...prev]);

    logActivity({
      date: incData.date,
      time: incData.time || '12:00 PM',
      vehicleId: incData.vehicleId,
      vehicleNumber: incData.vehicleNumber,
      activityType: incData.incidentType === 'Breakdown' ? 'Breakdown' : 'Accident',
      title: `Incident Logged: ${incData.incidentType} (${incData.location})`,
      description: incData.description,
      amount: incData.estimatedCost,
      user: role
    });

    logAudit({
      module: 'Incidents',
      action: 'CREATE',
      entityId: newIncident.id,
      entityName: newIncident.incidentNumber,
      newValue: `${incData.incidentType}: ${incData.location}`
    });

    return newIncident;
  };

  const updateIncident = (id: string, updates: Partial<FleetIncident>) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        fuelEntries,
        expenses,
        maintenanceRecords,
        documents,
        inspections,
        dailyLogs,
        incidents,
        activities,
        auditLogs,
        settings,
        role,
        selectedVehicleId,
        selectedDriverId,
        activeQuickModal,
        modalPrefillData,
        setSelectedVehicleId,
        setSelectedDriverId,
        openQuickModal,
        closeQuickModal,
        setRole,
        updateSettings,
        resetAllData,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addTrip,
        updateTrip,
        startTrip,
        completeTrip,
        deleteTrip,
        addFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
        addExpense,
        updateExpense,
        updateExpenseStatus,
        deleteExpense,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        deleteMaintenanceRecord,
        addDocument,
        updateDocument,
        deleteDocument,
        addInspection,
        updateInspection,
        addDailyLog,
        updateDailyLog,
        approveDailyLog,
        addIncident,
        updateIncident,
        deleteIncident,
        logActivity,
        logAudit,
        getVehicleById,
        getDriverById,
        getDocumentExpiryStatus,
        getOverdueMaintenanceCount,
        getExpiringDocumentsCount
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
