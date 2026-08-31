import React, { useState } from 'react';
import { 
  Receipt, Plus, Search, Filter, CheckCircle2, XCircle, 
  Download, Trash2, Clock, DollarSign, CarFront, Tag
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { ExpenseCategory, ExpenseApprovalStatus } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Expenses: React.FC = () => {
  const { 
    expenses, vehicles, role, openQuickModal, 
    approveExpense, rejectExpense, deleteExpense, setSelectedVehicleId 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase())) ||
      (e.driverName && e.driverName.toLowerCase().includes(search.toLowerCase())) ||
      (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || e.status === selectedStatus;
    const matchesVeh = selectedVehicle === 'All' || e.vehicleId === selectedVehicle || e.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesCat && matchesStatus && matchesVeh;
  });

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === 'Pending Approval').length;
  const pendingAmount = expenses.filter(e => e.status === 'Pending Approval').reduce((s, e) => s + e.amount, 0);
  const tollFastagTotal = expenses.filter(e => e.category === 'Toll' || e.category === 'FASTag' || e.category === 'Parking').reduce((s, e) => s + e.amount, 0);

  const categories: ExpenseCategory[] = [
    'Toll',
    'FASTag',
    'Parking',
    'Driver Expense',
    'Washing',
    'Road Tax',
    'Permit',
    'Insurance',
    'PUC',
    'Tyre',
    'Battery',
    'Fine / Penalty',
    'Other'
  ];

  const exportCSV = () => {
    const headers = ['Date,Vehicle,Category,Description,Amount (INR),Payment Mode,Vendor,Invoice No,Driver,Status'];
    const rows = filteredExpenses.map(e => 
      `"${e.date}","${e.vehicleNumber}","${e.category}","${e.description}",${e.amount},"${e.paymentMethod}","${e.vendor || ''}","${e.invoiceNumber || ''}","${e.driverName || ''}","${e.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Fleet_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canApprove = role === 'Super Admin' || role === 'Accounts' || role === 'Fleet/Vehicle Manager' || role === 'Management';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Expense Register & Approvals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tolls, fastag, allowances, fines, parking & miscellaneous fleet operating costs</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => openQuickModal('addExpense')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Recorded</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">₹{totalAmount.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase">Pending Approval</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            ₹{pendingAmount.toLocaleString()} <span className="text-xs font-normal">({pendingCount})</span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 block uppercase">Tolls & Parking</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">₹{tollFastagTotal.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Total Approved</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            ₹{expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses by description, vendor, bill #, driver..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
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
          {['All', 'Approved', 'Pending Approval', 'Rejected'].map(st => (
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
              {st === 'Pending Approval' && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Category & Details</th>
                <th className="px-4 py-3">Vendor / Bill #</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{e.date}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedVehicleId(e.vehicleId)}
                      className="font-bold text-blue-600 hover:underline block font-mono"
                    >
                      {e.vehicleNumber}
                    </button>
                    <div className="text-[11px] text-slate-400">{e.driverName || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 block">{e.category}</span>
                    <span className="text-[11px] text-slate-500">{e.description}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-slate-800">{e.vendor || '—'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{e.billNumber ? `#${e.billNumber}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                      {e.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                    ₹{e.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      e.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      e.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    )}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {e.status === 'Pending Approval' && canApprove && (
                        <>
                          <button
                            onClick={() => approveExpense(e.id)}
                            className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded"
                            title="Approve Expense"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectExpense(e.id)}
                            className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded"
                            title="Reject Expense"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          if (confirm('Delete this expense record?')) deleteExpense(e.id);
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
