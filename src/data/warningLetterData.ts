import { WarningLetter, WarningTemplate } from '../types/warningLetter';

export const INITIAL_WARNING_LETTERS: WarningLetter[] = [
  {
    id: 'WL-101',
    letterNumber: 'WL-2026-001',
    employeeId: 'ENR003',
    employeeName: 'Akash Kurmi',
    employeeDesignation: 'Loading',
    department: 'Loading & Dispatch',
    warningLevel: 'Second Written Warning',
    incidentType: 'Attendance & Punctuality',
    incidentDate: 'Aug 08, 2026',
    issueDate: 'Aug 10, 2026',
    reviewDate: 'Sep 10, 2026',
    status: 'Issued',
    subject: 'Repeated Unexcused Absences and Unpunctuality during Shift Operations',
    incidentDescription: 'Despite a prior verbal counseling on June 15th and a First Written Warning on July 12th, you failed to report for scheduled dispatch operations on August 4th, 5th, and 8th without prior notice.',
    correctiveAction: '1. Adhere strictly to official shift timings.\n2. Submit all leave applications on the HRMS at least 48 hours in advance.',
    consequences: 'Failure to demonstrate attendance compliance will result in escalation under employment guidelines.',
    issuedBy: 'Shafi Para Thadathil',
    issuedByRole: 'Enerpack Manager'
  },
  {
    id: 'WL-102',
    letterNumber: 'WL-2026-002',
    employeeId: 'ENR005',
    employeeName: 'Girija',
    employeeDesignation: 'Housekeeping',
    department: 'Administration',
    warningLevel: 'First Written Warning',
    incidentType: 'Safety Violation',
    incidentDate: 'Aug 02, 2026',
    issueDate: 'Aug 04, 2026',
    reviewDate: 'Sep 04, 2026',
    status: 'Acknowledged',
    acknowledgedAt: 'Aug 05, 2026, 11:30 AM',
    acknowledgedBy: 'Girija',
    subject: 'Non-Compliance with Warehouse Industrial Safety Gear Protocols',
    incidentDescription: 'During safety inspection at the central facility, safety protocols were overlooked.',
    correctiveAction: 'Wear all prescribed Personal Protective Equipment at all times.',
    consequences: 'Further failure to comply with safety regulations will lead to formal disciplinary review.',
    issuedBy: 'Rajesh Ec',
    issuedByRole: 'Supervisor'
  }
];

export const WARNING_TEMPLATES: WarningTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Attendance & Punctuality Violation',
    warningLevel: 'First Written Warning',
    incidentType: 'Attendance & Punctuality',
    subject: 'Warning Notice: Unauthorized Absence and Punctuality Breach',
    incidentDescription: 'This template is used when employees repeatedly miss shifts or arrive late without prior notice.',
    correctiveAction: 'Adhere to official shift timings and submit leave applications in advance.',
    consequences: 'Further infractions may lead to suspension or termination.'
  },
  {
    id: 'tpl-2',
    name: 'Safety Protocol Non-Compliance',
    warningLevel: 'First Written Warning',
    incidentType: 'Safety Violation',
    subject: 'Safety Notice: Violation of Plant Industrial Safety Standards',
    incidentDescription: 'Issued when employees fail to wear mandatory PPE or follow plant safety guidelines.',
    correctiveAction: 'Strict compliance with ISO-45001 safety guidelines and mandatory PPE usage.',
    consequences: 'Immediate disciplinary action upon recurrence.'
  }
];
