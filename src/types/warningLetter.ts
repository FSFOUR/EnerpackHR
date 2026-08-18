export type WarningLevel = 
  | 'Verbal Warning Record'
  | 'First Written Warning'
  | 'Second Written Warning'
  | 'Final Warning'
  | 'Show Cause Notice';

export type IncidentCategory = 
  | 'Attendance & Punctuality'
  | 'Performance & Deliverables'
  | 'Code of Conduct'
  | 'Policy & Security Breach'
  | 'Insubordination'
  | 'Safety Violation';

export type WarningStatus = 
  | 'Issued'
  | 'Acknowledged'
  | 'Under Appeal'
  | 'Resolved'
  | 'Closed';

export interface WarningLetter {
  id: string;
  letterNumber: string; // e.g. "WL-2026-001"
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  department: string;
  warningLevel: WarningLevel;
  incidentType: IncidentCategory;
  incidentDate: string;
  issueDate: string;
  reviewDate: string;
  status: WarningStatus;
  subject: string;
  incidentDescription: string;
  correctiveAction: string;
  consequences: string;
  issuedBy: string;
  issuedByRole: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  appealNotes?: string;
  syncedDocId?: string;
}

export interface WarningTemplate {
  id: string;
  name: string;
  warningLevel: WarningLevel;
  incidentType: IncidentCategory;
  subject: string;
  incidentDescription: string;
  correctiveAction: string;
  consequences: string;
}
