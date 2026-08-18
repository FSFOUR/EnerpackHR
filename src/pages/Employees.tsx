import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, MoreHorizontal, User, FileText, FileSignature, Clock, Calendar, ShieldCheck } from 'lucide-react';

const mockEmployees = [
  { id: 'EMP-001', name: 'Arjun Sharma', department: 'Engineering', designation: 'Senior Developer', type: 'Full-time', joinDate: '2023-01-15', manager: 'Neha Gupta', status: 'Active', photo: 'A' },
  { id: 'EMP-002', name: 'Priya Patel', department: 'Human Resources', designation: 'HR Manager', type: 'Full-time', joinDate: '2022-11-01', manager: 'Rajiv Singh', status: 'Active', photo: 'P' },
  { id: 'EMP-003', name: 'Vikram Singh', department: 'Sales', designation: 'Account Executive', type: 'Full-time', joinDate: '2023-05-10', manager: 'Amit Kumar', status: 'Active', photo: 'V' },
  { id: 'EMP-004', name: 'Ananya Desai', department: 'Marketing', designation: 'Marketing Specialist', type: 'Contract', joinDate: '2024-02-01', manager: 'Sneha Reddy', status: 'Probation', photo: 'A' },
  { id: 'EMP-005', name: 'Rohan Mehta', department: 'Finance', designation: 'Accountant', type: 'Full-time', joinDate: '2021-08-20', manager: 'Rajiv Singh', status: 'Active', photo: 'R' },
];

export const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Employee Directory</h1>
          <p className="text-slate-500 text-sm">Manage your workforce, view profiles, and perform HR actions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {mockEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {emp.photo}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 italic">ID: {emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">{emp.department}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">{emp.designation}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">{emp.type}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      emp.status === 'Active' ? 'bg-green-50 text-green-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/employees/${emp.id}`}>
                        <ActionIconButton icon={User} title="View Profile" />
                      </Link>
                      <ActionIconButton icon={FileText} title="Documents" />
                      <ActionIconButton icon={FileSignature} title="Contract" />
                      <button className="p-2 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Showing 1 to 5 of 5 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors">Prev</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionIconButton = ({ icon: Icon, title }: any) => (
  <button title={title} className="p-2 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors">
    <Icon className="w-4 h-4" />
  </button>
);
