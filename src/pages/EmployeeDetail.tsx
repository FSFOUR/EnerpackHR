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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    occupation: '',
    department: '',
    basicSalary: 0,
    mobile: '',
    email: '',
    state: '',
    country: 'India',
    status: 'Live',
    otEligibility: 'OT Employee' as 'OT Employee' | 'Non-OT Employee',
    hasAllowance: false,
    allowanceAmount: '',
    allowanceType: 'Special Duty Allowance',
    accountNo: '',
    bankName: '',
    ifsc: '',
  });

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

  const openEditModal = () => {
    if (!emp) return;
    setEditFormData({
      name: emp.name || '',
      occupation: emp.occupation || '',
      department: emp.department || 'Operations',
      basicSalary: emp.basicSalary || 0,
      mobile: emp.mobile || '',
      email: emp.email || '',
      state: emp.state || 'Kerala',
      country: emp.country || 'India',
      status: emp.status || 'Live',
      otEligibility: (emp.otEligibility === 'Non-OT Employee' ? 'Non-OT Employee' : 'OT Employee'),
      hasAllowance: (emp.allowanceEligibility === 'Allowance Employee' || (Number(emp.allowanceAmount) > 0)),
      allowanceAmount: String(emp.allowanceAmount || ''),
      allowanceType: emp.allowanceType || 'Special Duty Allowance',
      accountNo: emp.accountNo || '',
      bankName: emp.bankName || '',
      ifsc: emp.ifsc || '',
    });
    setIsEditModalOpen(true);
    setShowActionMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!emp) return;
    setIsSaving(true);
    const allowanceVal = editFormData.hasAllowance ? (parseFloat(editFormData.allowanceAmount) || 0) : 0;
    try {
      await updateEmployee(emp.id, {
        name: editFormData.name,
        occupation: editFormData.occupation,
        department: editFormData.department,
        basicSalary: Number(editFormData.basicSalary) || 0,
        mobile: editFormData.mobile,
        email: editFormData.email,
        state: editFormData.state,
        country: editFormData.country,
        status: editFormData.status as any,
        otEligibility: editFormData.otEligibility,
        allowanceEligibility: editFormData.hasAllowance && allowanceVal > 0 ? 'Allowance Employee' : 'Non-Allowance Employee',
        allowanceAmount: allowanceVal,
        allowanceType: editFormData.hasAllowance ? editFormData.allowanceType : 'None',
        accountNo: editFormData.accountNo,
        bankName: editFormData.bankName,
        ifsc: editFormData.ifsc,
      });
      showToast(`Employee ${emp.id} updated successfully`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      showToast(`Failed to update: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
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
                onClick={openEditModal}
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
            {emp.photo || (emp.name ? emp.name.charAt(0).toUpperCase() : 'E')}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {emp.name}
              </h2>
              <button
                onClick={openEditModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Edit Employee Master"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
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
            href={emp.mobile ? `tel:${emp.mobile}` : '#'}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border min-h-[44px] transition-colors",
              emp.mobile 
                ? "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200" 
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            )}
          >
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{emp.mobile || 'No Phone'}</span>
          </a>
          <a
            href={emp.email ? `mailto:${emp.email}` : '#'}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border min-h-[44px] transition-colors",
              emp.email 
                ? "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200" 
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            )}
          >
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Email</span>
          </a>
          <a
            href={emp.mobile ? `https://wa.me/${String(emp.mobile).replace(/[^0-9]/g, '')}` : '#'}
            target={emp.mobile ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border min-h-[44px] transition-colors",
              emp.mobile 
                ? "bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200" 
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            )}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Basic Salary</span>
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 font-mono mt-0.5">₹{emp.basicSalary?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">OT Classification</span>
                  <p className={cn(
                    "text-sm sm:text-base font-extrabold mt-0.5",
                    emp.otEligibility === 'OT Employee' ? "text-blue-700" : "text-purple-700"
                  )}>
                    {emp.otEligibility}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Allowance</span>
                  <p className={cn(
                    "text-sm sm:text-base font-extrabold mt-0.5",
                    (emp.allowanceAmount || 0) > 0 ? "text-emerald-700" : "text-slate-500"
                  )}>
                    {(emp.allowanceAmount || 0) > 0 ? `₹${emp.allowanceAmount?.toLocaleString()}/mo` : 'None'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-0.5">{emp.status}</p>
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
              <div className="bg-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Configured Basic Salary</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono mt-0.5">₹{emp.basicSalary?.toLocaleString() || '0'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openEditModal}
                    className="px-3.5 py-2 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Edit Compensation
                  </button>
                  <button
                    onClick={() => navigate('/payroll')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    View Payroll
                  </button>
                </div>
              </div>

              {/* OT & Allowance Detailed Breakdown Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overtime Policy</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-bold",
                      emp.otEligibility === 'OT Employee' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                    )}>
                      {emp.otEligibility}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {emp.otEligibility === 'OT Employee'
                      ? 'Authorized for daily extra hours and weekend overtime computations at standard multipliers.'
                      : 'Non-overtime salaried role; fixed monthly compensation exempt from overtime billings.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Special Allowance</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-bold",
                      (emp.allowanceAmount || 0) > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    )}>
                      {(emp.allowanceAmount || 0) > 0 ? `₹${emp.allowanceAmount?.toLocaleString()}/mo` : 'Non-Allowance'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {(emp.allowanceAmount || 0) > 0
                      ? `Category: ${emp.allowanceType || 'Special Duty Allowance'}. Added monthly to gross compensation.`
                      : 'No fixed recurring special or site allowances assigned.'}
                  </p>
                </div>
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

      {/* Edit Master Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Edit Employee Master</h3>
                <p className="text-xs text-slate-500 font-mono">Staff No: {emp.id}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Occupation / Designation *
                  </label>
                  <input
                    type="text"
                    value={editFormData.occupation}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Basic Salary (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={editFormData.basicSalary}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, basicSalary: Number(e.target.value) || 0 }))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* OT Classification Checkboxes */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Overtime (OT) Classification *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, otEligibility: 'OT Employee' }))}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer",
                      editFormData.otEligibility === 'OT Employee'
                        ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      editFormData.otEligibility === 'OT Employee'
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-300"
                    )}>
                      {editFormData.otEligibility === 'OT Employee' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">OT Employee</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Eligible for 1.5x regular and 2.0x weekend overtime pay
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, otEligibility: 'Non-OT Employee' }))}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer",
                      editFormData.otEligibility === 'Non-OT Employee'
                        ? "bg-purple-50/80 border-purple-500 text-purple-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      editFormData.otEligibility === 'Non-OT Employee'
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white border-slate-300"
                    )}>
                      {editFormData.otEligibility === 'Non-OT Employee' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Non-OT Employee</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Fixed salary package; exempt from overtime calculation
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Special Allowance Checkbox & Amount Input Column */}
              <div className="pt-2 border-t border-slate-200">
                <div 
                  onClick={() => setEditFormData(prev => ({ ...prev, hasAllowance: !prev.hasAllowance }))}
                  className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                    editFormData.hasAllowance
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-slate-300"
                  )}>
                    {editFormData.hasAllowance && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-800 block cursor-pointer">
                      Special / Site Allowance Eligible
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enable if this employee receives extra monthly recurring allowance.
                    </p>
                  </div>
                </div>

                {/* Allowance Input Column */}
                {editFormData.hasAllowance && (
                  <div className="mt-2.5 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                          Allowance Amount (₹ / month) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.allowanceAmount}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, allowanceAmount: e.target.value }))}
                            placeholder="e.g. 3000"
                            className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
                          Allowance Category
                        </label>
                        <select
                          value={editFormData.allowanceType}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, allowanceType: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px] cursor-pointer"
                        >
                          <option value="Special Duty Allowance">Special Duty Allowance</option>
                          <option value="Site / Project Allowance">Site / Project Allowance</option>
                          <option value="Mess / Food Allowance">Mess / Food Allowance</option>
                          <option value="Travel & Conveyance Allowance">Travel & Conveyance Allowance</option>
                          <option value="Management Allowance">Management Allowance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employment Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] cursor-pointer"
                  >
                    <option value="Live">Live (Active)</option>
                    <option value="Exit">Exit (Inactive)</option>
                    <option value="Probation">Probation</option>
                    <option value="Suspension">Suspension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
