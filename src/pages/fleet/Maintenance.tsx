import React, { useState } from 'react';
import { 
  Wrench, Plus, Search, Filter, AlertTriangle, CheckCircle2, 
  Calendar, Download, Trash2, Clock, CarFront, ShieldCheck
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { ServiceType, ServiceStatus } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Maintenance: React.FC = () => {
  const { 
    maintenanceRecords, vehicles, openQuickModal, 
    completeMaintenance, deleteMaintenance, setSelectedVehicleId,
    getOverdueMaintenanceCount
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');

  const filteredRecords = maintenanceRecords.filter(m => {
    const matchesSearch = 
      m.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.workshop.toLowerCase().includes(search.toLowerCase()) ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase())) ||
      (m.invoiceNumber && m.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (m.technician && m.technician.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'All' || m.serviceType === selectedType;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    const matchesVeh = selectedVehicle === 'All' || m.vehicleId === selectedVehicle || m.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesType && matchesStatus && matchesVeh;
  });

  const totalMaintenanceCost = maintenanceRecords.reduce((s, m) => s + m.totalCost, 0);
  const overdueCount = getOverdueMaintenanceCount();
  const inProgressCount = maintenanceRecords.filter(m => m.status === 'In Progress' || m.status === 'Scheduled').length;

  const exportCSV = () => {
    const headers = ['Record No,Date,Vehicle,Service Type,Title,Workshop,Technician,Odometer (KM),Parts Cost,Labor Cost,Total Cost,Invoice No,Status,Next Service Date,Next Service Odo'];
    const rows = filteredRecords.map(m => 
      `"${m.recordNumber}","${m.date}","${m.vehicleNumber}","${m.serviceType}","${m.title}","${m.workshop}","${m.technician || ''}",${m.odometer},${m.partsCost},${m.labourCost},${m.totalCost},"${m.invoiceNumber || ''}","${m.status}","${m.nextServiceDate || ''}",${m.nextServiceOdometer || ''}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Fleet_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const serviceTypes: ServiceType[] = [
    'Regular Service',
    'Engine Oil',
    'Oil Filter',
    'Air Filter',
    'Fuel Filter',
    'Brake',
    'Tyre',
    'Battery',
    'AC',
    'Electrical',
    'Engine',
    'Transmission',
    'Suspension',
    'Body Repair',
    'Other'
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Maintenance & Workshop Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Service history, job cards, parts replacement, scheduled milestones & repair costs</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => openQuickModal('addMaintenance')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Schedule Service
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Service Records</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{maintenanceRecords.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase">Active / Scheduled</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{inProgressCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block uppercase">Service Overdue</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{overdueCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Total Maintenance Cost</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">₹{totalMaintenanceCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by vehicle, workshop, technician, title or invoice #..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700 max-w-xs"
            >
              <option value="All">All Service Types</option>
              {serviceTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              <option value="All">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          {['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                selectedStatus === st 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Record # & Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service Details</th>
                <th className="px-4 py-3">Workshop</th>
                <th className="px-4 py-3 text-right">Odometer</th>
                <th className="px-4 py-3 text-right">Cost (Parts + Labor)</th>
                <th className="px-4 py-3">Next Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono">{m.recordNumber}</div>
                    <div className="text-[11px] text-slate-400">{m.date}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedVehicleId(m.vehicleId)}
                      className="font-bold text-blue-600 hover:underline block font-mono"
                    >
                      {m.vehicleNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{m.title}</span>
                    <span className="text-[11px] text-slate-500">{m.serviceType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{m.workshop}</div>
                    {m.technician && <div className="text-[11px] text-slate-400">Tech: {m.technician}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                    {m.odometer.toLocaleString()} KM
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono font-bold text-slate-900">₹{m.totalCost.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">P: ₹{m.partsCost} | L: ₹{m.labourCost}</div>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {m.nextServiceDate || m.nextServiceOdometer ? (
                      <div>
                        {m.nextServiceDate && <div className="font-medium text-slate-700">{m.nextServiceDate}</div>}
                        {m.nextServiceOdometer && <div className="text-[10px] text-slate-400 font-mono">@{m.nextServiceOdometer.toLocaleString()} KM</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      m.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      m.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    )}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {m.status !== 'Completed' && (
                        <button
                          onClick={() => completeMaintenance(m.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                        >
                          Done
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (confirm(`Delete maintenance record ${m.recordNumber}?`)) deleteMaintenance(m.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
