import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CompanyInfo {
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  siret: string | null;
  tvaNumber: string | null;
  iban: string | null;
  bic: string | null;
}

interface ClientInfo {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  company: string | null;
}

interface DocumentLine {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

interface DocumentData {
  type: "quote" | "invoice";
  number: string;
  date: Date;
  dueDate?: Date;
  company: CompanyInfo;
  client: ClientInfo;
  lines: DocumentLine[];
  notes?: string;
  legalMentions?: string;
  paymentTerms?: number;
  paymentMethod?: string;
}

export function generateDocumentPDF(data: DocumentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Couleurs
  const primaryColor: [number, number, number] = [230, 126, 80]; // #E67E50
  const darkText: [number, number, number] = [20, 20, 20];
  const lightText: [number, number, number] = [80, 80, 80];
  const borderColor: [number, number, number] = [200, 200, 200];

  let yPos = margin;

  // ============================================================================
  // EN-TÊTE PROFESSIONNEL
  // ============================================================================
  
  // Ligne de séparation supérieure
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Logo et nom entreprise
  doc.setFillColor(...primaryColor);
  doc.rect(margin, yPos - 3, 12, 12, "F");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("G", margin + 3, yPos + 4);

  doc.setTextColor(...darkText);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.company.name || "COACH DIGITAL", margin + 16, yPos + 4);

