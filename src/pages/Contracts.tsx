import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  FileText, Plus, Download, Printer, Eye, CheckCircle2, 
  Search, Shield, Briefcase, Calendar, User, FileSignature, X, ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ENERPACK_EMPLOYEE_MASTER, maskAadhaar, maskAccountNo } from '../data/enerpackEmployeeMaster';
import { addLetterhead } from '../utils/pdfLetterhead';

export interface ContractRecord {
  id: string;
  agreementNumber: string;
  employeeId: string;
  employeeName: string;
  contractType: 'Residential' | 'Non-Residential / Other State Employee';
  agreementDate: string;
  joiningDate: string;
  designation: string;
  department: string;
  otClassification: string;
  basicSalary: number;
  status: 'Active' | 'Draft' | 'Signed' | 'Superseded';
  generatedDate: string;
}

export const Contracts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedEmpId = searchParams.get('empId');
  const preAction = searchParams.get('action');
  const preType = searchParams.get('type');

  const employeeList = useMemo(() => {
    try {
      const saved = localStorage.getItem('enerpack_employees_master');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return ENERPACK_EMPLOYEE_MASTER;
  }, []);

  const [activeTab, setActiveTab] = useState<'list' | 'generate' | 'blank'>(preAction === 'generate' ? 'generate' : 'list');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(preSelectedEmpId || employeeList[0].id);
  const [contractType, setContractType] = useState<'Residential' | 'Non-Residential / Other State Employee'>(
    preType && preType.includes('Non') ? 'Non-Residential / Other State Employee' : 'Residential'
  );
  
  // Contract specific inputs
  const [agreementDate, setAgreementDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [probationPeriod, setProbationPeriod] = useState<string>('3 Months');
  const [noticePeriod, setNoticePeriod] = useState<string>('45 Days');
  const [workLocation, setWorkLocation] = useState<string>('Enerpack Primary Plant, Kerala');
  const [allowances, setAllowances] = useState<string>('Standard HRA & Medical Allowance');
  const [remarks, setRemarks] = useState<string>('Standard Enerpack Employment Terms & Conditions Applied.');

  // Preview Modal state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Contracts storage state
  const [contractsList, setContractsList] = useState<ContractRecord[]>([
    {
      id: 'CON-001',
      agreementNumber: 'ENR-CON-2026-0001',
      employeeId: employeeList[0].id,
      employeeName: employeeList[0].name,
      contractType: 'Residential',
      agreementDate: '2026-01-15',
      joiningDate: employeeList[0].joinDate,
      designation: employeeList[0].occupation,
      department: employeeList[0].department || 'Operations',
      otClassification: employeeList[0].otEligibility,
      basicSalary: employeeList[0].basicSalary || 25000,
      status: 'Active',
      generatedDate: '2026-01-15'
    },
    {
      id: 'CON-002',
      agreementNumber: 'ENR-CON-2026-0002',
      employeeId: employeeList[1]?.id || 'ENR002',
      employeeName: employeeList[1]?.name || 'Rahul Sharma',
      contractType: 'Non-Residential / Other State Employee',
      agreementDate: '2026-02-01',
      joiningDate: employeeList[1]?.joinDate || '2026-02-01',
      designation: employeeList[1]?.occupation || 'Technician',
      department: employeeList[1]?.department || 'Manufacturing',
      otClassification: 'OT Employee',
      basicSalary: 28000,
      status: 'Active',
      generatedDate: '2026-02-01'
    }
  ]);

  const selectedEmployee = useMemo(() => {
    return employeeList.find(e => e.id === selectedEmpId) || employeeList[0];
  }, [selectedEmpId, employeeList]);

  const generatedAgreementNo = useMemo(() => {
    const nextNum = contractsList.length + 1;
    return `ENR-CON-2026-${String(nextNum).padStart(4, '0')}`;
  }, [contractsList]);

  const handleGeneratePdf = (isDownload = true, isBlank = false) => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    let y = addLetterhead(doc, false);

    const addNewPage = () => {
      doc.addPage();
      return 15;
    };

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EMPLOYEE CONTRACT AGREEMENT", 105, y, { align: "center" });
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Contract Type: ${contractType.toUpperCase()}`, 105, y, { align: "center" });
    y += 6;

    // Agreement Details Line
    doc.setFontSize(8);
    doc.text(`Agreement No.: ${isBlank ? '___________________' : generatedAgreementNo}`, 15, y);
    doc.text(`Date: ${isBlank ? '___________________' : agreementDate}`, 150, y);
    y += 5;

    const introText = "This Employee Contract Agreement is made between ENERPACK, (the \"Company\"), and the employee identified below (the \"Employee\").";
    const splitIntro = doc.splitTextToSize(introText, 180);
    splitIntro.forEach((line: string) => {
      doc.text(line, 15, y, { align: 'left' });
      y += 4.2;
    });
    y += 5;

    // 1. Employee Details Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("1. Employee Details", 15, y);
    y += 4;

    const tableLeft = 15;
    const col1Width = 60;
    const col2Width = 120;
    const rowHeight = 6.2;

    const details = [
      ["Staff No:", isBlank ? "" : selectedEmployee.id],
      ["Employee Full Name:", isBlank ? "" : selectedEmployee.name],
      ["Age / Date of Birth:", isBlank ? "" : "32 / 14-06-1994"],
      ["Aadhaar No. (if lawfully required):", isBlank ? "" : maskAadhaar(selectedEmployee.aadhaar, false)],
      ["Permanent Address:", isBlank ? "" : "Kunnath House, P.O. Mambra, Thrissur, Kerala - 680308"],
      ["Current Address:", isBlank ? "" : "Enerpack Staff Quarters, Room 402, Aluva, Ernakulam"],
      ["Mobile / Email:", isBlank ? "" : `${selectedEmployee.mobile} | ${selectedEmployee.name.toLowerCase().replace(/\s+/g, '')}@enerpack.com`],
      ["Emergency Contact:", isBlank ? "" : "+91 9447123456 (Father)"],
      ["Designation / Department:", isBlank ? "" : `${selectedEmployee.occupation} / ${selectedEmployee.department || 'Operations'}`],
    ];

    doc.setFontSize(8);
    details.forEach(([label, value]) => {
      if (y > 270) { y = addNewPage(); }
      doc.setDrawColor(200, 200, 200);
      doc.rect(tableLeft, y, col1Width, rowHeight);
      doc.rect(tableLeft + col1Width, y, col2Width, rowHeight);

      doc.setFont("helvetica", "bold");
      doc.text(label, tableLeft + 2, y + 4.0);
      doc.setFont("helvetica", "normal");
      doc.text(value, tableLeft + col1Width + 2, y + 4.0);
      y += rowHeight;
    });

    y += 5;

    // Clauses 2 to 21
    const addSection = (title: string, rawLines: string[]) => {
      if (y > 260) { y = addNewPage(); }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(title, 15, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      rawLines.forEach(rawLine => {
        const wrappedLines = doc.splitTextToSize(rawLine, 180);
        wrappedLines.forEach((wLine: string) => {
          if (y > 275) { y = addNewPage(); }
          doc.text(wLine, 15, y, { align: 'left' });
          y += 4.2;
        });
      });
      y += 3;
    };

    addSection("2. Appointment", [
      `The Company appoints the Employee as ${isBlank ? '___________________' : selectedEmployee.occupation} in the ${isBlank ? '___________________' : (selectedEmployee.department || 'Operations')} Department, subject to the terms of this Agreement and applicable law.`
    ]);

    addSection("3. Joining Date & Place of Work", [
      `Joining Date: ${isBlank ? '__________' : selectedEmployee.joinDate}   Primary Work Location: ${isBlank ? '___________________' : workLocation}.`,
      "The Employee may be required to work at other company locations or operational sites as reasonably required."
    ]);

    addSection("4. Duties & Responsibilities", [
      "• Perform assigned duties diligently and safely.",
      "• Follow job cards, production instructions, inventory controls, quality requirements and lawful instructions.",
      "• Protect company property, materials, documents and confidential information.",
      "• Comply with company procedures, safety rules and attendance requirements."
    ]);

    addSection("5. Working Hours, Attendance & Overtime", [
      "The Employee must strictly follow the Company's designated shift timings, including In and Out timings. The Employee may be required to work day or night shifts and on any machine as instructed by the supervisor, subject to applicable working-hour, rest-period, safety and overtime requirements."
    ]);

    addSection("6. Salary & Benefits", [
      `Basic / Gross Salary: Rs. ${isBlank ? '_________' : (selectedEmployee.basicSalary || 25000).toLocaleString()} per month. Other approved allowances/benefits: ${allowances}.`,
      "Statutory deductions and benefits, where applicable, will be handled in accordance with law."
    ]);

    addSection("7. Probation", [
      `Probation period, if applicable: ${probationPeriod}. Confirmation will be subject to satisfactory performance and applicable company procedure.`
    ]);

    addSection("8. Leave", [
      "Leave eligibility and approval will follow company policy and applicable law."
    ]);

    addSection("9. Confidentiality & Company Property", [
      "The Employee shall protect confidential business information and return company property, records, keys, devices and other assets",
      "upon request or separation. Intentional or negligent damages recovery charges from wages or loss for the damage will be",
      "made by applicable law and after the required process."
    ]);

    addSection("10. Health, Safety & Conduct", [
      "The Employee shall comply with safety requirements, use required PPE, report accidents/unsafe conditions, and maintain",
      "professional conduct. Serious misconduct may lead to disciplinary action subject to applicable law and due process."
    ]);

    addSection("11. Termination / Separation", [
      "Notice, resignation, termination, final settlement and handover shall be handled in accordance with this Agreement, company",
      "policy and applicable law. Nothing in this Agreement is intended to reduce any statutory right or protection available to the Employee."
    ]);

    addSection("12. Mobile Phone Usage", [
      "Personal mobile-phone use during working hours is restricted where it affects productivity, safety, machine operation, loading/unloading,",
      "driving, customer service or other assigned duties. Unauthorized use may result in a salary deduction of ₹250 to ₹500 per occurrence,",
      "subject to applicable law, company procedure and any required authorization."
    ]);

    addSection("13. Absence & Attendance", [
      "Employees are required to attend work as scheduled and obtain approval for leave. Unauthorized absence may result in salary",
      "deduction for the corresponding period. Where company policy provides a two-day salary deduction for an unauthorized absence,",
      "the deduction will be applied only to the extent permitted by applicable law and after appropriate review."
    ]);

    addSection("14. Spitting on Company Premises", [
      "Spitting anywhere on Enerpack company premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500,",
      "subject to applicable law, the employee's applicable terms and required company procedure/authorization. Repeated violations",
      "may also result in additional disciplinary action."
    ]);

    addSection("15. Personal Information", [
      "Personal information supplied by the Employee will be collected and used for legitimate employment, payroll, attendance, statutory,",
      "safety and administrative purposes, subject to applicable law and company practices."
    ]);

    addSection("16. Governing Terms", [
      "This Agreement shall be interpreted subject to applicable laws of India and the relevant jurisdiction of the workplace. If any",
      "clause conflicts with mandatory law, the mandatory legal requirement will prevail."
    ]);

    addSection("17. Acknowledgement of Workplace Rules", [
      "The Employee confirms that the following Enerpack rules have been explained and understood. The Employee acknowledges",
      "that any salary/wage deduction will be made only as permitted by applicable law and company procedure:",
      "• Mobile Phone Usage: Unauthorized mobile-phone use during working hours may result in a salary deduction of ₹250 to ₹500 per occurrence.",
      "• Absence: Unauthorized absence may result in salary deduction for the corresponding period. The company rule of two days' salary deduction for unauthorized absence will apply only to the extent legally permissible.",
      "• Spitting on Company Premises: Spitting anywhere on Enerpack premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law and company procedure."
    ]);

    addSection("18. Personal Leave", [
      "Personal leave should normally be requested and communicated to the reporting supervisor/HR at least 7 to 10 days in advance,",
      "wherever reasonably practicable, so that work arrangements can be made. Leave approval remains subject to company policy,",
      "operational requirements and applicable law. Emergency or unforeseen leave should be reported as soon as reasonably possible."
    ]);

    addSection("19. Resignation & Notice Period", [
      `An Employee who wishes to resign from Enerpack shall provide a minimum of ${noticePeriod} prior written notice. The resignation`,
      "must be submitted in writing and signed by the Employee. The notice period shall be counted from the date the written resignation",
      "is received/acknowledged by the Company, subject to the terms of employment and applicable law. The Employee is expected to",
      "complete proper handover of duties, company property, documents, stock/material responsibilities and other assigned matters before the final working day."
    ]);

    // If Non-Residential / Other State, include Version B Section 20
    if (contractType === 'Non-Residential / Other State Employee') {
      addSection("20. Non Residential Company Terms and Conditions", [
        "• Leave Eligibility: Leave will ordinarily be permitted only after completion of 12 months of service, subject to applicable statutory leave entitlements, emergency circumstances and Company policy.",
        "• Travel during Authorized Leave: For eligible and authorized leave, the Company will provide round-trip Sleeper Class train tickets, subject to Company travel procedure, route availability.",
        "• Final Leave before One Year: No employee is ordinarily permitted to proceed on final/home leave before completing 12 months of service, except where management approves an exception or where applicable law requires otherwise.",
        "• Fighting / Violence: Fighting, threats, assault or abusive conduct among employees in Company premises or accommodation quarters is strictly prohibited and may lead to disciplinary action.",
        "• Accommodation: The Company will provide accommodation/room for employees where such accommodation is part of the employment arrangement. Employees must keep their living quarters clean, orderly and safe and must follow accommodation rules.",
        "• Waste & Plastic: Employees must not accumulate plastic waste outside their quarters and must not burn plastic. Waste shall be disposed of in the designated manner.",
        "• Pan / Tampack / Tobacco: The use or consumption of Pan, Tampack or other tobacco products in Accommodation premises is strictly prohibited. A violation may attract a fine of ₹500, subject to applicable law and Company procedure.",
        "• Resignation: The Company may require proper handover of duties, Company property, documents, and stock/material responsibility and accommodation assets before the final working day.",
        "• Leaving Home Before One Year: If an employee leaves for home before completing one year of service, a uniform fee of ₹400 may be recovered only where legally authorized.",
        "• Bonus Eligibility: Bonus eligibility under Company policy is applicable only upon successful completion of one year of service, subject to any statutory bonus or other mandatory entitlement that may apply.",
        "• Uniform: Wearing the prescribed uniform inside the plant is mandatory. Employees shall maintain the uniform in a clean and serviceable condition and follow Company instructions regarding its use and care.",
        "• Separation, Handover & Final Settlement: On resignation or separation, the Employee must complete the required handover and return Company property. Final salary and other amounts due will be settled in accordance with applicable law and Company procedure."
      ]);
    }

    const acceptanceSectionNum = contractType === 'Non-Residential / Other State Employee' ? '21. Acceptance' : '20. Acceptance';
    addSection(acceptanceSectionNum, [
      "By signing below, both parties confirm that they have read and understood this Agreement and agree to the terms stated herein."
    ]);

    if (y > 230) {
      y = addNewPage();
    }

    // Signature Section (Three Equal Columns)
    y += 4;
    const boxWidth = 58;
    const boxHeight = 32;
    const startX = 15;
    const colGap = 5;

    const signatures = [
      { title: "Employee", sigLabel: "Employee Signature", nameLabel: `Name: ${isBlank ? '___________________' : selectedEmployee.name}`, dateLabel: `Date: ${agreementDate}` },
      { title: "HR / Witness", sigLabel: "HR / Witness Signature", nameLabel: "Name: ___________________", dateLabel: `Date: ${agreementDate}` },
      { title: "Authorized Signatory", sigLabel: "Authorized Signatory", nameLabel: "Name: Authorized Signatory", dateLabel: `Date: ${agreementDate}` }
    ];

    signatures.forEach((sig, idx) => {
      const bx = startX + idx * (boxWidth + colGap);
      doc.setDrawColor(150, 150, 150);
      doc.rect(bx, y, boxWidth, boxHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(sig.title, bx + boxWidth / 2, y + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Signature: ___________________", bx + 3, y + 13);
      doc.text(sig.nameLabel, bx + 3, y + 19);
      doc.text(sig.dateLabel, bx + 3, y + 25);
    });

    if (isDownload) {
      const filename = isBlank ? `Enerpack_Blank_Contract_${contractType.slice(0, 11)}.pdf` : `Enerpack_Contract_${selectedEmployee.id}.pdf`;
      doc.save(filename);
      showToast(`Successfully downloaded ${filename}`);
    } else {
      window.open(doc.output('bloburl'), '_blank');
    }
  };

  const handleSaveContractRecord = () => {
    const newRecord: ContractRecord = {
      id: `CON-${Date.now().toString().slice(-4)}`,
      agreementNumber: generatedAgreementNo,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      contractType: contractType,
      agreementDate: agreementDate,
      joiningDate: selectedEmployee.joinDate,
      designation: selectedEmployee.occupation,
      department: selectedEmployee.department || 'Operations',
      otClassification: selectedEmployee.otEligibility,
      basicSalary: selectedEmployee.basicSalary || 25000,
      status: 'Active',
      generatedDate: new Date().toISOString().slice(0, 10)
    };

    setContractsList(prev => [newRecord, ...prev]);
    showToast(`Contract ${generatedAgreementNo} successfully saved & recorded!`);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none px-2 sm:px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Employee Contract Agreements</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage Residential & Non-Residential / Other State Employee official agreements.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('blank')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4" /> Generate Blank Agreement
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Generate New Contract
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer",
            activeTab === 'list' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          All Contracts ({contractsList.length})
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer",
            activeTab === 'generate' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          Contract Generator
        </button>
        <button
          onClick={() => setActiveTab('blank')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer",
            activeTab === 'blank' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          Blank Agreement Printing
        </button>
      </div>

      {/* TAB 1: ALL CONTRACTS LIST */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Active & Historical Contract Records</h3>
            <span className="text-xs font-bold text-slate-400">{contractsList.length} Total Records</span>
          </div>
          <div className="divide-y divide-slate-100">
            {contractsList.map(c => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <FileSignature className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{c.employeeName}</p>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        {c.contractType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agreement No: <span className="font-mono font-semibold text-slate-700">{c.agreementNumber}</span> &bull; Staff No: {c.employeeId} &bull; Generated: {c.generatedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-extrabold rounded-lg border",
                    c.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {c.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedEmpId(c.employeeId);
                      setContractType(c.contractType);
                      handleGeneratePdf(false, false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmpId(c.employeeId);
                      setContractType(c.contractType);
                      handleGeneratePdf(true, false);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACT GENERATOR WORKFLOW */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Main Column: Employee Master Info & Contract Type */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Select Employee from Master */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" /> Step 1: Select Employee from Employee Master
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Single Source of Truth</span>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Select Employee</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {ENERPACK_EMPLOYEE_MASTER.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.id} - {emp.name} ({emp.occupation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Two-Column Auto-Populated Employee Details Table Preview */}
                <div className="pt-2">
                  <p className="text-xs font-extrabold text-slate-700 mb-2">Auto-Populated Employee Details Table</p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 font-bold text-slate-500 px-3 py-2">
                      <div className="col-span-5">Employee Detail Label</div>
                      <div className="col-span-7">Auto-Populated Value</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">Staff No:</div><div className="col-span-7 font-mono font-semibold text-slate-900">{selectedEmployee.id}</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-slate-50"><div className="col-span-5 font-bold text-slate-600">Employee Full Name:</div><div className="col-span-7 font-bold text-slate-900">{selectedEmployee.name}</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">Age / Date of Birth:</div><div className="col-span-7 text-slate-800">32 / 14-06-1994</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-slate-50"><div className="col-span-5 font-bold text-slate-600">Aadhaar No.:</div><div className="col-span-7 font-mono text-slate-800">{maskAadhaar(selectedEmployee.aadhaar, false)}</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">Permanent Address:</div><div className="col-span-7 text-slate-800">Kunnath House, Mambra, Thrissur, Kerala</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-slate-50"><div className="col-span-5 font-bold text-slate-600">Current Address:</div><div className="col-span-7 text-slate-800">Enerpack Quarters, Room 402, Aluva</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">Mobile / Email:</div><div className="col-span-7 text-slate-800">{selectedEmployee.mobile} | {selectedEmployee.name.toLowerCase().replace(/\s+/g, '')}@enerpack.com</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-slate-50"><div className="col-span-5 font-bold text-slate-600">Emergency Contact:</div><div className="col-span-7 text-slate-800">+91 9447123456 (Father)</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">Designation / Department:</div><div className="col-span-7 font-semibold text-slate-900">{selectedEmployee.occupation} / {selectedEmployee.department || 'Operations'}</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-slate-50"><div className="col-span-5 font-bold text-slate-600">Joining Date:</div><div className="col-span-7 font-mono text-slate-800">{selectedEmployee.joinDate}</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">Primary Work Location:</div><div className="col-span-7 text-slate-800">{workLocation}</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-slate-50"><div className="col-span-5 font-bold text-slate-600">Basic / Gross Salary:</div><div className="col-span-7 font-mono font-bold text-emerald-700">₹{selectedEmployee.basicSalary?.toLocaleString()}/mo</div></div>
                      <div className="grid grid-cols-12 px-3 py-2 bg-white"><div className="col-span-5 font-bold text-slate-600">OT Classification:</div><div className="col-span-7 font-bold text-blue-700">{selectedEmployee.otEligibility}</div></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. Contract Type Selection */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" /> Step 2: Contract Type (Required)
                </h3>
                <p className="text-xs text-slate-500">Select the applicable contract version. Only one option can be selected at a time.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    contractType === 'Residential' ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}>
                    <input 
                      type="radio" 
                      name="contractType" 
                      checked={contractType === 'Residential'}
                      onChange={() => setContractType('Residential')}
                      className="mt-0.5 h-4 w-4 text-blue-600"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">Residential</span>
                      <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">Standard Enerpack local employment agreement with standard common terms and workplace rules.</span>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    contractType === 'Non-Residential / Other State Employee' ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}>
                    <input 
                      type="radio" 
                      name="contractType" 
                      checked={contractType === 'Non-Residential / Other State Employee'}
                      onChange={() => setContractType('Non-Residential / Other State Employee')}
                      className="mt-0.5 h-4 w-4 text-blue-600"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">Non-Residential / Other State Employee</span>
                      <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">Includes standard common agreement plus all Additional Other State terms (travel tickets, accommodation, waste/plastic rules, uniform, bonus).</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Contract Metadata & Actions */}
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Step 3: Agreement Parameters</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agreement No. (Auto-Generated)</label>
                    <input 
                      type="text" 
                      value={generatedAgreementNo} 
                      disabled 
                      className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agreement Date</label>
                    <input 
                      type="date" 
                      value={agreementDate} 
                      onChange={(e) => setAgreementDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Work Location</label>
                    <input 
                      type="text" 
                      value={workLocation} 
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Probation Period</label>
                    <input 
                      type="text" 
                      value={probationPeriod} 
                      onChange={(e) => setProbationPeriod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Resignation Notice Period</label>
                    <input 
                      type="text" 
                      value={noticePeriod} 
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Remarks & Special Conditions</label>
                    <textarea 
                      rows={3}
                      value={remarks} 
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleGeneratePdf(false, false)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Preview Agreement
                  </button>

                  <button
                    onClick={() => handleGeneratePdf(true, false)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" /> Generate & Download PDF
                  </button>

                  <button
                    onClick={handleSaveContractRecord}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Contract Record
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: BLANK AGREEMENT PRINTING */}
      {activeTab === 'blank' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Generate Blank Employee Agreement</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Print official Enerpack employment agreements with blank employee details boxes and signature fields for manual physical use.
            </p>
          </div>

          <div className="space-y-3 text-left max-w-md mx-auto pt-2">
            <label className="block text-xs font-bold text-slate-700">Select Contract Template Version</label>
            <div className="grid grid-cols-1 gap-3">
              <label className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer",
                contractType === 'Residential' ? "bg-blue-50/50 border-blue-600 font-bold" : "bg-slate-50 border-slate-200"
              )}>
                <input 
                  type="radio" 
                  name="blankType" 
                  checked={contractType === 'Residential'}
                  onChange={() => setContractType('Residential')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-xs text-slate-900">Residential Blank Agreement</span>
              </label>

              <label className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer",
                contractType === 'Non-Residential / Other State Employee' ? "bg-blue-50/50 border-blue-600 font-bold" : "bg-slate-50 border-slate-200"
              )}>
                <input 
                  type="radio" 
                  name="blankType" 
                  checked={contractType === 'Non-Residential / Other State Employee'}
                  onChange={() => setContractType('Non-Residential / Other State Employee')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-xs text-slate-900">Non-Residential / Other State Employee Blank Agreement</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => handleGeneratePdf(false, true)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4" /> Preview Blank PDF
            </button>
            <button
              onClick={() => handleGeneratePdf(true, true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Download Blank PDF
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
