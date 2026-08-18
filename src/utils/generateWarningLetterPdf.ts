import { jsPDF } from 'jspdf';
import { WarningLetter } from '../types/warningLetter';

export const generateWarningLetterPdf = (letter: WarningLetter) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // 1. Top Decorative Bar & Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Accent line
  doc.setFillColor(220, 38, 38); // Red accent for warning
  if (letter.warningLevel === 'Verbal Warning Record') {
    doc.setFillColor(217, 119, 6); // Amber
  } else if (letter.warningLevel === 'First Written Warning') {
    doc.setFillColor(234, 88, 12); // Orange
  } else if (letter.warningLevel === 'Second Written Warning') {
    doc.setFillColor(220, 38, 38); // Red
  } else if (letter.warningLevel === 'Show Cause Notice') {
    doc.setFillColor(124, 58, 237); // Purple
  }
  doc.rect(0, 24, pageWidth, 3, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ENERPACK ENTERPRISES PVT. LTD.', margin, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('HUMAN RESOURCES DISCIPLINARY & COMPLIANCE COMMITTEE', margin, 18);

  // Top Right Reference info in Header
  doc.setFontSize(8);
  doc.text(`REF: ${letter.letterNumber}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`DATE: ${letter.issueDate}`, pageWidth - margin, 18, { align: 'right' });

  // 2. Formal Notice Title & Confidentiality Stamp
  let currentY = 38;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(letter.warningLevel.toUpperCase(), margin, currentY);

  // Confidential tag
  doc.setDrawColor(220, 38, 38);
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(pageWidth - margin - 35, currentY - 5, 35, 7, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('STRICTLY CONFIDENTIAL', pageWidth - margin - 17.5, currentY - 0.5, { align: 'center' });

  currentY += 8;

  // 3. Employee Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);

  // Col 1
  doc.text(`Employee Name:`, margin + 4, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${letter.employeeName}`, margin + 34, currentY + 13);
  doc.setFont('helvetica', 'normal');

  doc.text(`Employee ID:`, margin + 4, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${letter.employeeId}`, margin + 34, currentY + 20);
  doc.setFont('helvetica', 'normal');

  // Col 2
  doc.text(`Designation:`, margin + 85, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${letter.employeeDesignation}`, margin + 110, currentY + 13);
  doc.setFont('helvetica', 'normal');

  doc.text(`Department:`, margin + 85, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${letter.department}`, margin + 110, currentY + 20);

  currentY += 32;

  // 4. Incident Category & Dates Row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Incident Category: ${letter.incidentType}`, margin, currentY);
  doc.text(`Incident Date: ${letter.incidentDate}`, margin + 85, currentY);
  doc.text(`Review Due Date: ${letter.reviewDate}`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // 5. Subject Line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const subjectLines = doc.splitTextToSize(`SUBJECT: ${letter.subject}`, contentWidth);
  doc.text(subjectLines, margin, currentY);
  currentY += (subjectLines.length * 5) + 3;

  // 6. Section A: Summary of Incident / Infraction
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. STATEMENT OF INFRACTION / BACKGROUND:', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(letter.incidentDescription, contentWidth);
  doc.text(descLines, margin, currentY);
  currentY += (descLines.length * 4.2) + 5;

  // 7. Section B: Required Corrective Action & Plan
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. REQUIRED CORRECTIVE MEASURES & PERFORMANCE TARGETS:', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const actionLines = doc.splitTextToSize(letter.correctiveAction, contentWidth);
  doc.text(actionLines, margin, currentY);
  currentY += (actionLines.length * 4.2) + 5;

  // 8. Section C: Consequences of Non-Compliance
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('3. CONSEQUENCES OF FURTHER NON-COMPLIANCE:', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const conLines = doc.splitTextToSize(letter.consequences, contentWidth);
  doc.text(conLines, margin, currentY);
  currentY += (conLines.length * 4.2) + 6;

  // 9. Signatures Block
  currentY = Math.max(currentY, 230); // push towards bottom nicely

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Left: Issuer Signature
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ISSUED BY:', margin, currentY);
  currentY += 12;
  doc.setFont('helvetica', 'bold');
  doc.text(letter.issuedBy, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(letter.issuedByRole, margin, currentY + 4);
  doc.text('Enerpack Human Resources Department', margin, currentY + 8);

  // Right: Employee Acknowledgment Block
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EMPLOYEE ACKNOWLEDGMENT:', pageWidth - margin - 75, currentY - 12);
  
  if (letter.status === 'Acknowledged' || letter.acknowledgedAt) {
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text(`[SIGNED ELECTRONICALLY]`, pageWidth - margin - 75, currentY - 5);
    doc.text(`By: ${letter.employeeName}`, pageWidth - margin - 75, currentY);
    doc.text(`Date: ${letter.acknowledgedAt || letter.issueDate}`, pageWidth - margin - 75, currentY + 4);
  } else {
    doc.setDrawColor(148, 163, 184);
    doc.line(pageWidth - margin - 75, currentY + 3, pageWidth - margin, currentY + 3);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Signature & Date (Pending Sign-off)', pageWidth - margin - 75, currentY + 7);
  }

  // 10. Footer stamp
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official Record of Disciplinary Action | Generated on ${new Date().toLocaleString()} | Stored in Enerpack Enterprise HR Vault`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  doc.save(`${letter.letterNumber}_${letter.employeeName.replace(/\s+/g, '_')}_Warning_Letter.pdf`);
};
