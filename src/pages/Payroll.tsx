import React, { useState } from 'react';
import { Search, Plus, Filter, DollarSign, Download, CheckCircle2, Clock, Calculator, FileText, CreditCard, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { jsPDF } from "jspdf";

const mockStructures = [
  { id: 'EMP-001', name: 'Arjun Sharma', role: 'Engineering Lead', base: 85000, hra: 34000, special: 15000, pf: 4800, tax: 7600, net: 121600 },
  { id: 'EMP-002', name: 'Priya Patel', role: 'Product Manager', base: 75000, hra: 30000, special: 12000, pf: 4200, tax: 6300, net: 106500 },
  { id: 'EMP-004', name: 'Ananya Desai', role: 'UX Designer', base: 60000, hra: 24000, special: 8000, pf: 3600, tax: 4200, net: 84200 },
  { id: 'EMP-005', name: 'Rahul Verma', role: 'Frontend Dev', base: 55000, hra: 22000, special: 6000, pf: 3000, tax: 3500, net: 76500 },
];

const mockPayslips = [
  { id: 'PAY-1049', empId: 'EMP-001', name: 'Arjun Sharma', month: 'Jul 2026', amount: 121600, status: 'Paid', date: 'Jul 31, 2026' },
  { id: 'PAY-1050', empId: 'EMP-002', name: 'Priya Patel', month: 'Jul 2026', amount: 106500, status: 'Paid', date: 'Jul 31, 2026' },
  { id: 'PAY-1051', empId: 'EMP-004', name: 'Ananya Desai', month: 'Jul 2026', amount: 84200, status: 'Paid', date: 'Jul 31, 2026' },
  { id: 'PAY-1052', empId: 'EMP-005', name: 'Rahul Verma', month: 'Jul 2026', amount: 76500, status: 'Paid', date: 'Jul 31, 2026' },
];

export function Payroll() {
  const [activeTab, setActiveTab] = useState<'overview' | 'structures' | 'payslips'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setProcessStep(1);
    setTimeout(() => setProcessStep(2), 1500);
    setTimeout(() => setProcessStep(3), 3000);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessStep(0);
      setActiveTab('payslips');
    }, 4500);
  };

  const handleDownloadPayslip = (slip: typeof mockPayslips[0]) => {
    const doc = new jsPDF();
    const structure = mockStructures.find(s => s.id === slip.empId) || mockStructures[0];
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Enerpack HR", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Payslip for the month of " + slip.month, 20, 40);
    
    // Employee Details
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Employee Name: " + slip.name, 20, 60);
    doc.text("Employee ID: " + slip.empId, 20, 68);
    doc.text("Designation: " + structure.role, 20, 76);
    
    // Earnings & Deductions Headers
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("EARNINGS", 20, 95);
    doc.text("DEDUCTIONS", 120, 95);
    
    doc.line(20, 98, 190, 98);
    
    // Values
    doc.setTextColor(15, 23, 42);
    doc.text("Basic Salary", 20, 110);
    doc.text(formatCurrency(structure.base), 80, 110, { align: "right" });
    
    doc.text("House Rent Allowance", 20, 120);
    doc.text(formatCurrency(structure.hra), 80, 120, { align: "right" });
    
    doc.text("Special Allowance", 20, 130);
    doc.text(formatCurrency(structure.special), 80, 130, { align: "right" });
    
    // Deductions
    doc.text("Provident Fund", 120, 110);
    doc.text(formatCurrency(structure.pf), 190, 110, { align: "right" });
    
    doc.text("Professional Tax", 120, 120);
    doc.text(formatCurrency(structure.tax), 190, 120, { align: "right" });
    
    doc.line(20, 140, 190, 140);
    
    // Totals
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const totalEarnings = structure.base + structure.hra + structure.special;
    const totalDeductions = structure.pf + structure.tax;
    
    doc.text("Total Earnings", 20, 150);
    doc.text(formatCurrency(totalEarnings), 80, 150, { align: "right" });
    
    doc.text("Total Deductions", 120, 150);
    doc.text(formatCurrency(totalDeductions), 190, 150, { align: "right" });
    
    // Net Pay
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 165, 170, 25, "F");
    doc.setFontSize(14);
    doc.text("Net Payable", 30, 181);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(formatCurrency(structure.net), 180, 181, { align: "right" });
    
    doc.save(`${slip.empId}_Payslip_${slip.month.replace(' ', '_')}.pdf`);
  };

  if (isProcessing) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner">
            <Calculator className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Payroll</h2>
          <p className="text-slate-500 text-sm mb-10">Please wait while we calculate taxes and generate payslips for August 2026.</p>
          
          <div className="space-y-6 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-4">
              {processStep >= 1 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
              <span className={cn("text-sm font-bold uppercase tracking-wider", processStep >= 1 ? "text-slate-900" : "text-slate-400")}>Calculating Earnings & Deductions</span>
            </div>
            <div className="flex items-center gap-4">
              {processStep >= 2 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
              <span className={cn("text-sm font-bold uppercase tracking-wider", processStep >= 2 ? "text-slate-900" : "text-slate-400")}>Generating Payslips</span>
            </div>
            <div className="flex items-center gap-4">
              {processStep >= 3 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
              <span className={cn("text-sm font-bold uppercase tracking-wider", processStep >= 3 ? "text-slate-900" : "text-slate-400")}>Initiating Bank Transfers</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Payroll Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage salary structures, process payroll, and generate payslips.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunPayroll}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" /> Run Payroll
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'structures', label: 'Salary Structures' },
          { id: 'payslips', label: 'Payslips' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors relative",
              activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Payroll Cost</p>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">₹14,52,400</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Processed</p>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">42 <span className="text-sm text-slate-500 font-medium font-sans">Employees</span></h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 mb-4 border border-orange-100">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">Pending Run</p>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">156 <span className="text-sm text-slate-500 font-medium font-sans">Employees</span></h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Next Pay Date</p>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">Aug 31</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">August 2026 Payroll</h3>
              <p className="text-sm text-slate-500">Review employee attendance, bonuses, and deductions before processing.</p>
            </div>
            <button 
              onClick={handleRunPayroll}
              className="px-6 py-3 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
            >
              Start Payroll Run
            </button>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Salary Structures</h2>
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Base Salary</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Allowances</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Monthly</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {mockStructures.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.id} • {s.role}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono text-slate-700">{formatCurrency(s.base)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono text-green-600">+{formatCurrency(s.hra + s.special)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono text-red-500">-{formatCurrency(s.pf + s.tax)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-bold text-slate-900">{formatCurrency(s.net)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payslips' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Generated Payslips</h2>
            <div className="flex gap-3">
              <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none">
                <option>July 2026</option>
                <option>June 2026</option>
                <option>May 2026</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document ID</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Month</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {mockPayslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-xs font-bold text-slate-900">{slip.id}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{slip.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{slip.empId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">{slip.month}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-bold text-slate-900">{formatCurrency(slip.amount)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDownloadPayslip(slip)}
                        title="Download PDF" 
                        className="p-2 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors inline-flex opacity-0 group-hover:opacity-100"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
