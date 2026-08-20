import { jsPDF } from 'jspdf';

export const generateBlankWarningLetterPdf = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);

  // Top Decorative Header Bar
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Red/Amber warning accent bar
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 24, pageWidth, 3, 'F');

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('ENERPACK ENTERPRISES PVT. LTD.', margin, 11);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('HUMAN RESOURCES & DISCIPLINARY COMPLIANCE COMMITTEE', margin, 17);
  doc.text('Official Form: HR-DISC-WL-BLANK-V2 | Confidential Disciplinary Record', margin, 21);

  // Top Right Metadata in Header
  doc.setFontSize(8);
  doc.text('FORM TYPE: BLANK ISSUANCE', pageWidth - margin, 12, { align: 'right' });
  doc.text('STANDARD REVISION 2026.2', pageWidth - margin, 18, { align: 'right' });

  // Title Section
  let currentY = 35;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL EMPLOYEE WARNING NOTICE', margin, currentY);

  // Warning Level Checkboxes Row
  currentY += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('TIER LEVEL:', margin, currentY);

  const levels = [
    '[  ] 1. Verbal Warning Record',
    '[  ] 2. First Written Warning',
    '[  ] 3. Second Written Warning',
    '[  ] 4. Final Warning Notice',
    '[  ] 5. Show Cause Notice'
  ];
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(levels.slice(0, 3).join('     '), margin + 20, currentY);
  currentY += 4.5;
  doc.text(levels.slice(3).join('     '), margin + 20, currentY);

  currentY += 6;

  // Section 1: Employee & Issuance Metadata Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 32, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RECIPIENT EMPLOYEE & ISSUANCE DETAILS', margin + 4, currentY + 5.5);

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');

  // Row 1
  currentY += 11;
  doc.text('Employee Full Name:', margin + 4, currentY);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 36, currentY, margin + 85, currentY);

  doc.text('Employee ID / Code:', margin + 92, currentY);
  doc.line(margin + 125, currentY, margin + 170, currentY);

  // Row 2
  currentY += 7;
  doc.text('Designation / Role:', margin + 4, currentY);
  doc.line(margin + 36, currentY, margin + 85, currentY);

  doc.text('Department / Unit:', margin + 92, currentY);
  doc.line(margin + 125, currentY, margin + 170, currentY);

  // Row 3
  currentY += 7;
  doc.text('Reference No.:', margin + 4, currentY);
  doc.text('ENR-WL-2026-________', margin + 36, currentY);

  doc.text('Date of Notice:', margin + 92, currentY);
  doc.text('_____ / _____ / 2026', margin + 125, currentY);

  currentY += 12;

  // Section 2: Incident Classification
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('2. INCIDENT CLASSIFICATION & DATE OF OCCURRENCE', margin + 4, currentY + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  
  currentY += 10;
  doc.text('[  ] Attendance & Repeated Tardiness', margin + 4, currentY);
  doc.text('[  ] Unauthorized Absence / Job Abandonment', margin + 60, currentY);
  doc.text('[  ] Code of Conduct / Insubordination', margin + 120, currentY);

  currentY += 5;
  doc.text('[  ] Work Quality / Negligence of Duty', margin + 4, currentY);
  doc.text('[  ] Breach of Workplace Safety / Policy', margin + 60, currentY);
  doc.text('Incident Date: _____ / _____ / 2026', margin + 120, currentY);

  currentY += 12;

  // Section 3: Statement of Facts & Description
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 38, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('3. STATEMENT OF FACTS & INCIDENT DESCRIPTION', margin + 4, currentY + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'italic');
  doc.text('(Detail the specific date, time, location, behavior, breach of policy, and operational impact observed)', margin + 4, currentY + 9.5);

  doc.setDrawColor(203, 213, 225);
  for (let i = 1; i <= 5; i++) {
    doc.line(margin + 4, currentY + 9.5 + (i * 5), margin + contentWidth - 4, currentY + 9.5 + (i * 5));
  }

  currentY += 43;

  // Section 4: Corrective Action Plan & Performance Milestones
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 36, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('4. MANDATORY CORRECTIVE ACTION PLAN & 30-DAY REVIEW TARGETS', margin + 4, currentY + 5.5);

  doc.setDrawColor(203, 213, 225);
  for (let i = 1; i <= 4; i++) {
    doc.line(margin + 4, currentY + 8 + (i * 5.5), margin + contentWidth - 4, currentY + 8 + (i * 5.5));
  }

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Follow-up Review Scheduled On: _____ / _____ / 2026    |    Assigned Mentor/Supervisor: ___________________________', margin + 4, currentY + 33);

  currentY += 41;

  // Section 5: Legal & Consequences Statement
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSEQUENCES OF NON-COMPLIANCE:', margin + 4, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const legalText = "Failure to rectify the described conduct or any subsequent violation within the specified monitoring timeframe will lead to further escalation in disciplinary proceedings, including but not limited to suspension without pay, withholding of appraisal/bonuses, or termination of employment in accordance with Enerpack Enterprises HR Governance Code.";
  const splitLegal = doc.splitTextToSize(legalText, contentWidth - 8);
  doc.text(splitLegal, margin + 4, currentY + 8.5);

  currentY += 23;

  // Section 6: Formal Signatures & Digital / Physical Acknowledgement
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 38, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('5. FORMAL AUTHORIZATION & EMPLOYEE ACKNOWLEDGEMENT', margin + 4, currentY + 5.5);

  const colWidth = (contentWidth - 8) / 3;

  // Sign Box 1: Issuing Manager
  const x1 = margin + 4;
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Issuing Authority (HR / Dept Head):', x1, currentY + 12);
  doc.line(x1, currentY + 26, x1 + colWidth - 4, currentY + 26);
  doc.text('Name & Signature (Date)', x1, currentY + 31);

  // Sign Box 2: Witness / Supervisor
  const x2 = margin + 4 + colWidth;
  doc.text('Reporting Manager / Supervisor:', x2, currentY + 12);
  doc.line(x2, currentY + 26, x2 + colWidth - 4, currentY + 26);
  doc.text('Name & Signature (Date)', x2, currentY + 31);

  // Sign Box 3: Employee
  const x3 = margin + 4 + (colWidth * 2);
  doc.text('Employee Signature & Receipt:', x3, currentY + 12);
  doc.line(x3, currentY + 26, x3 + colWidth - 4, currentY + 26);
  doc.text('Signature & Acknowledged Date', x3, currentY + 31);

  // Footer note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Enerpack Enterprises Pvt. Ltd. | Disciplinary & HR Document Vault | Confidential Copy for HR Archives & Personnel File', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Trigger download
  doc.save('Blank_Official_Warning_Letter_Template_Enerpack.pdf');
};
