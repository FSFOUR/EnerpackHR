import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Check, Upload, 
  User, Shield, Briefcase, FileText, CheckCircle2,
  Calendar, Mail, Phone, MapPin, DollarSign, Camera
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmployeeFormData {
  // Step 1: Basic
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  // Step 2: Identity
  aadhaarNumber: string;
  panNumber: string;
  address: string;
  emergencyContact: string;
  // Step 3: Employment
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full-time' | 'Contract' | 'Probation' | 'Intern';
  salary: string;
  otEligibility: 'OT Employee' | 'Non-OT Employee';
  hasAllowance: boolean;
  allowanceAmount: string;
  allowanceType: string;
  // Step 4: Documents
  photoName: string;
  idProofName: string;
  addressProofName: string;
}

const INITIAL_FORM: EmployeeFormData = {
  fullName: '',
  dob: '',
  gender: 'Male',
  phone: '',
  email: '',
  aadhaarNumber: '',
  panNumber: '',
  address: '',
  emergencyContact: '',
  employeeId: `ENR-${Math.floor(100 + Math.random() * 900)}`,
  department: 'Operations',
  designation: 'Specialist',
  joiningDate: new Date().toISOString().split('T')[0],
  employmentType: 'Full-time',
  salary: '25000',
  otEligibility: 'OT Employee',
  hasAllowance: false,
  allowanceAmount: '',
  allowanceType: 'Special Duty Allowance',
  photoName: '',
  idProofName: '',
  addressProofName: '',
};

interface MobileAddEmployeeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmployee: any) => void;
  onGenerateContract?: (empId: string, contractType: 'Residential' | 'Non-Residential / Other State Employee') => void;
}

