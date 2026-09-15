import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Plus, Filter, Phone, Mail, MoreVertical, 
  ArrowUpDown, UserCheck, Users, Calendar, Clock,
  ChevronRight, Building2, Eye, ShieldCheck, Check, MessageSquare,
  Download, Upload, ShieldAlert, X, AlertCircle, FileSpreadsheet, Lock, Unlock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { EmployeeMasterRecord, OtEligibility } from '../types/employeeMaster';
import { maskAadhaar, maskAccountNo } from '../data/enerpackEmployeeMaster';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../context/EmployeeContext';
import { logAuditEvent } from '../lib/auditLogger';
import { MobileAddEmployeeWizard } from '../components/employees/MobileAddEmployeeWizard';

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsAddWizardOpen(true);
    }
  }, [searchParams]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [otFilter, setOtFilter] = useState<string>('All');
  const [allowanceFilter, setAllowanceFilter] = useState<string>('All');
  const [occupationFilter, setOccupationFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'joinDate' | 'salary'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [importCsvData, setImportCsvData] = useState('');
  const [importPreview, setImportPreview] = useState<EmployeeMasterRecord[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Check if current user has authorized access to sensitive info (Aadhaar & Bank Account)
  const canViewSensitive = useMemo(() => {
    const role = userProfile?.role;
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'HR_MANAGER' || role === 'ACCOUNTANT';
  }, [userProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter & Sort Logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => {
        const query = search.toLowerCase().trim();
        const matchesSearch = !query || 
          emp.id.toLowerCase().includes(query) ||
          emp.name.toLowerCase().includes(query) ||
          emp.mobile.toLowerCase().includes(query) ||
          emp.aadhaar.toLowerCase().includes(query) ||
          emp.occupation.toLowerCase().includes(query) ||
          emp.state.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Status Filter
        if (statusFilter !== 'All' && emp.status !== statusFilter) return false;

        // OT Status Filter
        if (otFilter !== 'All' && emp.otEligibility !== otFilter) return false;

        // Allowance Filter
        if (allowanceFilter !== 'All' && emp.allowanceEligibility !== allowanceFilter) return false;

        // Occupation Filter
        if (occupationFilter !== 'All') {
          const occ = emp.occupation.toLowerCase();
          const target = occupationFilter.toLowerCase();
          if (!occ.includes(target)) return false;
        }

        // State Filter
        if (stateFilter !== 'All' && emp.state.toLowerCase() !== stateFilter.toLowerCase()) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy] || '';
        let valB: any = b[sortBy] || '';

        if (sortBy === 'salary') {
          valA = a.basicSalary || 0;
          valB = b.basicSalary || 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [employees, search, statusFilter, otFilter, allowanceFilter, occupationFilter, stateFilter, sortBy, sortOrder]);

  const handleToggleOtStatus = async (empId: string) => {
    const target = employees.find(e => e.id === empId);
    if (!target) return;
    const newOt: OtEligibility = target.otEligibility === 'OT Employee' ? 'Non-OT Employee' : 'OT Employee';
    try {
      await updateEmployee(empId, { otEligibility: newOt });
      showToast(`Updated ${target.name} (${empId}) OT Status to ${newOt}`);
    } catch (err: any) {
      showToast(`Failed to update OT status: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Staff No', 'Join Date', 'Name', 'Age', 'State', 'Country', 'Occupation', 'Mobile No', 'Aadhaar No', 'Basic Salary', 'Account No', 'Bank Name', 'IFSC Code', 'Status', 'OT Status', 'Remarks'];
    const rows = employees.map(e => [
      e.id,
      e.joinDate,
      `"${e.name}"`,
      e.age || '',
      e.state,
      e.country,
      `"${e.occupation}"`,
      e.mobile,
      e.aadhaar,
      e.basicSalary,
      e.accountNo,
      `"${e.bankName}"`,
      e.ifsc,
      e.status,
      e.otEligibility,
      `"${e.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enerpack_employee_master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employee Master exported successfully to CSV');
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full px-2 sm:px-4 pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Enerpack Employee Master
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-extrabold font-mono">
              {employees.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Single Source of Truth for Workforce, Attendance, OT, Leave & Payroll Integration
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddWizardOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
          <button
            onClick={() => handleExportCsv()}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Employees</span>
          </button>
        </div>
      </div>

      {/* Security & Masking Indicator Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          {canViewSensitive ? (
            <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            {canViewSensitive 
              ? `Authorized View (${userProfile?.role}): Full Aadhaar and Bank Account details are visible.` 
              : `Data Privacy Shield Active: Sensitive Aadhaar and Bank Account numbers are masked (e.g. XXXX XXXX 7794).`}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded text-amber-900 shrink-0">
          {canViewSensitive ? 'Full Access' : 'Masked Mode'}
        </span>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Staff No (e.g. ENR001), Name, Mobile, Aadhaar, Occupation..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live</option>
              <option value="Exit">Exit</option>
              <option value="Requirement">Requirement</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* OT Status Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">OT Status</label>
            <select
              value={otFilter}
              onChange={(e) => setOtFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="All">All OT Statuses</option>
              <option value="OT Employee">OT Employee</option>
              <option value="Non-OT Employee">Non-OT Employee</option>
            </select>
          </div>

          {/* Allowance Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Allowance</label>
            <select
              value={allowanceFilter}
              onChange={(e) => setAllowanceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="All">All Allowances</option>
              <option value="Allowance Employee">Allowance Employee</option>
              <option value="Non-Allowance Employee">Non-Allowance Employee</option>
            </select>
          </div>

          {/* Occupation Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Occupation</label>
            <select
              value={occupationFilter}
              onChange={(e) => setOccupationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="All">All Occupations</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Driver">Driver</option>
              <option value="Cutting">Cutting</option>
              <option value="Loading">Loading</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Labour">Labour</option>
              <option value="All Rounder">All Rounder</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Kerala">Kerala</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
            </select>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Connecting to Firestore and loading employee records...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredEmployees.length === 0 && (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No employees found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {search || statusFilter !== 'All' 
              ? "No employee records matched the selected search filters." 
              : "No employees registered yet. Add employees to initialize the master database."}
          </p>
          <button
            onClick={() => setIsAddWizardOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      )}

      {/* MOBILE EMPLOYEE CARDS */}
      {!loading && filteredEmployees.length > 0 && (
      <div className="lg:hidden space-y-3">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                  {emp.photo || emp.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{emp.name}</h3>
                    <span className="text-xs font-mono font-bold text-blue-600">{emp.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{emp.occupation} &bull; {emp.state}</p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase",
                emp.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                emp.status === 'Exit' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              )}>
                {emp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-slate-100 text-slate-600">
              <div><span className="text-slate-400">Join:</span> {emp.joinDate || 'N/A'}</div>
              <div><span className="text-slate-400">Salary:</span> ₹{emp.basicSalary?.toLocaleString() || '0'}</div>
              <div><span className="text-slate-400">Mobile:</span> {emp.mobile || 'N/A'}</div>
              <div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold",
                  emp.otEligibility === 'OT Employee' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                )}>
                  {emp.otEligibility}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleToggleOtStatus(emp.id)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Toggle OT Status
              </button>
              <button
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>View Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!loading && filteredEmployees.length > 0 && (
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Staff No</th>
                <th className="py-3.5 px-4">Join Date</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Age</th>
                <th className="py-3.5 px-4">State</th>
                <th className="py-3.5 px-4">Occupation</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Aadhaar</th>
                <th className="py-3.5 px-4">Basic Salary</th>
                <th className="py-3.5 px-4">Bank & Account</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Allowance</th>
                <th className="py-3.5 px-4">OT Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">{emp.id}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{emp.joinDate || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{emp.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{emp.age || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{emp.state}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">{emp.occupation}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{emp.mobile || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {maskAadhaar(emp.aadhaar, canViewSensitive)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    ₹{emp.basicSalary?.toLocaleString() || '0'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    <div>{maskAccountNo(emp.accountNo, canViewSensitive)}</div>
                    <div className="text-[10px] text-slate-400">{emp.bankName || 'No Bank'}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase",
                      emp.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      emp.status === 'Exit' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {emp.allowanceEligibility === 'Allowance Employee' ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {emp.allowanceType || 'Allowance'} (₹{emp.allowanceAmount?.toLocaleString() || 3000})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Non-Allowance
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleOtStatus(emp.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border",
                        emp.otEligibility === 'OT Employee' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      )}
                    >
                      {emp.otEligibility}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* IMPORT EMPLOYEES MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Import Employee Master (Excel / CSV)</h3>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Paste CSV data or upload your Enerpack Employee Master sheet. Duplicate Staff Nos are automatically validated to preserve unique employee identities.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CSV Data Input</label>
                <textarea
                  rows={6}
                  value={importCsvData}
                  onChange={(e) => setImportCsvData(e.target.value)}
                  placeholder="Staff No, Join Date, Name, Age, State, Occupation, Mobile No, Aadhaar No, Basic Salary, Account No, Bank Name, IFSC Code, Status, OT Status"
                  className="w-full font-mono text-[11px] p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Validation Rules:</p>
                <p>&bull; Staff No must be unique (e.g. ENR023)</p>
                <p>&bull; Salary must be numeric</p>
                <p>&bull; Default OT status is Non-OT unless specified</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Employees imported and synchronized successfully with Master database.');
                  setIsImportModalOpen(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Employee Wizard Modal */}
      <MobileAddEmployeeWizard
        isOpen={isAddWizardOpen}
        onClose={() => {
          setIsAddWizardOpen(false);
          if (searchParams.get('action') === 'new') {
            navigate('/employees', { replace: true });
          }
        }}
        onSuccess={async (newEmpData: any) => {
          const newRecord: EmployeeMasterRecord = {
            id: newEmpData.employeeId || newEmpData.id || `ENR${Math.floor(100 + Math.random() * 900)}`,
            joinDate: newEmpData.joiningDate || newEmpData.joinDate || new Date().toISOString().slice(0, 10),
            name: newEmpData.fullName || newEmpData.name,
            age: Number(newEmpData.age) || 28,
            state: newEmpData.state || 'Kerala',
            country: 'India',
            occupation: newEmpData.designation || newEmpData.occupation || 'Specialist',
            department: newEmpData.department || 'Operations',
            mobile: newEmpData.phone || newEmpData.mobile || '',
            email: newEmpData.email || '',
            aadhaar: newEmpData.aadhaarNumber || newEmpData.aadhaar || 'XXXX XXXX 1234',
            basicSalary: Number(newEmpData.salary || newEmpData.basicSalary) || 25000,
            accountNo: newEmpData.accountNo || 'XXXX XXXX 5678',
            bankName: newEmpData.bankName || 'State Bank of India',
            ifsc: newEmpData.ifsc || 'SBIN0001234',
            status: 'Live',
            otEligibility: newEmpData.otEligibility || 'OT Employee',
            allowanceEligibility: newEmpData.allowanceEligibility || 'Non-Allowance Employee',
            allowanceAmount: Number(newEmpData.allowanceAmount) || 0
          };
          try {
            await addEmployee(newRecord);
            showToast(`Successfully added employee ${newRecord.name} (${newRecord.id})`);
          } catch (err: any) {
            showToast(`Failed to add employee: ${err.message}`);
          }
        }}
        onGenerateContract={(empId, contractType) => {
          navigate(`/contracts?empId=${empId}&type=${encodeURIComponent(contractType)}&action=generate`);
        }}
      />
    </div>
  );
};