  // Informations entreprise à droite
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightText);
  let rightX = pageWidth - margin;
  let rightY = yPos;

  if (data.company.address) {
    doc.text(data.company.address, rightX, rightY, { align: "right" });
    rightY += 4;
  }
  if (data.company.postalCode && data.company.city) {
    doc.text(`${data.company.postalCode} ${data.company.city}`, rightX, rightY, { align: "right" });
    rightY += 4;
  }
  if (data.company.phone) {
    doc.text(`Tél: ${data.company.phone}`, rightX, rightY, { align: "right" });
    rightY += 4;
  }
  if (data.company.email) {
    doc.text(`Email: ${data.company.email}`, rightX, rightY, { align: "right" });
    rightY += 4;
  }

  yPos += 18;

  // ============================================================================
  // TITRE DU DOCUMENT
  // ============================================================================
  
  const docTitle = data.type === "quote" ? "DEVIS" : "FACTURE";
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(docTitle, margin, yPos);

  // Numéro et dates à droite
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(`N° ${data.number}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 8;

  doc.setFontSize(9);
  doc.setTextColor(...lightText);
  doc.text(`Date: ${data.date.toLocaleDateString("fr-FR")}`, pageWidth - margin, yPos, { align: "right" });
  if (data.dueDate) {
    yPos += 5;
    doc.text(`Échéance: ${data.dueDate.toLocaleDateString("fr-FR")}`, pageWidth - margin, yPos, { align: "right" });
  }

  yPos += 12;

  // ============================================================================
  // INFORMATIONS CLIENT
  // ============================================================================
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text("FACTURÉ À:", margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(data.client.name, margin, yPos);
  yPos += 5;

  if (data.client.company) {
    doc.text(data.client.company, margin, yPos);
    yPos += 5;
  }
  if (data.client.address) {
    doc.text(data.client.address, margin, yPos);
    yPos += 5;
  }
  if (data.client.postalCode && data.client.city) {
    doc.text(`${data.client.postalCode} ${data.client.city}`, margin, yPos);
    yPos += 5;
  }
  if (data.client.phone) {
    doc.text(`Tél: ${data.client.phone}`, margin, yPos);
    yPos += 5;
  }
  if (data.client.email) {
    doc.text(`Email: ${data.client.email}`, margin, yPos);
  }

  yPos += 10;

  // ============================================================================
  // TABLEAU DES PRESTATIONS
  // ============================================================================
  
  const tableData = data.lines.map((line) => {
    const lineTotal = line.quantity * line.unitPrice;
    const lineTVA = lineTotal * (line.vatRate / 100);
    return [
      line.description,
      line.quantity.toString(),
      `${line.unitPrice.toFixed(2)} €`,
      `${line.vatRate.toFixed(0)}%`,
      `${lineTotal.toFixed(2)} €`,
      `${lineTVA.toFixed(2)} €`,
      `${(lineTotal + lineTVA).toFixed(2)} €`,
    ];
  });

  // Calculs totaux
  let totalHT = 0;
  let totalTVA = 0;
  data.lines.forEach((line) => {
    const lineTotal = line.quantity * line.unitPrice;
    totalHT += lineTotal;
    totalTVA += lineTotal * (line.vatRate / 100);
  });
  const totalTTC = totalHT + totalTVA;

  (doc as any).autoTable({
    startY: yPos,
    head: [["Prestation", "Qté", "Prix unitaire HT", "TVA", "Montant HT", "Montant TVA", "Montant TTC"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkText,
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ============================================================================
  // TOTAUX
  // ============================================================================
  
  const totalsX = pageWidth - margin - 50;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);

  doc.text("Montant HT:", totalsX, yPos);
  doc.text(`${totalHT.toFixed(2)} €`, pageWidth - margin, yPos, { align: "right" });
  yPos += 6;

  doc.text("Montant TVA:", totalsX, yPos);
  doc.text(`${totalTVA.toFixed(2)} €`, pageWidth - margin, yPos, { align: "right" });
  yPos += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("TOTAL TTC:", totalsX, yPos);
  doc.text(`${totalTTC.toFixed(2)} €`, pageWidth - margin, yPos, { align: "right" });

  yPos += 12;

  // ============================================================================
  // MODALITÉS DE PAIEMENT
  // ============================================================================
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text("MODALITÉS DE PAIEMENT", margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightText);

  if (data.paymentTerms) {
    doc.text(`Délai de paiement: ${data.paymentTerms} jours nets`, margin, yPos);
    yPos += 5;
  }

  if (data.paymentMethod) {
    doc.text(`Moyen de paiement: ${data.paymentMethod}`, margin, yPos);
    yPos += 5;
  }

  if (data.company.iban) {
    doc.text(`IBAN: ${data.company.iban}`, margin, yPos);
    yPos += 5;
  }

  if (data.company.bic) {
    doc.text(`BIC: ${data.company.bic}`, margin, yPos);
    yPos += 5;
  }

  yPos += 5;

  // ============================================================================
  // CONDITIONS GÉNÉRALES
  // ============================================================================
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text("CONDITIONS GÉNÉRALES", margin, yPos);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightText);

  const conditions = [
    "1. Validité: Ce devis est valable 30 jours à compter de sa date d'émission.",
    "2. Paiement: Le paiement doit être effectué selon les modalités indiquées ci-dessus.",
    "3. Retard de paiement: Tout retard de paiement entraînera des intérêts de retard au taux légal.",
    "4. Confidentialité: Les informations contenues dans ce document sont confidentielles.",
    "5. Responsabilité: Notre responsabilité est limitée au montant de la prestation.",
  ];

  conditions.forEach((condition) => {
    const lines = doc.splitTextToSize(condition, pageWidth - 2 * margin);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 3.5 + 2;
  });

  // ============================================================================
  // NOTES SUPPLÉMENTAIRES
  // ============================================================================
  
  if (data.notes) {
    yPos += 3;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text("NOTES", margin, yPos);
    yPos += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...lightText);
    const notesLines = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
  }

  // ============================================================================
  // PIED DE PAGE
  // ============================================================================
  
  const footerY = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);

  // Informations légales
  let footerText = `${data.company.name}`;
  if (data.company.siret) footerText += ` | SIRET: ${data.company.siret}`;
  if (data.company.tvaNumber) footerText += ` | TVA: ${data.company.tvaNumber}`;

  doc.text(footerText, margin, footerY + 5);

  // Numéro de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    (doc as any).setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i}/${pageCount}`, pageWidth - margin, footerY + 5, { align: "right" });
  }

  return doc;
}

export function downloadDocumentPDF(data: DocumentData, filename?: string) {
  const doc = generateDocumentPDF(data);
  const defaultFilename = `${data.type === "quote" ? "devis" : "facture"}_${data.number}.pdf`;
  doc.save(filename || defaultFilename);
}
