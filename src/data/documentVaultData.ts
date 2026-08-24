import { 
  Briefcase, Users, Banknote, BookOpen, UserPlus, Workflow, 
  Printer, Scissors, PackageCheck, Award, Boxes, ShoppingCart, 
  Wrench, HardHat, Flame, Home, Shield, Truck, GraduationCap, 
  BarChart3, LucideIcon 
} from 'lucide-react';

export interface VaultDocumentItem {
  id: string;
  docNumber: string;
  name: string;
  category: string;
  fileFormat: 'pdf' | 'docx' | 'xlsx';
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  verified: boolean;
  confidentiality: 'Restricted' | 'Confidential' | 'Internal' | 'Public';
  description: string;
  tags: string[];
  version: string;
  approvedBy: string;
}

export interface FolderMetadata {
  id: string;
  slug: string;
  name: string;
  number: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  badge: string;
  governanceNote: string;
  defaultApprover: string;
  prefix: string;
}

export const FOLDER_CONFIGS: FolderMetadata[] = [
  {
    id: '01',
    slug: '01-management',
    number: '01',
    name: '01 Management',
    subtitle: 'Board & Strategic Policies',
    description: 'Official corporate organization architecture, executive terms of reference, delegated financial authorization limits, risk mitigation continuity protocols, and periodic board review reports.',
    icon: Briefcase,
    color: 'blue',
    badge: 'MGMT',
    governanceNote: 'All management documents in Folder 01 are bound by Enerpack Board governance policies. Revision changes must be submitted via Executive Change Request (ECR) and approved by the Plant Head.',
    defaultApprover: 'Board of Directors',
    prefix: 'ENP-MGT'
  },
  {
    id: '02',
    slug: '02-hr-employee-records',
    number: '02',
    name: '02 HR & Employee Records',
    subtitle: 'KYC, Dossiers & Staff Files',
    description: 'Comprehensive personnel dossiers, employee master registries, appointment agreements, disciplinary SOPs, and full & final offboarding documentation.',
    icon: Users,
    color: 'indigo',
    badge: 'HR',
    governanceNote: 'Personal data files are protected under Statutory Labor & Data Privacy guidelines. Access is strictly audited by Human Resources Head.',
    defaultApprover: 'HR Director',
    prefix: 'ENP-HR'
  },
  {
    id: '03',
    slug: '03-payroll-attendance-leave',
    number: '03',
    name: '03 Payroll, Attendance & Leave',
    subtitle: 'Wages, Slips & Time Logs',
    description: 'Consolidated wage sheets, biometric punch logs, overtime (Form 10) registers, statutory PF/ESI returns, and annual leave entitlement SOPs.',
    icon: Banknote,
    color: 'emerald',
    badge: 'PAY',
    governanceNote: 'Wage disbursement and statutory compliance registers undergo mandatory monthly audit before bank NEFT execution.',
    defaultApprover: 'Chief Financial Officer',
    prefix: 'ENP-PAY'
  },
  {
    id: '04',
    slug: '04-company-policies',
    number: '04',
    name: '04 Company Policies',
    subtitle: 'Standing Orders & Governance',
    description: 'Corporate policy manual, employee code of conduct, anti-harassment (POSH) charters, shopfloor discipline rules, and workplace conduct guides.',
    icon: BookOpen,
    color: 'purple',
    badge: 'POL',
    governanceNote: 'All employees receive signed policy acknowledgment upon onboarding. Revisions are communicated through official bulletin notices.',
    defaultApprover: 'Managing Director',
    prefix: 'ENP-POL'
  },
  {
    id: '05',
    slug: '05-recruitment-onboarding',
    number: '05',
    name: '05 Recruitment & Onboarding',
    subtitle: 'Hiring, Offers & Inductions',
    description: 'Manpower requisition approvals, interview assessment matrices, standard offer templates, and 30-day technical induction checklists.',
    icon: UserPlus,
    color: 'amber',
    badge: 'REC',
    governanceNote: 'Recruitment pipelines require approved Headcount Budget clearance from Plant Operations Head prior to candidate offer issuance.',
    defaultApprover: 'Talent Acquisition Head',
    prefix: 'ENP-REC'
  },
  {
    id: '06',
    slug: '06-production-planning',
    number: '06',
    name: '06 Production Planning',
    subtitle: 'Master Schedules & Capacity',
    description: 'Weekly corrugator schedules, die-cutting batch sequences, line capacity calculations, OEE targets, and conversion job cards.',
    icon: Workflow,
    color: 'cyan',
    badge: 'PLAN',
    governanceNote: 'Production plan revisions must be synchronized with PPC (Production Planning & Control) and Raw Material inventory reserves.',
    defaultApprover: 'PPC Lead',
    prefix: 'ENP-PRD'
  },
  {
    id: '07',
    slug: '07-pre-press-printing',
    number: '07',
    name: '07 Pre-Press & Printing',
    subtitle: 'CTP Plates & Color Proofing',
    description: 'Offset press color calibration SOPs, computer-to-plate (CTP) chemical bath logs, Pantone ink mixing recipes, and delta-E inspection sheets.',
    icon: Printer,
    color: 'sky',
    badge: 'PRNT',
    governanceNote: 'Color shade proof approvals must be physically signed off by QA and Customer Representative before bulk offset run commences.',
    defaultApprover: 'Print Master / Technical Lead',
    prefix: 'ENP-PRN'
  },
  {
    id: '08',
    slug: '08-lamination-die-cutting',
    number: '08',
    name: '08 Lamination & Die Cutting',
    subtitle: 'Thermal Film & Cut Specs',
    description: 'Thermal BOPP lamination temperature charts, creasing matrix channel gap tolerances, Bobst die-cutter setup guidelines, and waste stripping logs.',
    icon: Scissors,
    color: 'violet',
    badge: 'CUT',
    governanceNote: 'Die sharpness inspection and creasing depth calibration must be recorded every 50,000 impressions.',
    defaultApprover: 'Finishing Department Head',
    prefix: 'ENP-CUT'
  },
  {
    id: '09',
    slug: '09-folding-gluing-packing',
    number: '09',
    name: '09 Folding, Gluing & Packing',
    subtitle: 'Gluer Standards & Box Pack',
    description: 'Auto-folder gluer nozzle pressure calibration, hot-melt adhesion testing standards, strapping tension guidelines, and pallet stacking SOPs.',
    icon: PackageCheck,
    color: 'teal',
    badge: 'PACK',
    governanceNote: 'Finished carton batch samples undergo 100% fiber tear adhesion test before bundle packing and pallet stretch wrapping.',
    defaultApprover: 'Packaging Supervisor',
    prefix: 'ENP-GLU'
  },
  {
    id: '10',
    slug: '10-quality-control',
    number: '10',
    name: '10 Quality Control',
    subtitle: 'ISO 9001, GSM & QA Tests',
    description: 'ISO 9001 Quality Management System manual, burst factor calculations, ECT/BCT strength test protocols, and non-conformance reports (NCR).',
    icon: Award,
    color: 'rose',
    badge: 'QC',
    governanceNote: 'All testing instruments (Bursting tester, COBB tester, Caliper gauge) hold valid NABL calibration certificates.',
    defaultApprover: 'Quality Assurance Manager',
    prefix: 'ENP-QAC'
  },
  {
    id: '11',
    slug: '11-stores-inventory',
    number: '11',
    name: '11 Stores & Inventory',
    subtitle: 'Paper Reels & Stock Audits',
    description: 'Kraft paper reel inventory registers, adhesive chemicals storage, physical cycle-count reports, and minimum reorder level (ROP) sheets.',
    icon: Boxes,
    color: 'slate',
    badge: 'STR',
    governanceNote: 'Reel FIFO (First-In, First-Out) tracking is strictly mandated to preserve paper core moisture and burst factor performance.',
    defaultApprover: 'Stores & Inventory Manager',
    prefix: 'ENP-STR'
  },
  {
    id: '12',
    slug: '12-purchase-suppliers',
    number: '12',
    name: '12 Purchase & Suppliers',
    subtitle: 'Vendor Contracts & PO Records',
    description: 'Approved vendor lists (AVL), paperboard supply contracts, purchase orders, price indexation formulas, and supplier performance scorecards.',
    icon: ShoppingCart,
    color: 'orange',
    badge: 'PUR',
    governanceNote: 'Purchases exceeding INR 5,00,000 mandate 3 competitive sealed quotes and Commercial Director clearance.',
    defaultApprover: 'Procurement Head',
    prefix: 'ENP-PUR'
  },
  {
    id: '13',
    slug: '13-maintenance',
    number: '13',
    name: '13 Maintenance',
    subtitle: 'Machine PM & Breakdown Logs',
    description: 'Total Productive Maintenance (TPM) schedules, Heidelberg press overhaul logs, boiler lubrication checklists, and critical spare parts inventory.',
    icon: Wrench,
    color: 'amber',
    badge: 'MAINT',
    governanceNote: 'Preventive maintenance tasks are executed strictly during scheduled Sunday shutdowns with full LOTO (Lockout/Tagout) safety.',
    defaultApprover: 'Chief Maintenance Engineer',
    prefix: 'ENP-MNT'
  },
  {
    id: '14',
    slug: '14-hse-safety',
    number: '14',
    name: '14 HSE & Safety',
    subtitle: 'EHS Manuals & PPE Compliance',
    description: 'Factory EHS manual, machine guarding certifications, PPE compliance audit logs, safety committee minutes, and near-miss hazard reports.',
    icon: HardHat,
    color: 'emerald',
    badge: 'HSE',
    governanceNote: 'Plant operates under Zero Harm principles. Safety training refresher is mandatory for 100% of shopfloor operators every 6 months.',
    defaultApprover: 'HSE Safety Officer',
    prefix: 'ENP-HSE'
  },
  {
    id: '15',
    slug: '15-fire-emergency',
    number: '15',
    name: '15 Fire & Emergency',
    subtitle: 'Evacuation & Extinguisher SOP',
    description: 'Fire hydrant layout blueprints, emergency assembly evacuation maps, quarterly mock drill certificates, and extinguisher hydrostatic test logs.',
    icon: Flame,
    color: 'red',
    badge: 'FIRE',
    governanceNote: 'Fire mock drills and emergency siren tests are conducted quarterly in coordination with local industrial emergency authorities.',
    defaultApprover: 'Fire Safety Lead',
    prefix: 'ENP-FIR'
  },
  {
    id: '16',
    slug: '16-accommodation-other-state-employees',
    number: '16',
    name: '16 Accommodation & Other-State Employees',
    subtitle: 'Hostel Allotment & Police Verif.',
    description: 'Staff hostel allotment register, inter-state migrant worker statutory filings (ISMW Act), mess sanitation records, and local police verification dossiers.',
    icon: Home,
    color: 'blue',
    badge: 'ACC',
    governanceNote: 'Hostel facility inspections occur bi-weekly to ensure hygiene, fire alarm integrity, and worker welfare compliance.',
    defaultApprover: 'Administration & Welfare Lead',
    prefix: 'ENP-ACC'
  },
  {
    id: '17',
    slug: '17-security-administration',
    number: '17',
    name: '17 Security & Administration',
    subtitle: 'Gate Passes, CCTV & Admin Gate',
    description: 'Factory gate inward/outward registers, CCTV 90-day retention policies, visitor pass protocols, and security guard post duty charts.',
    icon: Shield,
    color: 'slate',
    badge: 'SEC',
    governanceNote: 'No raw material, finished carton pallets, or scrap scrap may leave the factory perimeter without an authorized Returnable/Non-Returnable Gate Pass.',
    defaultApprover: 'Chief Security Officer',
    prefix: 'ENP-SEC'
  },
  {
    id: '18',
    slug: '18-sales-dispatch-customers',
    number: '18',
    name: '18 Sales, Dispatch & Customers',
    subtitle: 'Client Orders & Delivery Challans',
    description: 'Customer purchase orders, delivery challans, fleet GPS transport logs, client proof-of-delivery (POD) receipts, and customer satisfaction surveys.',
    icon: Truck,
    color: 'blue',
    badge: 'SALE',
    governanceNote: 'Dispatch vehicle inspection checklist (clean container bed, moisture tarp, wheel chocks) is verified before driver departure.',
    defaultApprover: 'Dispatch & Logistics Head',
    prefix: 'ENP-DIS'
  },
  {
    id: '19',
    slug: '19-training-audit-document-control',
    number: '19',
    name: '19 Training, Audit & Document Control',
    subtitle: 'Skill Matrix & Non-Conformance',
    description: 'Shopfloor operator skill matrix, internal QMS audit schedules, corrective action plans (CAPA), 5S audit logs, and master document change histories.',
    icon: GraduationCap,
    color: 'indigo',
    badge: 'AUD',
    governanceNote: 'Obsolete document stamps are strictly enforced on all shopfloor hard copies upon revision release.',
    defaultApprover: 'Lead Auditor & Document Controller',
    prefix: 'ENP-AUD'
  },
  {
    id: '20',
    slug: '20-management-reports-kpis',
    number: '20',
    name: '20 Management Reports & KPIs',
    subtitle: 'Executive OEE, Cost & Analytics',
    description: 'Monthly plant efficiency KPIs, scrap waste percentage dashboards, raw material variance reports, power consumption analytics, and quarterly executive reviews.',
    icon: BarChart3,
    color: 'purple',
    badge: 'KPI',
    governanceNote: 'Executive performance scorecards are reviewed on the 5th of every calendar month by the Joint Managing Directors.',
    defaultApprover: 'Director of Operations',
    prefix: 'ENP-KPI'
  }
];

