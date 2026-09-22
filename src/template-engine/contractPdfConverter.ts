import { jsPDF } from 'jspdf';
import { MappedContractFields } from './contractFieldMapper';
import { EnerpackLetterheadWithoutLogo, formatIndianCurrency } from '../utils/pdfLetterhead';

// Export reusable letterhead for all document generators
export { EnerpackLetterheadWithoutLogo, formatIndianCurrency };

// Brand colors matching the official Enerpack design
const COLOR_NAVY = [30, 64, 175] as const; // #1e40af
const COLOR_HEADING = [29, 78, 216] as const; // #1d4ed8
const COLOR_DARK = [30, 41, 59] as const; // #1e293b
const COLOR_MUTED = [100, 116, 139] as const; // #64748b
const COLOR_BORDER = [203, 213, 225] as const; // #cbd5e1
const COLOR_LIGHT_BLUE = [240, 247, 255] as const; // #f0f7ff
const COLOR_ROW_BG = [248, 250, 252] as const; // #f8fafc

/**
 * Draws the authentic Indian Rupee vector glyph (₹, U+20B9) at the exact text baseline.
 * Faithfully reproduces the official national currency symbol:
 * - Top horizontal roof bar
 * - Second parallel horizontal bar
 * - Left vertical stem (upper half only)
 * - Smooth curved upper loop
 * - Slanted diagonal leg descending to baseline
 * - Open lower-left quadrant
 * - True baseline alignment and natural kerning with Helvetica
 */
export function drawRupeeGlyph(doc: jsPDF, x: number, y: number, fontSizePt: number = 8.5): number {
  const hMm = fontSizePt * 0.352778; // font height in mm (~3.0mm for 8.5pt)
  const wMm = hMm * 0.62;             // character width (~1.86mm)
  const strokeW = Math.max(0.20, hMm * 0.095);

  doc.saveGraphicsState();
  doc.setLineWidth(strokeW);
  doc.setDrawColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);

  const capH = hMm * 0.76;
  const topY = y - capH;
  const midY = y - capH * 0.40;
  const bar2Y = y - capH * 0.62;
  const stemX = x + strokeW * 0.7;

  // 1. Top horizontal roof bar (full width)
  doc.line(x, topY, x + wMm, topY);

  // 2. Second horizontal bar (parallel, slightly shorter)
  doc.line(x, bar2Y, x + wMm * 0.72, bar2Y);

  // 3. Vertical stem on left - only from top down to midY
  doc.line(stemX, topY, stemX, midY);

  // 4. Upper curved loop
  const loopRadiusX = (wMm - strokeW * 0.7) * 0.78;
  const loopCenterY = (topY + midY) / 2;
  const loopRadiusY = (midY - topY) / 2;
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const angle1 = -Math.PI / 2 + (Math.PI * i) / steps;
    const angle2 = -Math.PI / 2 + (Math.PI * (i + 1)) / steps;
    const px1 = stemX + Math.cos(angle1) * loopRadiusX;
    const py1 = loopCenterY + Math.sin(angle1) * loopRadiusY;
    const px2 = stemX + Math.cos(angle2) * loopRadiusX;
    const py2 = loopCenterY + Math.sin(angle2) * loopRadiusY;
    doc.line(px1, py1, px2, py2);
  }

  // 5. Diagonal leg - slants down-right to baseline
  doc.line(stemX + strokeW * 0.35, midY, x + wMm * 0.95, y);

  doc.restoreGraphicsState();
  return wMm + 0.35; // advance width with natural font kerning
}

/**
 * Renders a single line of text with embedded ₹ symbol vector preservation.
 */
export function renderLineWithRupee(
  doc: jsPDF,
  line: string,
  x: number,
  y: number,
  fontSizePt: number = 8.5
): void {
  if (!line.includes('₹')) {
    doc.text(line, x, y);
    return;
  }

  const parts = line.split('₹');
  let curX = x;
  parts.forEach((part, idx) => {
    if (idx > 0) {
      const adv = drawRupeeGlyph(doc, curX, y, fontSizePt);
      curX += adv;
    }
    if (part.length > 0) {
      doc.text(part, curX, y);
      curX += doc.getTextWidth(part);
    }
  });
}

/**
 * Splits text into lines accurately taking into account exact ₹ symbol widths and font sizing.
 */
