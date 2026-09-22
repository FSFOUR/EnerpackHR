import React from 'react';
import { BarChart3, PieChart, Download, FileText, Truck } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportToPDF } from '../lib/pdfReportGenerator';
import { useFleet } from '../context/FleetContext';
import { ENERPACK_EMPLOYEE_MASTER } from '../data/enerpackEmployeeMaster';

const MOCK_EMPLOYEES = ENERPACK_EMPLOYEE_MASTER.map(e => ({
  id: e.id,
  name: e.name,
  department: e.department || e.occupation,
  designation: e.occupation,
  status: e.status,
  joinDate: e.joinDate
}));

const MOCK_PAYROLL = ENERPACK_EMPLOYEE_MASTER.slice(0, 5).map(e => ({
  empId: e.id,
  name: e.name,
  month: 'September 2026',
  base: (e.basicSalary || 20000).toLocaleString(),
  bonuses: '2,000',
  deductions: '1,000',
  net: ((e.basicSalary || 20000) + 1000).toLocaleString()
}));

const MOCK_LEAVE = ENERPACK_EMPLOYEE_MASTER.slice(0, 3).map((e, idx) => ({
  empId: e.id,
  name: e.name,
  leaveType: idx === 0 ? 'Annual' : idx === 1 ? 'Sick' : 'Casual',
  from: '2026-09-01',
  to: '2026-09-03',
  days: '2',
  status: idx === 2 ? 'Pending' : 'Approved'
}));

export function Reports() {
  const { vehicles } = useFleet();

  const handleExportHeadcount = () => {
    exportToPDF({
      title: 'Enerpack Workforce Headcount Report',
      subtitle: 'Comprehensive list of all Enerpack employees.',
      filename: 'Enerpack-Headcount-Report',
      columns: [
        { header: 'Staff No', dataKey: 'id' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Department', dataKey: 'department' },
        { header: 'Designation', dataKey: 'designation' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Join Date', dataKey: 'joinDate' },
      ],
      data: MOCK_EMPLOYEES
    });
  };

  const handleExportPayroll = () => {
    exportToPDF({
      title: 'Enerpack Payroll Summary Report',
      subtitle: 'Monthly salary distribution and deductions.',
      filename: 'Enerpack-Payroll-Report',
      columns: [
        { header: 'Staff No', dataKey: 'empId' },
        { header: 'Employee Name', dataKey: 'name' },
        { header: 'Month', dataKey: 'month' },
        { header: 'Base (₹)', dataKey: 'base' },
        { header: 'Bonuses (₹)', dataKey: 'bonuses' },
        { header: 'Deductions (₹)', dataKey: 'deductions' },
        { header: 'Net (₹)', dataKey: 'net' },
      ],
      data: MOCK_PAYROLL
    });
  };

  const handleExportLeave = () => {
    exportToPDF({
      title: 'Enerpack Leave Utilization Report',
      subtitle: 'Employee leave requests and approvals.',
      filename: 'Enerpack-Leave-Report',
      columns: [
        { header: 'Staff No', dataKey: 'empId' },
        { header: 'Employee Name', dataKey: 'name' },
        { header: 'Leave Type', dataKey: 'leaveType' },
        { header: 'From', dataKey: 'from' },
        { header: 'To', dataKey: 'to' },
        { header: 'Days', dataKey: 'days' },
        { header: 'Status', dataKey: 'status' },
      ],
      data: MOCK_LEAVE
    });
  };

  const handleExportFleet = () => {
    exportToPDF({
      title: 'Enerpack Fleet & Logistics Report',
      subtitle: 'Vehicle status, mileage, and driver assignments.',
      filename: 'Enerpack-Fleet-Report',
      columns: [
        { header: 'Vehicle ID', dataKey: 'id' },
        { header: 'Model', dataKey: 'model' },
        { header: 'Plate Number', dataKey: 'plateNumber' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Fuel Level', dataKey: 'fuelLevel' },
        { header: 'Mileage', dataKey: 'mileage' },
      ],
      data: vehicles.map((v: any) => ({
        id: v.id,
        model: v.model || v.name || '',
        plateNumber: v.number || v.plateNumber || '',
        status: v.currentStatus || v.status || 'Active',
        fuelLevel: `${v.fuelLevel ?? 80}%`,
        mileage: `${v.currentOdometer ?? v.mileage ?? 0} km`
      }))
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enerpack Reports & Analytics</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Generate, view, and export certified Enerpack operational reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Headcount Report Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Enerpack Workforce Headcount</h3>
            <p className="text-xs text-slate-500 mt-1">Export complete staff directory with active statuses, state distribution, and join dates.</p>
          </div>
          <button
            onClick={handleExportHeadcount}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Headcount PDF
          </button>
        </div>

        {/* Payroll Report Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold mb-3">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Payroll & Salary Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of basic pay, allowances, bonuses, and statutory deductions.</p>
          </div>
          <button
            onClick={handleExportPayroll}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Payroll PDF
          </button>
        </div>

        {/* Leave Utilization Report Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Leave Utilization & Approvals</h3>
            <p className="text-xs text-slate-500 mt-1">Summary of leave logs, casual/sick leave balances, and management approvals.</p>
          </div>
          <button
            onClick={handleExportLeave}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Leave PDF
          </button>
        </div>

        {/* Fleet & Logistics Report Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Fleet & Logistics Status</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time vehicle tracking, fuel consumption, and delivery van operational logs.</p>
          </div>
          <button
            onClick={handleExportFleet}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Fleet PDF
          </button>
        </div>
      </div>
    </div>
  );
}
