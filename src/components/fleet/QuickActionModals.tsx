import React, { useState, useEffect } from 'react';
import { 
  X, Fuel, MapPin, Wrench, Receipt, FileText, Activity, 
  AlertOctagon, Plus, CheckCircle2, AlertTriangle, ShieldCheck, 
  Upload, UserPlus, CarFront, Check
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { 
  VehicleType, FuelType, VehicleStatus, OwnershipType,
  PaymentMethod, ExpenseCategory, ExpenseApprovalStatus,
  ServiceType, DocumentType, LicenceType, InspectionItemStatus,
  IncidentType
} from '../../types/fleet';
import { cn } from '../../lib/utils';

export const QuickActionModals: React.FC = () => {
  const { 
    activeQuickModal, closeQuickModal, modalPrefillData,
    vehicles, drivers, addVehicle, updateVehicle,
    addFuelEntry, addExpense, addTrip, addMaintenanceRecord,
    addDocument, addInspection, addIncident, addDriver, addDailyLog
  } = useFleet();

  if (!activeQuickModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      {activeQuickModal === 'addVehicle' && <VehicleFormModal isEdit={false} />}
      {activeQuickModal === 'editVehicle' && <VehicleFormModal isEdit={true} initialData={modalPrefillData} />}
      {activeQuickModal === 'addFuel' && <FuelModal prefill={modalPrefillData} />}
      {activeQuickModal === 'addExpense' && <ExpenseModal prefill={modalPrefillData} />}
      {activeQuickModal === 'newTrip' && <TripModal prefill={modalPrefillData} />}
      {activeQuickModal === 'scheduleService' && <MaintenanceModal prefill={modalPrefillData} isRepair={false} />}
      {activeQuickModal === 'recordRepair' && <MaintenanceModal prefill={modalPrefillData} isRepair={true} />}
      {activeQuickModal === 'uploadDocument' && <DocumentModal prefill={modalPrefillData} />}
      {activeQuickModal === 'inspection' && <InspectionModal prefill={modalPrefillData} />}
      {activeQuickModal === 'reportIncident' && <IncidentModal prefill={modalPrefillData} />}
      {activeQuickModal === 'addDriver' && <DriverModal prefill={modalPrefillData} />}
      {activeQuickModal === 'dailyLog' && <DailyLogModal prefill={modalPrefillData} />}
    </div>
  );
};

/* ================= VEHICLE FORM MODAL ================= */
const VehicleFormModal: React.FC<{ isEdit?: boolean; initialData?: any }> = ({ isEdit, initialData }) => {
  const { closeQuickModal, addVehicle, updateVehicle, drivers } = useFleet();
  
  const [formData, setFormData] = useState({
    number: initialData?.number || '',
    name: initialData?.name || '',
    type: (initialData?.type || 'Car') as VehicleType,
    category: initialData?.category || 'Executive Sedan',
    make: initialData?.make || '',
    model: initialData?.model || '',
    variant: initialData?.variant || '',
    manufacturingYear: initialData?.manufacturingYear || 2023,
    purchaseDate: initialData?.purchaseDate || '2023-01-01',
    purchasePrice: initialData?.purchasePrice || 850000,
    currentStatus: (initialData?.currentStatus || 'Active') as VehicleStatus,
    fuelType: (initialData?.fuelType || 'Petrol') as FuelType,
    tankCapacity: initialData?.tankCapacity || 45,
    expectedMileage: initialData?.expectedMileage || 14.0,
    initialOdometer: initialData?.initialOdometer || 0,
    currentOdometer: initialData?.currentOdometer || 0,
    ownership: (initialData?.ownership || 'Company Owned') as OwnershipType,
    primaryDriverId: initialData?.primaryDriverId || '',
    department: initialData?.department || 'Operations',
    responsibleManager: initialData?.responsibleManager || 'Priya Patel',
    location: initialData?.location || 'Kochi HQ',
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.name) return;

    const assignedDriver = drivers.find(d => d.id === formData.primaryDriverId);

    if (isEdit && initialData?.id) {
      updateVehicle(initialData.id, {
        ...formData,
        primaryDriverName: assignedDriver?.name || undefined
      });
    } else {
      addVehicle({
        ...formData,
        primaryDriverName: assignedDriver?.name || undefined
      });
    }
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <CarFront className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">{isEdit ? 'Edit Vehicle Master' : 'Add New Vehicle to Fleet'}</h3>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Number *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. KL-07-CD-5678"
              value={formData.number}
              onChange={e => setFormData({ ...formData, number: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Name / Alias *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Tata Nexon EV Max"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as VehicleType })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {['Car', 'Van', 'Pickup', 'Truck', 'Lorry', 'Tempo', 'Bus', 'Motorcycle', 'Scooter', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
            <input 
              type="text" 
              placeholder="e.g. Operations Utility, Executive"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Make & Model</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Make (e.g. Tata)"
                value={formData.make}
                onChange={e => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
              <input 
                type="text" 
                placeholder="Model (e.g. Nexon)"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Fuel Type</label>
            <select 
              value={formData.fuelType}
              onChange={e => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['Petrol', 'Diesel', 'CNG', 'LPG', 'EV', 'Hybrid', 'Other'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Current Odometer (KM)</label>
            <input 
              type="number" 
              value={formData.currentOdometer}
              onChange={e => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Mileage (KM/L)</label>
            <input 
              type="number" 
              step="0.1"
              value={formData.expectedMileage}
              onChange={e => setFormData({ ...formData, expectedMileage: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Assigned Driver</label>
            <select 
              value={formData.primaryDriverId}
              onChange={e => setFormData({ ...formData, primaryDriverId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">-- Unassigned (Pool Vehicle) --</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.licenceType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Operational Status</label>
            <select 
              value={formData.currentStatus}
              onChange={e => setFormData({ ...formData, currentStatus: e.target.value as VehicleStatus })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {['Active', 'In Trip', 'Available', 'Maintenance', 'Inactive'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
            <input 
              type="text" 
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Base / Parking Location</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Notes / Description</label>
          <textarea 
            rows={2}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special operational notes, equipment installed, etc."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            {isEdit ? 'Save Changes' : 'Create Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= FUEL MODAL ================= */
const FuelModal: React.FC<{ prefill?: any }> = ({ prefill }) => {
  const { closeQuickModal, addFuelEntry, vehicles, drivers } = useFleet();
  
  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [date, setDate] = useState('2026-08-30');
  const [time, setTime] = useState('10:30 AM');
  const [fuelStation, setFuelStation] = useState('Indian Oil Co-op, Edappally');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [quantity, setQuantity] = useState<number>(30);
  const [pricePerLitre, setPricePerLitre] = useState<number>(105.5);
  const [odometer, setOdometer] = useState<number>(45500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Company Card');
  const [receiptNumber, setReceiptNumber] = useState('IOC-' + Math.floor(100000 + Math.random() * 900000));
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [notes, setNotes] = useState('');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    if (selectedVeh) {
      setFuelType(selectedVeh.fuelType);
      setOdometer(selectedVeh.currentOdometer + 300);
      if (selectedVeh.primaryDriverId) setDriverId(selectedVeh.primaryDriverId);
    }
  }, [vehicleId, selectedVeh]);

  const totalAmount = Number((quantity * pricePerLitre).toFixed(2));
  const estimatedKm = selectedVeh ? odometer - selectedVeh.currentOdometer : 0;
  const liveMileage = (estimatedKm > 0 && quantity > 0) ? (estimatedKm / quantity).toFixed(1) : 'N/A';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;
    const drv = drivers.find(d => d.id === driverId);

    addFuelEntry({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      date,
      time,
      fuelStation,
      fuelType,
      quantity,
      pricePerLitre,
      totalAmount,
      odometer,
      paymentMethod,
      receiptNumber,
      driverId: drv?.id,
      driverName: drv?.name,
      notes
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Add Fuel Refill</h3>
            <p className="text-xs text-slate-500">Record fuel receipt, station, and calculate mileage.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Select Vehicle *</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number} — {v.name} ({v.fuelType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
            <input 
              type="text" 
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Current Odometer (KM) *</label>
            <input 
              type="number" 
              required
              value={odometer}
              onChange={e => setOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-semibold"
            />
            {selectedVeh && (
              <span className="text-[11px] text-slate-400 block mt-0.5">Last recorded: {selectedVeh.currentOdometer.toLocaleString()} KM</span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Fuel Station</label>
            <input 
              type="text" 
              value={fuelStation}
              onChange={e => setFuelStation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity (Litres) *</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Price / Litre (₹) *</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={pricePerLitre}
              onChange={e => setPricePerLitre(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
            <select 
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['Company Card', 'FASTag / Fuel Card', 'Cash', 'UPI', 'Net Banking', 'Other'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Receipt Number</label>
            <input 
              type="text" 
              value={receiptNumber}
              onChange={e => setReceiptNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Driver</label>
            <select 
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-700 block">Total Calculated Cost</span>
            <span className="text-lg font-bold text-blue-950">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-blue-700 block">Estimated Mileage</span>
            <span className="text-base font-bold text-emerald-700">{liveMileage} {liveMileage !== 'N/A' && 'km/l'}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Save Fuel Log
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= EXPENSE MODAL ================= */
const ExpenseModal: React.FC<{ prefill?: any }> = ({ prefill }) => {
  const { closeQuickModal, addExpense, vehicles, drivers, role } = useFleet();

  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [date, setDate] = useState('2026-08-30');
  const [category, setCategory] = useState<ExpenseCategory>('Toll');
  const [amount, setAmount] = useState<number>(450);
  const [vendor, setVendor] = useState('NHAI Toll Plaza');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-EXP-' + Math.floor(1000 + Math.random() * 9000));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('FASTag / Fuel Card');
  const [paidBy, setPaidBy] = useState('Company FASTag');
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [odometer, setOdometer] = useState<number>(45230);
  const [description, setDescription] = useState('Highway toll charges for site survey visit.');
  const [status, setStatus] = useState<ExpenseApprovalStatus>('Pending Approval');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh || amount <= 0) return;
    const drv = drivers.find(d => d.id === driverId);

    addExpense({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      date,
      category,
      amount,
      vendor,
      invoiceNumber,
      paymentMethod,
      paidBy,
      driverId: drv?.id,
      driverName: drv?.name,
      odometer,
      description,
      status
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Add Vehicle Expense</h3>
            <p className="text-xs text-slate-500">Log toll, parking, maintenance, tyres, permits, and fines.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle *</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number} — {v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {[
                'Toll', 'FASTag', 'Parking', 'Maintenance', 'Repair', 'Tyre', 'Battery', 
                'Spare Parts', 'Washing', 'Insurance', 'Road Tax', 'Permit', 'PUC', 
                'Driver Expense', 'Fine / Penalty', 'Emergency Repair', 'Other'
              ].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
            <input 
              type="number" 
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vendor / Payee</label>
            <input 
              type="text" 
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
            <select 
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['FASTag / Fuel Card', 'Company Card', 'Cash', 'UPI', 'Net Banking', 'Other'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Paid By</label>
            <input 
              type="text" 
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Purpose *</label>
          <textarea 
            rows={2}
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Submit Expense
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= TRIP MODAL ================= */
const TripModal: React.FC<{ prefill?: any }> = ({ prefill }) => {
  const { closeQuickModal, addTrip, vehicles, drivers } = useFleet();

  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [tripDate, setTripDate] = useState('2026-08-30');
  const [tripPurpose, setTripPurpose] = useState('Site inspection & solar invertor delivery');
  const [customerDepartment, setCustomerDepartment] = useState('Field Operations');
  const [startLocation, setStartLocation] = useState('Kochi HQ');
  const [destination, setDestination] = useState('Thrissur Substation');
  const [startOdometer, setStartOdometer] = useState<number>(prefill?.startOdometer || 45230);
  const [endOdometer, setEndOdometer] = useState<number>((prefill?.startOdometer || 45230) + 140);
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [tripType, setTripType] = useState<any>('Official Travel');
  const [passengerLoadDetails, setPassengerLoadDetails] = useState('2 Engineers with test bench');
  const [status, setStatus] = useState<any>('In Progress');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  useEffect(() => {
    if (selectedVeh) {
      setStartOdometer(selectedVeh.currentOdometer);
      setEndOdometer(selectedVeh.currentOdometer + 120);
      if (selectedVeh.primaryDriverId) setDriverId(selectedVeh.primaryDriverId);
    }
  }, [vehicleId, selectedVeh]);

  const calculatedDistance = Math.max(0, endOdometer - startOdometer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;
    const drv = drivers.find(d => d.id === driverId);

    addTrip({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      driverId: drv?.id || 'unassigned',
      driverName: drv?.name || 'Unassigned Driver',
      tripDate,
      tripPurpose,
      customerDepartment,
      startLocation,
      destination,
      startOdometer,
      endOdometer,
      distance: calculatedDistance,
      startTime,
      endTime,
      tripType,
      passengerLoadDetails,
      status
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Create New Trip</h3>
            <p className="text-xs text-slate-500">Schedule or record vehicle journey and distance.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle *</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number} ({v.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Driver *</label>
            <select 
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.licenceType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Start Location *</label>
            <input 
              type="text" 
              required
              value={startLocation}
              onChange={e => setStartLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Destination *</label>
            <input 
              type="text" 
              required
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Start Odometer (KM)</label>
            <input 
              type="number" 
              required
              value={startOdometer}
              onChange={e => setStartOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">End / Expected Odometer (KM)</label>
            <input 
              type="number" 
              required
              value={endOdometer}
              onChange={e => setEndOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Trip Type</label>
            <select 
              value={tripType}
              onChange={e => setTripType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['Delivery', 'Material Collection', 'Customer Visit', 'Official Travel', 'Employee Transport', 'Maintenance', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Trip Status</label>
            <select 
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {['Planned', 'In Progress', 'Completed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Trip Purpose / Assignment</label>
          <input 
            type="text" 
            value={tripPurpose}
            onChange={e => setTripPurpose(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-indigo-900">
          <span className="text-xs font-medium">Calculated Journey Distance:</span>
          <span className="text-base font-bold">{calculatedDistance} KM</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Save Trip
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= MAINTENANCE MODAL ================= */
const MaintenanceModal: React.FC<{ prefill?: any; isRepair?: boolean }> = ({ prefill, isRepair }) => {
  const { closeQuickModal, addMaintenanceRecord, vehicles } = useFleet();

  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [serviceType, setServiceType] = useState<ServiceType>(isRepair ? 'Body Repair' : 'Regular Service');
  const [title, setTitle] = useState(isRepair ? 'Emergency Repair & Parts Replacement' : 'Periodic Service & Fluid Change');
  const [date, setDate] = useState('2026-08-30');
  const [odometer, setOdometer] = useState<number>(prefill?.odometer || 45230);
  const [workshop, setWorkshop] = useState('Authorized Brand Service Workshop, Kochi');
  const [technician, setTechnician] = useState('Lead Service Advisor');
  const [invoiceNumber, setInvoiceNumber] = useState('SRV-INV-' + Math.floor(1000 + Math.random() * 9000));
  const [labourCost, setLabourCost] = useState<number>(2500);
  const [partsCost, setPartsCost] = useState<number>(6500);
  const [nextServiceDate, setNextServiceDate] = useState('2027-02-28');
  const [nextServiceOdometer, setNextServiceOdometer] = useState<number>((prefill?.odometer || 45230) + 5000);
  const [status, setStatus] = useState<any>('Completed');
  const [notes, setNotes] = useState('Engine oil renewed, brake checked, filter replaced.');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  const totalCost = labourCost + partsCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;

    addMaintenanceRecord({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      serviceType,
      title,
      date,
      odometer,
      workshop,
      technician,
      invoiceNumber,
      labourCost,
      partsCost,
      totalCost,
      nextServiceDate,
      nextServiceOdometer,
      status,
      notes
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{isRepair ? 'Record Repair' : 'Record Service & Maintenance'}</h3>
            <p className="text-xs text-slate-500">Track workshop jobs, costs, and set next service intervals.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle *</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number} — {v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Service Category</label>
            <select 
              value={serviceType}
              onChange={e => setServiceType(e.target.value as ServiceType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {[
                'Regular Service', 'Engine Oil', 'Oil Filter', 'Air Filter', 'Brake', 
                'Tyre', 'Battery', 'AC', 'Electrical', 'Engine', 'Transmission', 'Suspension', 'Body Repair', 'Other'
              ].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Service Title / Job Summary</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Odometer (KM)</label>
            <input 
              type="number" 
              required
              value={odometer}
              onChange={e => setOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Workshop / Service Center</label>
            <input 
              type="text" 
              value={workshop}
              onChange={e => setWorkshop(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Labour Cost (₹)</label>
            <input 
              type="number" 
              value={labourCost}
              onChange={e => setLabourCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Parts Cost (₹)</label>
            <input 
              type="number" 
              value={partsCost}
              onChange={e => setPartsCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Next Service Date</label>
            <input 
              type="date" 
              value={nextServiceDate}
              onChange={e => setNextServiceDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Next Service Odometer (KM)</label>
            <input 
              type="number" 
              value={nextServiceOdometer}
              onChange={e => setNextServiceOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-amber-900">
          <span className="text-xs font-medium">Total Service Cost:</span>
          <span className="text-lg font-bold">₹{totalCost.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= DOCUMENT MODAL ================= */
const DocumentModal: React.FC<{ prefill?: any }> = ({ prefill }) => {
  const { closeQuickModal, addDocument, vehicles } = useFleet();

  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [documentType, setDocumentType] = useState<DocumentType>('Insurance');
  const [documentNumber, setDocumentNumber] = useState('POL-2026-' + Math.floor(100000 + Math.random() * 900000));
  const [issueDate, setIssueDate] = useState('2026-08-30');
  const [expiryDate, setExpiryDate] = useState('2027-08-29');
  const [issuingAuthority, setIssuingAuthority] = useState('General Insurance Corp / SRTO Kerala');
  const [fileName, setFileName] = useState('Vehicle_Document_2026.pdf');
  const [notes, setNotes] = useState('Renewed and filed in digital vault.');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;

    addDocument({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      documentType,
      documentNumber,
      issueDate,
      expiryDate,
      issuingAuthority,
      fileName,
      fileSize: '1.2 MB',
      notes
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Upload Vehicle Document</h3>
            <p className="text-xs text-slate-500">Track RC, Insurance, PUC, Permits, and Expiries.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle *</label>
          <select 
            value={vehicleId}
            onChange={e => setVehicleId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.number} — {v.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Document Type *</label>
            <select 
              value={documentType}
              onChange={e => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {[
                'Insurance', 'PUC', 'Registration Certificate', 'Fitness Certificate', 
                'Permit', 'Road Tax', 'National Permit', 'Driving Licence', 'Lease Agreement', 'Other'
              ].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Document / Policy Number</label>
            <input 
              type="text" 
              required
              value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Date</label>
            <input 
              type="date" 
              required
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Expiry Date *</label>
            <input 
              type="date" 
              required
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Issuing Authority / Company</label>
          <input 
            type="text" 
            value={issuingAuthority}
            onChange={e => setIssuingAuthority(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        {/* File Dropzone Area */}
        <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <span className="text-xs font-semibold text-slate-700 block">Click or Drag & Drop Document PDF/Scans</span>
          <span className="text-[11px] text-slate-400">{fileName}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Upload & Save Document
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= INSPECTION MODAL ================= */
const InspectionModal: React.FC<{ prefill?: any }> = ({ prefill }) => {
  const { closeQuickModal, addInspection, vehicles, drivers } = useFleet();

  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [date, setDate] = useState('2026-08-30');
  const [odometer, setOdometer] = useState<number>(45230);
  const [remarks, setRemarks] = useState('Pre-trip 19-point safety checklist completed.');

  const [items, setItems] = useState<Record<string, InspectionItemStatus>>({
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
  });

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  const toggleItem = (key: string) => {
    setItems(prev => {
      const curr = prev[key];
      const next = curr === 'OK' ? 'Attention Required' : curr === 'Attention Required' ? 'Not OK' : 'OK';
      return { ...prev, [key]: next };
    });
  };

  const passAll = () => {
    const passed: Record<string, InspectionItemStatus> = {};
    Object.keys(items).forEach(k => { passed[k] = 'OK'; });
    setItems(passed);
  };

  const hasIssues = Object.values(items).some(v => v === 'Attention Required' || v === 'Not OK');
  const overallStatus = hasIssues ? (Object.values(items).some(v => v === 'Not OK') ? 'Failed' : 'Attention Needed') : 'Passed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;
    const drv = drivers.find(d => d.id === driverId);

    addInspection({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      driverId: drv?.id || 'drv-1',
      driverName: drv?.name || 'Driver',
      date,
      odometer,
      overallStatus,
      items: items as any,
      remarks,
      supervisorApproved: true,
      supervisorName: 'Priya Patel (HR & Fleet)'
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Daily Vehicle Inspection Checklist</h3>
            <p className="text-xs text-slate-500">19-Point safety & roadworthiness inspection.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle *</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Inspected By (Driver)</label>
            <select 
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Odometer (KM)</label>
            <input 
              type="number" 
              value={odometer}
              onChange={e => setOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">19-Point Checklist</span>
          <button 
            type="button" 
            onClick={passAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark All OK
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Object.entries(items).map(([key, val]) => (
            <button
              type="button"
              key={key}
              onClick={() => toggleItem(key)}
              className={cn(
                "p-2 rounded-lg border text-left flex items-center justify-between transition-all text-xs font-medium",
                val === 'OK' ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" :
                val === 'Attention Required' ? "bg-amber-50 border-amber-300 text-amber-900" :
                "bg-red-50 border-red-300 text-red-900"
              )}
            >
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                val === 'OK' ? "bg-emerald-200 text-emerald-900" :
                val === 'Attention Required' ? "bg-amber-200 text-amber-900" :
                "bg-red-200 text-red-900"
              )}>{val}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Remarks & Observations</label>
          <textarea 
            rows={2}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Submit Inspection ({overallStatus})
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= INCIDENT MODAL ================= */
const IncidentModal: React.FC<{ prefill?: any }> = ({ prefill }) => {
  const { closeQuickModal, addIncident, vehicles, drivers } = useFleet();

  const [vehicleId, setVehicleId] = useState(prefill?.vehicleId || (vehicles[0]?.id || ''));
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [date, setDate] = useState('2026-08-30');
  const [time, setTime] = useState('02:15 PM');
  const [location, setLocation] = useState('Edappally Toll Junction, Kochi');
  const [incidentType, setIncidentType] = useState<IncidentType>('Damage');
  const [description, setDescription] = useState('');
  const [injuries, setInjuries] = useState('None');
  const [propertyDamage, setPropertyDamage] = useState('Minor scratch on left side panel');
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [insuranceClaimStatus, setInsuranceClaimStatus] = useState<any>('Pending');
  const [estimatedCost, setEstimatedCost] = useState<number>(4500);
  const [immediateAction, setImmediateAction] = useState('Driver took photos; moved vehicle off carriageway.');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh || !description) return;
    const drv = drivers.find(d => d.id === driverId);

    addIncident({
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      driverId: drv?.id,
      driverName: drv?.name,
      date,
      time,
      location,
      incidentType,
      description,
      injuries,
      propertyDamage,
      policeReportNumber,
      insuranceClaimStatus,
      estimatedCost,
      immediateAction,
      status: 'Reported'
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Report Incident / Accident</h3>
            <p className="text-xs text-slate-500">Record accidents, damages, breakdowns, and insurance claims.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle *</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Driver</label>
            <select 
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Incident Type</label>
            <select 
              value={incidentType}
              onChange={e => setIncidentType(e.target.value as IncidentType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
            >
              {['Accident', 'Breakdown', 'Damage', 'Traffic Violation', 'Theft', 'Mechanical Failure', 'Other'].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Date & Time</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg" />
              <input type="text" value={time} onChange={e => setTime(e.target.value)} className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg" />
            </div>
          </div>

          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Incident Location *</label>
            <input 
              type="text" 
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Description of What Happened *</label>
          <textarea 
            rows={2}
            required
            placeholder="Provide clear details of the incident..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Estimated Cost (₹)</label>
            <input 
              type="number" 
              value={estimatedCost}
              onChange={e => setEstimatedCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Insurance Claim Status</label>
            <select 
              value={insuranceClaimStatus}
              onChange={e => setInsuranceClaimStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['Filed', 'Pending', 'Not Applicable', 'Settled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
          >
            Submit Incident Report
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= DRIVER MODAL ================= */
const DriverModal: React.FC<{ prefill?: any }> = () => {
  const { closeQuickModal, addDriver, vehicles } = useFleet();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('EMP-00' + Math.floor(6 + Math.random() * 5));
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Logistics & Transport');
  const [licenceNumber, setLicenceNumber] = useState('KL-07-' + Math.floor(2015 + Math.random() * 10) + '-00' + Math.floor(10000 + Math.random() * 90000));
  const [licenceType, setLicenceType] = useState<LicenceType>('LMV');
  const [licenceExpiry, setLicenceExpiry] = useState('2032-06-30');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [joinDate, setJoinDate] = useState('2026-08-30');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !licenceNumber) return;

    const assignedVeh = vehicles.find(v => v.id === assignedVehicleId);

    addDriver({
      name,
      employeeId,
      mobile,
      email,
      department,
      licenceNumber,
      licenceType,
      licenceExpiry,
      assignedVehicleId: assignedVeh?.id,
      assignedVehicleNumber: assignedVeh?.number,
      status: 'Active',
      emergencyContact,
      joinDate,
      notes
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Add New Driver</h3>
            <p className="text-xs text-slate-500">Register driver licence, employee link, and assign vehicles.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Driver Full Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Sreejith Nair"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Employee ID</label>
            <input 
              type="text" 
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
            <input 
              type="text" 
              required
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Licence Type</label>
            <select 
              value={licenceType}
              onChange={e => setLicenceType(e.target.value as LicenceType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['LMV', 'HMV', 'Commercial', '2-Wheeler', 'Hazardous'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Licence Number *</label>
            <input 
              type="text" 
              required
              value={licenceNumber}
              onChange={e => setLicenceNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Licence Expiry Date *</label>
            <input 
              type="date" 
              required
              value={licenceExpiry}
              onChange={e => setLicenceExpiry(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Vehicle</label>
            <select 
              value={assignedVehicleId}
              onChange={e => setAssignedVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="">-- None (Pool Driver) --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number} ({v.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
            <input 
              type="text" 
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Emergency Contact</label>
          <input 
            type="text" 
            placeholder="Name & phone number of next of kin"
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Add Driver
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= DAILY LOG MODAL ================= */
const DailyLogModal: React.FC<{ prefill?: any }> = () => {
  const { closeQuickModal, addDailyLog, vehicles, drivers } = useFleet();

  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [date, setDate] = useState('2026-08-30');
  const [openingOdometer, setOpeningOdometer] = useState<number>(45230);
  const [closingOdometer, setClosingOdometer] = useState<number>(45350);
  const [fuelAddedLitres, setFuelAddedLitres] = useState<number>(0);
  const [tripsCount, setTripsCount] = useState<number>(2);
  const [expenseTotal, setExpenseTotal] = useState<number>(0);
  const [vehicleCondition, setVehicleCondition] = useState<any>('Good');
  const [remarks, setRemarks] = useState('Daily operations completed smoothly.');

  const selectedVeh = vehicles.find(v => v.id === vehicleId);
  const totalKm = Math.max(0, closingOdometer - openingOdometer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;
    const drv = drivers.find(d => d.id === driverId);

    addDailyLog({
      date,
      vehicleId: selectedVeh.id,
      vehicleNumber: selectedVeh.number,
      driverId: drv?.id || 'drv-1',
      driverName: drv?.name || 'Driver',
      openingOdometer,
      closingOdometer,
      totalKm,
      fuelAddedLitres,
      tripsCount,
      expenseTotal,
      vehicleCondition,
      remarks,
      status: 'Submitted'
    });
    closeQuickModal();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Submit Daily Vehicle Log</h3>
            <p className="text-xs text-slate-500">Record daily run, fuel, and handover condition.</p>
          </div>
        </div>
        <button onClick={closeQuickModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle</label>
            <select 
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Driver</label>
            <select 
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Opening Odometer</label>
            <input 
              type="number" 
              value={openingOdometer}
              onChange={e => setOpeningOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Closing Odometer</label>
            <input 
              type="number" 
              value={closingOdometer}
              onChange={e => setClosingOdometer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Fuel Added (Litres)</label>
            <input 
              type="number" 
              value={fuelAddedLitres}
              onChange={e => setFuelAddedLitres(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Condition</label>
            <select 
              value={vehicleCondition}
              onChange={e => setVehicleCondition(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['Good', 'Needs Attention', 'Poor'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-blue-900">
          <span className="text-xs font-medium">Total Daily Distance:</span>
          <span className="text-base font-bold">{totalKm} KM</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={closeQuickModal}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Save Daily Log
          </button>
        </div>
      </form>
    </div>
  );
};
