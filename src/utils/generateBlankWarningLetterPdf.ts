import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addLetterhead } from './pdfLetterhead';

export const generateBlankWarningLetterPdf = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  let currentY = addLetterhead(doc);
  currentY += 5;

  // Title
  doc.setTextColor(30, 58, 138); // Dark blue text
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DISCIPLINARY ACTION / WARNING LETTER', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  // Function to draw checkbox
  const drawCheckbox = (x: number, y: number, checked: boolean, label: string) => {
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y - 3, 3, 3, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(label, x + 4, y);
  };

  // Header Levels
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['LEVEL 1', 'LEVEL 2', 'LEVEL 3', 'LEVEL 4']],
    body: [['', '', '', '']],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 9, cellPadding: 2 },
    bodyStyles: { minCellHeight: 8, valign: 'middle' },
    margin: { left: margin, right: margin },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) drawCheckbox(data.cell.x + 5, data.cell.y + 5, false, 'VERBAL WARNING');
      if (data.section === 'body' && data.column.index === 1) drawCheckbox(data.cell.x + 5, data.cell.y + 5, false, 'WRITTEN WARNING');
      if (data.section === 'body' && data.column.index === 2) drawCheckbox(data.cell.x + 5, data.cell.y + 5, false, 'FINAL WRITTEN WARNING');
      if (data.section === 'body' && data.column.index === 3) drawCheckbox(data.cell.x + 5, data.cell.y + 5, false, 'DISMISSAL');
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 1. Employee Details
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['1. EMPLOYEE DETAILS', '']],
    body: [
      ['Employee Name', 'Employee ID / Staff No.'],
      ['Position', 'Date of Joining'],
      ['Department', 'Date of Warning'],
      ['Last Warning Date', 'Reporting Supervisor']
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: contentWidth / 2 },
      1: { cellWidth: contentWidth / 2 }
    },
    bodyStyles: { fontSize: 8, textColor: 0, cellPadding: 3, fontStyle: 'bold' },
    margin: { left: margin, right: margin },
    willDrawCell: (data) => {
      if (data.section === 'head' && data.column.index === 1) data.cell.styles.fillColor = [30, 58, 138];
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // 2. Reason for Warning
  const reasonsCol1 = [
    'Persistent lack of performance',
    'Abuse / damage of company property',
    'Unsafe practices',
    'Misrepresenting data / records',
    'Disobeying instructions',
    'Breach of company policies / procedures',
    'Other'
  ];
  const reasonsCol2 = [
    'Persistent absence',
    'Persistent lateness',
    'Repeated negligence',
    'Offensive behaviour / language',
    'Aggressive behaviour / fighting',
    'Misconduct'
  ];

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['2. REASON FOR WARNING', '']],
    body: Array(7).fill(['', '']),
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: contentWidth / 2 },
      1: { cellWidth: contentWidth / 2 }
    },
    bodyStyles: { minCellHeight: 6 },
    margin: { left: margin, right: margin },
    willDrawCell: (data) => {
      if (data.section === 'head' && data.column.index === 1) data.cell.styles.fillColor = [30, 58, 138];
    },
    didDrawCell: (data) => {
      if (data.section === 'body') {
        const rIndex = data.row.index;
        const cIndex = data.column.index;
        
        let label = '';
        if (cIndex === 0 && rIndex < reasonsCol1.length) label = reasonsCol1[rIndex];
        if (cIndex === 1 && rIndex < reasonsCol2.length) label = reasonsCol2[rIndex];
        
        if (label) {
          drawCheckbox(data.cell.x + 2, data.cell.y + 4, false, label);
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // Details
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['DETAILS / INCIDENT DESCRIPTION']],
    body: [[' ']],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    bodyStyles: { minCellHeight: 20 },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // Remarks
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['MANAGEMENT / SUPERVISOR REMARKS']],
    body: [[' ']],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    bodyStyles: { minCellHeight: 15 },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // Plan of Action
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['SUGGESTED PLAN OF ACTION']],
    body: [['Employee must follow all Enerpack policies, procedures and supervisor instructions.\nEmployee must demonstrate safe and satisfactory performance during the monitoring period.\nEmployee must avoid repetition of the stated incident or misconduct.\nFurther disciplinary action may be taken for repeated or serious violations, subject to company procedure and applicable law.']],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    bodyStyles: { fontSize: 8, textColor: 0, cellPadding: 3 },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // Acknowledgement
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['EMPLOYEE ACKNOWLEDGEMENT', '']],
    body: [
      [{ content: 'I confirm that I have received and read this Disciplinary Action / Warning Letter. The contents and reasons for the warning have been explained to me. I understand the corrective actions and agree to comply with Enerpack policies, procedures and lawful instructions. Failure to improve performance or repeated misconduct may result in further disciplinary action, subject to company policy and applicable law.', colSpan: 2 }],
      ['Employee Name', ''],
      ['Employee Signature', ''],
      ['Date', '']
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: contentWidth - 50 }
    },
    bodyStyles: { fontSize: 8, textColor: 0, cellPadding: 3 },
    margin: { left: margin, right: margin },
    willDrawCell: (data) => {
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.fillColor = [30, 58, 138];
      }
      if (data.section === 'body' && data.row.index > 0 && data.column.index === 0) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // Approvals
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['APPROVED BY', 'SIGNATURE', 'DATE']],
    body: [
      ['Supervisor', '', ''],
      ['Line Manager', '', ''],
      ['HR / Administration', '', '']
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: (contentWidth - 50) / 2 },
      2: { cellWidth: (contentWidth - 50) / 2 }
    },
    bodyStyles: { minCellHeight: 8 },
    margin: { left: margin, right: margin },
    willDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // Witness / Notes
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['WITNESS / ADDITIONAL NOTES']],
    body: [[' ']],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
    bodyStyles: { minCellHeight: 15 },
    margin: { left: margin, right: margin },
  });

  // Footer stamp
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIDENTIAL - ENERPACK', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`Blank_Warning_Letter_Form.pdf`);
};
