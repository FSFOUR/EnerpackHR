import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  Search, Plus, Filter, Folder, File, FileText, FileSignature, Download, 
  Trash2, ShieldAlert, ShieldCheck, Eye, Upload, CheckCircle2, X, 
  Clock, Lock, Unlock, HardDrive, ArrowUpDown, ChevronRight, User, Users,
  Building, AlertCircle, RefreshCw, FileCode, CheckSquare, Square,
  MoreVertical, Edit3, Share2, Tag, Layers, Database, AlertTriangle,
  Briefcase, Banknote, BookOpen, UserPlus, Workflow, Printer, Scissors,
  PackageCheck, Award, Boxes, ShoppingCart, Wrench, HardHat, Flame,
  Home, Shield, Truck, GraduationCap, BarChart3, FolderTree, ChevronDown,
  ArrowLeft, Check, FileCheck, ExternalLink, Sparkles, List, LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WarningLetter } from '../types/warningLetter';
import { INITIAL_WARNING_LETTERS } from '../data/warningLetterData';
import { WarningLettersTab } from '../components/documents/WarningLettersTab';
import { IssueWarningLetterModal } from '../components/documents/IssueWarningLetterModal';
import { WarningLetterPreviewModal } from '../components/documents/WarningLetterPreviewModal';
import { getFolderByCategory, FOLDER_CONFIGS } from '../data/documentVaultData';

export const ENERPACK_FOLDERS = [
  '01 Management',
  '02 HR & Employee Records',
  '03 Payroll, Attendance & Leave',
  '04 Company Policies',
  '05 Recruitment & Onboarding',
  '06 Production Planning',
  '07 Pre-Press & Printing',
  '08 Lamination & Die Cutting',
  '09 Folding, Gluing & Packing',
  '10 Quality Control',
  '11 Stores & Inventory',
  '12 Purchase & Suppliers',
  '13 Maintenance',
  '14 HSE & Safety',
  '15 Fire & Emergency',
  '16 Accommodation & Other-State Employees',
  '17 Security & Administration',
  '18 Sales, Dispatch & Customers',
  '19 Training, Audit & Document Control',
  '20 Management Reports & KPIs'
] as const;

export type EnerpackFolder = typeof ENERPACK_FOLDERS[number];

export const CATEGORIES = [
  'All Files',
  ...ENERPACK_FOLDERS,
  'Warning Letter'
] as const;

export interface DocumentItem {
  id: string;
  name: string;
  category: EnerpackFolder | 'Warning Letter';
  employeeId?: string;
  employeeName?: string;
  fileFormat: 'pdf' | 'docx' | 'png' | 'xlsx' | 'jpg';
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  verified: boolean;
  confidentiality: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
  description?: string;
  tags?: string[];
}

export const FOLDER_DETAILS: Record<EnerpackFolder, { subtitle: string; icon: React.FC<{ className?: string }>; color: string; badge: string }> = {
  '01 Management': { subtitle: 'Board & Strategic Policies', icon: Briefcase, color: 'blue', badge: 'MGMT' },
  '02 HR & Employee Records': { subtitle: 'KYC, Dossiers & Staff Files', icon: Users, color: 'indigo', badge: 'HR' },
  '03 Payroll, Attendance & Leave': { subtitle: 'Wages, Slips & Time Logs', icon: Banknote, color: 'emerald', badge: 'PAY' },
  '04 Company Policies': { subtitle: 'Standing Orders & Governance', icon: BookOpen, color: 'purple', badge: 'POL' },
  '05 Recruitment & Onboarding': { subtitle: 'Hiring, Offers & Inductions', icon: UserPlus, color: 'amber', badge: 'REC' },
  '06 Production Planning': { subtitle: 'Master Schedules & Capacity', icon: Workflow, color: 'cyan', badge: 'PLAN' },
  '07 Pre-Press & Printing': { subtitle: 'CTP Plates & Color Proofing', icon: Printer, color: 'sky', badge: 'PRNT' },
  '08 Lamination & Die Cutting': { subtitle: 'Thermal Film & Cut Specs', icon: Scissors, color: 'violet', badge: 'CUT' },
  '09 Folding, Gluing & Packing': { subtitle: 'Gluer Standards & Box Pack', icon: PackageCheck, color: 'teal', badge: 'PACK' },
  '10 Quality Control': { subtitle: 'ISO 9001, GSM & QA Tests', icon: Award, color: 'rose', badge: 'QC' },
  '11 Stores & Inventory': { subtitle: 'Paper Reels & Stock Audits', icon: Boxes, color: 'slate', badge: 'STR' },
  '12 Purchase & Suppliers': { subtitle: 'Vendor Contracts & PO Records', icon: ShoppingCart, color: 'orange', badge: 'PUR' },
  '13 Maintenance': { subtitle: 'Machine PM & Breakdown Logs', icon: Wrench, color: 'amber', badge: 'MAINT' },
  '14 HSE & Safety': { subtitle: 'EHS Manuals & PPE Compliance', icon: HardHat, color: 'emerald', badge: 'HSE' },
  '15 Fire & Emergency': { subtitle: 'Evacuation & Extinguisher SOP', icon: Flame, color: 'red', badge: 'FIRE' },
  '16 Accommodation & Other-State Employees': { subtitle: 'Hostel Allotment & Police Verif.', icon: Home, color: 'blue', badge: 'ACC' },
  '17 Security & Administration': { subtitle: 'Gate Passes, CCTV & Admin Gate', icon: Shield, color: 'slate', badge: 'SEC' },
  '18 Sales, Dispatch & Customers': { subtitle: 'Client Orders & Delivery Challans', icon: Truck, color: 'blue', badge: 'SALE' },
  '19 Training, Audit & Document Control': { subtitle: 'Skill Matrix & Non-Conformance', icon: GraduationCap, color: 'indigo', badge: 'AUD' },
  '20 Management Reports & KPIs': { subtitle: 'Executive OEE, Cost & Analytics', icon: BarChart3, color: 'purple', badge: 'KPI' },
};

