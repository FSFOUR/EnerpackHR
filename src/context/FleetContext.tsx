import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { logAuditEvent } from '../lib/auditLogger';
import { 
  Vehicle, Driver, Trip, FuelEntry, FleetExpense, MaintenanceRecord, 
  FleetDocument, InspectionChecklist, DailyLogbook, FleetIncident, 
  FleetActivity, AuditLogEntry, FleetSettings, FleetRole, ExpenseApprovalStatus,
  TripStatus, ServiceStatus, DocumentStatus
} from '../types/fleet';
import { initialSettings } from '../data/fleetInitialData';

export type QuickModalType = 
  | 'addVehicle'
  | 'editVehicle'
  | 'addFuel'
  | 'addExpense'
  | 'newTrip'
  | 'scheduleService'
  | 'recordRepair'
  | 'addMaintenance'
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
  startTrip: (id: string, confirmedStartOdometer?: number) => void;
  completeTrip: (id: string, endOdometer: number) => void;
  acceptTrip: (id: string) => void;
  declineTrip: (id: string, reason?: string) => void;
  assignTrip: (id: string, driverId: string, driverName?: string) => void;
  reassignTrip: (id: string, newDriverId: string, newVehicleId?: string) => void;
  deleteTrip: (id: string) => void;

  addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'createdAt'>) => FuelEntry;
  updateFuelEntry: (id: string, updates: Partial<FuelEntry>) => void;
  deleteFuelEntry: (id: string) => void;

  addExpense: (expense: Omit<FleetExpense, 'id' | 'expenseNumber' | 'createdAt'>) => FleetExpense;
  updateExpense: (id: string, updates: Partial<FleetExpense>) => void;
  updateExpenseStatus: (id: string, status: ExpenseApprovalStatus, reason?: string) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string, reason?: string) => void;
  deleteExpense: (id: string) => void;

  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'recordNumber' | 'createdAt'>) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  completeMaintenance: (id: string) => void;
  deleteMaintenance: (id: string) => void;
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
  updateIncidentStatus: (id: string, status: any) => void;
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

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();

  // Clear legacy mock local storage
  useEffect(() => {
    try {
      localStorage.removeItem('enerpack_fleet_vehicles');
      localStorage.removeItem('enerpack_fleet_drivers');
      localStorage.removeItem('enerpack_fleet_trips');
      localStorage.removeItem('enerpack_fleet_fuel');
      localStorage.removeItem('enerpack_fleet_expenses');
      localStorage.removeItem('enerpack_fleet_maintenance');
      localStorage.removeItem('enerpack_fleet_documents');
      localStorage.removeItem('enerpack_fleet_inspections');
      localStorage.removeItem('enerpack_fleet_dailylogs');
      localStorage.removeItem('enerpack_fleet_incidents');
      localStorage.removeItem('enerpack_fleet_activities');
    } catch {
      // ignore
    }
  }, []);

  // Live state initialized to empty arrays (No mock data fallback)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [expenses, setExpenses] = useState<FleetExpense[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [documents, setDocuments] = useState<FleetDocument[]>([]);
  const [inspections, setInspections] = useState<InspectionChecklist[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLogbook[]>([]);
  const [incidents, setIncidents] = useState<FleetIncident[]>([]);
  const [activities, setActivities] = useState<FleetActivity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<FleetSettings>(initialSettings);

  const [role, setRole] = useState<FleetRole>(() => {
    if (userProfile?.role === 'SUPER_ADMIN') return 'Super Admin';
    if (userProfile?.role === 'ADMIN') return 'Admin';
    if (userProfile?.role === 'ACCOUNTANT') return 'Accountant';
    if (userProfile?.role === 'PRODUCTION_MANAGER') return 'Operations Manager';
    if (userProfile?.role === 'DRIVER') return 'Driver';
    return 'Super Admin';
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

  // Real-time Firestore Subscriptions for all Fleet collections
  useEffect(() => {
    if (!user) {
      setVehicles([]);
      setDrivers([]);
      setTrips([]);
      setFuelEntries([]);
      setExpenses([]);
      setMaintenanceRecords([]);
      setDocuments([]);
      setInspections([]);
      setDailyLogs([]);
      setIncidents([]);
      setActivities([]);
      return;
    }

    const unsubs = [
      onSnapshot(query(collection(db, 'vehicles')), (snap) => {
        const list: Vehicle[] = [];
        snap.forEach(d => list.push({ ...(d.data() as Vehicle), id: d.id }));
        setVehicles(list);
      }, (err) => console.warn('Vehicles listen error:', err)),

      onSnapshot(query(collection(db, 'drivers')), (snap) => {
        const list: Driver[] = [];
        snap.forEach(d => list.push({ ...(d.data() as Driver), id: d.id }));
        setDrivers(list);
      }, (err) => console.warn('Drivers listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleTrips')), (snap) => {
        const list: Trip[] = [];
        snap.forEach(d => list.push({ ...(d.data() as Trip), id: d.id }));
        setTrips(list.sort((a, b) => new Date(b.tripDate || 0).getTime() - new Date(a.tripDate || 0).getTime()));
      }, (err) => console.warn('Trips listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleFuel')), (snap) => {
        const list: FuelEntry[] = [];
        snap.forEach(d => list.push({ ...(d.data() as FuelEntry), id: d.id }));
        setFuelEntries(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      }, (err) => console.warn('Fuel listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleExpenses')), (snap) => {
        const list: FleetExpense[] = [];
        snap.forEach(d => list.push({ ...(d.data() as FleetExpense), id: d.id }));
        setExpenses(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      }, (err) => console.warn('Expenses listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleMaintenance')), (snap) => {
        const list: MaintenanceRecord[] = [];
        snap.forEach(d => list.push({ ...(d.data() as MaintenanceRecord), id: d.id }));
        setMaintenanceRecords(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      }, (err) => console.warn('Maintenance listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleDocuments')), (snap) => {
        const list: FleetDocument[] = [];
        snap.forEach(d => list.push({ ...(d.data() as FleetDocument), id: d.id }));
        setDocuments(list);
      }, (err) => console.warn('Documents listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleInspections')), (snap) => {
        const list: InspectionChecklist[] = [];
        snap.forEach(d => list.push({ ...(d.data() as InspectionChecklist), id: d.id }));
        setInspections(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      }, (err) => console.warn('Inspections listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleDailyLogs')), (snap) => {
        const list: DailyLogbook[] = [];
        snap.forEach(d => list.push({ ...(d.data() as DailyLogbook), id: d.id }));
        setDailyLogs(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      }, (err) => console.warn('DailyLogs listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleIncidents')), (snap) => {
        const list: FleetIncident[] = [];
        snap.forEach(d => list.push({ ...(d.data() as FleetIncident), id: d.id }));
        setIncidents(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      }, (err) => console.warn('Incidents listen error:', err)),

      onSnapshot(query(collection(db, 'vehicleActivities')), (snap) => {
        const list: FleetActivity[] = [];
        snap.forEach(d => list.push({ ...(d.data() as FleetActivity), id: d.id }));
        setActivities(list.slice(0, 30));
      }, (err) => console.warn('Activities listen error:', err)),
    ];

    return () => {
      unsubs.forEach(u => u());
    };
  }, [user]);

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
    // Resetting simply clears any active selections
    setSelectedVehicleId(null);
    setSelectedDriverId(null);
  };

  const logActivity = (act: Omit<FleetActivity, 'id'>) => {
    const actId = 'act-' + Date.now();
    const newAct: FleetActivity = { ...act, id: actId };
    setDoc(doc(db, 'vehicleActivities', actId), newAct).catch(console.warn);
  };

  const logAudit = (aud: Omit<AuditLogEntry, 'id' | 'timestamp' | 'user'>) => {
    logAuditEvent({
      module: 'Fleet',
      action: `${aud.module} ${aud.action}`,
      recordId: aud.entityId,
      newValue: aud.newValue || aud.entityName || ''
    });
  };

  const getDocumentExpiryStatus = (expiryDateStr?: string): DocumentStatus => {
    if (!expiryDateStr) return 'Valid';
    const now = new Date();
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
    const nowStr = new Date().toISOString().slice(0, 10);
    return vehicles.filter(v => {
      if (v.nextServiceOdometer && v.currentOdometer >= v.nextServiceOdometer) return true;
      if (v.nextServiceDate && v.nextServiceDate <= nowStr) return true;
      return false;
    }).length;
  };

  const getExpiringDocumentsCount = () => {
    return documents.filter(d => {
      const st = getDocumentExpiryStatus(d.expiryDate);
      return st === 'Expired' || st === 'Expiring Soon';
    }).length;
  };

  // CRUD Operations with direct Firestore persistence
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newId = 'veh-' + Date.now();
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    setDoc(doc(db, 'vehicles', newId), newVehicle).catch(console.warn);

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: newVehicle.id,
      vehicleNumber: newVehicle.number,
      activityType: 'Driver',
      title: `New Vehicle Added: ${newVehicle.number}`,
      description: `${newVehicle.name} (${newVehicle.type}) registered in Enerpack Fleet.`,
      user: role
    });

    logAuditEvent({
      action: 'Vehicle Record Created',
      module: 'Fleet',
      recordId: newVehicle.id,
      newValue: `${newVehicle.number} (${newVehicle.name})`
    });

    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    const vehDocRef = doc(db, 'vehicles', id);
    const updatedPayload = { ...updates, updatedAt: new Date().toISOString() };
    updateDoc(vehDocRef, updatedPayload).catch(console.warn);

    const target = vehicles.find(v => v.id === id);
    logAuditEvent({
      action: 'Vehicle Record Modified',
      module: 'Fleet',
      recordId: id,
      previousValue: target?.number,
      newValue: JSON.stringify(updates)
    });
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find(v => v.id === id);
    deleteDoc(doc(db, 'vehicles', id)).catch(console.warn);

    logAuditEvent({
      action: 'Vehicle Record Deleted',
      module: 'Fleet',
      recordId: id,
      previousValue: target?.number || id,
      newValue: 'Deleted'
    });
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newId = 'drv-' + Date.now();
    const newDriver: Driver = {
      ...driverData,
      id: newId,
      totalTrips: 0,
      totalKm: 0
    };

    setDoc(doc(db, 'drivers', newId), newDriver).catch(console.warn);

    logAuditEvent({
      action: 'Driver Added',
      module: 'Fleet',
      recordId: newId,
      newValue: `${newDriver.name} (License: ${newDriver.licenceNumber})`
    });

    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    updateDoc(doc(db, 'drivers', id), updates).catch(console.warn);
    logAuditEvent({
      action: 'Driver Updated',
      module: 'Fleet',
      recordId: id,
      newValue: JSON.stringify(updates)
    });
  };

  const deleteDriver = (id: string) => {
    const target = drivers.find(d => d.id === id);
    deleteDoc(doc(db, 'drivers', id)).catch(console.warn);
    logAuditEvent({
      action: 'Driver Deleted',
      module: 'Fleet',
      recordId: id,
      previousValue: target?.name || id,
      newValue: 'Deleted'
    });
  };

  const addTrip = (tripData: Omit<Trip, 'id' | 'tripNumber' | 'createdAt'>) => {
    const newId = 'trp-' + Date.now();
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      tripNumber: 'TRP-' + Date.now().toString().slice(-6),
      distance: tripData.endOdometer > tripData.startOdometer ? tripData.endOdometer - tripData.startOdometer : 0,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleTrips', newId), newTrip).catch(console.warn);

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
      description: `${newTrip.distance} KM | Driver: ${tripData.driverName}`,
      user: role
    });

    logAuditEvent({
      action: 'Trip Logged',
      module: 'Fleet',
      recordId: newId,
      newValue: `${newTrip.tripNumber}: ${tripData.startLocation} to ${tripData.destination}`
    });

    return newTrip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    updateDoc(doc(db, 'vehicleTrips', id), updates).catch(console.warn);
  };

  const startTrip = (id: string, confirmedStartOdometer?: number) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    const startOdo = confirmedStartOdometer !== undefined && confirmedStartOdometer >= 0 
      ? confirmedStartOdometer 
      : trip.startOdometer;

    const updates: Partial<Trip> = {
      status: 'In Progress',
      startOdometer: startOdo,
      startedAt: new Date().toISOString()
    };
    updateTrip(id, updates);
    updateVehicle(trip.vehicleId, { 
      currentStatus: 'In Trip',
      currentOdometer: startOdo
    });

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: trip.vehicleId,
      vehicleNumber: trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Started: ${trip.tripNumber}`,
      description: `Driver ${trip.driverName} departed from ${trip.startLocation} to ${trip.destination} (Confirmed Odometer: ${startOdo.toLocaleString()} KM).`,
      user: role
    });

    logAuditEvent({
      action: 'Trip Started',
      module: 'Fleet',
      recordId: id,
      newValue: `Status: In Progress | Start Odo: ${startOdo} KM`
    });
  };

  const completeTrip = (id: string, endOdometer: number) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    const distance = Math.max(0, endOdometer - trip.startOdometer);
    const nowIso = new Date().toISOString();

    updateTrip(id, { 
      status: 'Completed', 
      endOdometer, 
      distance,
      completedAt: nowIso
    });
    updateVehicle(trip.vehicleId, { 
      currentOdometer: endOdometer,
      currentStatus: 'Active' 
    });

    // Update driver cumulative stats
    const drv = drivers.find(d => d.id === trip.driverId);
    if (drv) {
      updateDriver(drv.id, {
        totalTrips: (drv.totalTrips || 0) + 1,
        totalKm: (drv.totalKm || 0) + distance
      });
    }

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: trip.vehicleId,
      vehicleNumber: trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Completed: ${trip.tripNumber}`,
      description: `Destination ${trip.destination} reached. Distance: ${distance} KM. Final Odometer: ${endOdometer.toLocaleString()} KM.`,
      user: role
    });

    logAuditEvent({
      action: 'Trip Completed',
      module: 'Fleet',
      recordId: id,
      newValue: `Distance: ${distance} KM | Final Odometer: ${endOdometer} KM`
    });
  };

  const acceptTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    updateTrip(id, { 
      status: 'Accepted',
      acceptedAt: new Date().toISOString()
    });

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: trip.vehicleId,
      vehicleNumber: trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Accepted: ${trip.tripNumber}`,
      description: `Driver ${trip.driverName} accepted assignment to ${trip.destination}.`,
      user: role
    });
  };

  const declineTrip = (id: string, reason?: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    const finalReason = reason || 'Declined by driver';
    updateTrip(id, { 
      status: 'Declined',
      declineReason: finalReason,
      declinedAt: new Date().toISOString()
    });

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: trip.vehicleId,
      vehicleNumber: trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Declined: ${trip.tripNumber}`,
      description: `Driver ${trip.driverName} declined trip to ${trip.destination}. Reason: ${finalReason}. Dispatch reassignment required.`,
      user: role
    });

    logAuditEvent({
      action: 'Trip Declined',
      module: 'Fleet',
      recordId: id,
      newValue: `Reason: ${finalReason}`
    });
  };

  const assignTrip = (id: string, driverId: string, driverName?: string) => {
    const drv = drivers.find(d => d.id === driverId);
    const resolvedName = driverName || drv?.name || 'Assigned Driver';
    updateTrip(id, {
      driverId,
      driverName: resolvedName,
      status: 'Assigned',
      assignedAt: new Date().toISOString(),
      declineReason: undefined,
      declinedAt: undefined
    });

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: '',
      vehicleNumber: '',
      activityType: 'Trip',
      title: `Trip Assigned to ${resolvedName}`,
      description: `Trip dispatch assigned to driver ${resolvedName}. Awaiting driver acceptance.`,
      user: role
    });
  };

  const reassignTrip = (id: string, newDriverId: string, newVehicleId?: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    const newDrv = drivers.find(d => d.id === newDriverId);
    const newVeh = newVehicleId ? vehicles.find(v => v.id === newVehicleId) : undefined;

    const updates: Partial<Trip> = {
      driverId: newDriverId,
      driverName: newDrv?.name || trip.driverName,
      status: 'Assigned',
      assignedAt: new Date().toISOString(),
      declineReason: undefined,
      declinedAt: undefined
    };

    if (newVeh) {
      updates.vehicleId = newVeh.id;
      updates.vehicleNumber = newVeh.number;
      updates.startOdometer = newVeh.currentOdometer;
    }

    updateTrip(id, updates);

    logActivity({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleId: updates.vehicleId || trip.vehicleId,
      vehicleNumber: updates.vehicleNumber || trip.vehicleNumber,
      activityType: 'Trip',
      title: `Trip Reassigned: ${trip.tripNumber}`,
      description: `Reassigned to driver ${updates.driverName}${newVeh ? ` with vehicle ${newVeh.number}` : ''}.`,
      user: role
    });
  };

  const deleteTrip = (id: string) => {
    deleteDoc(doc(db, 'vehicleTrips', id)).catch(console.warn);
  };

  const addFuelEntry = (entryData: Omit<FuelEntry, 'id' | 'createdAt'>) => {
    const newId = 'fl-' + Date.now();
    const prevFuel = fuelEntries.filter(f => f.vehicleId === entryData.vehicleId).sort((a, b) => b.odometer - a.odometer)[0];
    const prevOdo = prevFuel ? prevFuel.odometer : (getVehicleById(entryData.vehicleId)?.initialOdometer || 0);
    const kmDiff = entryData.odometer > prevOdo ? entryData.odometer - prevOdo : 0;
    const calculatedMileage = (kmDiff > 0 && entryData.quantity > 0) ? Number((kmDiff / entryData.quantity).toFixed(1)) : undefined;
    const costPerKm = (kmDiff > 0 && entryData.totalAmount > 0) ? Number((entryData.totalAmount / kmDiff).toFixed(2)) : undefined;

    const newEntry: FuelEntry = {
      ...entryData,
      id: newId,
      calculatedMileage,
      costPerKm,
      isAnomaly: false,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleFuel', newId), newEntry).catch(console.warn);

    const veh = getVehicleById(entryData.vehicleId);
    if (veh && entryData.odometer > veh.currentOdometer) {
      updateVehicle(veh.id, { currentOdometer: entryData.odometer });
    }

    logAuditEvent({
      action: 'Fuel Entry Logged',
      module: 'Fleet',
      recordId: newId,
      newValue: `${entryData.vehicleNumber}: ${entryData.quantity}L @ ₹${entryData.totalAmount}`
    });

    return newEntry;
  };

  const updateFuelEntry = (id: string, updates: Partial<FuelEntry>) => {
    updateDoc(doc(db, 'vehicleFuel', id), updates).catch(console.warn);
  };

  const deleteFuelEntry = (id: string) => {
    deleteDoc(doc(db, 'vehicleFuel', id)).catch(console.warn);
  };

  const addExpense = (expenseData: Omit<FleetExpense, 'id' | 'expenseNumber' | 'createdAt'>) => {
    const newId = 'exp-' + Date.now();
    const newExpense: FleetExpense = {
      ...expenseData,
      id: newId,
      expenseNumber: 'EXP-FLT-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleExpenses', newId), newExpense).catch(console.warn);

    logAuditEvent({
      action: 'Expense Created',
      module: 'Fleet',
      recordId: newId,
      newValue: `${expenseData.vehicleNumber} - ${expenseData.category}: ₹${expenseData.amount}`
    });

    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<FleetExpense>) => {
    updateDoc(doc(db, 'vehicleExpenses', id), updates).catch(console.warn);
  };

  const updateExpenseStatus = (id: string, status: ExpenseApprovalStatus, reason?: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    const updates: Partial<FleetExpense> = {
      status,
      approvedBy: (status === 'Approved' || status === 'Paid') ? role : exp.approvedBy,
      approvalDate: (status === 'Approved' || status === 'Paid') ? new Date().toISOString().slice(0, 10) : exp.approvalDate,
      rejectionReason: reason
    };
    updateExpense(id, updates);
    logAuditEvent({
      action: `Expense ${status}`,
      module: 'Fleet',
      recordId: id,
      previousValue: exp.status,
      newValue: status
    });
  };

  const approveExpense = (id: string) => {
    updateExpenseStatus(id, 'Approved');
  };

  const rejectExpense = (id: string, reason?: string) => {
    updateExpenseStatus(id, 'Rejected', reason);
  };

  const deleteExpense = (id: string) => {
    deleteDoc(doc(db, 'vehicleExpenses', id)).catch(console.warn);
  };

  const addMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id' | 'recordNumber' | 'createdAt'>) => {
    const newId = 'mnt-' + Date.now();
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: newId,
      recordNumber: 'SRV-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleMaintenance', newId), newRecord).catch(console.warn);

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

    logAuditEvent({
      action: 'Maintenance Scheduled/Recorded',
      module: 'Fleet',
      recordId: newId,
      newValue: `${recordData.vehicleNumber}: ${recordData.serviceType} (₹${recordData.totalCost})`
    });

    return newRecord;
  };

  const updateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    updateDoc(doc(db, 'vehicleMaintenance', id), updates).catch(console.warn);
  };

  const completeMaintenance = (id: string) => {
    updateMaintenanceRecord(id, { status: 'Completed' as any });
  };

  const deleteMaintenance = (id: string) => {
    deleteDoc(doc(db, 'vehicleMaintenance', id)).catch(console.warn);
  };

  const deleteMaintenanceRecord = (id: string) => {
    deleteDoc(doc(db, 'vehicleMaintenance', id)).catch(console.warn);
  };

  const addDocument = (docData: Omit<FleetDocument, 'id' | 'createdAt'>) => {
    const newId = 'doc-' + Date.now();
    const newDoc: FleetDocument = {
      ...docData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleDocuments', newId), newDoc).catch(console.warn);

    const vehUpdates: Partial<Vehicle> = {};
    if (docData.documentType === 'Insurance') vehUpdates.insuranceExpiry = docData.expiryDate;
    if (docData.documentType === 'PUC') vehUpdates.pucExpiry = docData.expiryDate;
    if (docData.documentType === 'Permit') vehUpdates.permitExpiry = docData.expiryDate;
    if (docData.documentType === 'Fitness Certificate') vehUpdates.fitnessExpiry = docData.expiryDate;
    if (docData.documentType === 'Road Tax') vehUpdates.taxExpiry = docData.expiryDate;
    if (Object.keys(vehUpdates).length > 0) {
      updateVehicle(docData.vehicleId, vehUpdates);
    }

    logAuditEvent({
      action: 'Vehicle Document Added',
      module: 'Fleet',
      recordId: newId,
      newValue: `${docData.vehicleNumber}: ${docData.documentType} (${docData.documentNumber})`
    });

    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<FleetDocument>) => {
    updateDoc(doc(db, 'vehicleDocuments', id), updates).catch(console.warn);
  };

  const deleteDocument = (id: string) => {
    deleteDoc(doc(db, 'vehicleDocuments', id)).catch(console.warn);
  };

  const addInspection = (inspData: Omit<InspectionChecklist, 'id' | 'createdAt'>) => {
    const newId = 'insp-' + Date.now();
    const newInsp: InspectionChecklist = {
      ...inspData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleInspections', newId), newInsp).catch(console.warn);

    logAuditEvent({
      action: 'Inspection Submitted',
      module: 'Fleet',
      recordId: newId,
      newValue: `${inspData.vehicleNumber}: ${inspData.overallStatus}`
    });

    return newInsp;
  };

  const updateInspection = (id: string, updates: Partial<InspectionChecklist>) => {
    updateDoc(doc(db, 'vehicleInspections', id), updates).catch(console.warn);
  };

  const addDailyLog = (logData: Omit<DailyLogbook, 'id' | 'createdAt'>) => {
    const newId = 'log-' + Date.now();
    const newLog: DailyLogbook = {
      ...logData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleDailyLogs', newId), newLog).catch(console.warn);
    return newLog;
  };

  const updateDailyLog = (id: string, updates: Partial<DailyLogbook>) => {
    updateDoc(doc(db, 'vehicleDailyLogs', id), updates).catch(console.warn);
  };

  const approveDailyLog = (id: string) => {
    updateDailyLog(id, { status: 'Approved', approvedBy: role });
  };

  const addIncident = (incData: Omit<FleetIncident, 'id' | 'incidentNumber' | 'createdAt'>) => {
    const newId = 'inc-' + Date.now();
    const newIncident: FleetIncident = {
      ...incData,
      id: newId,
      incidentNumber: 'INC-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'vehicleIncidents', newId), newIncident).catch(console.warn);

    logAuditEvent({
      action: 'Incident Reported',
      module: 'Fleet',
      recordId: newId,
      newValue: `${incData.vehicleNumber}: ${incData.incidentType} (${incData.location})`
    });

    return newIncident;
  };

  const updateIncident = (id: string, updates: Partial<FleetIncident>) => {
    updateDoc(doc(db, 'vehicleIncidents', id), updates).catch(console.warn);
  };

  const updateIncidentStatus = (id: string, status: any) => {
    updateIncident(id, { status });
  };

  const deleteIncident = (id: string) => {
    deleteDoc(doc(db, 'vehicleIncidents', id)).catch(console.warn);
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
        acceptTrip,
        declineTrip,
        assignTrip,
        reassignTrip,
        deleteTrip,
        addFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
        addExpense,
        updateExpense,
        updateExpenseStatus,
        approveExpense,
        rejectExpense,
        deleteExpense,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        completeMaintenance,
        deleteMaintenance,
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
        updateIncidentStatus,
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