export const MASTER_VAULT_DOCUMENTS: VaultDocumentItem[] = [
  // 01 Management
  {
    id: 'DOC-01-01',
    docNumber: 'ENP-MGT-001',
    name: 'Company_Organization_Structure.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2400000,
    uploadedAt: 'Aug 20, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Hierarchical organization chart of Enerpack packaging units, departmental reporting matrix, and plant leadership hierarchy.',
    tags: ['Org Structure', 'Management', 'Governance', 'Leadership'],
    version: 'v4.2',
    approvedBy: 'Board of Directors'
  },
  {
    id: 'DOC-01-02',
    docNumber: 'ENP-MGT-002',
    name: 'Management_Roles_and_Responsibilities.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '1.8 MB',
    sizeBytes: 1800000,
    uploadedAt: 'Aug 18, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Detailed terms of reference, key result areas (KRAs), and executive responsibilities for Directors, Plant Head, and Department Managers.',
    tags: ['KRAs', 'Job Roles', 'Executive', 'Accountability'],
    version: 'v3.0',
    approvedBy: 'Managing Director'
  },
  {
    id: 'DOC-01-03',
    docNumber: 'ENP-MGT-003',
    name: 'Management_Approval_Authority_Matrix.xlsx',
    category: '01 Management',
    fileFormat: 'xlsx',
    size: '1.2 MB',
    sizeBytes: 1200000,
    uploadedAt: 'Aug 15, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Delegation of Financial and Administrative Powers (DOFP) matrix for CapEx, OpEx, vendor selection, and headcount approvals.',
    tags: ['Authority Matrix', 'DOFP', 'Approval Limits', 'Finance'],
    version: 'v2026.1',
    approvedBy: 'Chief Financial Officer'
  },
  {
    id: 'DOC-01-04',
    docNumber: 'ENP-MGT-004',
    name: 'Risk_and_Business_Continuity_Plan.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '3.6 MB',
    sizeBytes: 3600000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Enterprise risk mitigation framework, disaster recovery protocols, supply chain contingency, and power outage fallback procedures.',
    tags: ['BCP', 'Risk Management', 'Contingency', 'Disaster Recovery'],
    version: 'v5.0',
    approvedBy: 'Plant Operations Committee'
  },
  {
    id: 'DOC-01-05',
    docNumber: 'ENP-MGT-005',
    name: 'Management_Review_Report.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '4.2 MB',
    sizeBytes: 4200000,
    uploadedAt: 'Aug 05, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Quarterly executive review report evaluating plant productivity, safety metrics, quality deviations, and strategic growth goals.',
    tags: ['MRM', 'Review Report', 'Executive Summary', 'Q2 2026'],
    version: 'v2026-Q2',
    approvedBy: 'Executive Committee'
  },

  // 02 HR & Employee Records
  {
    id: 'DOC-02-01',
    docNumber: 'ENP-HR-001',
    name: 'Employee_Master_Register.xlsx',
    category: '02 HR & Employee Records',
    fileFormat: 'xlsx',
    size: '3.5 MB',
    sizeBytes: 3500000,
    uploadedAt: 'Aug 22, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Comprehensive employee database with biometric IDs, KYC records, emergency contacts, blood group, department, and salary grade.',
    tags: ['Master Register', 'Employee Database', 'KYC', 'Staff Registry'],
    version: 'v2026.8',
    approvedBy: 'HR Director'
  },
  {
    id: 'DOC-02-02',
    docNumber: 'ENP-HR-002',
    name: 'Employee_Contract_Agreement.pdf',
    category: '02 HR & Employee Records',
    fileFormat: 'pdf',
    size: '2.1 MB',
    sizeBytes: 2100000,
    uploadedAt: 'Aug 20, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Standard legal employment contract template outlining employment terms, confidentiality, probation period, and IP assignment.',
    tags: ['Employment Contract', 'Legal Agreement', 'Terms', 'HR Legal'],
    version: 'v4.0',
    approvedBy: 'Legal Counsel & HR Head'
  },
  {
    id: 'DOC-02-03',
    docNumber: 'ENP-HR-003',
    name: 'Appointment_Letter.docx',
    category: '02 HR & Employee Records',
    fileFormat: 'docx',
    size: '850 KB',
    sizeBytes: 850000,
    uploadedAt: 'Aug 19, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Official formal appointment letter template specifying designation, compensation breakdown, date of joining, and reporting structure.',
    tags: ['Appointment Letter', 'Offer', 'Joining', 'HR Template'],
    version: 'v2.5',
    approvedBy: 'HR Operations Manager'
  },
  {
    id: 'DOC-02-04',
    docNumber: 'ENP-HR-004',
    name: 'Warning_and_Disciplinary_Action_Procedure.pdf',
    category: '02 HR & Employee Records',
    fileFormat: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1900000,
    uploadedAt: 'Aug 16, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Standardized 3-tier disciplinary framework: Verbal Counseling, Written Warning, Final Show-Cause Notice, and Domestic Enquiry SOP.',
    tags: ['Disciplinary Procedure', 'Warning Letter', 'Enquiry SOP', 'Compliance'],
    version: 'v3.1',
    approvedBy: 'Plant Disciplinary Committee'
  },
  {
    id: 'DOC-02-05',
    docNumber: 'ENP-HR-005',
    name: 'Resignation_Relieving_and_Experience_Procedure.pdf',
    category: '02 HR & Employee Records',
    fileFormat: 'pdf',
    size: '1.6 MB',
    sizeBytes: 1600000,
    uploadedAt: 'Aug 12, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Offboarding SOP, notice period guidelines, asset handover checklist, full & final settlement (F&F), and relieving letter issuance.',
    tags: ['Resignation SOP', 'Relieving Letter', 'Experience Certificate', 'Offboarding'],
    version: 'v2.1',
    approvedBy: 'HR Operations Manager'
  },

  // 03 Payroll, Attendance & Leave
  {
    id: 'DOC-03-01',
    docNumber: 'ENP-PAY-001',
    name: 'Attendance_and_Shift_SOP.pdf',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'pdf',
    size: '2.3 MB',
    sizeBytes: 2300000,
    uploadedAt: 'Aug 21, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Biometric face/fingerprint punch rules, 3-shift rotation schedule (Shift A, B & General), late grace period, and punch regularization.',
    tags: ['Shift SOP', 'Attendance Rules', 'Biometric', 'Shift Timings'],
    version: 'v3.0',
    approvedBy: 'Plant Operations Head'
  },
  {
    id: 'DOC-03-02',
    docNumber: 'ENP-PAY-002',
    name: 'Leave_and_Personal_Leave_SOP.pdf',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'pdf',
    size: '1.7 MB',
    sizeBytes: 1700000,
    uploadedAt: 'Aug 19, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Annual leave eligibility guidelines covering Casual Leave (CL), Sick Leave (SL), Earned/Privilege Leave (EL), and gate-pass permissions.',
    tags: ['Leave SOP', 'Leave Rules', 'Casual Leave', 'Privilege Leave'],
    version: 'v2.4',
    approvedBy: 'HR Director'
  },
  {
    id: 'DOC-03-03',
    docNumber: 'ENP-PAY-003',
    name: 'Monthly_Payroll_Register.xlsx',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'xlsx',
    size: '4.1 MB',
    sizeBytes: 4100000,
    uploadedAt: 'Aug 01, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Consolidated monthly salary master including basic pay, HRA, DA, PF employer/employee share, ESI deductions, PT, and net payout.',
    tags: ['Payroll Register', 'Salary Sheet', 'PF', 'ESI', 'Wages'],
    version: 'v2026.07',
    approvedBy: 'CFO & Accounts Lead'
  },
  {
    id: 'DOC-03-04',
    docNumber: 'ENP-PAY-004',
    name: 'Overtime_Register.xlsx',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'xlsx',
    size: '2.6 MB',
    sizeBytes: 2600000,
    uploadedAt: 'Aug 02, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Factory Act statutory OT register (Form 10) tracking double-rate overtime hours, supervisor approvals, and machine job allocations.',
    tags: ['OT Register', 'Overtime', 'Factory Act Form 10', 'Overtime Logs'],
    version: 'v2026.07',
    approvedBy: 'Production Head'
  },
  {
    id: 'DOC-03-05',
    docNumber: 'ENP-PAY-005',
    name: 'Salary_Deduction_and_Adjustment_Register.xlsx',
    category: '03 Payroll, Attendance & Leave',
    fileFormat: 'xlsx',
    size: '1.8 MB',
    sizeBytes: 1800000,
    uploadedAt: 'Aug 01, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Detailed tracking of festival salary advances, canteen deductions, uniform charges, loan recoveries, and loss-of-pay (LOP) adjustments.',
    tags: ['Deductions', 'Salary Advance', 'Adjustments', 'LOP Register'],
    version: 'v2026.07',
    approvedBy: 'Accounts Manager'
  },

  // 04 Company Policies
  {
    id: 'DOC-04-01',
    docNumber: 'ENP-POL-001',
    name: 'Enerpack_Company_Procedure_and_Policy_Manual.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '6.5 MB',
    sizeBytes: 6500000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Master governance document containing plant operational standards, departmental interactions, and statutory compliance framework.',
    tags: ['Policy Manual', 'Company SOP', 'Governance', 'Compliance Manual'],
    version: 'v5.0',
    approvedBy: 'Managing Director'
  },
  {
    id: 'DOC-04-02',
    docNumber: 'ENP-POL-002',
    name: 'Employee_Code_of_Conduct.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '2.8 MB',
    sizeBytes: 2800000,
    uploadedAt: 'Aug 11, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Professional ethics, workplace integrity, conflict of interest, non-harassment (POSH), anti-bribery, and customer confidentiality guidelines.',
    tags: ['Code of Conduct', 'Ethics', 'POSH', 'Workplace Standards'],
    version: 'v3.2',
    approvedBy: 'Board Ethics Committee'
  },
  {
    id: 'DOC-04-03',
    docNumber: 'ENP-POL-003',
    name: 'Attendance_and_Punctuality_Policy.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '1.5 MB',
    sizeBytes: 1500000,
    uploadedAt: 'Aug 12, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Mandatory punch-in tolerances, late coming salary cut rules (3 late arrivals = 0.5 day LOP), and unauthorized absenteeism consequences.',
    tags: ['Punctuality Policy', 'Late Coming', 'Absenteeism', 'Discipline'],
    version: 'v2.8',
    approvedBy: 'HR Operations'
  },
  {
    id: 'DOC-04-04',
    docNumber: 'ENP-POL-004',
    name: 'Mobile_Phone_Tobacco_and_Personal_Conduct_Policy.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '1.4 MB',
    sizeBytes: 1400000,
    uploadedAt: 'Aug 14, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Strict ban on smartphone usage on shopfloor machinery areas, zero-tolerance tobacco/gutkha chewing in factory premises, and uniform dress code.',
    tags: ['Mobile Policy', 'Tobacco Ban', 'Safety Protocol', 'Personal Conduct'],
    version: 'v2.1',
    approvedBy: 'EHS & Plant Head'
  },
  {
    id: 'DOC-04-05',
    docNumber: 'ENP-POL-005',
    name: 'Disciplinary_Action_Policy.pdf',
    category: '04 Company Policies',
    fileFormat: 'pdf',
    size: '2.2 MB',
    sizeBytes: 2200000,
    uploadedAt: 'Aug 15, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Formal policy on employee misconduct, insubordination, theft, willful damage, charge-sheet issuance, suspension, and appeal procedure.',
    tags: ['Disciplinary Policy', 'Misconduct', 'Charge Sheet', 'Domestic Enquiry'],
    version: 'v3.0',
    approvedBy: 'Legal Department'
  },

  // 05 Recruitment & Onboarding
  {
    id: 'DOC-05-01',
    docNumber: 'ENP-REC-001',
    name: 'Onboarding_Checklist_New_Hires_2026.pdf',
    category: '05 Recruitment & Onboarding',
    fileFormat: 'pdf',
    size: '1.2 MB',
    sizeBytes: 1200000,
    uploadedAt: 'Aug 05, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Step-by-step induction checklist for shopfloor operators, quality technicians, and print press engineers.',
    tags: ['Induction', 'Checklist', 'Hiring', 'New Joiner'],
    version: 'v2.2',
    approvedBy: 'Talent Acquisition Head'
  },
  {
    id: 'DOC-05-02',
    docNumber: 'ENP-REC-002',
    name: 'Candidate_Interview_Assessment_Matrix.xlsx',
    category: '05 Recruitment & Onboarding',
    fileFormat: 'xlsx',
    size: '1.5 MB',
    sizeBytes: 1500000,
    uploadedAt: 'Aug 02, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Standardized scoring sheet for operator technical skills, behavioral competencies, and safety awareness evaluation.',
    tags: ['Interview Matrix', 'Hiring Criteria', 'Scoring'],
    version: 'v1.8',
    approvedBy: 'HR Manager'
  },

  // 06 Production Planning
  {
    id: 'DOC-06-01',
    docNumber: 'ENP-PRD-001',
    name: 'Master_Production_Schedule_Shift_A_B.xlsx',
    category: '06 Production Planning',
    fileFormat: 'xlsx',
    size: '2.8 MB',
    sizeBytes: 2800000,
    uploadedAt: 'Yesterday, 06:00 PM',
    verified: true,
    confidentiality: 'Internal',
    description: 'Weekly corrugated box conversion schedule across Corrugator 1, Die Cutters, and Flexo folder gluer lines.',
    tags: ['Production', 'Shift A', 'Planning', 'Capacity'],
    version: 'v2026-W34',
    approvedBy: 'PPC Lead'
  },
  {
    id: 'DOC-06-02',
    docNumber: 'ENP-PRD-002',
    name: 'Job_Card_Route_Sheet_Standard_SOP.pdf',
    category: '06 Production Planning',
    fileFormat: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1900000,
    uploadedAt: 'Aug 14, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Barcode travel ticket guidelines tracking raw sheet feeding, print pass, lamination, and final pallet count.',
    tags: ['Route Card', 'Job Ticket', 'Traceability'],
    version: 'v3.0',
    approvedBy: 'Plant Manager'
  },

  // 07 Pre-Press & Printing
  {
    id: 'DOC-07-01',
    docNumber: 'ENP-PRN-001',
    name: 'Offset_Printing_Color_Calibration_SOP.pdf',
    category: '07 Pre-Press & Printing',
    fileFormat: 'pdf',
    size: '3.6 MB',
    sizeBytes: 3600000,
    uploadedAt: 'Jul 22, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Standard operating procedure for spectrophotometer delta-E tolerance and ink viscosity checks.',
    tags: ['Pre-Press', 'Offset', 'SOP', 'Printing', 'Color Proof'],
    version: 'v4.1',
    approvedBy: 'Print Master'
  },
  {
    id: 'DOC-07-02',
    docNumber: 'ENP-PRN-002',
    name: 'CTP_Plate_Exposure_and_Chemical_Bath_Log.xlsx',
    category: '07 Pre-Press & Printing',
    fileFormat: 'xlsx',
    size: '2.1 MB',
    sizeBytes: 2100000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Thermal plate exposure laser intensity calibration and developer replenishment logs.',
    tags: ['CTP Plates', 'Pre-Press', 'Laser', 'Chemicals'],
    version: 'v2.0',
    approvedBy: 'Pre-Press Lead'
  },

  // 08 Lamination & Die Cutting
  {
    id: 'DOC-08-01',
    docNumber: 'ENP-CUT-001',
    name: 'Thermal_Lamination_Temperature_Settings_Guide.docx',
    category: '08 Lamination & Die Cutting',
    fileFormat: 'docx',
    size: '890 KB',
    sizeBytes: 890000,
    uploadedAt: 'Jul 19, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'BOPP thermal film temperature matrix by paper GSM and creasing matrix clearance chart.',
    tags: ['Lamination', 'Die Cutting', 'Creasing', 'BOPP Film'],
    version: 'v2.4',
    approvedBy: 'Finishing Lead'
  },
  {
    id: 'DOC-08-02',
    docNumber: 'ENP-CUT-002',
    name: 'Bobst_Die_Cut_Matrix_Tension_Standard.pdf',
    category: '08 Lamination & Die Cutting',
    fileFormat: 'pdf',
    size: '2.5 MB',
    sizeBytes: 2500000,
    uploadedAt: 'Aug 04, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Die cutting tonnage calculation, nicking tool placement, and automatic waste stripping calibration.',
    tags: ['Bobst', 'Die Cutting', 'Tonnage', 'Nicking'],
    version: 'v3.1',
    approvedBy: 'Technical Lead'
  },

  // 09 Folding, Gluing & Packing
  {
    id: 'DOC-09-01',
    docNumber: 'ENP-GLU-001',
    name: 'High_Speed_Gluer_Packaging_Standard_SOP.pdf',
    category: '09 Folding, Gluing & Packing',
    fileFormat: 'pdf',
    size: '1.9 MB',
    sizeBytes: 1900000,
    uploadedAt: 'Aug 02, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Hot melt vs cold glue adhesion testing and bundling strap tension standards.',
    tags: ['Folding', 'Gluing', 'Packaging', 'Adhesion Test'],
    version: 'v2.2',
    approvedBy: 'Packaging Supervisor'
  },

  // 10 Quality Control
  {
    id: 'DOC-10-01',
    docNumber: 'ENP-QAC-001',
    name: 'Enerpack_ISO_9001_Quality_Manual_v5.pdf',
    category: '10 Quality Control',
    fileFormat: 'pdf',
    size: '5.4 MB',
    sizeBytes: 5400000,
    uploadedAt: 'Jul 15, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Quality Management System manual, GSM bursting factor testing, and COBB water absorption specs.',
    tags: ['ISO9001', 'QA', 'Quality Manual', 'Bursting Test'],
    version: 'v5.0',
    approvedBy: 'QA Manager'
  },
  {
    id: 'DOC-10-02',
    docNumber: 'ENP-QAC-002',
    name: 'ECT_BCT_Strength_Inspection_Report.xlsx',
    category: '10 Quality Control',
    fileFormat: 'xlsx',
    size: '3.1 MB',
    sizeBytes: 3100000,
    uploadedAt: 'Aug 17, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Edge Crush Test (ECT) and Box Compression Test (BCT) laboratory inspection test logs.',
    tags: ['ECT', 'BCT', 'Lab Test', 'Compression'],
    version: 'v2026.08',
    approvedBy: 'Chief QC Chemist'
  },

  // 11 Stores & Inventory
  {
    id: 'DOC-11-01',
    docNumber: 'ENP-STR-001',
    name: 'Monthly_Raw_Material_Stock_Audit_July_2026.xlsx',
    category: '11 Stores & Inventory',
    fileFormat: 'xlsx',
    size: '3.4 MB',
    sizeBytes: 3400000,
    uploadedAt: 'Aug 03, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Physical inventory audit of kraft paper reels, semi-chemical fluting, starch, and inks.',
    tags: ['Inventory', 'Stores', 'Kraft Paper', 'Stock Audit'],
    version: 'v2026.07',
    approvedBy: 'Stores Manager'
  },

  // 12 Purchase & Suppliers
  {
    id: 'DOC-12-01',
    docNumber: 'ENP-PUR-001',
    name: 'ITC_Paperboards_Vendor_Supply_Agreement.pdf',
    category: '12 Purchase & Suppliers',
    fileFormat: 'pdf',
    size: '2.7 MB',
    sizeBytes: 2700000,
    uploadedAt: 'Jun 10, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Annual raw paperboard supply agreement with quarterly price indexation terms.',
    tags: ['Supplier', 'Purchase', 'Agreement', 'Paperboard'],
    version: 'v2026.1',
    approvedBy: 'Procurement Head'
  },

  // 13 Maintenance
  {
    id: 'DOC-13-01',
    docNumber: 'ENP-MNT-001',
    name: 'Preventive_Maintenance_Heidelberg_Speedmaster.pdf',
    category: '13 Maintenance',
    fileFormat: 'pdf',
    size: '4.1 MB',
    sizeBytes: 4100000,
    uploadedAt: 'Jul 28, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Lubrication checklist, cylinder gap inspection, and hydraulic pressure logs.',
    tags: ['Maintenance', 'PM', 'Printing Press', 'Heidelberg'],
    version: 'v3.5',
    approvedBy: 'Chief Engineer'
  },

  // 14 HSE & Safety
  {
    id: 'DOC-14-01',
    docNumber: 'ENP-HSE-001',
    name: 'Factory_EHS_Policy_And_Safety_Manual.pdf',
    category: '14 HSE & Safety',
    fileFormat: 'pdf',
    size: '3.9 MB',
    sizeBytes: 3900000,
    uploadedAt: 'May 14, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Occupational Health and Safety rules, machine guarding, and mandatory PPE protocol.',
    tags: ['HSE', 'Safety', 'PPE', 'Factory Act', 'EHS Manual'],
    version: 'v4.0',
    approvedBy: 'EHS Officer'
  },

  // 15 Fire & Emergency
  {
    id: 'DOC-15-01',
    docNumber: 'ENP-FIR-001',
    name: 'Emergency_Evacuation_Plan_And_Assembly_Map.pdf',
    category: '15 Fire & Emergency',
    fileFormat: 'pdf',
    size: '4.2 MB',
    sizeBytes: 4200000,
    uploadedAt: 'Jun 05, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Factory floor emergency exit diagram, fire hydrant zones, and primary assembly point.',
    tags: ['Fire Safety', 'Emergency', 'Evacuation', 'Map'],
    version: 'v3.0',
    approvedBy: 'Fire Marshall'
  },

  // 16 Accommodation & Other-State Employees
  {
    id: 'DOC-16-01',
    docNumber: 'ENP-ACC-001',
    name: 'Staff_Hostel_Allotment_And_House_Rules.pdf',
    category: '16 Accommodation & Other-State Employees',
    fileFormat: 'pdf',
    size: '1.5 MB',
    sizeBytes: 1500000,
    uploadedAt: 'Jul 01, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Accommodations policy, room allotments, mess rules, and interstate worker registration files.',
    tags: ['Accommodation', 'Hostel', 'Interstate Workers', 'Mess Rules'],
    version: 'v2.0',
    approvedBy: 'Welfare Officer'
  },

  // 17 Security & Administration
  {
    id: 'DOC-17-01',
    docNumber: 'ENP-SEC-001',
    name: 'CCTV_Surveillance_And_Gate_Entry_Protocol.pdf',
    category: '17 Security & Administration',
    fileFormat: 'pdf',
    size: '1.3 MB',
    sizeBytes: 1300000,
    uploadedAt: 'Jun 15, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Security guard shift instructions, material inward/outward gate pass protocols.',
    tags: ['Security', 'Admin', 'Gate Pass', 'CCTV Protocol'],
    version: 'v2.1',
    approvedBy: 'Security Lead'
  },

  // 18 Sales, Dispatch & Customers
  {
    id: 'DOC-18-01',
    docNumber: 'ENP-DIS-001',
    name: 'Dispatch_Delivery_Challan_Log_August_2026.xlsx',
    category: '18 Sales, Dispatch & Customers',
    fileFormat: 'xlsx',
    size: '2.5 MB',
    sizeBytes: 2500000,
    uploadedAt: 'Today, 08:00 AM',
    verified: true,
    confidentiality: 'Internal',
    description: 'Finished goods dispatch tracking, fleet vehicle logs, and signed customer POD acknowledgments.',
    tags: ['Dispatch', 'Sales', 'Delivery', 'Logistics', 'POD'],
    version: 'v2026.08',
    approvedBy: 'Logistics Head'
  },

  // 19 Training, Audit & Document Control
  {
    id: 'DOC-19-01',
    docNumber: 'ENP-AUD-001',
    name: 'Six_Sigma_Training_Matrix_Operators_2026.pdf',
    category: '19 Training, Audit & Document Control',
    fileFormat: 'pdf',
    size: '2.9 MB',
    sizeBytes: 2900000,
    uploadedAt: 'Jul 30, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Staff skill matrix, 5S shopfloor audit scorecards, and document revision control logs.',
    tags: ['Training', 'Audit', 'QMS', '5S', 'Skill Matrix'],
    version: 'v2026.2',
    approvedBy: 'Lead Auditor'
  },

  // 20 Management Reports & KPIs
  {
    id: 'DOC-20-01',
    docNumber: 'ENP-KPI-001',
    name: 'Executive_Monthly_Plant_OEE_And_Waste_Report.pdf',
    category: '20 Management Reports & KPIs',
    fileFormat: 'pdf',
    size: '3.8 MB',
    sizeBytes: 3800000,
    uploadedAt: 'Aug 04, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Overall Equipment Effectiveness (OEE) benchmarks, corrugator trim waste reduction metrics, and power savings analytics.',
    tags: ['OEE', 'Waste Report', 'Executive KPI', 'Analytics'],
    version: 'v2026.07',
    approvedBy: 'Director of Operations'
  }
];

export const getFolderBySlug = (slug: string): FolderMetadata => {
  const found = FOLDER_CONFIGS.find(f => f.slug === slug || f.id === slug || f.name.toLowerCase().includes(slug.toLowerCase()));
  return found || FOLDER_CONFIGS[0];
};

export const getFolderByCategory = (category: string): FolderMetadata => {
  const found = FOLDER_CONFIGS.find(f => f.name === category);
  return found || FOLDER_CONFIGS[0];
};