const INITIAL_DOCUMENTS: DocumentItem[] = [
  // 01 Management
  {
    id: 'DOC-01-01',
    name: 'Company_Organization_Structure.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2400000,
    uploadedAt: 'Aug 20, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Hierarchical organization chart of Enerpack packaging units, departmental reporting matrix, and plant leadership hierarchy.',
    tags: ['Org Structure', 'Management', 'Governance', 'Leadership']
  },
  {
    id: 'DOC-01-02',
    name: 'Management_Roles_and_Responsibilities.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '1.8 MB',
    sizeBytes: 1800000,
    uploadedAt: 'Aug 18, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Detailed terms of reference, key result areas (KRAs), and executive responsibilities for Directors, Plant Head, and Department Managers.',
    tags: ['KRAs', 'Job Roles', 'Executive', 'Accountability']
  },
  {
    id: 'DOC-01-03',
    name: 'Management_Approval_Authority_Matrix.xlsx',
    category: '01 Management',
    fileFormat: 'xlsx',
    size: '1.2 MB',
    sizeBytes: 1200000,
    uploadedAt: 'Aug 15, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Delegation of Financial and Administrative Powers (DOFP) matrix for CapEx, OpEx, vendor selection, and headcount approvals.',
    tags: ['Authority Matrix', 'DOFP', 'Approval Limits', 'Finance']
  },
  {
    id: 'DOC-01-04',
    name: 'Risk_and_Business_Continuity_Plan.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '3.6 MB',
    sizeBytes: 3600000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Enterprise risk mitigation framework, disaster recovery protocols, supply chain contingency, and power outage fallback procedures.',
    tags: ['BCP', 'Risk Management', 'Contingency', 'Disaster Recovery']
  },
  {
    id: 'DOC-01-05',
    name: 'Management_Review_Report.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '4.2 MB',
    sizeBytes: 4200000,
    uploadedAt: 'Aug 05, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Quarterly executive review report evaluating plant productivity, safety metrics, quality deviations, and strategic growth goals.',
    tags: ['MRM', 'Review Report', 'Executive Summary', 'Q2 2026']
  },

  // 02 HR & Employee Records
  {
    id: 'DOC-02-01',
    name: 'Employee_Master_Register.xlsx',
    category: '02 HR & Employee Records',
    fileFormat: 'xlsx',
    size: '3.5 MB',
    sizeBytes: 3500000,
    uploadedAt: 'Aug 22, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Comprehensive employee database with biometric IDs, KYC records, emergency contacts, blood group, department, and salary grade.',
    tags: ['Master Register', 'Employee Database', 'KYC', 'Staff Registry']
  },
  {
    id: 'DOC-02-02',
    name: 'Employee_Contract_Agreement.pdf',
    category: '02 HR & Employee Records',
    fileFormat: 'pdf',
    size: '2.1 MB',
    sizeBytes: 2100000,
    uploadedAt: 'Aug 20, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Standard legal employment contract template outlining employment terms, confidentiality, probation period, and IP assignment.',
    tags: ['Employment Contract', 'Legal Agreement', 'Terms', 'HR Legal']
  },
  {
    id: 'DOC-02-03',
    name: 'Appointment_Letter.docx',
    category: '02 HR & Employee Records',
    fileFormat: 'docx',
    size: '850 KB',
    sizeBytes: 850000,
    uploadedAt: 'Aug 19, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Official formal appointment letter template specifying designation, compensation breakdown, date of joining, and reporting structure.',
    tags: ['Appointment Letter', 'Offer', 'Joining', 'HR Template']
  },
  {
    id: 'DOC-02-04',
    name: 'Warning_and_Disciplinary_Action_Procedure.pdf',
    category: '02 HR & Employee Records',
    fileFormat: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1900000,
    uploadedAt: 'Aug 16, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Standardized 3-tier disciplinary framework: Verbal Counseling, Written Warning, Final Show-Cause Notice, and Domestic Enquiry SOP.',
    tags: ['Disciplinary Procedure', 'Warning Letter', 'Enquiry SOP', 'Compliance']
  },
  {
    id: 'DOC-02-05',
    name: 'Resignation_Relieving_and_Experience_Procedure.pdf',
    category: '02 HR & Employee Records',
    fileFormat: 'pdf',
    size: '1.6 MB',
    sizeBytes: 1600000,
    uploadedAt: 'Aug 12, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Offboarding SOP, notice period guidelines, asset handover checklist, full & final settlement (F&F), and relieving letter issuance.',
    tags: ['Resignation SOP', 'Relieving Letter', 'Experience Certificate', 'Offboarding']
  },

  // 03 Payroll, Attendance & Leave
  {
    id: 'DOC-03-01',
    name: 'Attendance_and_Shift_SOP.pdf',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'pdf',
    size: '2.3 MB',
    sizeBytes: 2300000,
    uploadedAt: 'Aug 21, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Biometric face/fingerprint punch rules, 3-shift rotation schedule (Shift A, B & General), late grace period, and punch regularization.',
    tags: ['Shift SOP', 'Attendance Rules', 'Biometric', 'Shift Timings']
  },
  {
    id: 'DOC-03-02',
    name: 'Leave_and_Personal_Leave_SOP.pdf',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'pdf',
    size: '1.7 MB',
    sizeBytes: 1700000,
    uploadedAt: 'Aug 19, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Annual leave eligibility guidelines covering Casual Leave (CL), Sick Leave (SL), Earned/Privilege Leave (EL), and gate-pass permissions.',
    tags: ['Leave SOP', 'Leave Rules', 'Casual Leave', 'Privilege Leave']
  },
  {
    id: 'DOC-03-03',
    name: 'Monthly_Payroll_Register.xlsx',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'xlsx',
    size: '4.1 MB',
    sizeBytes: 4100000,
    uploadedAt: 'Aug 01, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Consolidated monthly salary master including basic pay, HRA, DA, PF employer/employee share, ESI deductions, PT, and net payout.',
    tags: ['Payroll Register', 'Salary Sheet', 'PF', 'ESI', 'Wages']
  },
  {
    id: 'DOC-03-04',
    name: 'Overtime_Register.xlsx',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'xlsx',
    size: '2.6 MB',
    sizeBytes: 2600000,
    uploadedAt: 'Aug 02, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Factory Act statutory OT register (Form 10) tracking double-rate overtime hours, supervisor approvals, and machine job allocations.',
    tags: ['OT Register', 'Overtime', 'Factory Act Form 10', 'Overtime Logs']
  },
  {
    id: 'DOC-03-05',
    name: 'Salary_Deduction_and_Adjustment_Register.xlsx',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'xlsx',
    size: '1.8 MB',
    sizeBytes: 1800000,
    uploadedAt: 'Aug 01, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Detailed tracking of festival salary advances, canteen deductions, uniform charges, loan recoveries, and loss-of-pay (LOP) adjustments.',
    tags: ['Deductions', 'Salary Advance', 'Adjustments', 'LOP Register']
  },

  // 04 Company Policies
  {
    id: 'DOC-04-01',
    name: 'Enerpack_Company_Procedure_and_Policy_Manual.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '6.5 MB',
    sizeBytes: 6500000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Master governance document containing plant operational standards, departmental interactions, and statutory compliance framework.',
    tags: ['Policy Manual', 'Company SOP', 'Governance', 'Compliance Manual']
  },
  {
    id: 'DOC-04-02',
    name: 'Employee_Code_of_Conduct.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '2.8 MB',
    sizeBytes: 2800000,
    uploadedAt: 'Aug 11, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Professional ethics, workplace integrity, conflict of interest, non-harassment (POSH), anti-bribery, and customer confidentiality guidelines.',
    tags: ['Code of Conduct', 'Ethics', 'POSH', 'Workplace Standards']
  },
  {
    id: 'DOC-04-03',
    name: 'Attendance_and_Punctuality_Policy.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '1.5 MB',
    sizeBytes: 1500000,
    uploadedAt: 'Aug 12, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Mandatory punch-in tolerances, late coming salary cut rules (3 late arrivals = 0.5 day LOP), and unauthorized absenteeism consequences.',
    tags: ['Punctuality Policy', 'Late Coming', 'Absenteeism', 'Discipline']
  },
  {
    id: 'DOC-04-04',
    name: 'Mobile_Phone_Tobacco_and_Personal_Conduct_Policy.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '1.4 MB',
    sizeBytes: 1400000,
    uploadedAt: 'Aug 14, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Strict ban on smartphone usage on shopfloor machinery areas, zero-tolerance tobacco/gutkha chewing in factory premises, and uniform dress code.',
    tags: ['Mobile Policy', 'Tobacco Ban', 'Safety Protocol', 'Personal Conduct']
  },
  {
    id: 'DOC-04-05',
    name: 'Disciplinary_Action_Policy.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '2.2 MB',
    sizeBytes: 2200000,
    uploadedAt: 'Aug 15, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Formal policy on employee misconduct, insubordination, theft, willful damage, charge-sheet issuance, suspension, and appeal procedure.',
    tags: ['Disciplinary Policy', 'Misconduct', 'Charge Sheet', 'Domestic Enquiry']
  },
  {
    id: 'DOC-111',
    name: 'Onboarding_Checklist_New_Hires_2026.pdf',
    category: '05 Recruitment & Onboarding',
    fileFormat: 'pdf',
    size: '1.2 MB',
    sizeBytes: 1200000,
    uploadedAt: 'Aug 05, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Step-by-step induction checklist for shopfloor operators, quality technicians, and engineers.',
    tags: ['Induction', 'Checklist', 'Hiring']
  },
  {
    id: 'DOC-112',
    name: 'Master_Production_Schedule_Shift_A_B.xlsx',
    category: '06 Production Planning',
    fileFormat: 'xlsx',
    size: '2.8 MB',
    sizeBytes: 2800000,
    uploadedAt: 'Yesterday, 06:00 PM',
    verified: true,
    confidentiality: 'Internal',
    description: 'Weekly corrugated box conversion schedule across Corrugator 1, Die Cutters, and Flexo lines.',
    tags: ['Production', 'Shift A', 'Planning']
  },
  {
    id: 'DOC-113',
    name: 'Offset_Printing_Color_Calibration_SOP.pdf',
    category: '07 Pre-Press & Printing',
    fileFormat: 'pdf',
    size: '3.6 MB',
    sizeBytes: 3600000,
    uploadedAt: 'Jul 22, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Standard operating procedure for spectrophotometer delta-E tolerance and ink viscosity checks.',
    tags: ['Pre-Press', 'Offset', 'SOP', 'Printing']
  },
  {
    id: 'DOC-114',
    name: 'Thermal_Lamination_Temperature_Settings_Guide.docx',
    category: '08 Lamination & Die Cutting',
    fileFormat: 'docx',
    size: '890 KB',
    sizeBytes: 890000,
    uploadedAt: 'Jul 19, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'BOPP thermal film temperature matrix by paper GSM and creasing matrix clearance chart.',
    tags: ['Lamination', 'Die Cutting', 'Creasing']
  },
  {
    id: 'DOC-115',
    name: 'High_Speed_Gluer_Packaging_Standard_SOP.pdf',
    category: '09 Folding, Gluing & Packing',
    fileFormat: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1900000,
    uploadedAt: 'Aug 02, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Hot melt vs cold glue adhesion testing and bundling strap tension standards.',
    tags: ['Folding', 'Gluing', 'Packaging']
  },
  {
    id: 'DOC-116',
    name: 'Enerpack_ISO_9001_Quality_Manual_v5.pdf',
    category: '10 Quality Control',
    fileFormat: 'pdf',
    size: '5.4 MB',
    sizeBytes: 5400000,
    uploadedAt: 'Jul 15, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Quality Management System manual, GSM bursting factor testing, and COBB water absorption specs.',
    tags: ['ISO9001', 'QA', 'Quality Manual']
  },
  {
    id: 'DOC-117',
    name: 'Monthly_Raw_Material_Stock_Audit_July_2026.xlsx',
    category: '11 Stores & Inventory',
    fileFormat: 'xlsx',
    size: '3.4 MB',
    sizeBytes: 3400000,
    uploadedAt: 'Aug 03, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Physical inventory audit of kraft paper reels, semi-chemical fluting, starch, and inks.',
    tags: ['Inventory', 'Stores', 'Kraft Paper']
  },
  {
    id: 'DOC-118',
    name: 'ITC_Paperboards_Vendor_Supply_Agreement.pdf',
    category: '12 Purchase & Suppliers',
    fileFormat: 'pdf',
    size: '2.7 MB',
    sizeBytes: 2700000,
    uploadedAt: 'Jun 10, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Annual raw paperboard supply agreement with quarterly price indexation terms.',
    tags: ['Supplier', 'Purchase', 'Agreement']
  },
  {
    id: 'DOC-119',
    name: 'Preventive_Maintenance_Heidelberg_Speedmaster.pdf',
    category: '13 Maintenance',
    fileFormat: 'pdf',
    size: '4.1 MB',
    sizeBytes: 4100000,
    uploadedAt: 'Jul 28, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Lubrication checklist, cylinder gap inspection, and hydraulic pressure logs.',
    tags: ['Maintenance', 'PM', 'Printing Press']
  },
  {
    id: 'DOC-120',
    name: 'Factory_EHS_Policy_And_Safety_Manual.pdf',
    category: '14 HSE & Safety',
    fileFormat: 'pdf',
    size: '3.9 MB',
    sizeBytes: 3900000,
    uploadedAt: 'May 14, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Occupational Health and Safety rules, machine guarding, and mandatory PPE protocol.',
    tags: ['HSE', 'Safety', 'PPE', 'Factory Act']
  },
  {
    id: 'DOC-121',
    name: 'Emergency_Evacuation_Plan_And_Assembly_Map.pdf',
    category: '15 Fire & Emergency',
    fileFormat: 'pdf',
    size: '4.2 MB',
    sizeBytes: 4200000,
    uploadedAt: 'Jun 05, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Factory floor emergency exit diagram, fire hydrant zones, and primary assembly point.',
    tags: ['Fire Safety', 'Emergency', 'Evacuation']
  },
  {
    id: 'DOC-122',
    name: 'Staff_Hostel_Allotment_And_House_Rules.pdf',
    category: '16 Accommodation & Other-State Employees',
    fileFormat: 'pdf',
    size: '1.5 MB',
    sizeBytes: 1500000,
    uploadedAt: 'Jul 01, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Accommodations policy, room allotments, mess rules, and interstate worker registration files.',
    tags: ['Accommodation', 'Hostel', 'Interstate Workers']
  },
  {
    id: 'DOC-123',
    name: 'CCTV_Surveillance_And_Gate_Entry_Protocol.pdf',
    category: '17 Security & Administration',
    fileFormat: 'pdf',
    size: '1.3 MB',
    sizeBytes: 1300000,
    uploadedAt: 'Jun 15, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Security guard shift instructions, material inward/outward gate pass protocols.',
    tags: ['Security', 'Admin', 'Gate Pass']
  },
  {
    id: 'DOC-124',
    name: 'Dispatch_Delivery_Challan_Log_August_2026.xlsx',
    category: '18 Sales, Dispatch & Customers',
    fileFormat: 'xlsx',
    size: '2.5 MB',
    sizeBytes: 2500000,
    uploadedAt: 'Today, 08:00 AM',
    verified: true,
    confidentiality: 'Internal',
    description: 'Finished goods dispatch tracking, fleet vehicle logs, and signed customer POD acknowledgments.',
    tags: ['Dispatch', 'Sales', 'Delivery', 'Logistics']
  },
  {
    id: 'DOC-125',
    name: 'Six_Sigma_Training_Matrix_Operators_2026.pdf',
    category: '19 Training, Audit & Document Control',
    fileFormat: 'pdf',
    size: '2.9 MB',
    sizeBytes: 2900000,
    uploadedAt: 'Jul 30, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Staff skill matrix, 5S shopfloor audit scorecards, and document revision control logs.',
    tags: ['Training', 'Audit', 'QMS', '5S']
  },
  {
    id: 'DOC-126',
    name: 'Executive_Monthly_Plant_OEE_And_Waste_Report.pdf',
    category: '20 Management Reports & KPIs',
    fileFormat: 'pdf',
    size: '3.8 MB',
    sizeBytes: 3800000,
    uploadedAt: 'Aug 01, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Overall Equipment Effectiveness (OEE), paperboard scrap yield loss, and monthly HR cost metrics.',
    tags: ['KPI', 'OEE', 'Management Reports', 'Analytics']
  }
];

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Arjun Sharma', dept: 'Engineering', designation: 'Senior Software Engineer' },
  { id: 'EMP-002', name: 'Priya Patel', dept: 'Human Resources', designation: 'Head of People & Culture' },
  { id: 'EMP-003', name: 'Vikram Singh', dept: 'Sales', designation: 'Enterprise Account Executive' },
  { id: 'EMP-004', name: 'Ananya Desai', dept: 'Marketing', designation: 'Digital Marketing Specialist' },
  { id: 'EMP-005', name: 'Rohan Mehta', dept: 'Finance', designation: 'Senior Financial Analyst' },
  { id: 'EMP-006', name: 'Sneha Reddy', dept: 'Operations', designation: 'Supply Chain Coordinator' },
  { id: 'EMP-007', name: 'Kavita Iyer', dept: 'Design', designation: 'Product Designer' },
];

