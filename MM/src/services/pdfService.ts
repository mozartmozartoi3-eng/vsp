import { jsPDF } from 'jspdf';
import { VehicleOrder, CommercialBankSettings } from '../types/wordpress';
import { getDealershipStampDataUrl } from './stampService';

/**
 * Utility to format currency in French format (e.g. 8 990 €)
 */
function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} €`;
}

/**
 * Utility to format date in French format (e.g. 09/09/2026)
 */
function formatDate(isoDate?: string): string {
  if (!isoDate) return new Date().toLocaleDateString('fr-FR');
  try {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return new Date().toLocaleDateString('fr-FR');
  }
}

/**
 * Generates and triggers download of the official Invoice (Facture) in PDF format
 */
export function generateInvoicePdf(
  order: VehicleOrder,
  commercialSettings: CommercialBankSettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep Blue (#1E3A8A)
  const darkColor: [number, number, number] = [30, 41, 59]; // Slate-800
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate-50
  const borderGray: [number, number, number] = [226, 232, 240]; // Slate-200
  const accentGreen: [number, number, number] = [16, 149, 106]; // Emerald-600

  // 1. Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(commercialSettings.companyName || 'JEAN AUTO VSP', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CONCESSIONNAIRE OFFICIEL VOITURES SANS PERMIS · AIX-LES-BAINS (73)', margin, 18);
  doc.text('Garantie Révision Atelier · Vente au comptant et en plusieurs fois', margin, 23);

  // Top Right Header Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DOCUMENT COMPTABLE OFFICIEL', pageWidth - margin, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Tél : ${commercialSettings.phone || '+33 2 59 50 89 31'}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Email : ${commercialSettings.email || 'amautosanspermis@gmail.com'}`, pageWidth - margin, 23, { align: 'right' });

  let y = 38;

  // 2. Document Title & Numbers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(`FACTURE N° ${order.orderNumber}`, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`Date d'émission : ${formatDate(order.createdAt)}`, margin, y + 6);
  doc.text(`Réf. commande : ${order.id}`, margin, y + 11);

  // Status Stamp / Badge
  const isPaidFull = order.paymentOption === 'full' && order.amountPaid >= order.vehiclePrice;
  doc.setFillColor(isPaidFull ? accentGreen[0] : 217, isPaidFull ? accentGreen[1] : 119, isPaidFull ? accentGreen[2] : 6);
  doc.roundedRect(pageWidth - margin - 58, y - 6, 58, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    isPaidFull ? 'ACQUITTÉE AU COMPTANT' : 'ACOMPTE DE 150 € ENREGISTRÉ',
    pageWidth - margin - 29,
    y + 4,
    { align: 'center' }
  );

  y += 20;

  // 3. Dual Columns: Emetteur (Garage) & Destinataire (Client)
  const colWidth = (contentWidth - 8) / 2;

  // Emetteur (Garage)
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Émetteur :', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(commercialSettings.companyName || 'JEAN AUTO VSP', margin + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text(commercialSettings.address || '11 Avenue du Grand Port', margin + 4, y + 17);
  doc.text(`${commercialSettings.postalCode || '73100'} ${commercialSettings.city || 'Aix-les-Bains'}`, margin + 4, y + 22);
  doc.text('SIRET : 842 190 412 00018 · N° TVA : FR 48 842190412', margin + 4, y + 27);
  doc.text(`Tél : ${commercialSettings.phone} · WhatsApp : ${commercialSettings.whatsapp}`, margin + 4, y + 32);

  // Destinataire (Client)
  const clientX = margin + colWidth + 8;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(clientX, y, colWidth, 38, 2, 2, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Facturé à (Client) :', clientX + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`${order.customer.firstName} ${order.customer.lastName}`, clientX + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(order.customer.address || 'Adresse renseignée à la commande', clientX + 4, y + 17);
  doc.text(`${order.customer.postalCode || ''} ${order.customer.city || ''}`, clientX + 4, y + 22);
  doc.text(`Téléphone : ${order.customer.phone || 'Non renseigné'}`, clientX + 4, y + 27);
  doc.text(`Email : ${order.customer.email || 'Non renseigné'}`, clientX + 4, y + 32);

  y += 44;

  // 4. Vehicle Details Table
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DÉSIGNATION DU VÉHICULE & PRESTATIONS', margin + 3, y + 4.8);
  doc.text('MODALITÉ', margin + 115, y + 4.8);
  doc.text('MONTANT TOTAL', pageWidth - margin - 3, y + 4.8, { align: 'right' });

  y += 7;

  // Row 1: The Vehicle
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Voiture sans permis : ${order.vehicleName}`, margin + 3, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`• Révision complète atelier en 100 points de contrôle certifiée`, margin + 3, y + 11);
  doc.text(`• Garantie mécanique pièce et main d'oeuvre incluse (12 mois)`, margin + 3, y + 15);
  doc.text(`• Préparation esthétique et mise à disposition sécurisée`, margin + 3, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text(
    order.paymentOption === 'installment' ? 'Achat en plusieurs fois' : 'Paiement au comptant',
    margin + 115,
    y + 6
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text(formatPrice(order.vehiclePrice), pageWidth - margin - 3, y + 6, { align: 'right' });

  y += 28;

  // 5. Financial Summary Breakdown Card
  const summaryWidth = 90;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(summaryX, y, summaryWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text('Prix total du véhicule TTC :', summaryX + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text(formatPrice(order.vehiclePrice), pageWidth - margin - 4, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Acompte versé / Montant acquitté :', summaryX + 4, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentGreen);
  doc.text(`- ${formatPrice(order.amountPaid)}`, pageWidth - margin - 4, y + 14, { align: 'right' });

  doc.setDrawColor(...borderGray);
  doc.line(summaryX + 4, y + 19, pageWidth - margin - 4, y + 19);

  const remaining = Math.max(0, order.vehiclePrice - order.amountPaid);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('Reste à régler à la livraison :', summaryX + 4, y + 26);
  doc.text(formatPrice(remaining), pageWidth - margin - 4, y + 26, { align: 'right' });

  // Bank Coordinates or Card Authorization Box on the left side
  const bankBoxWidth = contentWidth - summaryWidth - 6;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, bankBoxWidth, 34, 2, 2, 'FD');

  if (order.paymentMethod === 'card') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accentGreen);
    doc.text('PRÉLÈVEMENT CARTE BANCAIRE (3D SECURE)', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.text(`Titulaire : ${order.cardDetails?.cardHolder || (order.customer.firstName + ' ' + order.customer.lastName)}`, margin + 4, y + 12);
    doc.text(`Carte : ${order.cardDetails?.cardBrand?.toUpperCase() || 'CB'} ${order.cardDetails?.cardNumberMasked || ('•••• ' + (order.cardDetails?.cardLast4 || '****'))}`, margin + 4, y + 17);
    doc.text(`Autorisation N° : ${order.cardDetails?.authorizationId || 'AUTH-CB-DIRECT'}`, margin + 4, y + 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentGreen);
    doc.text(`Prélèvement immédiat de ${formatPrice(order.amountPaid)} validé`, margin + 4, y + 28);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text('COORDONNÉES BANCAIRES POUR LE VIREMENT', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.text(`Bénéficiaire : ${order.bankDetailsUsed?.accountHolder || commercialSettings.accountHolder}`, margin + 4, y + 12);
    doc.text(`IBAN : ${order.bankDetailsUsed?.iban || commercialSettings.iban}`, margin + 4, y + 17);
    doc.text(`BIC : ${order.bankDetailsUsed?.bic || commercialSettings.bic}`, margin + 4, y + 22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Référence : ${order.bankDetailsUsed?.mandatoryReference || order.customer.lastName}`, margin + 4, y + 28);
  }

  y += 40;

  // 6. Delivery Mode & Address
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text('MODALITÉ DE RÉCEPTION & RETRAIT :', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(
    `Retrait possible directement à notre concession : ${commercialSettings.address}, ${commercialSettings.postalCode} ${commercialSettings.city}`,
    margin + 4,
    y + 10.5
  );
  doc.text(
    `OU livraison sécurisée à l'adresse de l'acquéreur : ${order.customer.address}, ${order.customer.postalCode} ${order.customer.city}`,
    margin + 4,
    y + 15
  );

  y += 24;

  // 7. Signature & Cachet Box
  const sigWidth = (contentWidth - 8) / 2;
  const boxHeight = 30;

  // Box 1: Signature Client
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, sigWidth, boxHeight, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('Signature de l\'acquéreur :', margin + 3, y + 5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('(Mention manuscrite "Bon pour accord")', margin + 3, y + 9);
  doc.text('Date & signature :', margin + 3, y + 25);

  // Box 2: Cachet Garage / Concessionnaire officiel
  const box2X = margin + sigWidth + 8;
  doc.roundedRect(box2X, y, sigWidth, boxHeight, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text(`Pour ${commercialSettings.companyName || 'JEAN AUTO VSP'} :`, box2X + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryColor);
  doc.text('Cachet officiel de la concession & Visa', box2X + 3, y + 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkColor);
  doc.text('Visa commercial & conformité', box2X + 3, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('Règlement validé', box2X + 3, y + 22);
  doc.text(`Aix-les-Bains, le ${formatDate(order.createdAt)}`, box2X + 3, y + 26);

  // Intégration du cachet officiel circulaire Jean Auto VSP (transparent & net)
  const stampDataUrl = getDealershipStampDataUrl();
  if (stampDataUrl) {
    try {
      doc.addImage(stampDataUrl, 'PNG', box2X + sigWidth - 30, y + 1.5, 27, 27);
    } catch (stampErr) {
      console.warn("Could not insert stamp into invoice PDF:", stampErr);
    }
  }

  // 8. Bottom Legal Notice Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text(
    'TVA sur marge conformément aux dispositions de l’article 297 A du CGI (véhicules d’occasion). Véhicule garanti avec certificat de non-gage.',
    pageWidth / 2,
    285,
    { align: 'center' }
  );
  doc.text(
    `JEAN AUTO VSP · 11 Avenue du Grand Port, 73100 Aix-les-Bains · Tél : ${commercialSettings.phone} · Facture générée automatiquement`,
    pageWidth / 2,
    289,
    { align: 'center' }
  );

  // Trigger download
  doc.save(`Facture_JEAN_AUTO_VSP_${order.orderNumber}.pdf`);
}

/**
 * Generates and triggers download of the official Delivery Note (Bon de livraison) in PDF format
 */
export function generateDeliveryNotePdf(
  order: VehicleOrder,
  commercialSettings: CommercialBankSettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor: [number, number, number] = [15, 118, 110]; // Teal / Emerald (#0F766E)
  const darkColor: [number, number, number] = [30, 41, 59]; // Slate-800
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate-50
  const borderGray: [number, number, number] = [226, 232, 240]; // Slate-200
  const accentBlue: [number, number, number] = [30, 58, 138];

  // 1. Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(commercialSettings.companyName || 'JEAN AUTO VSP', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('ATELIER DE PRÉPARATION & LIVRAISON VÉHICULES SANS PERMIS', margin, 18);
  doc.text('11 Avenue du Grand Port, 73100 Aix-les-Bains', margin, 23);

  // Right Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BON DE LIVRAISON & RÉCEPTION', pageWidth - margin, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Tél atelier : ${commercialSettings.phone || '+33 2 59 50 89 31'}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`WhatsApp : ${commercialSettings.whatsapp || '+33 6 37 38 55 90'}`, pageWidth - margin, 23, { align: 'right' });

  let y = 38;

  // 2. Title & Delivery Reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(`BON DE LIVRAISON N° BL-${order.orderNumber}`, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`Date d'émission : ${formatDate(order.createdAt)}`, margin, y + 6);
  doc.text(`Rattaché à la commande N° : ${order.orderNumber}`, margin, y + 11);

  // Status Stamp
  doc.setFillColor(...primaryColor);
  doc.roundedRect(pageWidth - margin - 60, y - 6, 60, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PRÊT POUR MISE EN MAIN', pageWidth - margin - 30, y + 4, { align: 'center' });

  y += 20;

  // 3. Client & Garage Recipient Block
  const colWidth = (contentWidth - 8) / 2;

  // Client / Destinataire
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, colWidth, 36, 2, 2, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Destinataire / Réceptionnaire :', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${order.customer.firstName} ${order.customer.lastName}`, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Adresse : ${order.customer.address}`, margin + 4, y + 17);
  doc.text(`${order.customer.postalCode} ${order.customer.city}`, margin + 4, y + 22);
  doc.text(`Téléphone : ${order.customer.phone}`, margin + 4, y + 27);
  doc.text(`Email : ${order.customer.email}`, margin + 4, y + 32);

  // Lieu de livraison
  const rightColX = margin + colWidth + 8;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(rightColX, y, colWidth, 36, 2, 2, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Lieu et modalité de livraison :', rightColX + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentBlue);
  doc.text('Option 1 : Retrait à la concession (Gratuit)', rightColX + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text(`11 Avenue du Grand Port, 73100 Aix-les-Bains`, rightColX + 4, y + 17);
  doc.text(`Horaires : ${commercialSettings.openingHours || 'Du Lundi au Samedi : 08h30 - 19h00'}`, rightColX + 4, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Option 2 : Livraison directe à domicile', rightColX + 4, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text(`Livraison sécurisée avec prise de rendez-vous préalable`, rightColX + 4, y + 33);

  y += 42;

  // 4. Vehicle Identification Card
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('FICHE D\'IDENTIFICATION DU VÉHICULE LIVRÉ', margin + 3, y + 4.8);

  y += 7;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.rect(margin, y, contentWidth, 22, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(order.vehicleName, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text(`Identifiant interne : ${order.vehicleId}`, margin + 4, y + 12);
  doc.text(`Contrôle technique 100 points : Validé sans réserve`, margin + 4, y + 17);

  doc.text(`Prix catalogue : ${formatPrice(order.vehiclePrice)}`, margin + 105, y + 6);
  doc.text(`Règlement : ${order.paymentMethod === 'card' ? 'Carte Bancaire (Débité)' : 'Virement bancaire'}`, margin + 105, y + 11);
  doc.text(`Montant acquitté : ${formatPrice(order.amountPaid)}`, margin + 105, y + 16);
  doc.text(`Solde à la remise des clés : ${formatPrice(Math.max(0, order.vehiclePrice - order.amountPaid))}`, margin + 105, y + 21);

  y += 28;

  // 5. Checklist & Inspection Points (Remise des clés et documents)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('CONTRÔLE ET REMISE DES ÉLÉMENTS OBLIGATOIRES (CHECKLIST) :', margin, y);

  y += 4;

  const checklistItems = [
    { label: 'Double des clés d\'origine du véhicule', desc: 'Clé principale + double fonctionnel' },
    { label: 'Certificat d\'immatriculation / Carte grise provisoire', desc: 'Dossier administratif complet à jour' },
    { label: 'Certificat de non-gage administratif', desc: 'Véhicule libre de tout gage ou opposition' },
    { label: 'Carnet d\'entretien et historique des révisions', desc: 'Factures et carnet tamponné' },
    { label: 'Contrôle technique atelier 100 points validé', desc: 'Freinage, pneus, éclairage, batterie, variateur vérifiés' },
    { label: 'Kit de sécurité réglementaire à bord', desc: 'Gilet rétro-réfléchissant et triangle de signalisation' },
    { label: 'Notice d\'utilisation constructeur', desc: 'Manuel de bord et guide des commandes' },
    { label: 'Certificat de garantie mécanique active (12 mois)', desc: 'Couverture pièces et main-d’œuvre' },
    { label: 'Prise en main et explications de conduite', desc: 'Démarrage, variateur avant/arrière, plein de carburant/charge' },
  ];

  const checkColWidth = contentWidth / 2;
  checklistItems.forEach((item, index) => {
    const isColRight = index >= 5;
    const itemX = isColRight ? margin + checkColWidth : margin;
    const itemY = y + (index % 5) * 8.5;

    // Drawn checkbox
    doc.setDrawColor(...primaryColor);
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.rect(itemX, itemY, 4.5, 4.5, 'FD');
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('✓', itemX + 0.8, itemY + 3.5);

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.text(item.label, itemX + 6.5, itemY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...grayColor);
    doc.text(item.desc, itemX + 6.5, itemY + 6.5);
  });

  y += 46;

  // 6. Discharge and Reception Declaration
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('DÉCLARATION DE RÉCEPTION ET CONFORMITÉ :', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text(
    'Le client soussigné déclare avoir pris possession ce jour du véhicule ci-dessus désigné, révisé et nettoyé, conforme en tous points à la commande,',
    margin + 3,
    y + 9.5
  );
  doc.text(
    'et avoir reçu l\'ensemble des documents de bord, clés et accessoires obligatoires.',
    margin + 3,
    y + 13.5
  );

  y += 22;

  // 7. Dual Signature Boxes
  const sigWidth = (contentWidth - 8) / 2;

  // Box 1: Signature Client
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, y, sigWidth, 32, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text('Pour le Client réceptionnaire :', margin + 3, y + 6);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('Mention manuscrite "Bon pour réception et conformité" :', margin + 3, y + 11);
  doc.text('Date et signature :', margin + 3, y + 27);

  // Box 2: Signature Garage & Visa Atelier
  const box2X = margin + sigWidth + 8;
  doc.roundedRect(box2X, y, sigWidth, 32, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text(`Pour ${commercialSettings.companyName || 'JEAN AUTO VSP'} :`, box2X + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryColor);
  doc.text('Le Responsable de livraison & Atelier', box2X + 3, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkColor);
  doc.text('Visa départ atelier & remise des clés :', box2X + 3, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('Contrôle qualité & essai validés', box2X + 3, y + 23);
  doc.text(`Aix-les-Bains, le ${formatDate(order.createdAt)}`, box2X + 3, y + 28);

  // Intégration du cachet officiel circulaire Jean Auto VSP (transparent & net)
  const stampDataUrl = getDealershipStampDataUrl();
  if (stampDataUrl) {
    try {
      doc.addImage(stampDataUrl, 'PNG', box2X + sigWidth - 31, y + 2, 28, 28);
    } catch (stampErr) {
      console.warn("Could not insert stamp into delivery note PDF:", stampErr);
    }
  }

  // 8. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text(
    `JEAN AUTO VSP · 11 Avenue du Grand Port, 73100 Aix-les-Bains · Tél : ${commercialSettings.phone} · Bon de livraison officiel`,
    pageWidth / 2,
    289,
    { align: 'center' }
  );

  // Trigger download
  doc.save(`Bon_De_Livraison_JEAN_AUTO_VSP_${order.orderNumber}.pdf`);
}
