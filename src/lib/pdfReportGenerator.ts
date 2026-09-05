import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportReportParams {
  title: string;
  subtitle?: string;
  columns: { header: string; dataKey: string }[];
  data: any[];
  filename: string;
}

export function exportToPDF({ title, subtitle, columns, data, filename }: ExportReportParams) {
  const doc = new jsPDF('landscape');
  
  // Set document properties
  doc.setProperties({
    title: title,
    subject: subtitle,
    author: 'Enerpack HR & Fleet System',
    creator: 'Enerpack System'
  });

  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

  // Draw Header
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.text('Enerpack HR & Fleet', 14, 22);

  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 30);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, 14, 36);
  }

  // Draw Generation Date (Top Right)
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  const dateStr = `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`;
  doc.text(dateStr, pageWidth - 14, 22, { align: 'right' });

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);

  // Configure AutoTable
  autoTable(doc, {
    startY: 46,
    columns: columns,
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 250, 252], // slate-50
      textColor: [71, 85, 105], // slate-600
      fontStyle: 'bold',
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.5,
    },
    bodyStyles: {
      textColor: [51, 65, 85], // slate-700
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [250, 252, 253], // faint blue/slate
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
    },
    margin: { top: 46, right: 14, bottom: 20, left: 14 },
    didDrawPage: (data) => {
      // Draw Footer
      const str = 'Page ' + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(str, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }
  });

  doc.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
