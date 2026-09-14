export type EmploymentStatus = 'Live' | 'Exit' | 'Requirement' | 'On Leave' | 'Suspended' | 'Inactive';
export type OtEligibility = 'OT Employee' | 'Non-OT Employee';
export type AllowanceEligibility = 'Allowance Employee' | 'Non-Allowance Employee';
export type OtRateType = 'Hourly Fixed Rate' | 'Basic Salary Based' | 'Statutory/Configured Rate' | 'Custom Rate';
export type OccupationType = 
  | 'Enerpack Manager' 
  | 'Supervisor' 
  | 'Driver' 
  | 'Cutting' 
  | 'Loading' 
  | 'Housekeeping' 
  | 'Labour' 
  | 'All Rounder' 
  | 'Other';

export interface EmployeeMasterRecord {
  id: string; // Staff No e.g. ENR001
  joinDate: string; // e.g. 15-07-24
  name: string;
  age: number | null;
  state: string; // Kerala, Assam, Bihar, etc.
  country: string; // India
  occupation: string;
  mobile: string;
  aadhaar: string; // Raw or masked
  basicSalary: number;
  accountNo: string; // Raw or masked
  bankName: string;
  ifsc: string;
  status: EmploymentStatus;
  remarks?: string;
  
  // OT / Non-OT Classification
  otEligibility: OtEligibility;
  otRateType?: OtRateType;
  otRate?: number;
  otApprovalRequired?: boolean;
  otRemarks?: string;
  maxOtHoursDay?: number;
  maxOtHoursMonth?: number;
  effectiveFrom?: string;
  effectiveTo?: string;

  // Allowance Classification
  allowanceEligibility?: AllowanceEligibility;
  allowanceType?: string; // e.g. 'Travelling Allowance'
  allowanceAmount?: number; // e.g. 3000.00

  // Additional metadata for compatibility
  department?: string;
  email?: string;
  photo?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  employeeId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipDevice?: string;
}