export const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [warningLetters, setWarningLetters] = useState<WarningLetter[]>(INITIAL_WARNING_LETTERS);
  const [activeTab, setActiveTab] = useState<'all' | 'management' | 'warning-letters' | 'employee' | 'security'>('all');
  const [managementViewMode, setManagementViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Files');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx' | 'png' | 'xlsx' | 'jpg'>('all');
  const [confidentialityFilter, setConfidentialityFilter] = useState<'all' | 'Confidential' | 'Restricted' | 'Internal' | 'Public'>('all');
  
  // Selection for bulk operations
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showIssueWarningModal, setShowIssueWarningModal] = useState(false);
  const [selectedWarningLetter, setSelectedWarningLetter] = useState<WarningLetter | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '02 HR & Employee Records' as DocumentItem['category'],
    employeeId: 'EMP-001',
    isCompanyWide: false,
    fileFormat: 'pdf' as DocumentItem['fileFormat'],
    confidentiality: 'Restricted' as DocumentItem['confidentiality'],
    description: '',
    tags: 'HR, Employee Records',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Category filter
      if (selectedCategory !== 'All Files' && doc.category !== selectedCategory) {
        return false;
      }
      // Format filter
      if (formatFilter !== 'all' && doc.fileFormat !== formatFilter) {
        return false;
      }
      // Confidentiality filter
      if (confidentialityFilter !== 'all' && doc.confidentiality !== confidentialityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchEmp = doc.employeeName?.toLowerCase().includes(q) || false;
        const matchCategory = doc.category.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q) || false;
        const matchTags = doc.tags?.some(t => t.toLowerCase().includes(q)) || false;
        if (!matchName && !matchEmp && !matchCategory && !matchDesc && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [documents, selectedCategory, formatFilter, confidentialityFilter, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 
      'All Files': documents.length,
      'Warning Letter': warningLetters.length
    };
    CATEGORIES.forEach(c => {
      if (c !== 'All Files' && c !== 'Warning Letter') {
        counts[c] = documents.filter(d => (d.category as string) === c).length;
      }
    });
    return counts;
  }, [documents, warningLetters]);

  // Specific Management Documents List
  const managementDocs = useMemo(() => {
    return documents.filter(d => d.category === '01 Management');
  }, [documents]);

  // Overall storage metrics
  const storageMetrics = useMemo(() => {
    const totalBytes = documents.reduce((acc, d) => acc + d.sizeBytes, 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
    const verifiedCount = documents.filter(d => d.verified).length;
    const restrictedCount = documents.filter(d => d.confidentiality === 'Restricted' || d.confidentiality === 'Confidential').length;
    return {
      totalMb,
      totalCount: documents.length,
      verifiedCount,
      restrictedCount,
      percentUsed: Math.min(100, Math.round((Number(totalMb) / 100) * 100)), // mock 100MB vault
    };
  }, [documents]);

  // Toggle single selection
  const handleToggleSelect = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle all selection
  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocuments.map(d => d.id));
    }
  };

  // Delete single document
  const handleDeleteDoc = (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    setSelectedDocIds(prev => prev.filter(i => i !== id));
    showToast(`"${docToDelete?.name || 'Document'}" was permanently deleted.`);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedDocIds.length === 0) return;
    const count = selectedDocIds.length;
    setDocuments(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
    setSelectedDocIds([]);
    showToast(`Successfully deleted ${count} selected document${count > 1 ? 's' : ''}.`);
  };

  // Download PDF / Blob
  const handleDownloadDoc = (docItem: DocumentItem) => {
    try {
      if (docItem.fileFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("ENERPACK HR DOCUMENT VAULT", 15, 16);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(20);
        doc.text(docItem.name.replace('.pdf', ''), 15, 45);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Document ID: ${docItem.id}  |  Category: ${docItem.category}`, 15, 55);
        doc.text(`Classification: ${docItem.confidentiality}  |  Verified Status: ${docItem.verified ? 'Verified & Cryptographically Signed' : 'Pending'}`, 15, 62);
        
        if (docItem.employeeName) {
          doc.text(`Associated Employee: ${docItem.employeeName} (${docItem.employeeId})`, 15, 69);
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(15, 75, 195, 75);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(11);
        doc.text("OFFICIAL ARCHIVE COPY", 15, 88);
        
        const descriptionLines = doc.splitTextToSize(docItem.description || "Official Enerpack enterprise archived document.", 180);
        doc.text(descriptionLines, 15, 98);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Timestamp: ${new Date().toLocaleString()} | Authenticated Vault Export`, 15, 270);

        doc.save(docItem.name);
      } else {
        // Text / CSV simulation
        const content = `Enerpack HR Enterprise Vault Export\nDocument: ${docItem.name}\nCategory: ${docItem.category}\nEmployee: ${docItem.employeeName || 'Company-Wide'}\nClassification: ${docItem.confidentiality}\nDate: ${docItem.uploadedAt}\nDescription: ${docItem.description || ''}\n`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = docItem.name;
        link.click();
        URL.revokeObjectURL(url);
      }
      showToast(`Downloaded "${docItem.name}".`);
    } catch (err) {
      console.error(err);
      showToast(`Document generated for download: ${docItem.name}`);
    }
  };

  // Bulk download
  const handleBulkDownload = () => {
    if (selectedDocIds.length === 0) return;
    const selected = documents.filter(d => selectedDocIds.includes(d.id));
    selected.forEach((d, idx) => {
      setTimeout(() => {
        handleDownloadDoc(d);
      }, idx * 300);
    });
    showToast(`Initiating download for ${selected.length} files...`);
  };

  // Upload handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) {
      showToast('Please enter a valid document file name.');
      return;
    }

    const emp = uploadForm.isCompanyWide 
      ? undefined 
      : EMPLOYEES.find(e => e.id === uploadForm.employeeId);

    const ext = uploadForm.fileFormat;
    let finalName = uploadForm.name.trim();
    if (!finalName.toLowerCase().endsWith(`.${ext}`)) {
      finalName = `${finalName}.${ext}`;
    }

    const randomBytes = Math.floor(Math.random() * (4500000 - 450000) + 450000);
    const sizeStr = randomBytes > 1024 * 1024 
      ? `${(randomBytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(randomBytes / 1024)} KB`;

    const tagList = uploadForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newDoc: DocumentItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: finalName,
      category: uploadForm.category,
      employeeId: emp?.id,
      employeeName: emp?.name,
      fileFormat: uploadForm.fileFormat,
      size: sizeStr,
      sizeBytes: randomBytes,
      uploadedAt: 'Just now',
      verified: true,
      confidentiality: uploadForm.confidentiality,
      description: uploadForm.description || 'Uploaded via Document Vault Portal.',
      tags: tagList.length > 0 ? tagList : ['Uploaded', uploadForm.category.split(' ')[0]],
    };

    setDocuments(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    showToast(`Successfully uploaded "${newDoc.name}" to ${newDoc.category}.`);
  };

  // Edit / Update document
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;

    setDocuments(prev => prev.map(d => d.id === editDoc.id ? editDoc : d));
    setEditDoc(null);
    showToast(`Document "${editDoc.name}" updated successfully.`);
  };

  // Trigger file selection from input
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'pdf') as DocumentItem['fileFormat'];
      setUploadForm(prev => ({
        ...prev,
        name: file.name,
        fileFormat: ['pdf', 'docx', 'png', 'xlsx', 'jpg'].includes(ext) ? ext : 'pdf',
      }));
    }
  };

  // Warning Letter Handlers
  const handleIssueWarningLetter = (newLetter: WarningLetter, autoArchive: boolean) => {
    setWarningLetters(prev => [newLetter, ...prev]);
    if (autoArchive) {
      const newDoc: DocumentItem = {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        name: `${newLetter.letterNumber}_${newLetter.employeeName.replace(/\s+/g, '_')}_Warning_Notice.pdf`,
        category: '02 HR & Employee Records',
        employeeId: newLetter.employeeId,
        employeeName: newLetter.employeeName,
        fileFormat: 'pdf',
        size: '1.2 MB',
        sizeBytes: 1200000,
        uploadedAt: 'Today, Just now',
        verified: true,
        confidentiality: 'Restricted',
        description: `Formal disciplinary warning notice: ${newLetter.subject} (${newLetter.warningLevel}).`,
        tags: ['Warning Letter', 'Disciplinary', newLetter.incidentType]
      };
      setDocuments(prev => [newDoc, ...prev]);
      showToast(`Warning Notice ${newLetter.letterNumber} issued and archived to ${newLetter.employeeName}'s vault.`);
    } else {
      showToast(`Warning Notice ${newLetter.letterNumber} issued successfully.`);
    }
  };

  const handleAcknowledgeWarning = (id: string) => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setWarningLetters(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: 'Acknowledged',
          acknowledgedAt: timestamp,
          acknowledgedBy: `${l.employeeName} (Digitally Signed)`
        };
      }
      return l;
    }));
    if (selectedWarningLetter && selectedWarningLetter.id === id) {
      setSelectedWarningLetter(prev => prev ? ({
        ...prev,
        status: 'Acknowledged',
        acknowledgedAt: timestamp,
        acknowledgedBy: `${prev.employeeName} (Digitally Signed)`
      }) : null);
    }
    showToast('Warning Letter acknowledged and digitally signed.');
  };

  const handleUpdateWarningStatus = (id: string, newStatus: WarningLetter['status'], appealNote?: string) => {
    setWarningLetters(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: newStatus,
          ...(appealNote ? { appealNotes: appealNote } : {})
        };
      }
      return l;
    }));
    if (selectedWarningLetter && selectedWarningLetter.id === id) {
      setSelectedWarningLetter(prev => prev ? ({
        ...prev,
        status: newStatus,
        ...(appealNote ? { appealNotes: appealNote } : {})
      }) : null);
    }
    showToast(`Warning record status updated to ${newStatus}.`);
  };

  const handleDeleteWarningLetter = (id: string) => {
    setWarningLetters(prev => prev.filter(l => l.id !== id));
    if (selectedWarningLetter && selectedWarningLetter.id === id) {
      setSelectedWarningLetter(null);
    }
    showToast('Warning Letter record removed.');
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Enterprise Encrypted Document Vault
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Document Management</h1>
          <p className="text-slate-500 text-sm">Centralized, secure repository for employee KYC, contracts, company policies, tax records, and warning letters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowIssueWarningModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-amber-200 flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" /> Issue Warning Letter
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Storage & Security Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Vault Storage</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{storageMetrics.totalMb} MB <span className="text-xs text-slate-400 font-normal">/ 100 MB</span></p>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${storageMetrics.percentUsed}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archived Documents</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{documents.length} Files</p>
            <span className="text-[10px] text-indigo-600 font-bold">6 Active Categories</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified & Signed</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{storageMetrics.verifiedCount} / {documents.length}</p>
            <span className="text-[10px] text-emerald-600 font-bold">100% Tamper Proof</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidential / Restricted</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{storageMetrics.restrictedCount} Files</p>
            <span className="text-[10px] text-amber-700 font-bold">Role-Based Access</span>
          </div>
        </div>
      </div>

      {/* Main Category Folders Grid - ENERPACK 20 Folders Hierarchy */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                ENERPACK Departmental Document Tree
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  20 Folders
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">Structured manufacturing and enterprise governance repository</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('All Files');
                if (activeTab === 'warning-letters') setActiveTab('all');
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
                selectedCategory === 'All Files'
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              All Master Files
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                selectedCategory === 'All Files' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              )}>
                {categoryCounts['All Files'] || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('Warning Letter');
                setActiveTab('warning-letters');
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
                selectedCategory === 'Warning Letter'
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/60"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Warning Letters
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                selectedCategory === 'Warning Letter' ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
              )}>
                {categoryCounts['Warning Letter'] || 0}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {ENERPACK_FOLDERS.map((folderName, idx) => {
            const isSelected = selectedCategory === folderName;
            const count = categoryCounts[folderName] || 0;
            const details = FOLDER_DETAILS[folderName];
            const IconComponent = details?.icon || Folder;
            const folderNum = folderName.split(' ')[0];
            const folderTitle = folderName.substring(folderNum.length + 1);

            const folderConfig = getFolderByCategory(folderName);

            return (
              <div 
                key={folderName} 
                onClick={() => {
                  navigate(`/documents/folder/${folderConfig.slug}`);
                }}
                className={cn(
                  "p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group min-h-[92px]",
                  isSelected 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-[1.015]" 
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0",
                      isSelected 
                        ? "bg-white/20 text-white" 
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-100 border border-blue-100"
                    )}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 font-extrabold"
                    )}>
                      {folderNum}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono transition-colors",
                    isSelected 
                      ? "bg-white/20 text-white" 
                      : count > 0 ? "bg-blue-50 text-blue-700 border border-blue-100 font-extrabold" : "bg-slate-100 text-slate-400"
                  )}>
                    {count} {count === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-xs leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors",
                    isSelected ? "text-white group-hover:text-white" : "text-slate-900"
                  )} title={folderName}>
                    {folderName}
                  </h3>
                  <p className={cn(
                    "text-[9px] mt-0.5 font-medium line-clamp-1",
                    isSelected ? "text-blue-100" : "text-slate-400"
                  )} title={details?.subtitle}>
                    {details?.subtitle || 'Enterprise Directory'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tabs and Content Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Navigation Tabs Bar */}
        <div className="px-4 pt-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Files (Master Table)', count: documents.length },
              { id: 'management', label: '01 Management', count: managementDocs.length, isManagement: true },
              { id: 'warning-letters', label: 'Warning Letters', count: warningLetters.length, isWarning: true },
              { id: 'employee', label: 'Employee Vault View' },
              { id: 'security', label: 'Security & Access Matrix' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'management') {
                    navigate('/documents/management');
                    return;
                  }
                  setActiveTab(tab.id as any);
                  if (tab.id === 'warning-letters') {
                    setSelectedCategory('Warning Letter');
                  } else if (selectedCategory === 'Warning Letter' || selectedCategory === '01 Management') {
                    setSelectedCategory('All Files');
                  }
                }}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer",
                  activeTab === tab.id
                    ? tab.id === 'management'
                      ? "border-blue-600 text-blue-700 bg-white shadow-xs"
                      : tab.id === 'warning-letters'
                        ? "border-amber-600 text-amber-700 bg-white shadow-xs"
                        : "border-blue-600 text-blue-600 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                )}
              >
                {tab.id === 'management' && <Briefcase className="w-3.5 h-3.5 text-blue-600" />}
                {tab.id === 'warning-letters' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold",
                    activeTab === tab.id 
                      ? tab.id === 'warning-letters' ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700" 
                      : "bg-slate-200 text-slate-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Folder Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pb-2">
            <span className="text-slate-400">Current Scope:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {selectedCategory}
            </span>
          </div>
        </div>

        {/* Search, Filter & Bulk Actions Bar */}
        {activeTab === 'all' && (
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search file name, employee, tag..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Format Filter */}
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="jpg">Image (.jpg / .png)</option>
              </select>

              {/* Sensitivity Filter */}
              <select
                value={confidentialityFilter}
                onChange={(e) => setConfidentialityFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classifications</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
                <option value="Internal">Internal</option>
                <option value="Public">Public</option>
              </select>
            </div>

            {/* Bulk Action Controls */}
            {selectedDocIds.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-blue-900 font-mono">
                  {selectedDocIds.length} Selected
                </span>
                <button
                  onClick={handleBulkDownload}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: ALL FILES TABLE */}
        {activeTab === 'all' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 w-10 text-center">
                    <button 
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-blue-600 focus:outline-none"
                    >
                      {selectedDocIds.length > 0 && selectedDocIds.length === filteredDocuments.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Name</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Employee</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Added</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Folder className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700">No documents found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your category, format, or search query filter.</p>
                      <button 
                        onClick={() => { setSelectedCategory('All Files'); setSearchQuery(''); setFormatFilter('all'); setConfidentialityFilter('all'); }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <tr 
                        key={doc.id} 
                        className={cn(
                          "transition-colors group",
                          isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/80"
                        )}
                      >
                        <td className="py-4 px-4 text-center">
                          <button 
                            onClick={() => handleToggleSelect(doc.id)}
                            className="text-slate-400 hover:text-blue-600 focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* File Name & Format Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase",
                              doc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border-red-100" :
                              doc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border-blue-100" :
                              doc.fileFormat === 'xlsx' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              "bg-purple-50 text-purple-600 border-purple-100"
                            )}>
                              {doc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                               doc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                               doc.fileFormat === 'xlsx' ? <FileCode className="w-5 h-5" /> : 
                               <File className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span 
                                  onClick={() => setPreviewDoc(doc)}
                                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-sm"
                                  title={doc.name}
                                >
                                  {doc.name}
                                </span>
                                {doc.verified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Cryptographically Verified" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-slate-400">{doc.id}</span>
                                {doc.tags?.slice(0, 2).map((t, idx) => (
                                  <span key={idx} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {doc.category}
                          </span>
                        </td>

                        {/* Linked Employee */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {doc.employeeName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {doc.employeeName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{doc.employeeName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{doc.employeeId}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" /> Company-Wide
                            </span>
                          )}
                        </td>

                        {/* Classification */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            doc.confidentiality === 'Restricted' ? "bg-red-50 text-red-700 border border-red-200" :
                            doc.confidentiality === 'Confidential' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            doc.confidentiality === 'Internal' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {doc.confidentiality === 'Restricted' || doc.confidentiality === 'Confidential' ? (
                              <Lock className="w-2.5 h-2.5" />
                            ) : (
                              <Unlock className="w-2.5 h-2.5" />
                            )}
                            {doc.confidentiality}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-slate-600">
                          {doc.size}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                          {doc.uploadedAt}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setPreviewDoc(doc)}
                              title="Preview Document Details"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadDoc(doc)}
                              title="Download File"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditDoc(doc)}
                              title="Edit Document Info"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDoc(doc.id)}
                              title="Delete File"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: 01 MANAGEMENT DOCUMENTS LIST */}
        {activeTab === 'management' && (
          <div className="p-6 space-y-6">
            {/* Header & Back to Document Navigation */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200 shrink-0 font-bold text-lg">
                  01
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">01. Management Repository</h3>
                    <span className="bg-blue-100 text-blue-800 font-bold text-[10px] uppercase font-mono px-2 py-0.5 rounded-full">
                      5 Core Documents
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Board resolutions, corporate governance structure, executive authority matrices, risk & BCP plans, and review reports.
                  </p>
                </div>
              </div>

              {/* Back to Document & View Switcher Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Grid / List Switcher */}
                <div className="bg-white p-1 rounded-xl flex items-center border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => setManagementViewMode('list')}
                    title="List View"
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                      managementViewMode === 'list' ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                  </button>
                  <button
                    onClick={() => setManagementViewMode('grid')}
                    title="Grid View"
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                      managementViewMode === 'grid' ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Grid
                  </button>
                </div>

                <button
                  onClick={() => navigate('/documents/management')}
                  className="px-3.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  Open Full Page
                </button>

                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedCategory('All Files');
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                  Back to Documents
                </button>

                <button
                  onClick={() => {
                    setUploadForm(prev => ({
                      ...prev,
                      category: '01 Management',
                      isCompanyWide: true
                    }));
                    setShowUploadModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add File
                </button>
              </div>
            </div>

            {/* List / Grid of Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Management Document Inventory ({managementViewMode === 'list' ? 'List View' : 'Grid View'})
                </span>
                <span className="text-xs font-medium text-slate-500 font-mono">
                  {managementDocs.length} Verified Files
                </span>
              </div>

              {managementViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {managementDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase shadow-2xs",
                            doc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border-red-200" :
                            doc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border-blue-200" :
                            doc.fileFormat === 'xlsx' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            "bg-purple-50 text-purple-600 border-purple-200"
                          )}>
                            {doc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                             doc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                             doc.fileFormat === 'xlsx' ? <FileCode className="w-5 h-5" /> : 
                             <File className="w-5 h-5 text-slate-600" />}
                          </div>

                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            doc.confidentiality === 'Restricted' ? "bg-red-50 text-red-700 border border-red-200" :
                            doc.confidentiality === 'Confidential' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            doc.confidentiality === 'Internal' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {doc.confidentiality === 'Restricted' || doc.confidentiality === 'Confidential' ? (
                              <Lock className="w-2.5 h-2.5" />
                            ) : (
                              <Unlock className="w-2.5 h-2.5" />
                            )}
                            {doc.confidentiality}
                          </span>
                        </div>

                        <h3 
                          onClick={() => setPreviewDoc(doc)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                        >
                          {doc.name.replace(/_/g, ' ').replace(/\.(pdf|docx|xlsx|jpg)$/i, '')}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                          {doc.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.tags?.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{doc.size}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDoc(doc)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                {managementDocs.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase",
                        doc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border-red-100" :
                        doc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        doc.fileFormat === 'xlsx' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-purple-50 text-purple-600 border-purple-100"
                      )}>
                        {doc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                         doc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                         doc.fileFormat === 'xlsx' ? <FileCode className="w-5 h-5" /> : 
                         <File className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 
                            onClick={() => setPreviewDoc(doc)}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {doc.name.replace(/_/g, ' ').replace(/\.(pdf|docx|xlsx|jpg)$/i, '')}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded">
                            .{doc.fileFormat}
                          </span>
                          {doc.verified && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                          {doc.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            doc.confidentiality === 'Restricted' ? "bg-red-50 text-red-700 border border-red-200" :
                            doc.confidentiality === 'Confidential' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            doc.confidentiality === 'Internal' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {doc.confidentiality === 'Restricted' || doc.confidentiality === 'Confidential' ? (
                              <Lock className="w-2.5 h-2.5" />
                            ) : (
                              <Unlock className="w-2.5 h-2.5" />
                            )}
                            {doc.confidentiality}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {doc.size}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            &bull; Updated: {doc.uploadedAt}
                          </span>
                          {doc.tags?.map((t, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        onClick={() => setEditDoc(doc)}
                        title="Edit Info"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>

            {/* Quick Governance Note */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900">Governance & Approval Authority Protocol</h4>
                <p className="text-xs text-blue-800/80 mt-0.5 leading-relaxed">
                  All management documents uploaded to Folder 01 are bound by Enerpack Board governance policies. Revision changes must be submitted via Executive Change Request (ECR) and approved by the Plant Head.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WARNING LETTERS TAB */}
        {activeTab === 'warning-letters' && (
          <div className="p-6">
            <WarningLettersTab
              warningLetters={warningLetters}
              onOpenIssueModal={() => setShowIssueWarningModal(true)}
              onSelectLetter={(letter) => setSelectedWarningLetter(letter)}
              onAcknowledge={handleAcknowledgeWarning}
              onDelete={handleDeleteWarningLetter}
            />
          </div>
        )}

        {/* TAB 2: EMPLOYEE VAULT VIEW */}
        {activeTab === 'employee' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Employee Individual Document Dossiers</h3>
                <p className="text-xs text-slate-500">Access and verify KYC, contracts, and compensation slips partitioned by team member.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {EMPLOYEES.map(emp => {
                const empDocs = documents.filter(d => d.employeeId === emp.id);
                return (
                  <div key={emp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{emp.dept} &bull; <span className="font-mono">{emp.id}</span></p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 font-mono">
                          {empDocs.length} files
                        </span>
                      </div>

                      <div className="space-y-2 mt-4">
                        {empDocs.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                            No documents archived yet.
                          </div>
                        ) : (
                          empDocs.map(doc => (
                            <div key={doc.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="text-xs font-medium text-slate-800 truncate" title={doc.name}>{doc.name}</span>
                              </div>
                              <button
                                onClick={() => handleDownloadDoc(doc)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">KYC Status: Verified</span>
                      <button
                        onClick={() => {
                          setUploadForm(prev => ({
                            ...prev,
                            employeeId: emp.id,
                            isCompanyWide: false
                          }));
                          setShowUploadModal(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add File
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & ACCESS MATRIX */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-base">Document Security & Compliance Matrix</h3>
              <p className="text-xs text-slate-500">Overview of encryption policies, role permissions, and tamper verification status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" /> Confidentiality Tiers
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">Restricted</span>
                      <span className="text-xs font-mono font-bold text-slate-700">Executive & Admin Only</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Employment contracts, salary annexures, disciplinary records.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">Confidential</span>
                      <span className="text-xs font-mono font-bold text-slate-700">HR & Direct Manager</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Aadhaar, Passport, PAN cards, performance appraisals.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">Internal</span>
                      <span className="text-xs font-mono font-bold text-slate-700">All Employees</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Company handbooks, leave policies, IT security guides.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Retention & Compliance Audit
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Storage Encryption:</span>
                    <span className="font-bold text-emerald-700 font-mono">AES-256 GCM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">KYC Verification Rule:</span>
                    <span className="font-bold text-slate-900">Mandatory 48h after onboarding</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Audit Logging:</span>
                    <span className="font-bold text-emerald-700">Enabled (Shafi3396@gmail.com)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Contract Archive Duration:</span>
                    <span className="font-bold text-slate-900">8 Years (Statutory Requirement)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Footer Stats */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span>Showing {filteredDocuments.length} of {documents.length} total files</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Vault Version: 2026.4 Enterprise</span>
          </div>
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload to Document Vault</h2>
                  <p className="text-xs text-slate-500">Securely archive employee or company-wide files.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop File Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/30 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFilePicked}
                  className="hidden" 
                />
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-200 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {uploadForm.name ? uploadForm.name : 'Click to select or drag and drop a file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, PNG, JPG (up to 25MB)</p>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arjun_Sharma_Passport_Copy.pdf"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Category & File Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Vault Folder Category *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {ENERPACK_FOLDERS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    File Format *
                  </label>
                  <select
                    value={uploadForm.fileFormat}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, fileFormat: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  >
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="docx">Microsoft Word (.docx)</option>
                    <option value="xlsx">Microsoft Excel (.xlsx)</option>
                    <option value="jpg">Image (.jpg / .png)</option>
                  </select>
                </div>
              </div>

              {/* Linked Target (Employee vs Company-wide) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Target Assignment</label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.isCompanyWide}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, isCompanyWide: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>Company-Wide (General)</span>
                  </label>
                </div>

                {!uploadForm.isCompanyWide && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Associate with Employee
                    </label>
                    <select
                      value={uploadForm.employeeId}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {EMPLOYEES.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.id}) &bull; {emp.dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Security Classification & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Confidentiality Classification *
                  </label>
                  <select
                    value={uploadForm.confidentiality}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, confidentiality: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Restricted">Restricted (Executive / Admin)</option>
                    <option value="Confidential">Confidential (HR / Manager)</option>
                    <option value="Internal">Internal (Company Employees)</option>
                    <option value="Public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Metadata Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Contract, Signed, 2026"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Document Description & Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context or summary about this archived document..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Save & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DOCUMENT MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase",
                  previewDoc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                )}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{previewDoc.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {previewDoc.id} &bull; {previewDoc.size}</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Folder Category:</span>
                  <span className="font-bold text-slate-900">{previewDoc.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Target Assignment:</span>
                  <span className="font-bold text-slate-900">
                    {previewDoc.employeeName ? `${previewDoc.employeeName} (${previewDoc.employeeId})` : 'Company-Wide'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-bold text-blue-700">{previewDoc.confidentiality}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Date Archived:</span>
                  <span className="font-bold text-slate-700">{previewDoc.uploadedAt}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Integrity Check:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Valid SHA-256
                  </span>
                </div>
              </div>

              {previewDoc.description && (
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">Document Summary</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{previewDoc.description}</p>
                </div>
              )}

              {previewDoc.tags && previewDoc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewDoc.tags.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const id = previewDoc.id;
                  setPreviewDoc(null);
                  handleDeleteDoc(id);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete File
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / RENAME MODAL */}
      {editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Document Metadata</h3>
              <button onClick={() => setEditDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={editDoc.name}
                  onChange={(e) => setEditDoc({ ...editDoc, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Category
                </label>
                <select
                  value={editDoc.category}
                  onChange={(e) => setEditDoc({ ...editDoc, category: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ENERPACK_FOLDERS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Classification
                </label>
                <select
                  value={editDoc.confidentiality}
                  onChange={(e) => setEditDoc({ ...editDoc, confidentiality: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Restricted">Restricted</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Internal">Internal</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDoc.description || ''}
                  onChange={(e) => setEditDoc({ ...editDoc, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditDoc(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE WARNING LETTER MODAL */}
      <IssueWarningLetterModal
        isOpen={showIssueWarningModal}
        onClose={() => setShowIssueWarningModal(false)}
        onIssue={handleIssueWarningLetter}
        employees={EMPLOYEES}
      />

      {/* WARNING LETTER PREVIEW / READER MODAL */}
      <WarningLetterPreviewModal
        letter={selectedWarningLetter}
        onClose={() => setSelectedWarningLetter(null)}
        onAcknowledge={handleAcknowledgeWarning}
        onUpdateStatus={handleUpdateWarningStatus}
        onDelete={handleDeleteWarningLetter}
      />
    </div>
  );
};
