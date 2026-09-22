import { Vehicle, Driver, Trip, MaintenanceRecord, FleetIncident } from '../types/fleet';

export interface TripConflict {
  id: string;
  type: 
    | 'vehicle_active_trip' 
    | 'driver_active_trip' 
    | 'vehicle_maintenance' 
    | 'driver_license_expired' 
    | 'driver_inactive' 
    | 'vehicle_schedule_overlap' 
    | 'driver_schedule_overlap' 
    | 'service_milestone_overdue' 
    | 'driver_license_expiring';
  severity: 'critical' | 'warning';
  title: string;
  message: string;
}

export interface TripConflictValidationResult {
  hasCriticalConflict: boolean;
  hasWarnings: boolean;
  conflicts: TripConflict[];
  criticalCount: number;
  warningCount: number;
}

interface ValidateTripAssignmentParams {
  vehicleId: string;
  driverId: string;
  tripDate?: string;
  excludeTripId?: string;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceRecords?: MaintenanceRecord[];
  incidents?: FleetIncident[];
}

/**
 * Validates vehicle and driver assignment against active trips, maintenance, 
 * schedule overlaps, duty availability, and license expiration.
 */
export function validateTripAssignment({
  vehicleId,
  driverId,
  tripDate = new Date().toISOString().slice(0, 10),
  excludeTripId,
  vehicles,
  drivers,
  trips,
  maintenanceRecords = [],
  incidents = []
}: ValidateTripAssignmentParams): TripConflictValidationResult {
  const conflicts: TripConflict[] = [];

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  // -------------------------------------------------------------
  // 1. VEHICLE CONFLICTS
  // -------------------------------------------------------------
  if (selectedVehicle) {
    // 1a. Vehicle already on an active trip (In Progress)
    const activeVehicleTrip = trips.find(
      t => t.vehicleId === vehicleId && 
           (t.status === 'In Progress' || (t.status as string) === 'IN_PROGRESS') && 
           t.id !== excludeTripId
    );

    if (activeVehicleTrip || selectedVehicle.currentStatus === 'In Trip') {
      conflicts.push({
        id: 'veh-active-trip',
        type: 'vehicle_active_trip',
        severity: 'critical',
        title: 'Vehicle Currently on Road',
        message: `Vehicle ${selectedVehicle.number} (${selectedVehicle.name}) is currently on an active trip${activeVehicleTrip ? ` (${activeVehicleTrip.tripNumber} to ${activeVehicleTrip.destination})` : ''}. Cannot dispatch another trip simultaneously.`
      });
    }

    // 1b. Vehicle has open critical maintenance or is under repair
    const openMaintenance = maintenanceRecords.find(
      m => m.vehicleId === vehicleId && 
           (m.status === 'In Progress' || m.status === 'Scheduled')
    );

    if (selectedVehicle.currentStatus === 'Maintenance' || openMaintenance) {
      const isUrgent = selectedVehicle.currentStatus === 'Maintenance' || 
                       openMaintenance?.status === 'In Progress' ||
                       openMaintenance?.serviceType === 'Body Repair' ||
                       openMaintenance?.serviceType === 'Engine' ||
                       openMaintenance?.serviceType === 'Brake';

      conflicts.push({
        id: 'veh-maintenance',
        type: 'vehicle_maintenance',
        severity: isUrgent ? 'critical' : 'warning',
        title: isUrgent ? 'Vehicle In Maintenance / Repair' : 'Scheduled Maintenance Pending',
        message: openMaintenance 
          ? `Vehicle ${selectedVehicle.number} has active maintenance: "${openMaintenance.title}" (${openMaintenance.status}, Service: ${openMaintenance.serviceType}).`
          : `Vehicle ${selectedVehicle.number} operational status is currently set to "Maintenance".`
      });
    }

    // 1c. Vehicle has unresolved severe/major incident (Accident, Breakdown, Fire, Mechanical Failure)
    const severeIncident = incidents.find(
      i => i.vehicleId === vehicleId && 
           (i.status === 'Reported' || i.status === 'Under Investigation') && 
           ['Accident', 'Breakdown', 'Fire', 'Mechanical Failure'].includes(i.incidentType)
    );
    if (severeIncident) {
      conflicts.push({
        id: 'veh-incident',
        type: 'vehicle_maintenance',
        severity: 'critical',
        title: `Open Vehicle Incident (${severeIncident.incidentType})`,
        message: `Vehicle ${selectedVehicle.number} has an open incident record (${severeIncident.incidentNumber}: ${severeIncident.description.slice(0, 80)}...). Vehicle grounded pending safety clearance.`
      });
    }

    // 1d. Vehicle overdue for service milestone
    if (selectedVehicle.nextServiceOdometer && selectedVehicle.currentOdometer >= selectedVehicle.nextServiceOdometer) {
      conflicts.push({
        id: 'veh-service-overdue',
        type: 'service_milestone_overdue',
        severity: 'warning',
        title: 'Service Milestone Overdue',
        message: `Vehicle ${selectedVehicle.number} current odometer (${selectedVehicle.currentOdometer.toLocaleString()} KM) exceeds the scheduled service milestone (${selectedVehicle.nextServiceOdometer.toLocaleString()} KM).`
      });
    }

    // 1e. Vehicle overlapping scheduled trip on the same date
    const sameDayVehicleTrip = trips.find(
      t => t.vehicleId === vehicleId && 
           t.tripDate === tripDate && 
           ['Planned', 'Assigned', 'Accepted'].includes(t.status) && 
           t.id !== excludeTripId
    );
    if (sameDayVehicleTrip) {
      conflicts.push({
        id: 'veh-schedule-overlap',
        type: 'vehicle_schedule_overlap',
        severity: 'warning',
        title: 'Vehicle Schedule Overlap',
        message: `Vehicle ${selectedVehicle.number} already has a scheduled trip on ${tripDate} (${sameDayVehicleTrip.tripNumber}: ${sameDayVehicleTrip.startLocation} ➔ ${sameDayVehicleTrip.destination} @ ${sameDayVehicleTrip.startTime || 'scheduled'}).`
      });
    }
  }

  // -------------------------------------------------------------
  // 2. DRIVER CONFLICTS
  // -------------------------------------------------------------
  if (selectedDriver) {
    // 2a. Driver currently on an active trip (In Progress)
    const activeDriverTrip = trips.find(
      t => t.driverId === driverId && 
           (t.status === 'In Progress' || (t.status as string) === 'IN_PROGRESS') && 
           t.id !== excludeTripId
    );

    if (activeDriverTrip) {
      conflicts.push({
        id: 'drv-active-trip',
        type: 'driver_active_trip',
        severity: 'critical',
        title: 'Driver Already on Active Journey',
        message: `Driver ${selectedDriver.name} is currently driving trip ${activeDriverTrip.tripNumber} (${activeDriverTrip.vehicleNumber} to ${activeDriverTrip.destination}). Cannot accept a concurrent assignment.`
      });
    }

    // 2b. Driver Duty Status (On Leave, Suspended, Inactive)
    if (selectedDriver.status !== 'Active') {
      conflicts.push({
        id: 'drv-inactive-status',
        type: 'driver_inactive',
        severity: 'critical',
        title: `Driver is ${selectedDriver.status}`,
        message: `Driver ${selectedDriver.name} is currently listed as "${selectedDriver.status}". Assignments are restricted to Active personnel.`
      });
    }

    // 2c. Driver's License Expiration Check
    if (selectedDriver.licenceExpiry) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(selectedDriver.licenceExpiry);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        conflicts.push({
          id: 'drv-lic-expired',
          type: 'driver_license_expired',
          severity: 'critical',
          title: 'Driver License Expired',
          message: `Driver ${selectedDriver.name}'s license (${selectedDriver.licenceNumber}, ${selectedDriver.licenceType}) expired on ${selectedDriver.licenceExpiry} (${Math.abs(diffDays)} days ago). Driving is prohibited by transport safety regulations.`
        });
      } else if (diffDays <= 15) {
        conflicts.push({
          id: 'drv-lic-expiring-soon',
          type: 'driver_license_expiring',
          severity: 'warning',
          title: 'Driver License Expiring Soon',
          message: `Driver ${selectedDriver.name}'s license expires in ${diffDays} days (${selectedDriver.licenceExpiry}). Ensure renewal is processed promptly.`
        });
      }
    }

    // 2d. Driver scheduled overlap on same date
    const sameDayDriverTrip = trips.find(
      t => t.driverId === driverId && 
           t.tripDate === tripDate && 
           ['Planned', 'Assigned', 'Accepted'].includes(t.status) && 
           t.id !== excludeTripId
    );
    if (sameDayDriverTrip) {
      conflicts.push({
        id: 'drv-schedule-overlap',
        type: 'driver_schedule_overlap',
        severity: 'warning',
        title: 'Driver Schedule Overlap',
        message: `Driver ${selectedDriver.name} already has trip ${sameDayDriverTrip.tripNumber} (${sameDayDriverTrip.destination}) scheduled for ${tripDate}. Check departure time windows.`
      });
    }
  }

  const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
  const warningCount = conflicts.filter(c => c.severity === 'warning').length;

  return {
    hasCriticalConflict: criticalCount > 0,
    hasWarnings: warningCount > 0,
    conflicts,
    criticalCount,
    warningCount
  };
}
