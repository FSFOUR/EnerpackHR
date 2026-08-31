import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle, Trip, FuelEntry, FleetExpense, MaintenanceRecord, FleetDocument, InspectionChecklist } from '../types/fleet';

interface GenerateReportOptions {
  vehicle: Vehicle;
  timeframe: 'Daily' | 'Monthly' | 'Yearly';
  selectedDate: string; // YYYY-MM-DD or YYYY-MM or YYYY
  trips: Trip[];
  fuelEntries: FuelEntry[];
  expenses: FleetExpense[];
  maintenanceRecords: MaintenanceRecord[];
  documents: FleetDocument[];
  inspections: InspectionChecklist[];
  kpis: {
    totalKm: number;
    totalCost: number;
    fuelCost: number;
    maintenanceCost: number;
    otherExpenses: number;
    fuelLitres: number;
    avgMileage: number;
    costPerKm: number;
    tripsCount: number;
  };
  chartBreakdown?: {
    name: string;
    value: number;
  }[];
}

export function generateVehiclePdfReport(options: GenerateReportOptions) {
  const {
    vehicle,
    timeframe,
    selectedDate,
    trips,
    fuelEntries,
    expenses,
    maintenanceRecords,
    documents,
    inspections,
    kpis,
    chartBreakdown
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor: [number, number, number] = [30, 41, 59]; // slate-800
  const accentColor: [number, number, number] = [37, 99, 235]; // blue-600
  const successColor: [number, number, number] = [16, 185, 129]; // emerald-500
  const amberColor: [number, number, number] = [217, 119, 6]; // amber-600

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Accent stripe
  doc.setFillColor(...accentColor);
  doc.rect(0, 26, pageWidth, 2.5, 'F');

  // Company / App Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ENERPACK FLEET MANAGEMENT SYSTEM', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('VEHICLE OPERATIONAL ANALYTICS & EXPENSE AUDIT REPORT', 14, 18);

  // Timeframe Badge (Top Right)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 65, 7, 51, 13, 2, 2, 'F');
  doc.setTextColor(...accentColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${timeframe.toUpperCase()} REPORT`, pageWidth - 40, 12, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${selectedDate}`, pageWidth - 40, 17, { align: 'center' });

  // 2. Vehicle Summary Card
  let currentY = 35;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 3, 3, 'FD');

  // Vehicle info columns
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(vehicle.number, 18, currentY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${vehicle.make} ${vehicle.model} (${vehicle.variant || vehicle.type})`, 18, currentY + 13);
  doc.text(`Driver: ${vehicle.primaryDriverName || 'Unassigned'}  |  Dept: ${vehicle.department}`, 18, currentY + 19);

  // Vehicle metadata right side
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${vehicle.currentStatus}`, pageWidth - 70, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Odometer: ${vehicle.currentOdometer.toLocaleString()} KM`, pageWidth - 70, currentY + 13);
  doc.text(`Fuel: ${vehicle.fuelType}  |  Exp Mileage: ${vehicle.expectedMileage} km/l`, pageWidth - 70, currentY + 19);

  currentY += 32;

  // 3. Executive KPI Metric Grid (4 Cards)
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 18;

  const kpiCards = [
    { title: 'TOTAL DISTANCE', val: `${kpis.totalKm.toLocaleString()} KM`, sub: `${kpis.tripsCount} Trips Logged`, bg: [239, 246, 255], border: [191, 219, 254], text: accentColor },
    { title: 'TOTAL EXPENDITURE', val: `Rs. ${kpis.totalCost.toLocaleString()}`, sub: `Fuel + Maint + Misc`, bg: [254, 242, 242], border: [254, 202, 202], text: [220, 38, 38] as [number, number, number] },
    { title: 'FUEL CONSUMPTION', val: `${kpis.fuelLitres.toFixed(1)} L`, sub: `Avg ${kpis.avgMileage > 0 ? kpis.avgMileage.toFixed(1) : vehicle.expectedMileage} KM/L`, bg: [240, 253, 244], border: [187, 247, 208], text: successColor },
    { title: 'COST PER KM', val: `Rs. ${kpis.costPerKm.toFixed(2)} /KM`, sub: `Fleet Benchmark: Rs. 9.50`, bg: [255, 251, 235], border: [254, 243, 199], text: amberColor }
  ];

  kpiCards.forEach((card, idx) => {
    const cx = 14 + idx * (cardWidth + 3);
    doc.setFillColor(...(card.bg as [number, number, number]));
    doc.setDrawColor(...(card.border as [number, number, number]));
    doc.roundedRect(cx, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(card.title, cx + cardWidth / 2, currentY + 4.5, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setTextColor(...card.text);
    doc.text(card.val, cx + cardWidth / 2, currentY + 11, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(card.sub, cx + cardWidth / 2, currentY + 15.5, { align: 'center' });
  });

  currentY += 24;

  // 4. Financial & Expense Breakdown Matrix
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Operational Cost Breakdown', 14, currentY);
  currentY += 3;

  const costBreakdownBody = [
    [
      'Fuel Refills & Consumption',
      `${kpis.fuelLitres.toFixed(1)} Litres`,
      `Rs. ${kpis.fuelCost.toLocaleString()}`,
      `${kpis.totalCost > 0 ? ((kpis.fuelCost / kpis.totalCost) * 100).toFixed(1) : '0.0'}%`
    ],
    [
      'Vehicle Maintenance & Workshop Repairs',
      `${maintenanceRecords.length} Services`,
      `Rs. ${kpis.maintenanceCost.toLocaleString()}`,
      `${kpis.totalCost > 0 ? ((kpis.maintenanceCost / kpis.totalCost) * 100).toFixed(1) : '0.0'}%`
    ],
    [
      'Tolls, FASTag, Washing & Parking Expenses',
      `${expenses.length} Expense Claims`,
      `Rs. ${kpis.otherExpenses.toLocaleString()}`,
      `${kpis.totalCost > 0 ? ((kpis.otherExpenses / kpis.totalCost) * 100).toFixed(1) : '0.0'}%`
    ],
    [
      'TOTAL OPERATIONAL COST',
      `${kpis.totalKm.toLocaleString()} KM Total`,
      `Rs. ${kpis.totalCost.toLocaleString()}`,
      '100.0%'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Expense Category', 'Volume / Units', 'Total Amount (INR)', '% Share']],
    body: costBreakdownBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 42, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 30, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 5. Trips Summary Log
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Logged Dispatch & Field Trips (${trips.length} Records)`, 14, currentY);
  currentY += 3;

  const tripsBody = trips.length > 0
    ? trips.map(t => [
        t.tripNumber,
        t.tripDate,
        `${t.startLocation} -> ${t.destination}`,
        t.tripPurpose || 'Official Travel',
        `${t.distance} KM`,
        `Rs. ${(t.tollExpense || 0) + (t.parkingExpense || 0)}`,
        t.status
      ])
    : [['No trip records logged for this selected timeframe', '-', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    head: [['Trip #', 'Date', 'Route (From - To)', 'Purpose / Remarks', 'Distance', 'Tolls/Park', 'Status']],
    body: tripsBody,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 20 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
      4: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 15, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for Fuel & Expenses
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  // 6. Fuel Refills Log
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Fuel Refill Logs (${fuelEntries.length} Records)`, 14, currentY);
  currentY += 3;

  const fuelBody = fuelEntries.length > 0
    ? fuelEntries.map(f => [
        f.date,
        f.fuelStation,
        `${f.quantity.toFixed(1)} L`,
        `Rs. ${f.pricePerLitre.toFixed(2)}`,
        `Rs. ${f.totalAmount.toLocaleString()}`,
        `${f.odometer.toLocaleString()} KM`,
        f.calculatedMileage ? `${f.calculatedMileage.toFixed(1)} KM/L` : '-'
      ])
    : [['No fuel refill records in this timeframe', '-', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Fuel Station / Retail Outlet', 'Qty (L)', 'Rate / L', 'Total Cost', 'Odometer', 'Mileage']],
    body: fuelBody,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      2: { cellWidth: 18, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 18, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for Expenses & Maintenance
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // 7. Operating Expenses Log
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`4. Operational & Incidental Expenses (${expenses.length} Records)`, 14, currentY);
  currentY += 3;

  const expenseBody = expenses.length > 0
    ? expenses.map(e => [
        e.expenseNumber,
        e.date,
        e.category,
        e.vendor || e.paidBy || '-',
        e.description || '-',
        `Rs. ${e.amount.toLocaleString()}`,
        e.status
      ])
    : [['No incidental expenses logged in this timeframe', '-', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    head: [['Exp #', 'Date', 'Category', 'Vendor / Paid By', 'Description / Purpose', 'Amount (INR)', 'Status']],
    body: expenseBody,
    theme: 'striped',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 40 },
      5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 14, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 12;

  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 25;
  }

  // 8. Sign-off / Verification Block
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 6;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}  |  Enerpack Intelligent Fleet Operating System`, 14, currentY);

  currentY += 14;
  const signColWidth = (pageWidth - 28) / 3;

  doc.setDrawColor(148, 163, 184);
  // Line 1
  doc.line(14, currentY, 14 + signColWidth - 10, currentY);
  doc.text('Prepared By (Driver / Fleet Admin)', 14, currentY + 5);

  // Line 2
  doc.line(14 + signColWidth, currentY, 14 + signColWidth * 2 - 10, currentY);
  doc.text('Verified By (Operations Manager)', 14 + signColWidth, currentY + 5);

  // Line 3
  doc.line(14 + signColWidth * 2, currentY, pageWidth - 14, currentY);
  doc.text('Approved By (Finance & Audit)', 14 + signColWidth * 2, currentY + 5);

  // Save the PDF
  const filename = `Enerpack_Report_${vehicle.number}_${timeframe}_${selectedDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
