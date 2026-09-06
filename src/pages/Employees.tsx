import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Plus, Filter, Phone, Mail, MoreVertical, 
  ArrowUpDown, UserCheck, Users, Calendar, Clock,
  ChevronRight, Building2, Eye, ShieldCheck, Check, MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MobileAddEmployeeWizard } from '../components/employees/MobileAddEmployeeWizard';

export interface EmployeeItem {
  id: string;
  name: string;
  department: string;
  designation: string;
  type: 'Full-time' | 'Contract' | 'Probation' | 'Intern';
  joinDate: string;
  manager: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  phone: string;
  email: string;
  photo: string;
}

const INITIAL_EMPLOYEES: EmployeeItem[] = [
  { 
    id: 'EMP-001', 
    name: 'Arjun Sharma', 
    department: 'Engineering', 
    designation: 'Senior Developer', 
    type: 'Full-time', 
    joinDate: '2023-01-15', 
    manager: 'Neha Gupta', 
    status: 'Active', 
    phone: '+91 98765 43210',
    email: 'arjun.sharma@enerpack.in',
    photo: 'A' 
  },
  { 
    id: 'EMP-002', 
    name: 'Priya Patel', 
    department: 'Human Resources', 
    designation: 'HR Manager', 
    type: 'Full-time', 
    joinDate: '2022-11-01', 
    manager: 'Rajiv Singh', 
    status: 'Active', 
    phone: '+91 98234 56789',
    email: 'priya.patel@enerpack.in',
    photo: 'P' 
  },
  { 
    id: 'EMP-003', 
    name: 'Vikram Singh', 
    department: 'Sales', 
    designation: 'Account Executive', 
    type: 'Full-time', 
    joinDate: '2023-05-10', 
    manager: 'Amit Kumar', 
    status: 'Active', 
    phone: '+91 97123 45678',
    email: 'vikram.singh@enerpack.in',
    photo: 'V' 
  },
  { 
    id: 'EMP-004', 
    name: 'Ananya Desai', 
    department: 'Marketing', 
    designation: 'Marketing Specialist', 
    type: 'Contract', 
    joinDate: '2024-02-01', 
    manager: 'Sneha Reddy', 
    status: 'On Leave', 
    phone: '+91 96543 21098',
    email: 'ananya.desai@enerpack.in',
    photo: 'A' 
  },
  { 
    id: 'EMP-005', 
    name: 'Rohan Mehta', 
    department: 'Finance', 
    designation: 'Accountant', 
    type: 'Full-time', 
    joinDate: '2021-08-20', 
    manager: 'Rajiv Singh', 
    status: 'Active', 
    phone: '+91 95432 10987',
    email: 'rohan.mehta@enerpack.in',
    photo: 'R' 
  },
  { 
    id: 'EMP-006', 
    name: 'Sneha Reddy', 
    department: 'Operations', 
    designation: 'Operations Lead', 
    type: 'Full-time', 
    joinDate: '2022-04-12', 
    manager: 'Rajiv Singh', 
    status: 'Active', 
    phone: '+91 94321 09876',
    email: 'sneha.reddy@enerpack.in',
    photo: 'S' 
  },
  { 
    id: 'EMP-007', 
    name: 'Karan Joshi', 
    department: 'Engineering', 
    designation: 'Hardware Tech', 
    type: 'Probation', 
    joinDate: '2024-06-01', 
    manager: 'Arjun Sharma', 
    status: 'Inactive', 
    phone: '+91 93210 98765',
    email: 'karan.joshi@enerpack.in',
    photo: 'K' 
  }
];

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState<EmployeeItem[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Leave' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'department'>('name');
  const [isWizardOpen, setIsWizardOpen] = useState(searchParams.get('action') === 'new');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => {
        const matchesSearch = 
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.id.toLowerCase().includes(search.toLowerCase()) ||
          emp.department.toLowerCase().includes(search.toLowerCase()) ||
          emp.designation.toLowerCase().includes(search.toLowerCase()) ||
          emp.phone.includes(search);

        if (!matchesSearch) return false;
        if (statusFilter === 'All') return true;
        return emp.status === statusFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'id') return a.id.localeCompare(b.id);
        return a.department.localeCompare(b.department);
      });
  }, [employees, search, statusFilter, sortBy]);

  const handleAddEmployeeSuccess = (newEmp: EmployeeItem) => {
    setEmployees(prev => [newEmp, ...prev]);
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Top Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Employees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {filteredEmployees.length} of {employees.length} workforce members active
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shadow-blue-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Sticky Search & Filters Section (Section 6) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 sticky top-14 sm:top-16 z-10">
        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name, ID, phone, department..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 min-h-[44px]"
          />
        </div>

        {/* Quick Filter Pills Row & Sort */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['All', 'Active', 'On Leave', 'Inactive'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] flex items-center cursor-pointer",
                  statusFilter === tab 
                    ? "bg-slate-900 text-white shadow-2xs" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort employees"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none min-h-[36px] cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="id">Sort: ID</option>
              <option value="department">Sort: Dept</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE EMPLOYEE CARDS (Visible on phone/tablet, Section 6) */}
      <div className="lg:hidden space-y-2.5">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">No employees found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or active filter.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-3 active:scale-[0.99]"
            >
              {/* Top Row: Avatar, Info, Status */}
              <div 
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-2xs">
                    {emp.photo}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
                      {emp.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                      {emp.designation}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                      <span>{emp.id}</span>
                      <span>&bull;</span>
                      <span className="truncate">{emp.department}</span>
                    </div>
                  </div>
                </div>

                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 border",
                  emp.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  emp.status === 'On Leave' ? "bg-purple-50 text-purple-700 border-purple-200" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  {emp.status}
                </span>
              </div>

              {/* Bottom Quick Action Menu: Call, Message, View Profile (min 44px targets) */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${emp.phone}`}
                    className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 min-h-[44px] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${emp.email}`}
                    className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 min-h-[44px] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email</span>
                  </a>
                </div>

                <button
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 min-h-[44px] cursor-pointer transition-colors"
                >
                  <span>Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Visible only on lg+ screens) */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Designation</th>
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredEmployees.map((emp) => (
              <tr 
                key={emp.id} 
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
                      {emp.photo}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                        {emp.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {emp.id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">{emp.department}</td>
                <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">{emp.designation}</td>
                <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500 font-mono">{emp.phone}</td>
                <td className="py-4 px-6 whitespace-nowrap text-slate-600">{emp.type}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide",
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                    emp.status === 'On Leave' ? 'bg-purple-50 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  )}>
                    {emp.status}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-right">
                  <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center justify-end gap-1">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Multi-Step Mobile Add Employee Modal/Sheet */}
      <MobileAddEmployeeWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={handleAddEmployeeSuccess}
      />
    </div>
  );
};
