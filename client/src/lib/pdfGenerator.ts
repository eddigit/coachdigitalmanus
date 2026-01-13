import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface DocumentData {
  type: "quote" | "invoice" | "credit_note" | "proforma";
  number: string;
  date: Date;
  dueDate?: Date;
  validityDate?: Date;
  
  // Company info
  company: {
    name: string;
    address?: string;
    postalCode?: string;
    city?: string;
    siret?: string;
    tvaNumber?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
  };
  
  // Client info
  client: {
    firstName: string;
    lastName: string;
    company?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    email?: string;
  };
  
  // Document content
  subject?: string;
  introduction?: string;
  conclusion?: string;
  
  // Lines
  lines: Array<{
    description: string;
    quantity?: string;
    unit?: string;
    unitPriceHt?: string;
    tvaRate?: string;
    totalHt?: string;
    totalTva?: string;
    totalTtc?: string;
  }>;
  
  // Totals
  totalHt: string;
  totalTva: string;
  totalTtc: string;
  discountAmount?: string;
  
  // Payment
  paymentTerms?: number;
  paymentMethod?: string;
  isAcompteRequired?: boolean;
  acomptePercentage?: string;
  acompteAmount?: string;
  
  notes?: string;
}

export function generateDocumentPDF(data: DocumentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };
  
  // Document type title
  const docTypeMap = {
    quote: "DEVIS",
    invoice: "FACTURE",
    credit_note: "AVOIR",
    proforma: "FACTURE PROFORMA",
  };
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(docTypeMap[data.type], pageWidth - 20, yPosition, { align: "right" });
  
  // Document number
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${data.number}`, pageWidth - 20, yPosition + 8, { align: "right" });
  
  // Company info (left side)
  yPosition = 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.company.name, 20, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (data.company.address) {
    yPosition = addText(data.company.address, 20, yPosition, 80);
  }
  if (data.company.postalCode && data.company.city) {
    yPosition = addText(`${data.company.postalCode} ${data.company.city}`, 20, yPosition, 80);
  }
  if (data.company.siret) {
    yPosition = addText(`SIRET: ${data.company.siret}`, 20, yPosition, 80);
  }
  if (data.company.tvaNumber) {
    yPosition = addText(`TVA: ${data.company.tvaNumber}`, 20, yPosition, 80);
  }
  if (data.company.phone) {
    yPosition = addText(`Tél: ${data.company.phone}`, 20, yPosition, 80);
  }
  if (data.company.email) {
    yPosition = addText(`Email: ${data.company.email}`, 20, yPosition, 80);
  }
  
  // Client info (right side box)
  const clientBoxY = 50;
  const clientBoxX = pageWidth - 90;
  const clientBoxWidth = 70;
  
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.rect(clientBoxX, clientBoxY, clientBoxWidth, 45, "FD");
  
  let clientY = clientBoxY + 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Client:", clientBoxX + 5, clientY);
  
  clientY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`${data.client.firstName} ${data.client.lastName}`, clientBoxX + 5, clientY);
  
  if (data.client.company) {
    clientY += 5;
    doc.text(data.client.company, clientBoxX + 5, clientY);
  }
  if (data.client.address) {
    clientY += 5;
    const addressLines = doc.splitTextToSize(data.client.address, clientBoxWidth - 10);
    doc.text(addressLines, clientBoxX + 5, clientY);
    clientY += addressLines.length * 4;
  }
  if (data.client.postalCode && data.client.city) {
    clientY += 5;
    doc.text(`${data.client.postalCode} ${data.client.city}`, clientBoxX + 5, clientY);
  }
  
  // Dates
  yPosition = clientBoxY + 50;
  doc.setFontSize(10);
  doc.text(`Date: ${data.date.toLocaleDateString("fr-FR")}`, 20, yPosition);
  
  if (data.dueDate) {
    yPosition += 5;
    doc.text(`Échéance: ${data.dueDate.toLocaleDateString("fr-FR")}`, 20, yPosition);
  }
  
  if (data.validityDate) {
    yPosition += 5;
    doc.text(`Validité: ${data.validityDate.toLocaleDateString("fr-FR")}`, 20, yPosition);
  }
  
  // Subject
  yPosition += 10;
  if (data.subject) {
    doc.setFont("helvetica", "bold");
    yPosition = addText(`Objet: ${data.subject}`, 20, yPosition, pageWidth - 40, 11);
    yPosition += 3;
  }
  
  // Introduction
  if (data.introduction) {
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    yPosition = addText(data.introduction, 20, yPosition, pageWidth - 40);
    yPosition += 5;
  }
  
  // Lines table
  yPosition += 5;
  
  const tableData = data.lines.map((line) => [
    line.description,
    line.quantity || "",
    line.unit || "",
    line.unitPriceHt || "",
    line.tvaRate || "",
    line.totalHt || "",
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [["Description", "Qté", "Unité", "Prix HT", "TVA", "Total HT"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [60, 80, 150],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 25, halign: "right" },
    },
  });
  
  // Get Y position after table
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals box
  const totalsX = pageWidth - 70;
  const totalsWidth = 50;
  
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  
  // Total HT
  doc.text("Total HT:", totalsX - 35, yPosition);
  doc.text(`${data.totalHt} €`, totalsX + totalsWidth - 5, yPosition, { align: "right" });
  doc.line(totalsX - 35, yPosition + 1, totalsX + totalsWidth - 5, yPosition + 1);
  
  yPosition += 6;
  
  // Total TVA
  doc.text("Total TVA:", totalsX - 35, yPosition);
  doc.text(`${data.totalTva} €`, totalsX + totalsWidth - 5, yPosition, { align: "right" });
  doc.line(totalsX - 35, yPosition + 1, totalsX + totalsWidth - 5, yPosition + 1);
  
  yPosition += 6;
  
  // Discount
  if (data.discountAmount && parseFloat(data.discountAmount) > 0) {
    doc.text("Remise:", totalsX - 35, yPosition);
    doc.text(`-${data.discountAmount} €`, totalsX + totalsWidth - 5, yPosition, { align: "right" });
    doc.line(totalsX - 35, yPosition + 1, totalsX + totalsWidth - 5, yPosition + 1);
    yPosition += 6;
  }
  
  // Total TTC
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total TTC:", totalsX - 35, yPosition);
  doc.text(`${data.totalTtc} €`, totalsX + totalsWidth - 5, yPosition, { align: "right" });
  doc.setLineWidth(1);
  doc.line(totalsX - 35, yPosition + 1, totalsX + totalsWidth - 5, yPosition + 1);
  
  yPosition += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Acompte
  if (data.isAcompteRequired && data.acompteAmount) {
    yPosition += 5;
    doc.text(`Acompte requis (${data.acomptePercentage || ""}%):`, 20, yPosition);
    doc.text(`${data.acompteAmount} €`, totalsX + totalsWidth - 5, yPosition, { align: "right" });
  }
  
  // Payment terms
  yPosition += 10;
  if (data.paymentTerms) {
    doc.text(`Conditions de paiement: ${data.paymentTerms} jours`, 20, yPosition);
    yPosition += 5;
  }
  
  if (data.paymentMethod) {
    const methodMap: Record<string, string> = {
      bank_transfer: "Virement bancaire",
      check: "Chèque",
      card: "Carte bancaire",
      cash: "Espèces",
      other: "Autre",
    };
    doc.text(`Mode de paiement: ${methodMap[data.paymentMethod] || data.paymentMethod}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Conclusion
  if (data.conclusion) {
    yPosition += 5;
    yPosition = addText(data.conclusion, 20, yPosition, pageWidth - 40);
  }
  
  // Notes
  if (data.notes) {
    yPosition += 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    yPosition = addText(data.notes, 20, yPosition, pageWidth - 40, 8);
  }
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `${docTypeMap[data.type]} N° ${data.number} - ${data.company.name}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  
  return doc;
}

export function downloadDocumentPDF(data: DocumentData, filename?: string) {
  const doc = generateDocumentPDF(data);
  const defaultFilename = `${data.type}_${data.number}.pdf`;
  doc.save(filename || defaultFilename);
}

export function getDocumentPDFBlob(data: DocumentData): Blob {
  const doc = generateDocumentPDF(data);
  return doc.output("blob");
}
