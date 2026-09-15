import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, 
  Calendar, Building, ShieldCheck, CheckCircle, Clock, 
  FileText, DollarSign, Laptop, MessageCircle, MoreVertical,
  Download, Eye, AlertCircle, Check, X, ShieldAlert,
  CreditCard, Award, Home, Activity, Lock, Unlock, AlertTriangle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { maskAadhaar, maskAccountNo } from '../data/enerpackEmployeeMaster';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../context/EmployeeContext';
import { logAuditEvent } from '../lib/auditLogger';

const PROFILE_TABS = [
  'Overview',
  'Personal Details',
  'Employment',
  'Salary',
  'Bank Details',
  'Attendance',
  'Overtime',
  'Leave',
  'Payroll',
  'Documents',
  'Contract Agreements',
  'Disciplinary / Warnings',
  'Accommodation',
  'Audit History'
];

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { employees, updateEmployee, loading } = useEmployees();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find employee from EmployeeContext (Firestore live records)
  const emp = useMemo(() => {
    return employees.find(e => e.id === id);
  }, [employees, id]);

  const canViewSensitive = useMemo(() => {
    const role = userProfile?.role;
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'HR_MANAGER' || role === 'ACCOUNTANT';
  }, [userProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = async () => {
    if (!emp) return;
    const nextStatus = emp.status === 'Live' ? 'Exit' : 'Live';
    try {
      await updateEmployee(emp.id, { status: nextStatus });
      showToast(`Employee ${emp.id} status changed to ${nextStatus}`);
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`);
    }
    setShowActionMenu(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-semibold">Loading employee details...</p>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl space-y-4">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Employee Record Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No employee found with ID "{id}". It may have been deleted or not yet registered.
        </p>
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee List</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full px-2 sm:px-4 pb-12 select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => navigate('/employees')} 
            aria-label="Back to employee directory"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 truncate leading-tight">
                {emp.name}
              </h1>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 border",
                emp.status === 'Live' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                emp.status === 'Exit' ? "bg-rose-50 text-rose-700 border-rose-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {emp.status}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 border",
                emp.otEligibility === 'OT Employee' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200"
              )}>
                {emp.otEligibility}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">
              Staff No: {emp.id} &bull; {emp.occupation} &bull; {emp.state}
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            aria-label="Employee options"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors border border-slate-200"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showActionMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowActionMenu(false)}
            >
              <button
                onClick={() => {
                  showToast('Edit profile modal opened');
                  setShowActionMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors min-h-[40px] text-left cursor-pointer"
              >
                <Edit className="w-4 h-4 text-blue-600" />
                <span>Edit Master Details</span>
              </button>
              <button
                onClick={handleToggleStatus}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[40px] text-left cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{emp.status === 'Live' ? 'Mark as Exit' : 'Mark as Live'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            {emp.photo || emp.name.charAt(0)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
              {emp.name}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">{emp.occupation}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {emp.department || 'Enerpack Operations'}
              </span>
              <span>&bull;</span>
              <span className="font-mono font-bold text-slate-700">{emp.id}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {emp.state}, {emp.country}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <a
            href={`tel:${emp.mobile}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold border border-slate-200 min-h-[44px] transition-colors"
          >
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{emp.mobile || 'No Phone'}</span>
          </a>
          <a
            href={`mailto:${emp.email}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold border border-slate-200 min-h-[44px] transition-colors"
          >
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Email</span>
          </a>
          <a
            href={`https://wa.me/${emp.mobile.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold border border-slate-200 min-h-[44px] transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 13-Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 custom-scrollbar">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-xs font-bold tracking-wide whitespace-nowrap border-b-2 transition-all min-h-[44px] flex items-center cursor-pointer",
                activeTab === tab 
                  ? "border-blue-600 text-blue-700 bg-white shadow-2xs" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6">
          {activeTab === 'Overview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Basic Salary</span>
                  <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">₹{emp.basicSalary?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">OT Classification</span>
                  <p className="text-lg font-extrabold text-blue-700 mt-0.5">{emp.otEligibility}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Employment Status</span>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">{emp.status}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Enerpack Master Summary</h4>
                <p className="text-slate-600">
                  Staff No <span className="font-mono font-bold">{emp.id}</span> is officially registered under the {emp.occupation} occupation, joining on {emp.joinDate || 'N/A'}. 
                  All attendance, leave, overtime, and payroll calculations are linked directly to this master record.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Personal Details' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[11px]">Sensitive Identity Protection</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold",
                    canViewSensitive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {canViewSensitive ? 'Full View Authorized' : 'Masked for Privacy'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div><span className="text-slate-400">Full Name:</span> <span className="font-bold text-slate-900 ml-1">{emp.name}</span></div>
                  <div><span className="text-slate-400">Age:</span> <span className="font-bold text-slate-900 ml-1">{emp.age || 'N/A'}</span></div>
                  <div><span className="text-slate-400">Aadhaar Number:</span> <span className="font-mono font-bold text-slate-900 ml-1">{maskAadhaar(emp.aadhaar, canViewSensitive)}</span></div>
                  <div><span className="text-slate-400">State / Country:</span> <span className="font-bold text-slate-900 ml-1">{emp.state}, {emp.country}</span></div>
                  <div><span className="text-slate-400">Mobile Number:</span> <span className="font-mono font-bold text-slate-900 ml-1">{emp.mobile || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Employment' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className="text-slate-400">Staff No:</span> <span className="font-mono font-bold text-slate-900 ml-1">{emp.id}</span></div>
                  <div><span className="text-slate-400">Join Date:</span> <span className="font-bold text-slate-900 ml-1">{emp.joinDate || 'N/A'}</span></div>
                  <div><span className="text-slate-400">Occupation / Designation:</span> <span className="font-bold text-slate-900 ml-1">{emp.occupation}</span></div>
                  <div><span className="text-slate-400">Employment Status:</span> <span className="font-bold text-emerald-700 ml-1">{emp.status}</span></div>
                  <div><span className="text-slate-400">Remarks:</span> <span className="font-bold text-slate-800 ml-1">{emp.remarks || 'None'}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Salary' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Configured Basic Salary</span>
                  <p className="text-2xl font-extrabold text-emerald-950 font-mono mt-0.5">₹{emp.basicSalary?.toLocaleString() || '0'}</p>
                </div>
                <button
                  onClick={() => navigate('/payroll')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  View Payroll
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Bank Details' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className="text-slate-400">Bank Name:</span> <span className="font-bold text-slate-900 ml-1">{emp.bankName || 'N/A'}</span></div>
                  <div><span className="text-slate-400">Account Number:</span> <span className="font-mono font-bold text-slate-900 ml-1">{maskAccountNo(emp.accountNo, canViewSensitive)}</span></div>
                  <div><span className="text-slate-400">IFSC Code:</span> <span className="font-mono font-bold text-slate-900 ml-1">{emp.ifsc || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Attendance Integration Linked</h4>
                  <p className="text-slate-500 mt-0.5">Real-time attendance logs are synchronized with the Employee Master.</p>
                </div>
                <button
                  onClick={() => navigate('/attendance')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  View Attendance
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Overtime' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-blue-700">OT Classification Rule</span>
                <p className="text-sm font-bold text-blue-950">Classification: {emp.otEligibility}</p>
                <p className="text-slate-600 text-xs">
                  {emp.otEligibility === 'OT Employee' 
                    ? 'Eligible for overtime calculation and approval workflow.' 
                    : 'Non-OT classification. Overtime earnings are restricted unless authorized override is recorded.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Leave' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Leave Management</h4>
                  <p className="text-slate-500">Manage sick leave, casual leave, and annual leave balances.</p>
                </div>
                <button
                  onClick={() => navigate('/leave')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Leave Module
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Payroll' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Payroll & Pay Slips</h4>
                  <p className="text-slate-500">Official Enerpack pay slips and monthly salary calculation.</p>
                </div>
                <button
                  onClick={() => navigate('/payroll')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  View Payroll
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Contract Agreements' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Employee Contract Agreements</h4>
                  <p className="text-slate-500 mt-0.5">Manage official Residential and Non-Residential / Other State employment agreements for {emp.name}.</p>
                </div>
                <button
                  onClick={() => navigate(`/contracts?empId=${emp.id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Generate New Agreement
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">ENR-CON-2026-0001 (Residential)</p>
                      <p className="text-slate-500 text-[11px]">Issued: {emp.joinDate || '2026-01-15'} &bull; Staff No: {emp.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-lg border border-emerald-200 text-[11px]">Active</span>
                    <button
                      onClick={() => navigate(`/contracts?empId=${emp.id}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                    >
                      View / Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Disciplinary / Warnings' && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
                No disciplinary warnings or notices recorded for {emp.name}.
              </div>
            </div>
          )}

          {activeTab === 'Accommodation' && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
                Company staff accommodation status: Standard quarters assigned (if applicable).
              </div>
            </div>
          )}

          {activeTab === 'Audit History' && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600">
                [2026-09-10 03:00:00] Master Record Synchronized: {emp.id} - {emp.name} ({emp.status})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
