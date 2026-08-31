import React, { useState } from 'react';
import { 
  Activity, Plus, Search, Filter, ShieldCheck, Fuel, 
  MapPin, Wrench, Receipt, AlertOctagon, FileText, Download,
  CheckCircle2, XCircle, Clock, CarFront
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { ActivityType } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Activities: React.FC = () => {
  const { 
    activities, vehicles, inspections, openQuickModal, 
    setSelectedVehicleId 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'timeline' | 'inspections'>('timeline');

  const filteredActivities = activities.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (a.vehicleNumber && a.vehicleNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'All' || a.type === selectedType;
    const matchesVeh = selectedVehicle === 'All' || a.vehicleId === selectedVehicle || a.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesType && matchesVeh;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Fuel': return <Fuel className="w-4 h-4 text-blue-600" />;
      case 'Trip': return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'Expense': return <Receipt className="w-4 h-4 text-emerald-600" />;
      case 'Incident': return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'Document': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'Inspection': return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const exportCSV = () => {
    const headers = ['Timestamp,Type,Title,Description,Vehicle,Performed By'];
    const rows = filteredActivities.map(a => 
      `"${a.timestamp}","${a.type}","${a.title}","${a.description}","${a.vehicleNumber || ''}","${a.performedBy}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Activity_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Activities & Audit Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time operational timeline, 19-point inspections, and complete event logs</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Audit Log
          </button>
          <button 
            onClick={() => openQuickModal('inspection')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" /> Start Inspection
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('timeline')}
          className={cn(
            "pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2",
            activeTab === 'timeline'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Activity className="w-4 h-4" /> All Operational Events ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={cn(
            "pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2",
            activeTab === 'inspections'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <ShieldCheck className="w-4 h-4" /> 19-Point Inspections Checklist ({inspections.length})
        </button>
      </div>

      {activeTab === 'timeline' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search audit trail by keyword, vehicle, or staff name..." 
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
                <option value="All">All Event Types</option>
                {['Fuel', 'Trip', 'Maintenance', 'Expense', 'Incident', 'Document', 'Inspection', 'System'].map(t => (
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

          {/* Timeline Feed */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {filteredActivities.map((act) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{act.title}</span>
                        {act.vehicleNumber && (
                          <button 
                            onClick={() => act.vehicleId && setSelectedVehicleId(act.vehicleId)}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold hover:underline"
                          >
                            {act.vehicleNumber}
                          </button>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold uppercase">
                          {act.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{act.description}</p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Logged by: <span className="font-semibold text-slate-700">{act.performedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Inspections Checklist Table */
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Vehicle Inspection Logs (19-Point Standard)</h3>
              <button 
                onClick={() => openQuickModal('inspection')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                + Conduct New Inspection
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Inspection Date</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Inspector</th>
                    <th className="px-4 py-3 text-right">Odometer</th>
                    <th className="px-4 py-3 text-center">Checklist Score</th>
                    <th className="px-4 py-3">Remarks / Defects</th>
                    <th className="px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.map(insp => {
                    const passedCount = insp.items.filter(i => i.status === 'Pass').length;
                    const totalItems = insp.items.length;

                    return (
                      <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{insp.date}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => setSelectedVehicleId(insp.vehicleId)}
                            className="font-bold text-blue-600 hover:underline font-mono"
                          >
                            {insp.vehicleNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{insp.inspectorName}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium">{insp.odometer.toLocaleString()} KM</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-slate-900">{passedCount}/{totalItems}</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-500">{insp.notes || 'Routine check passed.'}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            insp.overallResult === 'Passed' ? 'bg-emerald-100 text-emerald-700' :
                            insp.overallResult === 'Attention Needed' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          )}>
                            {insp.overallResult}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