export function splitTextIntoLines(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSizePt: number = 8.5
): string[] {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSizePt);

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  const getLineWidth = (str: string): number => {
    if (!str.includes('₹')) {
      return doc.getTextWidth(str);
    }
    const parts = str.split('₹');
    const hMm = fontSizePt * 0.352778;
    const rupeeAdv = hMm * 0.62 + 0.35;
    let totalW = 0;
    parts.forEach((part, idx) => {
      if (idx > 0) totalW += rupeeAdv;
      if (part.length > 0) totalW += doc.getTextWidth(part);
    });
    return totalW;
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;

    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (getLineWidth(candidate) <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Renders multi-line text with natural wrapping, full justification, and ₹ symbol preservation.
 */
export function renderParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  startY: number,
  maxWidth: number = 174,
  lineHeight: number = 3.8,
  fontSizePt: number = 8.2,
  align: 'left' | 'justify' = 'justify'
): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSizePt);
  doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);

  const lines = splitTextIntoLines(doc, text, maxWidth, fontSizePt);
  let curY = startY;
  const normalSpaceW = doc.getTextWidth(' ');

  lines.forEach((line, idx) => {
    const isLastLine = idx === lines.length - 1;

    // Apply clean text justification to all lines except the last line
    if (align === 'justify' && !isLastLine) {
      const words = line.trim().split(/\s+/);
      if (words.length > 1) {
        let wordsWidth = 0;
        words.forEach(w => {
          if (!w.includes('₹')) {
            wordsWidth += doc.getTextWidth(w);
          } else {
            const parts = w.split('₹');
            const hMm = fontSizePt * 0.352778;
            const rupeeAdv = hMm * 0.62 + 0.35;
            let wW = 0;
            parts.forEach((p, pIdx) => {
              if (pIdx > 0) wW += rupeeAdv;
              if (p.length > 0) wW += doc.getTextWidth(p);
            });
            wordsWidth += wW;
          }
        });

        const totalSpaceNeeded = maxWidth - wordsWidth;
        const spaceW = totalSpaceNeeded / (words.length - 1);

        if (spaceW >= normalSpaceW * 0.45 && spaceW <= normalSpaceW * 2.8) {
          let curX = x;
          words.forEach(w => {
            if (!w.includes('₹')) {
              doc.text(w, curX, curY);
              curX += doc.getTextWidth(w) + spaceW;
            } else {
              renderLineWithRupee(doc, w, curX, curY, fontSizePt);
              const parts = w.split('₹');
              const hMm = fontSizePt * 0.352778;
              const rupeeAdv = hMm * 0.62 + 0.35;
              let wW = 0;
              parts.forEach((p, pIdx) => {
                if (pIdx > 0) wW += rupeeAdv;
                if (p.length > 0) wW += doc.getTextWidth(p);
              });
              curX += wW + spaceW;
            }
          });
          curY += lineHeight;
          return;
        }
      }
    }

    // Default left-alignment for last line or single-word line
    renderLineWithRupee(doc, line, x, curY, fontSizePt);
    curY += lineHeight;
  });

  return curY;
}

// =========================================================================
// REUSABLE DOCUMENT TEMPLATE COMPONENTS (Architecture Requirement 13)
// =========================================================================

/**
 * Reusable Component: Document Header & Agreement Metadata Box
 */
