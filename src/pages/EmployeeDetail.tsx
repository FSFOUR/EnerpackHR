import React, { useState } from 'react';
import { 
  ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, 
  Calendar, Building, ShieldCheck, CheckCircle, Clock, 
  FileText, DollarSign, Laptop, MessageCircle, MoreVertical,
  Download, Eye, AlertCircle, Check, X, ShieldAlert
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';

const MOBILE_TABS = [
  'Info', 'Attendance', 'Leave', 'Documents', 'Salary', 'Assets'
];

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Info');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock employee data
  const emp = {
    id: id || 'EMP-001',
    name: 'Arjun Sharma',
    department: 'Engineering',
    designation: 'Senior Developer',
    email: 'arjun.sharma@enerpack.in',
    phone: '+919876543210',
    displayPhone: '+91 98765 43210',
    location: 'Bangalore, India',
    type: 'Full-time',
    joinDate: 'Jan 15, 2023',
    manager: 'Neha Gupta',
    status: status,
    photo: 'A',
    salary: '₹1,20,000 / mo',
    pan: 'ABCDE1234F',
    aadhaar: 'XXXX-XXXX-4521',
    completion: 100
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = () => {
    const nextStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(nextStatus);
    showToast(`Employee marked as ${nextStatus}`);
    setShowActionMenu(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-10 select-none">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header: Back button, Employee name, Status badge, Action menu */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => navigate('/employees')} 
            aria-label="Back to employee directory"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 truncate leading-tight">
                {emp.name}
              </h1>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0",
                emp.status === 'Active' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
              )}>
                {emp.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {emp.designation} &bull; {emp.id}
            </p>
          </div>
        </div>

        {/* Action Menu (Edit, Deactivate) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            aria-label="Employee action options"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors border border-slate-200"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showActionMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowActionMenu(false)}
            >
              <button
                onClick={() => {
                  showToast('Edit mode enabled for employee profile');
                  setShowActionMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors min-h-[40px] text-left cursor-pointer"
              >
                <Edit className="w-4 h-4 text-blue-600" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleToggleStatus}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[40px] text-left cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{emp.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Profile Overview Card (Photo, Name, ID, Designation, Dept, Quick Actions: Call, Email, WhatsApp) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            {emp.photo}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
              {emp.name}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">{emp.designation}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {emp.department}
              </span>
              <span>&bull;</span>
              <span className="font-mono">{emp.id}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {emp.location}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Touch Buttons: Call, Email, WhatsApp (min 44px) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <a
            href={`tel:${emp.phone}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold border border-slate-200 min-h-[44px] transition-colors"
          >
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Call</span>
          </a>
          <a
            href={`mailto:${emp.email}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold border border-slate-200 min-h-[44px] transition-colors"
          >
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Email</span>
          </a>
          <a
            href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold border border-slate-200 min-h-[44px] transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 3. Horizontal Scrollable Tab Bar: Info, Attendance, Leave, Documents, Salary, Assets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 custom-scrollbar">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap border-b-2 transition-all min-h-[44px] flex items-center cursor-pointer",
                activeTab === tab 
                  ? "border-blue-600 text-blue-700 bg-white" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Cards */}
        <div className="p-4 sm:p-6">
          {/* TAB 1: INFO */}
          {activeTab === 'Info' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Identity & Personal Record
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500">Date of Birth:</span> <span className="font-bold text-slate-800 ml-1">12 Aug 1990</span></div>
                  <div><span className="text-slate-500">Gender:</span> <span className="font-bold text-slate-800 ml-1">Male</span></div>
                  <div><span className="text-slate-500">Aadhaar (Masked):</span> <span className="font-mono font-bold text-slate-800 ml-1">{emp.aadhaar}</span></div>
                  <div><span className="text-slate-500">PAN Card:</span> <span className="font-mono font-bold text-slate-800 ml-1">{emp.pan}</span></div>
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Employment Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500">Joining Date:</span> <span className="font-bold text-slate-800 ml-1">{emp.joinDate}</span></div>
                  <div><span className="text-slate-500">Employment Type:</span> <span className="font-bold text-slate-800 ml-1">{emp.type}</span></div>
                  <div><span className="text-slate-500">Reporting Manager:</span> <span className="font-bold text-slate-800 ml-1">{emp.manager}</span></div>
                  <div><span className="text-slate-500">Department:</span> <span className="font-bold text-slate-800 ml-1">{emp.department}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'Attendance' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Present</span>
                  <p className="text-xl font-extrabold text-emerald-950 mt-0.5">21 days</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Late</span>
                  <p className="text-xl font-extrabold text-amber-950 mt-0.5">1 day</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Leave</span>
                  <p className="text-xl font-extrabold text-purple-950 mt-0.5">1 day</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Total Hours</span>
                  <p className="text-xl font-extrabold text-blue-950 mt-0.5">210 hrs</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Assigned Shift: 08:00 AM – 06:00 PM</h4>
                  <p className="text-[11px] text-slate-500">10-hour standard operational shift &bull; ₹50 OT Night Rate</p>
                </div>
                <button
                  onClick={() => navigate('/attendance')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer"
                >
                  View Heatmap
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LEAVE */}
          {activeTab === 'Leave' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Casual Leave</span>
                  <p className="text-lg font-bold text-blue-950 mt-0.5">10 / 12</p>
                </div>
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Sick Leave</span>
                  <p className="text-lg font-bold text-rose-950 mt-0.5">8 / 10</p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Earned Leave</span>
                  <p className="text-lg font-bold text-emerald-950 mt-0.5">15 / 18</p>
                </div>
                <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/50">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Comp-off</span>
                  <p className="text-lg font-bold text-purple-950 mt-0.5">3 / 4</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Leave Applications</h4>
                  <p className="text-[11px] text-slate-500">Track and submit leaves directly for this employee.</p>
                </div>
                <button
                  onClick={() => navigate('/leave')}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer"
                >
                  Manage Leave
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'Documents' && (
            <div className="space-y-2.5 animate-in fade-in">
              {[
                { name: 'Aadhaar Card Copy.pdf', type: 'PDF', date: 'Jan 15, 2023', verified: true },
                { name: 'PAN Card Verification.pdf', type: 'PDF', date: 'Jan 15, 2023', verified: true },
                { name: 'Signed Employment Contract.pdf', type: 'PDF', date: 'Jan 18, 2023', verified: true },
                { name: 'Enerpack Code of Conduct Acknowledgment.pdf', type: 'PDF', date: 'Jan 20, 2023', verified: true }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 font-bold text-xs">
                      {doc.type}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-400">Uploaded {doc.date} &bull; Verified</span>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Opening ${doc.name}`)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SALARY */}
          {activeTab === 'Salary' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Monthly Net Compensation</span>
                  <h3 className="text-xl font-extrabold text-emerald-950 font-mono mt-0.5">{emp.salary}</h3>
                </div>
                <button
                  onClick={() => navigate('/payroll')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold min-h-[36px]"
                >
                  Pay Slips
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span className="text-slate-500">Base Salary:</span> <span className="font-bold text-slate-800 font-mono">₹90,000</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span className="text-slate-500">House Rent Allowance:</span> <span className="font-bold text-slate-800 font-mono">₹20,000</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span className="text-slate-500">Special Allowance:</span> <span className="font-bold text-slate-800 font-mono">₹10,000</span></div>
                <div className="flex justify-between py-1 text-rose-600"><span className="font-medium">PF & Statutory Deductions:</span> <span className="font-bold font-mono">-₹8,500</span></div>
              </div>
            </div>
          )}

          {/* TAB 6: ASSETS */}
          {activeTab === 'Assets' && (
            <div className="space-y-2.5 animate-in fade-in">
              {[
                { title: 'MacBook Pro 14" M3', serial: 'SN-ENG-8941', issued: 'Jan 15, 2023', condition: 'Excellent' },
                { title: 'Enerpack Security Keycard', serial: 'KC-001-A', issued: 'Jan 15, 2023', condition: 'Active' },
                { title: 'Company Pool Vehicle (Assigned)', serial: 'KL-07-CD-5678', issued: 'Aug 01, 2024', condition: 'Good' },
              ].map((asset, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{asset.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{asset.serial} &bull; Issued {asset.issued}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {asset.condition}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
