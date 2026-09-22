import { EmployeeMasterRecord } from '../types/employeeMaster';
import { maskAadhaar } from '../data/enerpackEmployeeMaster';

export interface MappedContractFields {
  agreementNo: string;
  date: string;
  fullName: string;
  staffNo: string;
  ageDob: string;
  aadhaar: string;
  permAddress: string;
  currAddress: string;
  mobileEmail: string;
  emergencyContact: string;
  designationDept: string;
  designation: string;
  department: string;
  joiningDate: string;
  workLocation: string;
  salary: string;
  allowances: string;
  probation: string;
  noticePeriod: string;
  contractType: 'Residential' | 'Non-Residential / Other State Employee';
}

export function mapEmployeeToContractFields(
  employee: EmployeeMasterRecord | null | undefined,
  options: {
    agreementNo?: string;
    agreementDate?: string;
    contractType?: 'Residential' | 'Non-Residential / Other State Employee';
    probationPeriod?: string;
    noticePeriod?: string;
    workLocation?: string;
    allowances?: string;
    isBlank?: boolean;
    maskAadhaarNumber?: boolean;
  } = {}
): MappedContractFields {
  const isBlank = !!options.isBlank;
  const cType = options.contractType || 'Residential';

  if (isBlank || !employee) {
    return {
      agreementNo: '',
      date: '',
      fullName: '',
      staffNo: '',
      ageDob: '',
      aadhaar: '',
      permAddress: '',
      currAddress: '',
      mobileEmail: '',
      emergencyContact: '',
      designationDept: '',
      designation: '__________________________',
      department: '__________________',
      joiningDate: '__________',
      workLocation: '______________________________',
      salary: '________________',
      allowances: '______________________________',
      probation: options.probationPeriod || '__________',
      noticePeriod: options.noticePeriod || '45 days\'',
      contractType: cType,
    };
  }

  const staffNo = employee.id || '';
  const fullName = employee.name || '';
  
  // Format age / DOB
  let ageDob = '';
  if (employee.age) {
    ageDob = `${employee.age} Yrs`;
  }
  if (employee.dob) {
    ageDob = ageDob ? `${ageDob} / ${employee.dob}` : employee.dob;
  }
  if (!ageDob) {
    ageDob = 'N/A';
  }

  // Aadhaar
  const aadhaar = employee.aadhaar
    ? (options.maskAadhaarNumber !== false ? maskAadhaar(employee.aadhaar, false) : employee.aadhaar)
    : 'N/A';

  // Address
  const permAddress = employee.permanentAddress || employee.address || 'Kunnath House, P.O. Mambra, Thrissur, Kerala - 680308';
  const currAddress = employee.currentAddress || employee.address || 'Enerpack Staff Quarters, Room 402, Aluva, Ernakulam';

  // Mobile / Email
  const mobile = employee.mobile || 'N/A';
  const email = employee.email || (fullName ? `${fullName.toLowerCase().replace(/\s+/g, '')}@enerpack.com` : 'info@enerpack.com');
  const mobileEmail = `${mobile} / ${email}`;

  // Emergency Contact
  const emergencyContact = employee.emergencyContact || employee.emergencyPhone || '+91 9447123456 (Family Contact)';

  // Designation & Dept
  const designation = employee.occupation || employee.designation || 'Technician';
  const department = employee.department || 'Operations';
  const designationDept = `${designation} / ${department}`;

  // Join Date
  const joiningDate = employee.joinDate || new Date().toISOString().slice(0, 10);
  const workLocation = options.workLocation || 'Enerpack Primary Plant, Kerala';

  // Salary
  const salaryVal = Number(employee.basicSalary || 20000);
  const salary = salaryVal.toLocaleString('en-IN');

  const allowances = options.allowances || 'Standard HRA & Medical Allowance';
  const rawProbation = options.probationPeriod || '3 Months';
  const cleanProbationNum = rawProbation.replace(/\s*months?$/i, '').trim();
  const probation = cleanProbationNum ? `${cleanProbationNum} Months` : '3 Months';
  const notice = options.noticePeriod || "45 days'";

  return {
    agreementNo: options.agreementNo || `ENR-CON-2026-${String(staffNo.replace(/\D/g, '') || '0001').padStart(4, '0')}`,
    date: options.agreementDate || new Date().toISOString().slice(0, 10),
    fullName,
    staffNo,
    ageDob,
    aadhaar,
    permAddress,
    currAddress,
    mobileEmail,
    emergencyContact,
    designationDept,
    designation,
    department,
    joiningDate,
    workLocation,
    salary,
    allowances,
    probation,
    noticePeriod: notice,
    contractType: cType,
  };
}