export function ContractHeader(
  doc: jsPDF,
  y: number,
  fields: MappedContractFields,
  isBlank: boolean,
  contentWidth: number = 174,
  leftMargin: number = 18
): number {
  // Title: EMPLOYEE CONTRACT AGREEMENT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
  doc.text('EMPLOYEE CONTRACT AGREEMENT', 105, y, { align: 'center' });

  // Agreement No. & Date Table Box
  y += 5.5;
  const boxH = 7.5;
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  doc.setLineWidth(0.3);
  doc.setFillColor(COLOR_ROW_BG[0], COLOR_ROW_BG[1], COLOR_ROW_BG[2]);
  doc.rect(leftMargin, y, contentWidth, boxH, 'FD');
  doc.line(leftMargin + contentWidth / 2, y, leftMargin + contentWidth / 2, y + boxH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
  doc.text('Agreement No. ', leftMargin + 3, y + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.text(isBlank ? '' : fields.agreementNo, leftMargin + 26, y + 4.8);

  doc.setFont('helvetica', 'bold');
  doc.text('Date: ', leftMargin + contentWidth / 2 + 3, y + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.text(isBlank ? '' : fields.date, leftMargin + contentWidth / 2 + 13, y + 4.8);

  // Intro paragraph
  y += boxH + 4.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  const intro =
    'This Employee Contract Agreement is made between ENERPACK, (the “Company”), and the employee identified below (the “Employee”).';
  y = renderParagraph(doc, intro, leftMargin, y, contentWidth, 3.8, 8.2);

  return y;
}

/**
 * Reusable Component: Employee Details 2-Column Table
 */
export function EmployeeDetailsTable(
  doc: jsPDF,
  y: number,
  fields: MappedContractFields,
  isBlank: boolean,
  contentWidth: number = 174,
  leftMargin: number = 18
): number {
  // 1. EMPLOYEE DETAILS Banner
  y += 1.5;
  const bannerH = 5.8;
  doc.setFillColor(COLOR_NAVY[0], COLOR_NAVY[1], COLOR_NAVY[2]);
  doc.rect(leftMargin, y, contentWidth, bannerH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('1. EMPLOYEE DETAILS', leftMargin + 3, y + 4.1);

  // Two-column table
  y += bannerH;
  const col1W = 58;
  const col2W = contentWidth - col1W; // 116mm

  const empRows = [
    ['Employee Full Name', isBlank ? '' : fields.fullName],
    ['Staff No.', isBlank ? '' : fields.staffNo],
    ['Age / Date of Birth', isBlank ? '' : fields.ageDob],
    ['Aadhaar No. (if lawfully required)', isBlank ? '' : fields.aadhaar],
    ['Permanent Address', isBlank ? '' : fields.permAddress],
    ['Current Address', isBlank ? '' : fields.currAddress],
    ['Mobile / Email', isBlank ? '' : fields.mobileEmail],
    ['Emergency Contact', isBlank ? '' : fields.emergencyContact],
    ['Designation / Department', isBlank ? '' : fields.designationDept],
  ];

  empRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    const wrappedValueLines = doc.splitTextToSize(value || '', col2W - 6) as string[];
    const rowH = Math.max(5.6, wrappedValueLines.length * 3.5 + 2.1);

    // Left cell (Light blue)
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.setFillColor(COLOR_LIGHT_BLUE[0], COLOR_LIGHT_BLUE[1], COLOR_LIGHT_BLUE[2]);
    doc.rect(leftMargin, y, col1W, rowH, 'FD');

    // Right cell (White)
    doc.setFillColor(255, 255, 255);
    doc.rect(leftMargin + col1W, y, col2W, rowH, 'FD');

    // Label text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
    doc.text(label, leftMargin + 3, y + 3.9);

    // Value text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    if (wrappedValueLines.length <= 1) {
      doc.text(value || '', leftMargin + col1W + 3, y + 3.9);
    } else {
      let lineY = y + 3.5;
      wrappedValueLines.forEach(vLine => {
        doc.text(vLine, leftMargin + col1W + 3, lineY);
        lineY += 3.5;
      });
    }

    y += rowH;
  });

  return y;
}

/**
 * Reusable Component: Numbered Contract Section
 */
export function ContractSection(
  doc: jsPDF,
  y: number,
  title: string,
  content: string,
  contentWidth: number = 174,
  leftMargin: number = 18,
  options: {
    headingSize?: number;
    fontSize?: number;
    lineHeight?: number;
    spaceBeforeHeading?: number;
    spaceAfterHeading?: number;
    spaceAfterContent?: number;
    align?: 'left' | 'justify';
  } = {}
): number {
  const {
    headingSize = 9.0,
    fontSize = 8.2,
    lineHeight = 3.8,
    spaceBeforeHeading = 3.0,
    spaceAfterHeading = 3.6,
    spaceAfterContent = 1.4,
    align = 'justify',
  } = options;

  y += spaceBeforeHeading;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(headingSize);
  doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
  doc.text(title, leftMargin, y);
  y += spaceAfterHeading;

  y = renderParagraph(doc, content, leftMargin, y, contentWidth, lineHeight, fontSize, align);
  y += spaceAfterContent;

  return y;
}

/**
 * Reusable Component: Bullet List with Section Heading
 */
export function ContractBulletList(
  doc: jsPDF,
  y: number,
  title: string,
  bullets: string[],
  contentWidth: number = 174,
  leftMargin: number = 18,
  options: {
    headingSize?: number;
    fontSize?: number;
    lineHeight?: number;
    bulletGap?: number;
    spaceBeforeHeading?: number;
    spaceAfterHeading?: number;
    align?: 'left' | 'justify';
  } = {}
): number {
  const {
    headingSize = 9.0,
    fontSize = 8.0,
    lineHeight = 3.6,
    bulletGap = 0.8,
    spaceBeforeHeading = 3.0,
    spaceAfterHeading = 3.6,
    align = 'left',
  } = options;

  if (title) {
    y += spaceBeforeHeading;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(headingSize);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text(title, leftMargin, y);
    y += spaceAfterHeading;
  }

  bullets.forEach(bullet => {
    y = renderParagraph(doc, bullet, leftMargin, y, contentWidth, lineHeight, fontSize, align);
    y += bulletGap;
  });

  return y;
}

/**
 * Reusable Component: Employee Signature Block (Table 1)
 */
export function EmployeeSignatureBlock(
  doc: jsPDF,
  y: number,
  fields: MappedContractFields,
  isBlank: boolean,
  contentWidth: number = 174,
  leftMargin: number = 18,
  sigHeight: number = 11.0
): number {
  const col1W = 55;
  const col2W = contentWidth - col1W;

  const rows = [
    { label: 'Employee Name', value: isBlank ? '' : fields.fullName, height: 6.2 },
    { label: 'Employee Signature', value: '', height: sigHeight },
    { label: 'Date', value: isBlank ? '' : fields.date, height: 6.2 },
  ];

  doc.setLineWidth(0.3);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);

  rows.forEach(({ label, value, height }) => {
    // Label cell
    doc.setFillColor(COLOR_LIGHT_BLUE[0], COLOR_LIGHT_BLUE[1], COLOR_LIGHT_BLUE[2]);
    doc.rect(leftMargin, y, col1W, height, 'FD');

    // Value cell
    doc.setFillColor(255, 255, 255);
    doc.rect(leftMargin + col1W, y, col2W, height, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
    doc.text(label, leftMargin + 3, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    doc.text(value || '', leftMargin + col1W + 3, y + 4.2);

    y += height;
  });

  return y;
}

/**
 * Reusable Component: Approval Signature Block (Table 2)
 */
export function ApprovalSignatureBlock(
  doc: jsPDF,
  y: number,
  fields: MappedContractFields,
  isBlank: boolean,
  contentWidth: number = 174,
  leftMargin: number = 18,
  bodyHeight: number = 16.0
): number {
  const t2Col1 = 62;
  const t2Col2 = 64;
  const t2Col3 = contentWidth - t2Col1 - t2Col2; // 48mm
  const t2HeaderH = 5.5;

  // Header row (Dark Navy)
  doc.setFillColor(COLOR_NAVY[0], COLOR_NAVY[1], COLOR_NAVY[2]);
  doc.rect(leftMargin, y, contentWidth, t2HeaderH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(255, 255, 255);
  doc.text('APPROVED BY', leftMargin + 3, y + 3.8);
  doc.text('SIGNATURE', leftMargin + t2Col1 + t2Col2 / 2, y + 3.8, { align: 'center' });
  doc.text('DATE', leftMargin + t2Col1 + t2Col2 + t2Col3 / 2, y + 3.8, { align: 'center' });

  y += t2HeaderH;

  // White data row
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.rect(leftMargin, y, t2Col1, bodyHeight, 'FD');
  doc.rect(leftMargin + t2Col1, y, t2Col2, bodyHeight, 'FD');
  doc.rect(leftMargin + t2Col1 + t2Col2, y, t2Col3, bodyHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
  doc.text('Authorized Signature Name', leftMargin + 3, y + 4.5);
  doc.text('& Designation:', leftMargin + 3, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.text('HR / Administration', leftMargin + 3, y + 13.5);

  // Date in column 3
  if (!isBlank && fields.date) {
    doc.setFontSize(8.0);
    doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
    doc.text(fields.date, leftMargin + t2Col1 + t2Col2 + t2Col3 / 2, y + 8.5, { align: 'center' });
  }

  y += bodyHeight;
  return y;
}

/**
 * Reusable Component: Official Enerpack Document Footer
 */
export function EnerpackFooter(doc: jsPDF, _pageNum: number, _totalPages: number): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.0);
  doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  doc.text('ENERPACK | Confidential Company Document', 105, 286, { align: 'center' });
}

/**
 * Automated Quality Control Validation (Requirement 14)
 */
export function validateContractPdf(doc: jsPDF): { isValid: boolean; pageCount: number; errors: string[] } {
  const pageCount = doc.getNumberOfPages();
  const errors: string[] = [];

  if (pageCount !== 3) {
    errors.push(`Page count is ${pageCount}, expected exactly 3.`);
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  if (Math.round(pageWidth) !== 210 || Math.round(pageHeight) !== 297) {
    errors.push(`Page dimensions (${pageWidth}x${pageHeight}) do not match A4 (210x297mm).`);
  }

  return {
    isValid: errors.length === 0,
    pageCount,
    errors,
  };
}

/**
 * Primary Contract PDF Generator: Generates an official Enerpack Employee Contract Agreement
 * STRICTLY AND GUARANTEED TO BE EXACTLY 3 A4 PAGES.
 */
export function generateContractPdf(
  fields: MappedContractFields,
  isBlank = false
): jsPDF {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const isNonRes = fields.contractType.toLowerCase().includes('non');
  const leftMargin = 18;
  const contentWidth = 174; // 210 - 36mm

  // Clean probation formatting so it never produces duplicate units (Requirement 7)
  const cleanProbation = isBlank
    ? '__________ months'
    : fields.probation.toLowerCase().endsWith('months')
    ? fields.probation
    : `${fields.probation} Months`;

  // Clean salary string formatted with ₹ symbol
  const formattedSalary = isBlank
    ? '________________'
    : formatIndianCurrency(fields.salary).replace(/^₹/, '');

  // =========================================================================
  // PAGE 1: Letterhead, Document Header, Table, and First Core Clauses
  // Non-Residential: Clauses 1 to 9 (fully fills Page 1 down to ~255mm)
  // Residential: Clauses 1 to 7 (fully fills Page 1 down to ~240mm)
  // =========================================================================
  let y = EnerpackLetterheadWithoutLogo(doc); // Standard official header bar

  // Document Title, Agreement No./Date box, Intro paragraph
  y = ContractHeader(doc, y + 4.0, fields, isBlank, contentWidth, leftMargin);

  // 1. EMPLOYEE DETAILS Table
  y = EmployeeDetailsTable(doc, y, fields, isBlank, contentWidth, leftMargin);

  // 2. Appointment
  const apptText = `The Company appoints the Employee as ${
    isBlank ? '__________________________' : fields.designation
  } in the ${
    isBlank ? '__________________' : fields.department
  } Department, subject to the terms of this Agreement and applicable law.`;
  y = ContractSection(doc, y, '2. Appointment', apptText, contentWidth, leftMargin, {
    spaceBeforeHeading: 3.0,
    spaceAfterHeading: 3.4,
    spaceAfterContent: 1.2,
  });

  // 3. Joining Date & Place of Work
  const joinText = `Joining Date: ${
    isBlank ? '__________' : fields.joiningDate
  } | Primary Work Location: ${
    isBlank ? '______________________________' : fields.workLocation
  }. The Employee may be required to work at other company locations or operational sites as reasonably required.`;
  y = ContractSection(doc, y, '3. Joining Date & Place of Work', joinText, contentWidth, leftMargin, {
    spaceBeforeHeading: 3.0,
    spaceAfterHeading: 3.4,
    spaceAfterContent: 1.2,
  });

  // 4. Duties & Responsibilities
  const duties = [
    '• Perform assigned duties diligently and safely.',
    '• Follow job cards, production instructions, inventory controls, quality requirements and lawful instructions.',
    '• Protect company property, materials, documents and confidential information.',
    '• Comply with company procedures, safety rules and attendance requirements.',
  ];
  y = ContractBulletList(doc, y, '4. Duties & Responsibilities', duties, contentWidth, leftMargin, {
    fontSize: 8.0,
    lineHeight: 3.6,
    bulletGap: 0.6,
    spaceBeforeHeading: 3.0,
    spaceAfterHeading: 3.4,
  });

  // 5. Working Hours, Attendance & Overtime
  const hoursText =
    'The Employee must strictly follow the Company’s designated shift timings, including In and Out timings. The Employee may be required to work day or night shifts and on any machine as instructed by the supervisor, subject to applicable working-hour, rest-period, safety and overtime requirements.';
  y = ContractSection(doc, y, '5. Working Hours, Attendance & Overtime', hoursText, contentWidth, leftMargin, {
    spaceBeforeHeading: 3.0,
    spaceAfterHeading: 3.4,
    spaceAfterContent: 1.2,
  });

  // 6. Salary & Benefits
  const salaryText = `Basic / Gross Salary: ₹${formattedSalary} per month. Other approved allowances/benefits: ${
    isBlank ? '______________________________' : fields.allowances
  }. Statutory deductions and benefits, where applicable, will be handled in accordance with law.`;
  y = ContractSection(doc, y, '6. Salary & Benefits', salaryText, contentWidth, leftMargin, {
    spaceBeforeHeading: 3.0,
    spaceAfterHeading: 3.4,
    spaceAfterContent: 1.2,
  });

  // 7. Probation
  const probText = `Probation period, if applicable: ${cleanProbation}. Confirmation will be subject to satisfactory performance and applicable company procedure.`;
  y = ContractSection(doc, y, '7. Probation', probText, contentWidth, leftMargin, {
    spaceBeforeHeading: 3.0,
    spaceAfterHeading: 3.4,
    spaceAfterContent: isNonRes ? 1.2 : 0,
  });

  if (isNonRes) {
    // 8. Leave
    y = ContractSection(
      doc,
      y,
      '8. Leave',
      'Leave eligibility and approval will follow company policy and applicable law.',
      contentWidth,
      leftMargin,
      {
        spaceBeforeHeading: 3.0,
        spaceAfterHeading: 3.4,
        spaceAfterContent: 1.2,
      }
    );

    // 9. Confidentiality & Company Property
    const confText =
      'The Employee shall protect confidential business information and return company property, records, keys, devices and other assets upon request or separation. Intentional or negligent damages recovery charges from wages or loss for the damage will be made by applicable law and after the required process.';
    y = ContractSection(doc, y, '9. Confidentiality & Company Property', confText, contentWidth, leftMargin, {
      spaceBeforeHeading: 3.0,
      spaceAfterHeading: 3.4,
      spaceAfterContent: 0,
    });
  }

  EnerpackFooter(doc, 1, 3);

  // =========================================================================
  // PAGE 2: Middle Section Clauses
  // Non-Residential: Clauses 10 to 18 (fills Page 2 down to ~245mm)
  // Residential: Clauses 8 to 16 (fills Page 2 down to ~235mm)
  // =========================================================================
  doc.addPage();
  y = 16;

  if (isNonRes) {
    // Non-Residential Page 2 Clauses: 10 through 18
    const page2NonResSections = [
      {
        title: '10. Health, Safety & Conduct',
        content:
          'The Employee shall comply with safety requirements, use required PPE, report accidents/unsafe conditions, and maintain professional conduct. Serious misconduct may lead to disciplinary action subject to applicable law and due process.',
      },
      {
        title: '11. Termination / Separation',
        content:
          'Notice, resignation, termination, final settlement and handover shall be handled in accordance with this Agreement, company policy and applicable law. Nothing in this Agreement is intended to reduce any statutory right or protection available to the Employee.',
      },
      {
        title: '12. Mobile Phone Usage',
        content:
          'Personal mobile-phone use during working hours is restricted where it affects productivity, safety, machine operation, loading/unloading, driving, customer service or other assigned duties. Unauthorized use may result in a salary deduction of ₹250 to ₹500 per occurrence, subject to applicable law, company procedure and any required authorization.',
      },
      {
        title: '13. Absence & Attendance',
        content:
          'Employees are required to attend work as scheduled and obtain approval for leave. Unauthorized absence may result in salary deduction for the corresponding period. Where company policy provides a two-day salary deduction for an unauthorized absence, the deduction will be applied only to the extent permitted by applicable law and after appropriate review.',
      },
      {
        title: '14. Spitting on Company Premises',
        content:
          'Spitting anywhere on Enerpack company premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law, the employee\'s applicable terms and required company procedure/authorization. Repeated violations may also result in additional disciplinary action.',
      },
      {
        title: '15. Personal Information',
        content:
          'Personal information supplied by the Employee will be collected and used for legitimate employment, payroll, attendance, statutory, safety and administrative purposes, subject to applicable law and company practices.',
      },
      {
        title: '16. Governing Terms',
        content:
          'This Agreement shall be interpreted subject to applicable laws of India and the relevant jurisdiction of the workplace. If any clause conflicts with mandatory law, the mandatory legal requirement will prevail.',
      },
    ];

    page2NonResSections.forEach(sec => {
      y = ContractSection(doc, y, sec.title, sec.content, contentWidth, leftMargin, {
        headingSize: 9.0,
        fontSize: 8.0,
        lineHeight: 3.6,
        spaceBeforeHeading: 2.8,
        spaceAfterHeading: 3.4,
        spaceAfterContent: 1.0,
      });
    });

    // 17. Acknowledgement of Workplace Rules
    y += 2.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('17. Acknowledgement of Workplace Rules', leftMargin, y);
    y += 3.4;

    const ackText =
      'The Employee confirms that the following Enerpack rules have been explained and understood. The Employee acknowledges that any salary/wage deduction will be made only as permitted by applicable law and company procedure:';
    y = renderParagraph(doc, ackText, leftMargin, y, contentWidth, 3.5, 7.8, 'justify');
    y += 0.8;

    const ackBullets = [
      '• Mobile Phone Usage: Unauthorized mobile-phone use during working hours may result in a salary deduction of ₹250 to ₹500 per occurrence.',
      "• Absence: Unauthorized absence may result in salary deduction for the corresponding period. The company rule of two days' salary deduction for unauthorized absence will apply only to the extent legally permissible.",
      '• Spitting on Company Premises: Spitting anywhere on Enerpack premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law and company procedure.',
    ];

    ackBullets.forEach(b => {
      y = renderParagraph(doc, b, leftMargin, y, contentWidth, 3.5, 7.8, 'left');
      y += 0.5;
    });

    // 18. Personal Leave
    y += 2.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('18. Personal Leave', leftMargin, y);
    y += 3.4;

    const leaveText =
      'Personal leave should normally be requested and communicated to the reporting supervisor/HR at least 7 to 10 days in advance, wherever reasonably practicable, so that work arrangements can be made. Leave approval remains subject to company policy, operational requirements and applicable law. Emergency or unforeseen leave should be reported as soon as reasonably possible.';
    y = renderParagraph(doc, leaveText, leftMargin, y, contentWidth, 3.5, 7.8, 'justify');
  } else {
    // Residential Page 2 Clauses: 8 through 16
    const page2ResSections = [
      {
        title: '8. Leave',
        content: 'Leave eligibility and approval will follow company policy and applicable law.',
      },
      {
        title: '9. Confidentiality & Company Property',
        content:
          'The Employee shall protect confidential business information and return company property, records, keys, devices and other assets upon request or separation. Intentional or negligent damages recovery charges from wages or loss for the damage will be made by applicable law and after the required process.',
      },
      {
        title: '10. Health, Safety & Conduct',
        content:
          'The Employee shall comply with safety requirements, use required PPE, report accidents/unsafe conditions, and maintain professional conduct. Serious misconduct may lead to disciplinary action subject to applicable law and due process.',
      },
      {
        title: '11. Termination / Separation',
        content:
          'Notice, resignation, termination, final settlement and handover shall be handled in accordance with this Agreement, company policy and applicable law. Nothing in this Agreement is intended to reduce any statutory right or protection available to the Employee.',
      },
      {
        title: '12. Mobile Phone Usage',
        content:
          'Personal mobile-phone use during working hours is restricted where it affects productivity, safety, machine operation, loading/unloading, driving, customer service or other assigned duties. Unauthorized use may result in a salary deduction of ₹250 to ₹500 per occurrence, subject to applicable law, company procedure and any required authorization.',
      },
      {
        title: '13. Absence & Attendance',
        content:
          'Employees are required to attend work as scheduled and obtain approval for leave. Unauthorized absence may result in salary deduction for the corresponding period. Where company policy provides a two-day salary deduction for an unauthorized absence, the deduction will be applied only to the extent permitted by applicable law and after appropriate review.',
      },
      {
        title: '14. Spitting on Company Premises',
        content:
          'Spitting anywhere on Enerpack company premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law, the employee\'s applicable terms and required company procedure/authorization. Repeated violations may also result in additional disciplinary action.',
      },
      {
        title: '15. Personal Information',
        content:
          'Personal information supplied by the Employee will be collected and used for legitimate employment, payroll, attendance, statutory, safety and administrative purposes, subject to applicable law and company practices.',
      },
      {
        title: '16. Governing Terms',
        content:
          'This Agreement shall be interpreted subject to applicable laws of India and the relevant jurisdiction of the workplace. If any clause conflicts with mandatory law, the mandatory legal requirement will prevail.',
      },
    ];

    page2ResSections.forEach(sec => {
      y = ContractSection(doc, y, sec.title, sec.content, contentWidth, leftMargin, {
        headingSize: 9.0,
        fontSize: 8.2,
        lineHeight: 3.8,
        spaceBeforeHeading: 3.0,
        spaceAfterHeading: 3.6,
        spaceAfterContent: 1.2,
      });
    });
  }

  EnerpackFooter(doc, 2, 3);

  // =========================================================================
  // PAGE 3: Final Clauses, (20. Non-Residential), Acceptance & Dual Signatures
  // Non-Residential: Clause 19, Clause 20 (All 12 items), Clause 21 (Acceptance) + Signatures
  // Residential: Clause 17, Clause 18, Clause 19, Clause 20 (Acceptance) + Signatures
  // =========================================================================
  doc.addPage();
  y = 15;

  if (isNonRes) {
    // 19. Resignation & Notice Period
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('19. Resignation & Notice Period', leftMargin, y);
    y += 3.4;

    const noticeText =
      "An Employee who wishes to resign from Enerpack shall provide a minimum of 45 days' prior written notice. The resignation must be submitted in writing and signed by the Employee. The notice period shall be counted from the date the written resignation is received/acknowledged by the Company, subject to the terms of employment and applicable law. The Employee is expected to complete proper handover of duties, company property, documents, stock/material responsibilities and other assigned matters before the final working day.";
    y = renderParagraph(doc, noticeText, leftMargin, y, contentWidth, 3.4, 7.8, 'justify');

    // 20. Non Residential Company Terms and Conditions (All 12 items integrated on Page 3)
    y += 2.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('20. Non Residential Company Terms and Conditions', leftMargin, y);
    y += 3.4;

    const nonResBullets = [
      '• Leave Eligibility: Leave will ordinarily be permitted only after completion of 12 months of service, subject to applicable statutory leave entitlements, emergency circumstances and Company policy.',
      '• Travel during Authorized Leave: For eligible and authorized leave, the Company will provide round-trip Sleeper Class train tickets, subject to Company travel procedure and route availability.',
      '• Final Leave before One Year: No employee is ordinarily permitted to proceed on final/home leave before completing 12 months of service, except where management approves an exception or where applicable law requires otherwise.',
      '• Fighting / Violence: Fighting, threats, assault or abusive conduct among employees in Company premises or accommodation quarters is strictly prohibited and may lead to disciplinary action.',
      '• Accommodation: The Company will provide accommodation/room for employees where such accommodation is part of the employment arrangement. Employees must keep their living quarters clean, orderly and safe and must follow accommodation rules.',
      '• Waste & Plastic: Employees must not accumulate plastic waste outside their quarters and must not burn plastic. Waste shall be disposed of in the designated manner.',
      '• Pan / Tampack / Tobacco: The use or consumption of Pan, Tampack or other tobacco products in Accommodation premises is strictly prohibited. A violation may attract a fine of ₹500, subject to applicable law and Company procedure.',
      '• Resignation: The Company may require proper handover of duties, Company property, documents, stock/material responsibility and accommodation assets before the final working day.',
      '• Leaving Home Before One Year: If an employee leaves for home before completing one year of service, a uniform fee of ₹400 may be recovered only where legally authorized.',
      '• Bonus Eligibility: Bonus eligibility under Company policy is applicable only upon successful completion of one year of service, subject to any statutory bonus or other mandatory entitlement that may apply.',
      '• Uniform: Wearing the prescribed uniform inside the plant is mandatory. Employees shall maintain the uniform in a clean and serviceable condition and follow Company instructions regarding its use and care.',
      '• Separation, Handover & Final Settlement: On resignation or separation, the Employee must complete the required handover and return Company property. Final salary and other amounts due will be settled in accordance with applicable law and Company procedure. Nothing in this Agreement is intended to remove any mandatory statutory right or protection.',
    ];

    nonResBullets.forEach(b => {
      y = renderParagraph(doc, b, leftMargin, y, contentWidth, 3.1, 7.5, 'left');
      y += 0.4;
    });

    // 21. Acceptance
    y += 2.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('21. Acceptance', leftMargin, y);
    y += 3.4;

    const acceptStatement =
      'By signing below, both parties confirm that they have read and understood this Agreement and agree to the terms stated herein.';
    y = renderParagraph(doc, acceptStatement, leftMargin, y, contentWidth, 3.4, 7.8, 'left');
    y += 2.5;

    // Dual Signatures Block on Page 3
    y = EmployeeSignatureBlock(doc, y, fields, isBlank, contentWidth, leftMargin, 9.5);
    y += 2.5;
    y = ApprovalSignatureBlock(doc, y, fields, isBlank, contentWidth, leftMargin, 14.0);
  } else {
    // Residential Page 3: Clauses 17, 18, 19, Acceptance (20), and Dual Signatures
    // 17. Acknowledgement of Workplace Rules
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('17. Acknowledgement of Workplace Rules', leftMargin, y);
    y += 3.4;

    const ackText =
      'The Employee confirms that the following Enerpack rules have been explained and understood. The Employee acknowledges that any salary/wage deduction will be made only as permitted by applicable law and company procedure:';
    y = renderParagraph(doc, ackText, leftMargin, y, contentWidth, 3.6, 8.0, 'justify');
    y += 1.0;

    const ackBullets = [
      '• Mobile Phone Usage: Unauthorized mobile-phone use during working hours may result in a salary deduction of ₹250 to ₹500 per occurrence.',
      "• Absence: Unauthorized absence may result in salary deduction for the corresponding period. The company rule of two days' salary deduction for unauthorized absence will apply only to the extent legally permissible.",
      '• Spitting on Company Premises: Spitting anywhere on Enerpack premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law and company procedure.',
    ];

    ackBullets.forEach(b => {
      y = renderParagraph(doc, b, leftMargin, y, contentWidth, 3.6, 8.0, 'left');
      y += 0.8;
    });

    // 18. Personal Leave
    y += 2.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('18. Personal Leave', leftMargin, y);
    y += 3.4;

    const leaveText =
      'Personal leave should normally be requested and communicated to the reporting supervisor/HR at least 7 to 10 days in advance, wherever reasonably practicable, so that work arrangements can be made. Leave approval remains subject to company policy, operational requirements and applicable law. Emergency or unforeseen leave should be reported as soon as reasonably possible.';
    y = renderParagraph(doc, leaveText, leftMargin, y, contentWidth, 3.6, 8.0, 'justify');

    // 19. Resignation & Notice Period
    y += 2.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('19. Resignation & Notice Period', leftMargin, y);
    y += 3.4;

    const noticeText =
      "An Employee who wishes to resign from Enerpack shall provide a minimum of 45 days' prior written notice. The resignation must be submitted in writing and signed by the Employee. The notice period shall be counted from the date the written resignation is received/acknowledged by the Company, subject to the terms of employment and applicable law. The Employee is expected to complete proper handover of duties, company property, documents, stock/material responsibilities and other assigned matters before the final working day.";
    y = renderParagraph(doc, noticeText, leftMargin, y, contentWidth, 3.6, 8.0, 'justify');

    // 20. Acceptance
    y += 2.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(COLOR_HEADING[0], COLOR_HEADING[1], COLOR_HEADING[2]);
    doc.text('20. Acceptance', leftMargin, y);
    y += 3.4;

    const acceptStatement =
      'By signing below, both parties confirm that they have read and understood this Agreement and agree to the terms stated herein.';
    y = renderParagraph(doc, acceptStatement, leftMargin, y, contentWidth, 3.6, 8.0, 'left');
    y += 3.5;

    // Dual Signatures Block on Page 3
    y = EmployeeSignatureBlock(doc, y, fields, isBlank, contentWidth, leftMargin, 11.5);
    y += 3.5;
    y = ApprovalSignatureBlock(doc, y, fields, isBlank, contentWidth, leftMargin, 16.0);
  }

  EnerpackFooter(doc, 3, 3);

  // Validate quality control
  const qc = validateContractPdf(doc);
  if (!qc.isValid) {
    console.warn('PDF Quality Control warnings:', qc.errors);
  }

  return doc;
}
