import React, { useState } from 'react';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Calendar, Building, ShieldCheck, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const TABS = [
  'Overview', 'Personal', 'Employment', 'Attendance', 'Leave', 
  'Payroll', 'Documents', 'Contracts', 'Policies', 'Performance', 
  'Training', 'Assets', 'Activity'
];

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  // Mock employee data
  const emp = {
    id: id || 'EMP-001',
    name: 'Arjun Sharma',
    department: 'Engineering',
    designation: 'Senior Developer',
    email: 'arjun.sharma@enerpack.in',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    type: 'Full-time',
    joinDate: 'Jan 15, 2023',
    manager: 'Neha Gupta',
    status: 'Active',
    photo: 'A',
    completion: 100
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/employees')} className="p-2 text-slate-400 hover:text-slate-900 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {emp.name} 
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 uppercase tracking-widest">
              {emp.status}
            </span>
          </h1>
          <p className="text-sm text-slate-500">{emp.designation} &bull; {emp.department} &bull; {emp.id}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center text-center md:w-1/3 bg-slate-50/30">
          <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-3xl mb-4 border border-slate-200 shadow-sm">
            {emp.photo}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{emp.name}</h2>
          <p className="text-slate-500 font-medium text-sm mb-1">{emp.designation}</p>
          <p className="text-[10px] text-slate-400 font-mono mb-6">ID: {emp.id}</p>
          
          <div className="w-full flex justify-between items-center bg-white border border-slate-100 rounded-lg p-3 text-sm shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Status</span>
            <span className="font-bold text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {emp.completion}%
            </span>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 md:w-2/3">
          <InfoItem icon={Mail} label="Email Address" value={emp.email} />
          <InfoItem icon={Phone} label="Phone Number" value={emp.phone} />
          <InfoItem icon={MapPin} label="Work Location" value={emp.location} />
          <InfoItem icon={Briefcase} label="Employment Type" value={emp.type} />
          <InfoItem icon={Calendar} label="Joining Date" value={emp.joinDate} />
          <InfoItem icon={Building} label="Reporting Manager" value={emp.manager} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 custom-scrollbar hide-scrollbar bg-slate-50/50">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-700 bg-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-8">
          {activeTab === 'Overview' && (
            <div className="text-slate-500 flex flex-col items-center justify-center py-12">
              <ShieldCheck className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm font-medium">Select a tab to view detailed information.</p>
            </div>
          )}
          {activeTab === 'Personal' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">Identity Information</h3>
                  <div className="space-y-4">
                    <InfoRow label="Date of Birth" value="12 Aug 1990" />
                    <InfoRow label="Gender" value="Male" />
                    <InfoRow label="Aadhaar Number" value="XXXX XXXX 4521" isMasked />
                    <InfoRow label="PAN" value="ABCDE1234F" />
                  </div>
               </div>
               <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">Emergency Contact</h3>
                  <div className="space-y-4">
                    <InfoRow label="Contact Name" value="Priya Sharma" />
                    <InfoRow label="Relationship" value="Spouse" />
                    <InfoRow label="Phone" value="+91 98765 12345" />
                  </div>
               </div>
             </div>
          )}
          {activeTab === 'Leave' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Leave Balance & Quotas (2026)</h3>
                  <p className="text-xs text-slate-500">Allotted time off categories and consumption.</p>
                </div>
                <button
                  onClick={() => navigate('/leave')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer w-fit"
                >
                  <Calendar className="w-4 h-4" /> Apply Leave
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block mb-1">Casual Leave</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-blue-950">10</span>
                    <span className="text-xs text-blue-600 font-medium">/ 12 days left</span>
                  </div>
                  <div className="w-full bg-blue-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[83%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block mb-1">Sick Leave</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-rose-950">8</span>
                    <span className="text-xs text-rose-600 font-medium">/ 10 days left</span>
                  </div>
                  <div className="w-full bg-rose-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full w-[80%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Earned Leave</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-emerald-950">15</span>
                    <span className="text-xs text-emerald-600 font-medium">/ 18 days left</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full w-[83%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block mb-1">Comp-Off</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-purple-950">3</span>
                    <span className="text-xs text-purple-600 font-medium">/ 4 days left</span>
                  </div>
                  <div className="w-full bg-purple-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full w-[75%]"></div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Leave Applications History</h4>
                  <p className="text-xs text-slate-500 mt-0.5">View and track status of all leave applications for this employee.</p>
                </div>
                <button
                  onClick={() => navigate('/leave')}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Manage Leaves &rarr;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Attendance Log & Register</h3>
                  <p className="text-xs text-slate-500">View monthly punch details, overtime calculation, and export attendance cards.</p>
                </div>
                <button
                  onClick={() => navigate('/attendance')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  Open Attendance Desk
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && activeTab !== 'Personal' && activeTab !== 'Leave' && activeTab !== 'Attendance' && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-4">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xl">🚧</span>
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">{activeTab} details</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start gap-4">
    <div className="p-2.5 rounded border border-slate-100 bg-slate-50 text-slate-400 shrink-0 shadow-sm">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

const InfoRow = ({ label, value, isMasked }: any) => (
  <div className="flex justify-between py-1">
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <span className={`text-sm font-medium ${isMasked ? 'tracking-wider font-mono text-slate-700' : 'text-slate-900'}`}>{value}</span>
  </div>
);
