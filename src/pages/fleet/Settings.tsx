import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, ShieldCheck, Bell, Database, 
  CreditCard, CarFront, Save, RotateCcw, Check, Users, Key
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { initialFleetData } from '../../data/fleetInitialData';
import { cn } from '../../lib/utils';

export const Settings: React.FC = () => {
  const { role, setRole } = useFleet();

  const [currency, setCurrency] = useState('INR (₹)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers (KM)');
  const [defaultServiceInterval, setDefaultServiceInterval] = useState(10000);
  const [serviceReminderLeadKm, setServiceReminderLeadKm] = useState(500);
  const [docExpiryLeadDays, setDocExpiryLeadDays] = useState(30);
  const [anomalyThresholdPercent, setAnomalyThresholdPercent] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default initial fleet demo data?')) {
      localStorage.setItem('enerpack_fleet_vehicles', JSON.stringify(initialFleetData.vehicles));
      localStorage.setItem('enerpack_fleet_drivers', JSON.stringify(initialFleetData.drivers));
      localStorage.setItem('enerpack_fleet_fuel', JSON.stringify(initialFleetData.fuelEntries));
      localStorage.setItem('enerpack_fleet_trips', JSON.stringify(initialFleetData.trips));
      localStorage.setItem('enerpack_fleet_maintenance', JSON.stringify(initialFleetData.maintenanceRecords));
      localStorage.setItem('enerpack_fleet_expenses', JSON.stringify(initialFleetData.expenses));
      localStorage.setItem('enerpack_fleet_documents', JSON.stringify(initialFleetData.documents));
      localStorage.setItem('enerpack_fleet_activities', JSON.stringify(initialFleetData.activities));
      localStorage.setItem('enerpack_fleet_incidents', JSON.stringify(initialFleetData.incidents));
      localStorage.setItem('enerpack_fleet_inspections', JSON.stringify(initialFleetData.inspections));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Settings & System Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fleet thresholds, service intervals, access controls & notification triggers</p>
        </div>
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences Saved!
            </span>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* General Preferences */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <SettingsIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">General Operational Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Currency Standard</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="INR (₹)">Indian Rupee (INR ₹)</option>
              <option value="USD ($)">US Dollar (USD $)</option>
              <option value="EUR (€)">Euro (EUR €)</option>
              <option value="AED (د.إ)">UAE Dirham (AED)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Distance Metric</label>
            <select
              value={distanceUnit}
              onChange={e => setDistanceUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Kilometers (KM)">Kilometers (KM)</option>
              <option value="Miles (mi)">Miles (mi)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Default Periodic Service Interval (KM)</label>
            <input 
              type="number"
              value={defaultServiceInterval}
              onChange={e => setDefaultServiceInterval(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Used to auto-calculate next service milestone</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Fuel Drop Anomaly Sensitivity (%)</label>
            <input 
              type="number"
              value={anomalyThresholdPercent}
              onChange={e => setAnomalyThresholdPercent(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Trigger anomaly alert if mileage drops by this %</span>
          </div>
        </div>
      </div>

      {/* Notification & Compliance Triggers */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Alert & Expiry Notification Thresholds</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Document Expiry Lead Time (Days)</label>
            <select
              value={docExpiryLeadDays}
              onChange={e => setDocExpiryLeadDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value={15}>15 Days before expiry</option>
              <option value={30}>30 Days before expiry (Recommended)</option>
              <option value={45}>45 Days before expiry</option>
              <option value={60}>60 Days before expiry</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Service Due Advance Notice (KM)</label>
            <select
              value={serviceReminderLeadKm}
              onChange={e => setServiceReminderLeadKm(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value={250}>250 KM in advance</option>
              <option value={500}>500 KM in advance (Standard)</option>
              <option value={1000}>1,000 KM in advance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control Reference */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Role Permissions & Governance Matrix</h3>
          </div>
          <span className="text-xs text-slate-500">Active Role: <strong className="text-blue-600">{role}</strong></span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Vehicle Master</th>
                <th className="px-3 py-2">Fuel Logs</th>
                <th className="px-3 py-2">Expense Approval</th>
                <th className="px-3 py-2">Maintenance</th>
                <th className="px-3 py-2">Audit Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900">Super Admin</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full CRUD</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full CRUD</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Approve / Reject</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full CRUD</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full Access</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900">Fleet/Vehicle Manager</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full CRUD</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full CRUD</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Approve / Reject</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full CRUD</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Full Access</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900">Accounts</td>
                <td className="px-3 py-2 text-slate-600">View Only</td>
                <td className="px-3 py-2 text-slate-600">View & Verify</td>
                <td className="px-3 py-2 text-emerald-600 font-bold">Approve / Reject</td>
                <td className="px-3 py-2 text-slate-600">View & Verify</td>
                <td className="px-3 py-2 text-slate-600">View Reports</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900">Driver</td>
                <td className="px-3 py-2 text-slate-400">Assigned Only</td>
                <td className="px-3 py-2 text-blue-600 font-medium">Add Refills</td>
                <td className="px-3 py-2 text-blue-600 font-medium">Submit Expense</td>
                <td className="px-3 py-2 text-slate-400">View Only</td>
                <td className="px-3 py-2 text-slate-400">No Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Demo Data & Storage Management</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Reset Demo Fleet Database</h4>
            <p className="text-xs text-slate-500 mt-0.5">Restores all initial vehicles, drivers, trips, fuel entries, maintenance records & compliance documents</p>
          </div>
          <button 
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Default Fleet Data
          </button>
        </div>
      </div>
    </div>
  );
};
