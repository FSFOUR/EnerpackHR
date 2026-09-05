import React from 'react';
import { BarChart3, PieChart, Download, FileText, Truck } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportToPDF } from '../lib/pdfReportGenerator';
import { useFleet } from '../context/FleetContext';
import { format } from 'date-fns';

const MOCK_EMPLOYEES = [
  { id: 'EMP-001', name: 'Arjun Sharma', department: 'Engineering', designation: 'Senior Developer', type: 'Full-time', joinDate: '2023-01-15' },
  { id: 'EMP-002', name: 'Priya Patel', department: 'Human Resources', designation: 'HR Manager', type: 'Full-time', joinDate: '2022-11-01' },
  { id: 'EMP-003', name: 'Vikram Singh', department: 'Sales', designation: 'Account Executive', type: 'Full-time', joinDate: '2023-05-10' },
  { id: 'EMP-004', name: 'Ananya Desai', department: 'Marketing', designation: 'Marketing Specialist', type: 'Contract', joinDate: '2024-02-01' },
  { id: 'EMP-005', name: 'Rohan Mehta', department: 'Finance', designation: 'Accountant', type: 'Full-time', joinDate: '2021-08-20' },
];

const MOCK_PAYROLL = [
  { empId: 'EMP-001', name: 'Arjun Sharma', month: 'August 2024', base: 120000, bonuses: 5000, deductions: 12500, net: 112500 },
  { empId: 'EMP-002', name: 'Priya Patel', month: 'August 2024', base: 95000, bonuses: 2000, deductions: 9800, net: 87200 },
  { empId: 'EMP-003', name: 'Vikram Singh', month: 'August 2024', base: 85000, bonuses: 12000, deductions: 8500, net: 88500 },
];

const MOCK_LEAVE = [
  { empId: 'EMP-001', name: 'Arjun Sharma', leaveType: 'Annual', from: '2024-08-10', to: '2024-08-15', days: 5, status: 'Approved' },
  { empId: 'EMP-002', name: 'Priya Patel', leaveType: 'Sick', from: '2024-08-22', to: '2024-08-23', days: 2, status: 'Approved' },
  { empId: 'EMP-004', name: 'Ananya Desai', leaveType: 'Unpaid', from: '2024-09-01', to: '2024-09-05', days: 5, status: 'Pending' },
];

export function Reports() {
  const { vehicles } = useFleet();

  const handleExportHeadcount = () => {
    exportToPDF({
      title: 'Company Headcount Report',
      subtitle: 'Comprehensive list of all active and contract employees.',
      filename: 'Headcount-Report',
      columns: [
        { header: 'EMP ID', dataKey: 'id' },
        { header: 'Employee Name', dataKey: 'name' },
        { header: 'Department', dataKey: 'department' },
        { header: 'Designation', dataKey: 'designation' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Join Date', dataKey: 'joinDate' },
      ],
      data: MOCK_EMPLOYEES
    });
  };

  const handleExportPayroll = () => {
    exportToPDF({
      title: 'Monthly Payroll Summary',
      subtitle: 'Overview of employee compensations and deductions.',
      filename: 'Payroll-Summary',
      columns: [
        { header: 'EMP ID', dataKey: 'empId' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Period', dataKey: 'month' },
        { header: 'Base Salary', dataKey: 'base' },
        { header: 'Bonuses', dataKey: 'bonuses' },
        { header: 'Deductions', dataKey: 'deductions' },
        { header: 'Net Pay', dataKey: 'net' },
      ],
      data: MOCK_PAYROLL.map(row => ({
        ...row,
        base: '$' + row.base.toLocaleString(),
        bonuses: '$' + row.bonuses.toLocaleString(),
        deductions: '$' + row.deductions.toLocaleString(),
        net: '$' + row.net.toLocaleString(),
      }))
    });
  };

  const handleExportLeave = () => {
    exportToPDF({
      title: 'Leave Analysis Report',
      subtitle: 'Employee time-off records and statuses.',
      filename: 'Leave-Analysis',
      columns: [
        { header: 'EMP ID', dataKey: 'empId' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Leave Type', dataKey: 'leaveType' },
        { header: 'From Date', dataKey: 'from' },
        { header: 'To Date', dataKey: 'to' },
        { header: 'Days', dataKey: 'days' },
        { header: 'Status', dataKey: 'status' },
      ],
      data: MOCK_LEAVE
    });
  };

  const handleExportFleet = () => {
    exportToPDF({
      title: 'Fleet Vehicles Status Report',
      subtitle: 'Detailed list of registered vehicles, types, and current status.',
      filename: 'Fleet-Report',
      columns: [
        { header: 'Plate Number', dataKey: 'number' },
        { header: 'Vehicle Model', dataKey: 'name' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Department', dataKey: 'department' },
        { header: 'Assigned Driver', dataKey: 'driver' },
        { header: 'Current Odometer', dataKey: 'odometer' },
        { header: 'Status', dataKey: 'status' },
      ],
      data: vehicles.map(v => ({
        number: v.number,
        name: v.name,
        type: v.type,
        department: v.department,
        driver: v.primaryDriverName || 'Pool (Unassigned)',
        odometer: `${v.currentOdometer.toLocaleString()} KM`,
        status: v.currentStatus
      }))
    });
  };

  const reports = [
    { 
      title: 'Headcount Report', 
      desc: 'Current employees, departments, and roles.', 
      icon: BarChart3,
      onExport: handleExportHeadcount 
    },
    { 
      title: 'Payroll Summary', 
      desc: 'Monthly compensation, taxes, and deductions.', 
      icon: FileText,
      onExport: handleExportPayroll 
    },
    { 
      title: 'Leave Analysis', 
      desc: 'Time-off patterns and balance summaries.', 
      icon: PieChart,
      onExport: handleExportLeave 
    },
    {
      title: 'Fleet Vehicles Report',
      desc: 'Active vehicles, assignments, and current mileage statuses.',
      icon: Truck,
      onExport: handleExportFleet
    }
  ];

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Export company data and view aggregate statistics in professional PDF formats.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {reports.map((rep, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-5 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <rep.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">{rep.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{rep.desc}</p>
            
            <button 
              onClick={rep.onExport}
              className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