export const MobileAddEmployeeWizard: React.FC<MobileAddEmployeeWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onGenerateContract,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedEmpId, setSavedEmpId] = useState<string | null>(null);
  const [selectedContractType, setSelectedContractType] = useState<'Residential' | 'Non-Residential / Other State Employee'>('Residential');

  if (!isOpen) return null;

  const updateField = (field: keyof EmployeeFormData, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
      if (!formData.phone.trim()) errs.phone = 'Phone number is required';
      if (!formData.email.trim()) errs.email = 'Valid email is required';
    } else if (step === 2) {
      if (!formData.aadhaarNumber.trim()) errs.aadhaarNumber = 'Aadhaar / ID number is required';
      if (!formData.address.trim()) errs.address = 'Residential address is required';
    } else if (step === 3) {
      if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
      if (!formData.designation.trim()) errs.designation = 'Designation is required';
      if (formData.hasAllowance && (!formData.allowanceAmount.trim() || Number(formData.allowanceAmount) < 0)) {
        errs.allowanceAmount = 'Please enter a valid allowance amount';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 5) setStep((step + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 6) setStep((step - 1) as any);
  };

  const handleSave = () => {
    const allowanceVal = formData.hasAllowance ? (parseFloat(formData.allowanceAmount) || 0) : 0;
    const newEmp = {
      id: formData.employeeId,
      name: formData.fullName,
      department: formData.department,
      designation: formData.designation,
      occupation: formData.designation,
      type: formData.employmentType,
      joinDate: formData.joiningDate,
      phone: formData.phone,
      mobile: formData.phone,
      email: formData.email,
      status: 'Live',
      photo: (formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'E'),
      basicSalary: parseFloat(formData.salary) || 20000,
      aadhaar: formData.aadhaarNumber,
      state: 'Kerala',
      country: 'India',
      otEligibility: formData.otEligibility || 'OT Employee',
      allowanceEligibility: formData.hasAllowance && allowanceVal > 0 ? 'Allowance Employee' : 'Non-Allowance Employee',
      allowanceType: formData.hasAllowance ? (formData.allowanceType || 'Special Duty Allowance') : 'None',
      allowanceAmount: allowanceVal,
    };
    try {
      Promise.resolve(onSuccess(newEmp)).catch(err => {
        console.error('Error invoking onSuccess handler:', err);
      });
    } catch (err) {
      console.error('Error calling onSuccess:', err);
    }
    setSavedEmpId(formData.employeeId);
    setStep(6 as any); // Success prompt step
  };

  const stepsList = [
    { num: 1, title: 'Basic Info', icon: User },
    { num: 2, title: 'Identity', icon: Shield },
    { num: 3, title: 'Employment', icon: Briefcase },
    { num: 4, title: 'Documents', icon: FileText },
    { num: 5, title: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Container */}
      <div className="relative w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[92vh] h-[92vh] sm:h-auto overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {step === 6 ? 'Employee Created Successfully' : 'Add New Employee'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {step <= 5 ? (
                <>Step {step} of 5 &bull; {stepsList[step - 1]?.title || 'Form'}</>
              ) : (
                <>Onboarding Complete &bull; Staff No: {formData.employeeId}</>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Pills - Only visible during steps 1 to 5 */}
        {step <= 5 && (
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between overflow-x-auto custom-scrollbar shrink-0">
            {stepsList.map((s) => {
              const isCompleted = s.num < step;
              const isCurrent = s.num === step;
              return (
                <div 
                  key={s.num} 
                  onClick={() => {
                    if (s.num < step) setStep(s.num as any);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
                    isCurrent ? "bg-blue-600 text-white shadow-2xs" :
                    isCompleted ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" :
                    "text-slate-400"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0",
                    isCurrent ? "bg-white text-blue-600" :
                    isCompleted ? "bg-emerald-600 text-white" :
                    "bg-slate-200 text-slate-600"
                  )}>
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                  </div>
                  <span className="hidden xs:inline whitespace-nowrap">{s.title}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[44px]",
                    errors.fullName ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                  )}
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField('dob', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px] cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]",
                    errors.phone ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                  )}
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official / Personal Email *
                </label>
                <input
                  type="email"
                  inputMode="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="employee@enerpack.in"
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]",
                    errors.email ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                  )}
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: IDENTITY */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Aadhaar / National ID Number *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.aadhaarNumber}
                  onChange={(e) => updateField('aadhaarNumber', e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PAN Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Residential Address *
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Permanent Street address, City, State, PIN"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Contact (Name & Phone)
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                  placeholder="e.g. Ramesh Sharma (Father) - +91 98451 12345"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: EMPLOYMENT */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => updateField('employeeId', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px] cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designation *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                  placeholder="e.g. Senior Battery Architect"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => updateField('joiningDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => updateField('employmentType', e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px] cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Probation">Probation</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Monthly Gross Salary (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={formData.salary}
                    onChange={(e) => updateField('salary', e.target.value)}
                    placeholder="25000"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  />
                </div>
              </div>

              {/* OT Classification Checkboxes */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Overtime (OT) Classification *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateField('otEligibility', 'OT Employee')}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer",
                      formData.otEligibility === 'OT Employee'
                        ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      formData.otEligibility === 'OT Employee'
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-300"
                    )}>
                      {formData.otEligibility === 'OT Employee' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">OT Employee</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Eligible for regular (1.5x) and double (2.0x) overtime calculations
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('otEligibility', 'Non-OT Employee')}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer",
                      formData.otEligibility === 'Non-OT Employee'
                        ? "bg-purple-50/80 border-purple-500 text-purple-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      formData.otEligibility === 'Non-OT Employee'
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white border-slate-300"
                    )}>
                      {formData.otEligibility === 'Non-OT Employee' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Non-OT Employee</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Fixed monthly compensation; exempt from overtime pay calculations
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Allowance Checkbox & Input Column */}
              <div className="pt-2 border-t border-slate-200">
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, hasAllowance: !prev.hasAllowance }))}
                  className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                    formData.hasAllowance
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-slate-300"
                  )}>
                    {formData.hasAllowance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-800 block cursor-pointer">
                      Special / Site Allowance Eligible
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Check if this employee receives extra monthly recurring allowance (site duty, food/mess, or managerial allowance).
                    </p>
                  </div>
                </div>

                {/* Allowance Input Column (conditionally rendered when checked) */}
                {formData.hasAllowance && (
                  <div className="mt-3 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                          Allowance Amount (₹ / month) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-bold">₹</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={formData.allowanceAmount}
                            onChange={(e) => updateField('allowanceAmount', e.target.value)}
                            placeholder="e.g. 3000"
                            className={cn(
                              "w-full pl-8 pr-3.5 py-2.5 bg-white border rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]",
                              errors.allowanceAmount ? "border-rose-400 bg-rose-50/20" : "border-emerald-300"
                            )}
                          />
                        </div>
                        {errors.allowanceAmount && (
                          <p className="text-xs text-rose-600 mt-1 font-medium">{errors.allowanceAmount}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                          Allowance Category / Purpose
                        </label>
                        <select
                          value={formData.allowanceType}
                          onChange={(e) => updateField('allowanceType', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] cursor-pointer"
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
            </div>
          )}

          {/* STEP 4: DOCUMENTS */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xs text-slate-500">
                Upload compliance records and verification proofs for employee onboarding.
              </p>

              {[
                { label: 'Upload Profile Photo', key: 'photoName', desc: 'Passport size JPEG/PNG photo' },
                { label: 'Upload ID Proof (Aadhaar/Passport)', key: 'idProofName', desc: 'Official government identity card' },
                { label: 'Upload Address Proof', key: 'addressProofName', desc: 'Electricity bill / Rental agreement / Passbook' },
              ].map((docItem) => (
                <div key={docItem.key} className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-white transition-colors text-center">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">{docItem.label}</span>
                  <span className="text-[11px] text-slate-400 block mb-2">{docItem.desc}</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer min-h-[36px]">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>{formData[docItem.key as keyof EmployeeFormData] ? 'Change File' : 'Choose / Capture'}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateField(docItem.key as any, file.name);
                      }}
                    />
                  </label>
                  {formData[docItem.key as keyof EmployeeFormData] && (
                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> {formData[docItem.key as keyof EmployeeFormData]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 5: REVIEW & SAVE */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{formData.fullName || 'New Employee'}</h3>
                  <p className="text-xs text-blue-700 font-semibold">{formData.designation} &bull; {formData.department}</p>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {formData.employeeId}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Contact Details</span>
                  <div className="flex justify-between py-0.5"><span className="text-slate-500">Phone:</span> <span className="font-semibold text-slate-800">{formData.phone}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{formData.email}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-500">Address:</span> <span className="font-semibold text-slate-800 truncate max-w-[200px]">{formData.address || 'Not provided'}</span></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Employment Terms</span>
                  <div className="flex justify-between py-0.5"><span className="text-slate-500">Joining Date:</span> <span className="font-semibold text-slate-800">{formData.joiningDate}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-500">Type:</span> <span className="font-semibold text-slate-800">{formData.employmentType}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-500">Salary:</span> <span className="font-semibold text-slate-800 font-mono">₹{Number(formData.salary || 0).toLocaleString()}/mo</span></div>
                  <div className="flex justify-between py-0.5 border-t border-slate-200 pt-1 mt-1">
                    <span className="text-slate-500">OT Classification:</span> 
                    <span className={cn(
                      "font-bold text-xs px-2 py-0.5 rounded-md",
                      formData.otEligibility === 'OT Employee' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                    )}>
                      {formData.otEligibility}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Allowance Status:</span> 
                    <span className={cn(
                      "font-bold text-xs px-2 py-0.5 rounded-md",
                      formData.hasAllowance && Number(formData.allowanceAmount) > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    )}>
                      {formData.hasAllowance && Number(formData.allowanceAmount) > 0 
                        ? `₹${Number(formData.allowanceAmount).toLocaleString()}/mo (${formData.allowanceType})`
                        : 'Non-Allowance'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 py-4 text-center animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Employee Saved Successfully</h3>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 max-w-sm mx-auto">
                <p><span className="text-slate-500">Staff No:</span> <span className="font-bold text-slate-900">{formData.employeeId}</span></p>
                <p><span className="text-slate-500">Employee Name:</span> <span className="font-bold text-slate-900">{formData.fullName}</span></p>
                <p><span className="text-slate-500">Designation:</span> <span className="font-bold text-slate-900">{formData.designation}</span></p>
              </div>

              <div className="max-w-sm mx-auto text-left space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Contract Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedContractType('Residential')}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer",
                      selectedContractType === 'Residential' ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Residential
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedContractType('Non-Residential / Other State Employee')}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer",
                      selectedContractType === 'Non-Residential / Other State Employee' ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Non-Residential / Other State
                  </button>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-700 pt-2">Would you like to generate the Employee Contract Agreement now?</p>
              <div className="grid grid-cols-2 gap-3 pt-1 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setStep(1);
                    setFormData(INITIAL_FORM);
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  No / Skip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onGenerateContract && savedEmpId) {
                      onGenerateContract(savedEmpId, selectedContractType);
                    }
                    onClose();
                    setStep(1);
                    setFormData(INITIAL_FORM);
                  }}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Yes, Generate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Navigation Bar (Back / Next / Save) */}
        {step < 6 && (
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 safe-area-inset-bottom">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-xs shadow-blue-200 flex items-center gap-1.5 min-h-[44px] cursor-pointer ml-auto"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-xs shadow-emerald-200 flex items-center gap-1.5 min-h-[44px] cursor-pointer ml-auto"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Employee</span>
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
