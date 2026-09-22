import { jsPDF } from 'jspdf';

/**
 * Formats monetary amounts using the exact Indian Rupee symbol (₹, U+20B9)
 * and Indian numbering grouping (e.g. 15000 -> ₹15,000; 250 -> ₹250).
 */
export function formatIndianCurrency(amount: number | string): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const str = String(amount).trim();
  if (str === '__________' || str === '________________') return `₹${str}`;
  
  // If it already starts with ₹, parse the number
  const cleanStr = str.replace(/[₹\s,]/g, '');
  const num = parseFloat(cleanStr);
  if (isNaN(num)) {
    return str.startsWith('₹') ? str : `₹${str}`;
  }
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/**
 * Renders the official Enerpack Letterhead (Without Logo) across all documents.
 * Standard across Policies, Warning Letters, Payslips, Attendance, Fleet, and Vault archives.
 */
export const EnerpackLetterheadWithoutLogo = (doc: jsPDF): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Background Header Bar (light gray)
  doc.setFillColor(238, 240, 243);
  doc.rect(0, 0, pageWidth, 26, 'F');

  const logoX = 15;
  const logoY = 4;

  // Enerpack text header on the left (Strictly Without Logo as per company standard)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 117, 187); // #1875bb
  doc.text('ENERPACK', logoX, logoY + 10.5);

  // Center - Official Registered Address
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const centerX = pageWidth / 2;
  doc.text('VII/188-H,G, AYIKKARAPPADI ROAD', centerX, logoY + 6, { align: 'center' });
  doc.text('KAKKANCHERY, CHELEMBRA (PO)', centerX, logoY + 10, { align: 'center' });
  doc.text('MALAPPURAM, KERALA - 673634.', centerX, logoY + 14, { align: 'center' });

  // Right - Contact Info
  const rightX = pageWidth - 15;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  
  // Office numbers
  doc.setTextColor(24, 117, 187); // Blue labels
  doc.text('OFFICE :', rightX - 35, logoY + 7, { align: 'right' });
  doc.setTextColor(51, 65, 85); // Dark text for numbers
  doc.text('8921027181 | 9995980464', rightX, logoY + 7, { align: 'right' });

  // Email
  doc.setTextColor(24, 117, 187);
  doc.text('EMAIL :', rightX - 35, logoY + 12, { align: 'right' });
  doc.setTextColor(51, 65, 85);
  doc.text('infoenerpack@gmail.com', rightX, logoY + 12, { align: 'right' });
  
  // Reset for main content
  doc.setTextColor(0, 0, 0);
  
  // Return Y offset where content can safely start
  return 30; 
};

/**
 * Alias for backward compatibility across all modules.
 */
export const addLetterhead = (doc: jsPDF, _withLogo: boolean = false): number => {
  return EnerpackLetterheadWithoutLogo(doc);
};

