import React, { useState } from 'react';
import { 
  AlertOctagon, Plus, Search, Filter, ShieldAlert, 
  CheckCircle2, Download, Trash2, CarFront, FileText, AlertTriangle, User
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { IncidentType, IncidentStatus } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Incidents: React.FC = () => {
  const { 
    incidents, vehicles, openQuickModal, 
    updateIncidentStatus, deleteIncident, setSelectedVehicleId 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = 
      i.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      (i.driverName && i.driverName.toLowerCase().includes(search.toLowerCase())) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()) ||
      (i.policeReportNumber && i.policeReportNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'All' || i.incidentType === selectedType;
    const matchesStatus = selectedStatus === 'All' || i.status === selectedStatus;
    const matchesVeh = selectedVehicle === 'All' || i.vehicleId === selectedVehicle || i.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesType && matchesStatus && matchesVeh;
  });

  const activeCount = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
  const totalEstCost = incidents.reduce((s, i) => s + (i.estimatedCost || 0), 0);
  const claimFiledCount = incidents.filter(i => i.insuranceClaimStatus === 'Filed' || i.insuranceClaimStatus === 'Settled').length;

  const exportCSV = () => {
    const headers = ['Incident No,Date,Vehicle,Driver,Type,Location,Description,Est Cost,Insurance Claim Status,Police Report No,Status'];
    const rows = filteredIncidents.map(i => 
      `"${i.incidentNumber}","${i.date}","${i.vehicleNumber}","${i.driverName || ''}","${i.incidentType}","${i.location}","${i.description}",${i.estimatedCost || 0},"${i.insuranceClaimStatus}","${i.policeReportNumber || ''}","${i.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Incidents_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const incidentTypes: IncidentType[] = [
    'Accident',
    'Breakdown',
    'Traffic Violation',
    'Damage',
    'Theft',
    'Fire',
    'Mechanical Failure',
    'Other'
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Accidents, Incidents & Insurance Claims</h2>
          <p className="text-xs text-slate-500 mt-0.5">Accident records, breakdown reports, driver statements, and insurance claim tracking</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => openQuickModal('reportIncident')}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
          >
            <AlertOctagon className="w-4 h-4" /> Report Incident
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Incidents</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{incidents.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block uppercase">Active / Investigating</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase">Estimated Repair Cost</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">₹{totalEstCost.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Insurance Claims Active</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{claimFiledCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by vehicle, driver, location, or police report #..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              <option value="All">All Incident Types</option>
              {incidentTypes.map(s => (
                <option key={s} value={s}>{s}</option>
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
          {['All', 'Reported', 'Under Investigation', 'Insurance Claim In Progress', 'Resolved', 'Closed'].map(st => (
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

      {/* Incidents List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Incident # & Date</th>
                <th className="px-4 py-3">Vehicle & Driver</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location & Summary</th>
                <th className="px-4 py-3 text-right">Est Repair Cost</th>
                <th className="px-4 py-3">Insurance Claim</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map(i => (
                <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono">{i.incidentNumber}</div>
                    <div className="text-[11px] text-slate-400">{i.date} {i.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedVehicleId(i.vehicleId)}
                      className="font-bold text-blue-600 hover:underline block font-mono"
                    >
                      {i.vehicleNumber}
                    </button>
                    <div className="text-[11px] text-slate-500">{i.driverName || 'Unassigned'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800 block">{i.incidentType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{i.location}</div>
                    <div className="text-[11px] text-slate-500 max-w-xs truncate">{i.description}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{(i.estimatedCost || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      i.insuranceClaimStatus === 'Settled' ? 'bg-emerald-100 text-emerald-700' :
                      i.insuranceClaimStatus === 'Filed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    )}>
                      {i.insuranceClaimStatus}
                    </span>
                    {i.policeReportNumber && (
                      <div className="text-[10px] text-slate-400 mt-0.5">FIR: {i.policeReportNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      i.status === 'Resolved' || i.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' :
                      i.status === 'Insurance Claim In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-rose-100 text-rose-700'
                    )}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {i.status !== 'Resolved' && i.status !== 'Closed' && (
                        <button
                          onClick={() => updateIncidentStatus(i.id, 'Resolved')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                        >
                          Resolve
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (confirm(`Delete incident report ${i.incidentNumber}?`)) deleteIncident(i.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete Incident"
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
