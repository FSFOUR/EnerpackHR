import { jsPDF } from 'jspdf';

export const addLetterhead = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Background Header Bar (light gray)
  doc.setFillColor(238, 240, 243);
  doc.rect(0, 0, pageWidth, 26, 'F');

  const logoX = 15;
  const logoY = 4;

  // Try to load custom logo from localStorage
  let customLogo = null;
  try {
    customLogo = localStorage.getItem('enerpack_company_logo');
  } catch (e) {
    console.error('Could not access localStorage for logo', e);
  }

  if (customLogo) {
    try {
      const imgProps = doc.getImageProperties(customLogo);
      const targetHeight = 18;
      const targetWidth = targetHeight * (imgProps.width / imgProps.height);
      doc.addImage(customLogo, 'PNG', logoX, logoY, targetWidth, targetHeight);
    } catch (e) {
      console.error('Error adding custom logo to PDF', e);
      drawFallbackLogo(doc, logoX, logoY);
    }
  } else {
    drawFallbackLogo(doc, logoX, logoY);
  }

  // Center - Address
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
  return 35; 
};

function drawFallbackLogo(doc: jsPDF, logoX: number, logoY: number) {
  doc.setFillColor(24, 117, 187); // #1875bb

  const s = 0.2; // scale factor
  const ox = logoX - 5;
  const oy = logoY - 3;

  // Helper to draw a 4-point polygon using two triangles
  const drawQuad = (p1: number[], p2: number[], p3: number[], p4: number[]) => {
    doc.triangle(ox + p1[0]*s, oy + p1[1]*s, ox + p2[0]*s, oy + p2[1]*s, ox + p3[0]*s, oy + p3[1]*s, 'F');
    doc.triangle(ox + p1[0]*s, oy + p1[1]*s, ox + p3[0]*s, oy + p3[1]*s, ox + p4[0]*s, oy + p4[1]*s, 'F');
  };

  // 3 Stacked Top Plates
  drawQuad([100,15], [145,30], [100,45], [55,30]);
  drawQuad([100,23], [145,38], [100,53], [55,38]);
  drawQuad([100,31], [145,46], [100,61], [55,46]);
  
  // Left face (E block)
  drawQuad([55,52], [98,66], [98,110], [55,96]);
  
  // Right face (P block)
  drawQuad([102,66], [145,52], [145,96], [102,110]);

  // Letters inside blocks
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('E', ox + 76*s, oy + 93*s, { align: 'center' });
  doc.text('P', ox + 124*s, oy + 93*s, { align: 'center' });
  
  // Bottom Text
  doc.setTextColor(24, 117, 187);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Ener Pack', ox + 100*s, oy + 145*s, { align: 'center' });
}
