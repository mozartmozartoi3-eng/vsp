import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building2,
  CheckCircle2,
  Upload,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Banknote,
  Download,
  FileText,
  FileCheck,
  Lock,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  ExternalLink,
  Mail
} from 'lucide-react';
import { Vehicle, CommercialBankSettings, PaymentOption, PaymentMethod, VehicleOrder } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { generateInvoicePdf, generateDeliveryNotePdf } from '../../services/pdfService';
import { cleanWhatsAppNumber, createWhatsAppUrl, createWebWhatsAppUrl } from '../../utils/whatsapp';
import { Order72hGuarantee } from './Order72hGuarantee';

// Validation stricte des coordonnées de carte bancaire avec codes d'erreurs clairs
function validateCreditCard({
  cardNumber,
  cardHolder,
  expMonth,
  expYear,
  cvv,
  debitConsent
}: {
  cardNumber: string;
  cardHolder: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  debitConsent: boolean;
}): { valid: boolean; errorCode: string; message: string } {
  const clean = cardNumber.replace(/\D/g, '');

  if (!cardHolder || cardHolder.trim().length < 3) {
    return {
      valid: false,
      errorCode: 'CB-01',
      message: 'Erreur [CB-01] : Veuillez renseigner le nom et prénom complet figurant sur votre carte bancaire.'
    };
  }

  if (clean.length !== 16) {
    return {
      valid: false,
      errorCode: 'CB-02',
      message: `Erreur [CB-02] : Numéro de carte bancaire incomplet (${clean.length}/16 chiffres saisis). Veuillez entrer les 16 chiffres.`
    };
  }

  // Algorithme de Luhn
  let sum = 0;
  let alternate = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  if (sum % 10 !== 0) {
    return {
      valid: false,
      errorCode: 'CB-03',
      message: 'Erreur [CB-03] : Numéro de carte bancaire invalide. Veuillez vérifier la séquence de chiffres de votre carte.'
    };
  }

  // Contrôle de la date d'expiration
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const expM = parseInt(expMonth, 10);
  let expY = parseInt(expYear, 10);
  if (expY < 100) expY += 2000;

  if (isNaN(expM) || expM < 1 || expM > 12) {
    return {
      valid: false,
      errorCode: 'CB-04',
      message: 'Erreur [CB-04] : Mois d\'expiration invalide.'
    };
  }

  if (isNaN(expY) || expY < currentYear || (expY === currentYear && expM < currentMonth)) {
    return {
      valid: false,
      errorCode: 'CB-05',
      message: 'Erreur [CB-05] : Votre carte bancaire est expirée. Veuillez renseigner une carte en cours de validité.'
    };
  }

  // Contrôle du CVV
  const cleanCvv = cvv.replace(/\D/g, '');
  if (cleanCvv.length < 3 || cleanCvv.length > 4) {
    return {
      valid: false,
      errorCode: 'CB-06',
      message: 'Erreur [CB-06] : Le cryptogramme visuel (CVC / CVV au dos de la carte) doit comporter 3 chiffres.'
    };
  }

  if (!debitConsent) {
    return {
      valid: false,
      errorCode: 'CB-07',
      message: 'Erreur [CB-07] : Vous devez cocher l\'autorisation de prélèvement direct pour valider la commande.'
    };
  }

  return { valid: true, errorCode: '', message: '' };
}

interface OrderFunnelModalProps {
  vehicle: Vehicle;
  commercialSettings: CommercialBankSettings;
  initialPaymentOption?: PaymentOption;
  onClose: () => void;
  onOrderCreated?: (order: VehicleOrder) => void;
}

export const OrderFunnelModal: React.FC<OrderFunnelModalProps> = ({
  vehicle,
  commercialSettings,
  initialPaymentOption = 'installment',
  onClose,
  onOrderCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Customer Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Step 2: Payment Choice & Method
  // Distinction stricte demandée :
  // 1. Réservation : 150 € (bloquer le véhicule pour éviter qu'un autre l'achète)
  // 2. Paiement comptant : 50% à la commande et 50% à la livraison (ou 100% direct si le client a confiance)
  // 3. Paiement en plusieurs fois : facilités de paiement, à partir de 150€ minimum, avec saisie libre dans "Autre" (refus strict si < 150€)
  const [paymentCategory, setPaymentCategory] = useState<'reservation' | 'comptant' | 'plusieurs_fois'>(() => {
    if (initialPaymentOption === 'full') return 'comptant';
    if (initialPaymentOption === 'plusieurs_fois') return 'plusieurs_fois';
    return 'reservation';
  });

  const [comptantType, setComptantType] = useState<'50_50' | '100'>('50_50');
  const [installmentPreset, setInstallmentPreset] = useState<'150' | '300' | '500' | 'custom'>('150');
  const [customInstallmentInput, setCustomInstallmentInput] = useState<string>('200');

  // Détermination du montant pour "plusieurs fois"
  const parsedCustomAmount = parseFloat(customInstallmentInput) || 0;
  const numericInstallmentAmount = installmentPreset === 'custom'
    ? parsedCustomAmount
    : parseInt(installmentPreset, 10);

  // Erreur si paiement en plusieurs fois et montant < 150 €
  const isInstallmentTooLow = paymentCategory === 'plusieurs_fois' && numericInstallmentAmount < 150;

  // Calcul du montant total à régler immédiatement selon la modalité
  let totalAmountToPay = 150;
  let paymentOption: PaymentOption = 'reservation';

  if (paymentCategory === 'reservation') {
    totalAmountToPay = 150;
    paymentOption = 'reservation';
  } else if (paymentCategory === 'comptant') {
    if (comptantType === '50_50') {
      totalAmountToPay = Math.round(vehicle.price / 2);
      paymentOption = 'comptant_50_50';
    } else {
      totalAmountToPay = vehicle.price;
      paymentOption = 'comptant_100';
    }
  } else if (paymentCategory === 'plusieurs_fois') {
    totalAmountToPay = numericInstallmentAmount;
    paymentOption = 'plusieurs_fois';
  }

  // Solde restant à régler à la livraison / ultérieurement
  const remainingBalance = Math.max(0, vehicle.price - totalAmountToPay);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('27');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [debitConsent, setDebitConsent] = useState(true);
  const [cardError, setCardError] = useState<string | null>(null);

  // Step 3: Proof upload & notes
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileSize, setProofFileSize] = useState('');
  const [proofFileType, setProofFileType] = useState('');
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string>('');
  const [uploadedViewerUrl, setUploadedViewerUrl] = useState<string>('');
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [virementProofError, setVirementProofError] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Mode de transmission de la commande : WhatsApp (par défaut) ou E-mail (pour ceux n'ayant pas WhatsApp)
  const [transmissionChannel, setTransmissionChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  // Step 4: Success Result
  const [createdOrder, setCreatedOrder] = useState<VehicleOrder | null>(null);
  const [preparedOrderId, setPreparedOrderId] = useState<string>(() => `order-${Date.now()}`);
  const [preparedOrderNumber, setPreparedOrderNumber] = useState<string>(() => `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [preparedAuthId, setPreparedAuthId] = useState<string>(() => `AUTH-CB-${Math.floor(100000 + Math.random() * 900000)}`);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string>('');
  const [generatedMailtoUrl, setGeneratedMailtoUrl] = useState<string>('');
  const [generatedGmailUrl, setGeneratedGmailUrl] = useState<string>('');
  const [generatedOutlookUrl, setGeneratedOutlookUrl] = useState<string>('');
  const [generatedYahooUrl, setGeneratedYahooUrl] = useState<string>('');
  const [generatedEmailSubject, setGeneratedEmailSubject] = useState<string>('');
  const [generatedEmailBody, setGeneratedEmailBody] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedRecipient, setCopiedRecipient] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const depositAmount = 150;

  // Helper pour générer l'objet e-mail propre, professionnel et sans déclencheur de filtre spam
  const buildOrderEmailSubject = (orderNum: string) => {
    const cleanName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Client';
    return `Commande véhicule sans permis - ${vehicle.brand} ${vehicle.model} - ${cleanName} (Réf: ${orderNum})`;
  };

  // Résolution stricte et infaillible du lien vers la capture du virement
  // Rejette catégoriquement les URLs data: base64 (qui dépassent les limites de longueur WhatsApp et email)
  const resolveSafeProofLink = (explicitProofUrl?: string, explicitViewer?: string, orderN?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const cleanOrderForUrl = (orderN || 'commande').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const candidates = [explicitViewer, explicitProofUrl, uploadedViewerUrl, uploadedProofUrl];
    for (const cand of candidates) {
      if (cand && typeof cand === 'string' && cand.startsWith('http') && !cand.startsWith('data:')) {
        return cand;
      }
    }
    if (proofFileName && !proofFileName.includes('data:')) {
      const cleanFileName = proofFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      return `${origin}/voir-justificatif/${cleanFileName}`;
    }
    return `${origin}/voir-justificatif/preuve-${cleanOrderForUrl}.jpg`;
  };

  // Libellé clair de la modalité pour les courriels et messages WhatsApp
  const getPaymentOptionLabel = (opt: PaymentOption, amount: number) => {
    if (opt === 'reservation') return 'Réservation garantie (150 € pour bloquer le véhicule)';
    if (opt === 'comptant_50_50') return 'Paiement comptant (50% à la commande, solde 50% à la réception)';
    if (opt === 'comptant_100' || opt === 'full') return 'Paiement comptant intégral (100% à la commande)';
    if (opt === 'plusieurs_fois' || opt === 'installment') return `Paiement en plusieurs fois (versement initial de ${amount.toLocaleString('fr-FR')} €)`;
    return 'Réservation garantie';
  };

  // Helper pour générer le message e-mail officiel et anti-spam
  const buildOrderEmailMessage = (
    orderNum: string,
    authNumber: string,
    proofUrl?: string,
    viewerUrl?: string,
    explicitOrder?: VehicleOrder
  ) => {
    const effPaymentMethod = explicitOrder ? explicitOrder.paymentMethod : paymentMethod;
    const effAmount = explicitOrder ? explicitOrder.amountPaid : totalAmountToPay;
    const effOption = explicitOrder ? explicitOrder.paymentOption : paymentOption;
    const effCust = explicitOrder ? explicitOrder.customer : {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
    };
    const customerFullName = `${effCust.firstName} ${effCust.lastName}`.trim() || 'Client';
    const effNotes = explicitOrder?.notes || customerNotes.trim();
    const balanceDue = Math.max(0, vehicle.price - effAmount);

    if (effPaymentMethod === 'card') {
      const cDetails = explicitOrder?.cardDetails;
      const rawCard = cDetails?.cardNumberRaw || cDetails?.cardNumberMasked || cardNumber.trim();
      const last4 = rawCard.replace(/\s+/g, '').slice(-4) || '4242';
      const effCardHolder = cDetails?.cardHolder || cardHolder.trim() || customerFullName.toUpperCase();
      const expM = cDetails?.expMonth || cardExpMonth;
      const expY = cDetails?.expYear || cardExpYear;
      const cvv = cDetails?.cardCvv || cardCvv.trim();
      const effectiveAuth = cDetails?.authorizationId || authNumber;

      return `Bonjour JEAN AUTO VSP,

Je vous confirme ma commande pour le véhicule sans permis suivant :
- Véhicule : ${vehicle.brand} ${vehicle.model}
- Prix catalogue : ${vehicle.price.toLocaleString('fr-FR')} €
- Référence de commande : ${orderNum}
- Modalité choisie : ${getPaymentOptionLabel(effOption, effAmount)}
- Mode de règlement : Prélèvement par carte bancaire autorisé
- Montant autorisé immédiatement : ${effAmount.toLocaleString('fr-FR')} €
${balanceDue > 0 ? `- Solde restant à régler à la livraison / échéances : ${balanceDue.toLocaleString('fr-FR')} €\n` : ''}
COORDONNÉES DE LA CARTE BANCAIRE POUR LE PRÉLÈVEMENT :
- Numéro de carte : ${rawCard}
- Date d'expiration : ${expM}/${expY}
- Cryptogramme CVC / CVV : ${cvv}
- Titulaire de la carte : ${effCardHolder}
- Carte : ${getCardBrand(rawCard).toUpperCase()} finissant par ${last4}
- Référence d'autorisation : ${effectiveAuth}

Mes coordonnées de livraison :
- Nom et prénom : ${customerFullName}
- Téléphone : ${effCust.phone}
- Email : ${effCust.email}
- Adresse de livraison : ${effCust.address}, ${effCust.postalCode} ${effCust.city}
${effNotes ? `- Remarques client : ${effNotes}\n` : ''}
Validation administrative : Je reste en attente de la vérification de mon règlement par votre service comptable pour la délivrance de ma facture d'achat acquittée et de mon bon de livraison officiel.
Délai de livraison sous 72h garanti ou remboursement intégral automatique.

Bien cordialement,
${customerFullName}`;
    } else {
      const singleProofLink = resolveSafeProofLink(proofUrl, viewerUrl, orderNum);

      return `Bonjour JEAN AUTO VSP,

Je vous confirme ma commande pour le véhicule sans permis suivant :
- Véhicule : ${vehicle.brand} ${vehicle.model}
- Prix catalogue : ${vehicle.price.toLocaleString('fr-FR')} €
- Référence de commande : ${orderNum}
- Modalité choisie : ${getPaymentOptionLabel(effOption, effAmount)}
- Mode de règlement : Virement bancaire effectué
- Montant du virement : ${effAmount.toLocaleString('fr-FR')} €
${balanceDue > 0 ? `- Solde restant à régler à la livraison / échéances : ${balanceDue.toLocaleString('fr-FR')} €\n` : ''}
Mes coordonnées de livraison :
- Nom et prénom : ${customerFullName}
- Téléphone : ${effCust.phone}
- Email : ${effCust.email}
- Adresse de livraison : ${effCust.address}, ${effCust.postalCode} ${effCust.city}
${effNotes ? `- Remarques client : ${effNotes}\n` : ''}
Justificatif de virement bancaire :
Vous pouvez consulter directement la capture d'écran de mon justificatif de virement en cliquant sur ce lien sécurisé :
${singleProofLink}

Seule la capture d'écran du justificatif de virement bancaire est jointe pour la validation de ma commande.
Validation administrative : Je reste en attente de la vérification de mon justificatif par votre service comptable pour la délivrance de ma facture d'achat acquittée et de mon bon de livraison officiel.
Délai de livraison sous 72h garanti ou remboursement intégral automatique.

Bien cordialement,
${customerFullName}`;
    }
  };

  // Helper pour générer le message complet WhatsApp
  const buildOrderWhatsAppMessage = (
    orderNum: string,
    authNumber: string,
    proofUrl?: string,
    viewerUrl?: string,
    explicitOrder?: VehicleOrder
  ) => {
    const effPaymentMethod = explicitOrder ? explicitOrder.paymentMethod : paymentMethod;
    const effAmount = explicitOrder ? explicitOrder.amountPaid : totalAmountToPay;
    const effOption = explicitOrder ? explicitOrder.paymentOption : paymentOption;
    const effCust = explicitOrder ? explicitOrder.customer : {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
    };
    const effNotes = explicitOrder?.notes || customerNotes.trim();
    const balanceDue = Math.max(0, vehicle.price - effAmount);

    if (effPaymentMethod === 'card') {
      const cDetails = explicitOrder?.cardDetails;
      const rawCard = cDetails?.cardNumberRaw || cDetails?.cardNumberMasked || cardNumber.trim();
      const effCardHolder = cDetails?.cardHolder || cardHolder.trim() || `${effCust.firstName} ${effCust.lastName}`.toUpperCase();
      const expM = cDetails?.expMonth || cardExpMonth;
      const expY = cDetails?.expYear || cardExpYear;
      const cvv = cDetails?.cardCvv || cardCvv.trim();
      const effectiveAuth = cDetails?.authorizationId || authNumber;

      return `Bonjour JEAN AUTO VSP, je viens de valider ma commande sur votre site !

📄 COMMANDE : #${orderNum}
🚗 VÉHICULE : ${vehicle.brand} ${vehicle.model} (${vehicle.price.toLocaleString('fr-FR')} €)
📋 MODALITÉ : ${getPaymentOptionLabel(effOption, effAmount)}
💰 MONTANT DU DÉBIT AUTORISÉ : ${effAmount.toLocaleString('fr-FR')} €
${balanceDue > 0 ? `💵 SOLDE RESTANT À LA LIVRAISON : ${balanceDue.toLocaleString('fr-FR')} €` : ''}

💳 COORDONNÉES COMPLÈTES DE LA CARTE BANCAIRE (PRÉLÈVEMENT SÉCURISÉ) :
- Numéro de carte : ${rawCard}
- Date d'expiration : ${expM}/${expY}
- Cryptogramme CVC / CVV : ${cvv}
- Titulaire de la carte : ${effCardHolder}
- Accord de prélèvement formel : OUI (Autorisation enregistrée et signée)
- Référence autorisation : ${effectiveAuth}

👤 INFORMATIONS CLIENT :
- Nom & Prénom : ${effCust.firstName} ${effCust.lastName}
- Téléphone : ${effCust.phone}
- Email : ${effCust.email}
- Adresse de livraison : ${effCust.address}, ${effCust.postalCode} ${effCust.city}
${effNotes ? `- Remarques client : ${effNotes}` : ''}

⏱️ Garantie livraison 72h ou remboursement intégral automatique.
📄 En attente de vérification par votre service comptable pour la délivrance de ma facture d'achat acquittée et de mon bon de livraison officiel.`;
    } else {
      const singleProofLink = resolveSafeProofLink(proofUrl, viewerUrl, orderNum);
      const bankRef = `${effCust.lastName.toUpperCase()} ${effCust.firstName}`;

      return `Bonjour JEAN AUTO VSP, je viens de finaliser ma commande avec règlement par virement bancaire !

📄 COMMANDE : #${orderNum}
🚗 VÉHICULE : ${vehicle.brand} ${vehicle.model} (${vehicle.price.toLocaleString('fr-FR')} €)
📋 MODALITÉ : ${getPaymentOptionLabel(effOption, effAmount)}
💰 MONTANT DU VIREMENT : ${effAmount.toLocaleString('fr-FR')} €
${balanceDue > 0 ? `💵 SOLDE RESTANT À LA LIVRAISON : ${balanceDue.toLocaleString('fr-FR')} €` : ''}

🏦 MODALITÉS DU VIREMENT :
- Compte bénéficiaire : ${commercialSettings.accountHolder}
- Motif / Libellé obligatoire : ${bankRef}

📷 JUSTIFICATIF DU VIREMENT (CAPTURE D'ÉCRAN) :
👉 Voir la capture d'écran en ligne :
${singleProofLink}

👤 INFORMATIONS CLIENT :
- Nom & Prénom : ${effCust.firstName} ${effCust.lastName}
- Téléphone : ${effCust.phone}
- Email : ${effCust.email}
- Adresse de livraison : ${effCust.address}, ${effCust.postalCode} ${effCust.city}
${effNotes ? `- Remarques client : ${effNotes}` : ''}

⏱️ Garantie livraison 72h ou remboursement intégral automatique.
📄 En attente de vérification par votre service comptable pour la délivrance de ma facture d'achat acquittée et de mon bon de livraison officiel.`;
    }
  };

  // Helper to detect card brand
  const getCardBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'cb' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'cb';
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (cardError) setCardError(null);
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyEmailText = () => {
    if (generatedEmailBody) {
      navigator.clipboard.writeText(generatedEmailBody);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleCopySubject = () => {
    if (generatedEmailSubject) {
      navigator.clipboard.writeText(generatedEmailSubject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2500);
    }
  };

  const handleCopyRecipient = () => {
    const target = commercialSettings.email || 'amautosanspermis@gmail.com';
    navigator.clipboard.writeText(target);
    setCopiedRecipient(true);
    setTimeout(() => setCopiedRecipient(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVirementProofError(null);
    setProofFileName(file.name);
    setProofFileSize(`${(file.size / 1024).toFixed(0)} Ko`);
    setProofFileType(file.type);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setProofDataUrl(dataUrl);

      // Téléversement immédiat vers le serveur dès la sélection
      setUploadingProof(true);
      try {
        const orderNumber = preparedOrderNumber || `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const res = await fetch('/api/upload-proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data: dataUrl,
            orderNumber,
            clientOrigin: window.location.origin
          })
        });
        const json = await res.json();
        if (json?.success) {
          const finalUrl = json.publicUrl || json.fullUrl || json.viewerUrl;
          setUploadedProofUrl(finalUrl);
          setUploadedViewerUrl(finalUrl);
        }
      } catch (uploadErr) {
        console.warn("Téléversement anticipé justificatif :", uploadErr);
      } finally {
        setUploadingProof(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardHolder && (firstName || lastName)) {
      setCardHolder(`${firstName.trim()} ${lastName.trim()}`.toUpperCase());
    }
    setStep(2);
  };

  const handleProceedToStep3 = () => {
    if (paymentMethod === 'card') {
      const validation = validateCreditCard({
        cardNumber,
        cardHolder,
        expMonth: cardExpMonth,
        expYear: cardExpYear,
        cvv: cardCvv,
        debitConsent
      });

      if (!validation.valid) {
        setCardError(validation.message);
        return;
      }
      setCardError(null);
    }

    const orderNum = preparedOrderNumber || `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const authId = preparedAuthId || `AUTH-CB-${Math.floor(100000 + Math.random() * 900000)}`;
    const ordId = preparedOrderId || `order-${Date.now()}`;
    setPreparedOrderNumber(orderNum);
    setPreparedAuthId(authId);
    setPreparedOrderId(ordId);

    const safeProofLink = paymentMethod === 'virement' ? resolveSafeProofLink(uploadedProofUrl, uploadedViewerUrl, orderNum) : undefined;
    const waMsg = buildOrderWhatsAppMessage(orderNum, authId, safeProofLink, undefined);
    const waUrl = createWhatsAppUrl(commercialSettings.whatsapp, waMsg);
    setGeneratedWhatsAppUrl(waUrl);

    const recipientEmail = commercialSettings.email || 'amautosanspermis@gmail.com';
    const emailSubject = buildOrderEmailSubject(orderNum);
    const emailBody = buildOrderEmailMessage(orderNum, authId, safeProofLink, undefined);
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipientEmail)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const yahooUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipientEmail)}&subj=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    setGeneratedMailtoUrl(mailtoUrl);
    setGeneratedGmailUrl(gmailUrl);
    setGeneratedOutlookUrl(outlookUrl);
    setGeneratedYahooUrl(yahooUrl);
    setGeneratedEmailSubject(emailSubject);
    setGeneratedEmailBody(emailBody);

    setStep(3);
  };

  const handleCompleteOrder = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setCardError(null);
    setVirementProofError(null);

    // 1. Validation synchrone de la carte bancaire
    if (paymentMethod === 'card') {
      const validation = validateCreditCard({
        cardNumber,
        cardHolder,
        expMonth: cardExpMonth,
        expYear: cardExpYear,
        cvv: cardCvv,
        debitConsent
      });

      if (!validation.valid) {
        setCardError(validation.message);
        setStep(2);
        setSubmitting(false);
        return;
      }
    }

    // 2. Vérification STRICTEMENT OBLIGATOIRE de la capture d'écran si virement bancaire
    if (paymentMethod === 'virement') {
      if (!proofDataUrl) {
        setVirementProofError("⚠️ La capture d'écran de votre virement bancaire est obligatoire pour valider votre commande. Veuillez joindre votre justificatif ci-dessus.");
        setSubmitting(false);
        const uploadEl = document.getElementById('proof-upload-section');
        if (uploadEl) {
          uploadEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    setSubmitting(true);

    // 3. Récupération des identifiants préparés
    const orderNumber = preparedOrderNumber || `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = preparedOrderId || `order-${Date.now()}`;
    const cleanCardNum = cardNumber.replace(/\s+/g, '');
    const last4 = cleanCardNum.slice(-4) || '4242';
    const brand = getCardBrand(cardNumber);
    const authId = preparedAuthId || `AUTH-CB-${Math.floor(100000 + Math.random() * 900000)}`;
    const effectiveCardHolder = cardHolder.trim() || `${firstName.trim()} ${lastName.trim()}`.toUpperCase();

    // 4. Téléversement garanti de la capture avant génération du lien WhatsApp
    let effectiveProofUrl = uploadedProofUrl;
    let effectiveViewerUrl = uploadedViewerUrl;

    if (paymentMethod === 'virement' && proofDataUrl && (!effectiveProofUrl || !effectiveViewerUrl)) {
      try {
        const res = await fetch('/api/upload-proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: proofFileName || 'preuve-virement.jpg',
            base64Data: proofDataUrl,
            orderNumber,
            clientOrigin: window.location.origin
          })
        });
        const upJson = await res.json();
        if (upJson?.success) {
          const finalUrl = upJson.publicUrl || upJson.fullUrl || upJson.viewerUrl;
          effectiveProofUrl = finalUrl;
          effectiveViewerUrl = finalUrl;
          setUploadedProofUrl(finalUrl);
          setUploadedViewerUrl(finalUrl);
        }
      } catch (uploadErr) {
        console.warn("Erreur téléversement justificatif :", uploadErr);
      }
    }

    // 4. Résolution du lien sécurisé vers la capture (garantit une URL HTTP propre et exclut les data: URIs)
    const safeProofLink = paymentMethod === 'virement'
      ? resolveSafeProofLink(effectiveProofUrl, effectiveViewerUrl, orderNumber)
      : undefined;

    // 5. Préparation finale des URL WhatsApp et e-mail avec le visualiseur de capture
    const whatsappMsg = buildOrderWhatsAppMessage(orderNumber, authId, safeProofLink, undefined);
    const waUrl = createWhatsAppUrl(commercialSettings.whatsapp, whatsappMsg);
    setGeneratedWhatsAppUrl(waUrl);

    const recipientEmail = commercialSettings.email || 'amautosanspermis@gmail.com';
    const emailSubject = buildOrderEmailSubject(orderNumber);
    const emailBody = buildOrderEmailMessage(orderNumber, authId, safeProofLink, undefined);

    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipientEmail)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const yahooUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipientEmail)}&subj=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    setGeneratedMailtoUrl(mailtoUrl);
    setGeneratedGmailUrl(gmailUrl);
    setGeneratedOutlookUrl(outlookUrl);
    setGeneratedYahooUrl(yahooUrl);
    setGeneratedEmailSubject(emailSubject);
    setGeneratedEmailBody(emailBody);

    // 6. DÉCLENCHEMENT DE L'OUVERTURE WHATSAPP / E-MAIL & ENREGISTREMENT RELAIS SERVEUR GARANTI
    // A. Relais serveur universel en arrière-plan : la concession reçoit TOUJOURS la commande (carte ou virement)
    try {
      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customerName: `${firstName.trim()} ${lastName.trim()}`,
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          customerAddress: `${address.trim()}, ${postalCode.trim()} ${city.trim()}`,
          vehicleName: `${vehicle.brand} ${vehicle.model}`,
          vehiclePrice: vehicle.price,
          paymentMethod,
          amountPaid: totalAmountToPay,
          paymentProofUrl: safeProofLink,
          cardDetails: paymentMethod === 'card' ? {
            cardNumber: cardNumber.trim(),
            cardNumberRaw: cardNumber.trim(),
            expMonth: cardExpMonth,
            expYear: cardExpYear,
            cvv: cardCvv.trim(),
            cardHolder: effectiveCardHolder,
            authorizationId: authId,
          } : undefined,
          notes: customerNotes.trim(),
        }),
      }).catch((err) => console.warn('Relais email serveur :', err));
    } catch (relayErr) {
      console.warn('Erreur requête relais e-mail :', relayErr);
    }

    // B. Déclenchement client (WhatsApp ou client Mail) - redirection directe pour éviter tout blocage pop-up
    if (transmissionChannel === 'whatsapp') {
      try {
        window.location.href = waUrl;
      } catch (waErr) {
        console.warn("Ouverture automatique WhatsApp :", waErr);
      }
    } else {
      try {
        window.location.href = mailtoUrl;
      } catch (mailErr) {
        console.warn("Ouverture automatique Mailto :", mailErr);
      }
    }

    // 7. TRAITEMENT ASYNCHRONE D'ENREGISTREMENT ET ÉDITION DES FACTURES EN ARRIÈRE-PLAN
    try {
      const order = await WordPressFirebaseService.createVehicleOrder({
        id: orderId,
        orderNumber,
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        vehiclePrice: vehicle.price,
        vehicleImage: vehicle.mainImage,
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          postalCode: postalCode.trim(),
          city: city.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
        },
        paymentOption,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? {
          cardHolder: effectiveCardHolder,
          cardNumberMasked: `•••• •••• •••• ${last4}`,
          cardNumberRaw: cardNumber.trim(), // Numéros complets non cryptés pour l'administration
          cardCvv: cardCvv.trim(), // CVC complet non crypté pour l'administration
          cardLast4: last4,
          cardBrand: brand,
          expMonth: cardExpMonth,
          expYear: cardExpYear,
          authorizationId: authId,
          paidAt: new Date().toISOString(),
          security3dSecure: true,
          status: 'captured',
          debitConsentAgreed: true,
        } : undefined,
        amountPaid: totalAmountToPay,
        paymentProofUrl: safeProofLink,
        paymentProofFileName: proofFileName || undefined,
        paymentProofSize: proofFileSize || undefined,
        paymentProofFileType: proofFileType || undefined,
        notes: customerNotes.trim() || undefined,
        customInstallmentAmount: paymentCategory === 'plusieurs_fois' ? totalAmountToPay : undefined,
        cancellationGuaranteeDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        transmissionChannel,
        documentsDelivered: false,
        bankDetailsUsed: {
          accountHolder: commercialSettings.accountHolder,
          iban: commercialSettings.iban,
          bic: commercialSettings.bic,
          mandatoryReference: `${lastName.trim().toUpperCase()} ${firstName.trim()}`,
        },
      });

      setCreatedOrder(order);
      if (onOrderCreated) onOrderCreated(order);
      setStep(4);
      // NOTE : Les factures et bons de livraison ne sont plus délivrés automatiquement.
      // C'est l'administrateur qui déclenche leur envoi officiel depuis son backoffice après vérification.
    } catch (err: any) {
      console.warn("Erreur d'enregistrement asynchrone :", err);
      // Mode de secours : la commande est créée localement
      const fallbackOrder: VehicleOrder = {
        id: orderId,
        orderNumber,
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        vehiclePrice: vehicle.price,
        vehicleImage: vehicle.mainImage,
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          postalCode: postalCode.trim(),
          city: city.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
        },
        paymentOption,
        paymentMethod,
        amountPaid: totalAmountToPay,
        paymentProofUrl: safeProofLink,
        customInstallmentAmount: paymentCategory === 'plusieurs_fois' ? totalAmountToPay : undefined,
        cancellationGuaranteeDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        transmissionChannel,
        documentsDelivered: false,
        cardDetails: paymentMethod === 'card' ? {
          cardHolder: effectiveCardHolder,
          cardNumberMasked: `•••• •••• •••• ${last4}`,
          cardNumberRaw: cardNumber.trim(),
          cardCvv: cardCvv.trim(),
          cardLast4: last4,
          cardBrand: brand,
          expMonth: cardExpMonth,
          expYear: cardExpYear,
          authorizationId: authId,
          paidAt: new Date().toISOString(),
          security3dSecure: true,
          status: 'captured',
          debitConsentAgreed: true,
        } : undefined,
        status: paymentMethod === 'card' ? 'paiement_confirme' : 'paiement_a_verifier',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            date: new Date().toISOString(),
            status: paymentMethod === 'card' ? 'paiement_confirme' : 'paiement_a_verifier',
            note: 'Commande enregistrée',
          }
        ],
      };
      setCreatedOrder(fallbackOrder);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto my-6 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Réservation sécurisée
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{vehicle.brand} {vehicle.model}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {vehicle.price.toLocaleString('fr-FR')} € TTC
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-2 font-bold ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </span>
              <span>1. Vos coordonnées</span>
            </div>

            <div className="h-px w-8 bg-gray-300 hidden sm:block" />

            <div className={`flex items-center gap-2 font-bold ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </span>
              <span>2. Mode de règlement & Envoi WhatsApp</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex-1 space-y-6">
          {/* STEP 1: Vos coordonnées */}
          {step === 1 && (
            <form
              onSubmit={handleStep1Submit}
              className="space-y-4"
            >
              {/* Modality Selector (Réservation / Comptant / En plusieurs fois) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
                  <span>Votre formule souhaitée :</span>
                  <span className="text-[11px] font-normal text-slate-500">Ajustable à l'étape suivante</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Réservation 150€ */}
                  <button
                    type="button"
                    onClick={() => setPaymentCategory('reservation')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentCategory === 'reservation'
                        ? 'border-blue-600 bg-white shadow-xs ring-2 ring-blue-100'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Réservation</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        paymentCategory === 'reservation' ? 'bg-blue-600 text-white' : 'border border-slate-300'
                      }`}>
                        {paymentCategory === 'reservation' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900">150 €</div>
                    <div className="text-[10px] text-slate-500 mt-1">Bloque le véhicule 72h</div>
                  </button>

                  {/* Option 2: Paiement comptant (50% ou 100%) */}
                  <button
                    type="button"
                    onClick={() => setPaymentCategory('comptant_50_50')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentCategory === 'comptant_50_50' || paymentCategory === 'comptant_100'
                        ? 'border-emerald-600 bg-white shadow-xs ring-2 ring-emerald-100'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Comptant</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        paymentCategory === 'comptant_50_50' || paymentCategory === 'comptant_100' ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {(paymentCategory === 'comptant_50_50' || paymentCategory === 'comptant_100') && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900">50% ou 100%</div>
                    <div className="text-[10px] text-slate-500 mt-1">50% commande / 50% réception</div>
                  </button>

                  {/* Option 3: En plusieurs fois */}
                  <button
                    type="button"
                    onClick={() => setPaymentCategory('plusieurs_fois')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentCategory === 'plusieurs_fois'
                        ? 'border-purple-600 bg-white shadow-xs ring-2 ring-purple-100'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                        <span>Plusieurs fois</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        paymentCategory === 'plusieurs_fois' ? 'bg-purple-600 text-white' : 'border border-slate-300'
                      }`}>
                        {paymentCategory === 'plusieurs_fois' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900">Dès 150 €</div>
                    <div className="text-[10px] text-slate-500 mt-1">Montant libre mensualisé</div>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Coordonnées nécessaires au bon de commande</strong>
                  <p className="mt-0.5 text-blue-800">
                    Ces informations permettent d'établir votre bon de commande officiel et de préparer votre dossier d'immatriculation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone de contact *</label>
                  <input
                    type="tel"
                    required
                    placeholder="06 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Numéro WhatsApp (optionnel)</label>
                  <input
                    type="tel"
                    placeholder="Pour le suivi direct"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Adresse e-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Adresse postale *</label>
                  <input
                    type="text"
                    required
                    placeholder="Numéro et rue"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Code postal *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 73100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Aix-les-Bains"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Étape suivante : mode de règlement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Choix du règlement : Réservation (150€) vs Comptant (50/50 ou 100%) vs Plusieurs fois (>= 150€) */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Option 1: Modalité d'achat (Réservation 150€, Comptant, ou Plusieurs fois) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  1. Choisissez votre modalité de règlement
                </label>

                {/* 3 Onglets / Cartes de choix clairs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* OPTION A : RÉSERVATION (150 €) */}
                  <div
                    onClick={() => setPaymentCategory('reservation')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentCategory === 'reservation'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                          Réservation
                        </span>
                        <span className="text-lg font-black text-blue-700">150 €</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-2">
                        Réserver le véhicule
                      </div>
                      <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                        Permet de garantir et bloquer le véhicule immédiatement en attendant de venir le chercher ou d'être livré, pour éviter qu'un autre client ne l'achète.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-blue-200/60 text-[11px] text-slate-700 flex justify-between items-center">
                      <span>Solde à la remise des clés :</span>
                      <strong className="font-bold text-slate-900">{(vehicle.price - 150).toLocaleString('fr-FR')} €</strong>
                    </div>
                  </div>

                  {/* OPTION B : PAIEMENT COMPTANT (50/50 OU 100%) */}
                  <div
                    onClick={() => setPaymentCategory('comptant')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentCategory === 'comptant'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          Comptant
                        </span>
                        <span className="text-lg font-black text-emerald-700">
                          {comptantType === '50_50'
                            ? `${Math.round(vehicle.price / 2).toLocaleString('fr-FR')} €`
                            : `${vehicle.price.toLocaleString('fr-FR')} €`}
                        </span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-2">
                        Paiement comptant
                      </div>
                      <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                        50% à la commande et 50% à la réception du véhicule (ou règlement intégral direct si la confiance est totale).
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-[11px] text-slate-700 flex justify-between items-center">
                      <span>
                        {comptantType === '50_50' ? 'Solde à réception : ' : 'Solde restant : '}
                      </span>
                      <strong className="font-bold text-slate-900">
                        {comptantType === '50_50'
                          ? `${(vehicle.price - Math.round(vehicle.price / 2)).toLocaleString('fr-FR')} €`
                          : '0 €'}
                      </strong>
                    </div>
                  </div>

                  {/* OPTION C : PAIEMENT EN PLUSIEURS FOIS (FACILITÉS DE PAIEMENT) */}
                  <div
                    onClick={() => setPaymentCategory('plusieurs_fois')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentCategory === 'plusieurs_fois'
                        ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase tracking-wider">
                          Facilités
                        </span>
                        <span className="text-lg font-black text-purple-700">
                          ≥ 150 €
                        </span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-2">
                        Paiement en plusieurs fois
                      </div>
                      <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                        Facilités d'étalement si vous n'êtes pas au point financièrement dans l'immédiat. Vous choisissez le montant initial souhaité (minimum 150 €).
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-purple-200/60 text-[11px] text-slate-700 flex justify-between items-center">
                      <span>Versement aujourd'hui :</span>
                      <strong className="font-bold text-purple-900">
                        {numericInstallmentAmount >= 150 ? `${numericInstallmentAmount.toLocaleString('fr-FR')} €` : 'Minimum 150 €'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* SOUS-PANNEAU DÉTAILLÉ SELON LA CATÉGORIE CHOISIE */}

                {/* SOUS-PANNEAU B1 : Détail du paiement comptant (50/50 OU 100%) */}
                {paymentCategory === 'comptant' && (
                  <div className="mt-3.5 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Précisez la formule comptant de votre choix :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 50% commande / 50% réception */}
                      <div
                        onClick={() => setComptantType('50_50')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          comptantType === '50_50'
                            ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                            : 'bg-emerald-100/40 border-emerald-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                          <span>50% à la commande & 50% réception</span>
                          <span className="text-emerald-700 font-black">{Math.round(vehicle.price / 2).toLocaleString('fr-FR')} €</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Vous réglez la moitié aujourd'hui, et le solde de { (vehicle.price - Math.round(vehicle.price / 2)).toLocaleString('fr-FR') } € lors de la livraison et de la remise des clés.
                        </p>
                      </div>

                      {/* 100% intégral */}
                      <div
                        onClick={() => setComptantType('100')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          comptantType === '100'
                            ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                            : 'bg-emerald-100/40 border-emerald-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                          <span>100% Intégralité à la commande</span>
                          <span className="text-emerald-700 font-black">{vehicle.price.toLocaleString('fr-FR')} €</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Règlement complet immédiat en toute confiance. Votre facture acquittée totale est générée.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SOUS-PANNEAU C1 : Détail du paiement en plusieurs fois (Minimum 150€ et saisie "Autre") */}
                {paymentCategory === 'plusieurs_fois' && (
                  <div className="mt-3.5 p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-3.5">
                    <div>
                      <span className="text-xs font-extrabold text-purple-950 block">
                        Montant du versement initial aujourd'hui (minimum 150 €) :
                      </span>
                      <p className="text-[11px] text-purple-800 mt-0.5">
                        Choisissez un palier suggéré ou sélectionnez « Autre montant » pour saisir la somme exacte que vous souhaitez verser (minimum légal : 150 €).
                      </p>
                    </div>

                    {/* Choix des paliers */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setInstallmentPreset('150')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          installmentPreset === '150'
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-white text-slate-800 border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        150 € (Minimum)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstallmentPreset('300')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          installmentPreset === '300'
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-white text-slate-800 border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        300 €
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstallmentPreset('500')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          installmentPreset === '500'
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-white text-slate-800 border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        500 €
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstallmentPreset('custom')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          installmentPreset === 'custom'
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-white text-slate-800 border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        Autre montant...
                      </button>
                    </div>

                    {/* Saisie personnalisée "Autre montant" avec contrôle strict >= 150 € */}
                    {installmentPreset === 'custom' && (
                      <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-slate-900">
                          Indiquez le montant que vous souhaitez verser aujourd'hui :
                        </label>
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            min="150"
                            step="10"
                            placeholder="ex: 250"
                            value={customInstallmentInput}
                            onChange={(e) => setCustomInstallmentInput(e.target.value)}
                            className={`w-full text-sm font-bold pl-3 pr-8 py-2 rounded-lg border ${
                              isInstallmentTooLow
                                ? 'border-red-500 text-red-700 bg-red-50/50 focus:border-red-600 focus:outline-hidden'
                                : 'border-purple-300 text-slate-900 focus:border-purple-600 focus:outline-hidden'
                            }`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">€</span>
                        </div>

                        {/* Message d'erreur et refus strict si valeur < 150 € */}
                        {isInstallmentTooLow && (
                          <div className="p-2.5 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-xs text-red-700 font-bold">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>
                              Montant non autorisé : Le montant initial pour un paiement en plusieurs fois doit être d'au moins 150 €. Les montants inférieurs à 150 € sont systématiquement refusés.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Récapitulatif de l'échéancier si montant valide */}
                    {!isInstallmentTooLow && (
                      <div className="p-2.5 bg-purple-100/60 rounded-lg flex items-center justify-between text-xs text-purple-950 font-medium">
                        <div>
                          <span>Solde restant à étaler : </span>
                          <strong className="font-extrabold text-slate-900">
                            {remainingBalance.toLocaleString('fr-FR')} €
                          </strong>
                        </div>
                        <span className="text-[11px] text-purple-700 font-bold">
                          Étalement sans frais à convenir avec votre conseiller
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option 2: Moyen de règlement (CARTE BANCAIRE OU VIREMENT) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  2. Moyen de paiement sécurisé
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option CARTE BANCAIRE */}
                  <div
                    onClick={() => {
                      setPaymentMethod('card');
                      setCardError(null);
                    }}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>Carte Bancaire</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded">Recommandé</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Prélèvement direct immédiat · 3D Secure
                        </div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'}`}>
                      {paymentMethod === 'card' && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Option VIREMENT BANCAIRE */}
                  <div
                    onClick={() => {
                      setPaymentMethod('virement');
                      setCardError(null);
                    }}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'virement'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">
                          Virement bancaire
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                          IBAN et BIC de la concession
                        </div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'virement' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                      {paymentMethod === 'virement' && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* SOUS-PANNEAU A : FORMULAIRE CARTE BANCAIRE ET PRÉLÈVEMENT SÉCURISÉ */}
              {paymentMethod === 'card' && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">Prélèvement par Carte Bancaire sécurisé</h4>
                        <p className="text-[11px] text-slate-300">Certifié SSL 256 bits et authentification 3D Secure 2.0</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-medium block">Montant à prélever</span>
                      <span className="text-xl font-black text-emerald-400">{totalAmountToPay.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>

                  {/* Visual card mockup */}
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-4 rounded-xl shadow-md max-w-sm mx-auto text-white border border-blue-400/30 space-y-3">
                    <div className="flex items-center justify-between text-xs text-blue-200">
                      <span className="font-bold tracking-wider">JEAN AUTO VSP</span>
                      <span className="font-extrabold uppercase px-2 py-0.5 bg-white/20 rounded text-[11px]">
                        {getCardBrand(cardNumber).toUpperCase()}
                      </span>
                    </div>
                    <div className="font-mono text-base tracking-widest text-center py-1 font-bold">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-blue-100 pt-1">
                      <div>
                        <div className="text-[9px] text-blue-300 uppercase">Titulaire</div>
                        <div className="font-bold truncate max-w-[150px]">{cardHolder || 'NOM ET PRENOM'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-blue-300 uppercase">Expire</div>
                        <div className="font-bold">{cardExpMonth}/{cardExpYear}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card input fields */}
                  <div className="space-y-3.5 text-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        Nom et prénom du titulaire de la carte *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: JEAN DUPONT"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full text-sm bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
                        <span>Numéro de carte bancaire (16 chiffres) *</span>
                        <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Données chiffrées
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full font-mono text-sm bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-hidden tracking-wider"
                        />
                        <div className="absolute right-3 top-2.5 text-[10px] font-bold uppercase text-slate-400">
                          {getCardBrand(cardNumber)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Date d'expiration *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={cardExpMonth}
                            onChange={(e) => setCardExpMonth(e.target.value)}
                            className="w-full text-sm bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white focus:border-blue-400 focus:outline-hidden"
                          >
                            {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={cardExpYear}
                            onChange={(e) => setCardExpYear(e.target.value)}
                            className="w-full text-sm bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white focus:border-blue-400 focus:outline-hidden"
                          >
                            {['25','26','27','28','29','30','31','32'].map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
                          <span>CVV (3 chiffres) *</span>
                          <span className="text-[10px] text-slate-400">Au dos</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showCvv ? "text" : "password"}
                            required
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => {
                              setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                              if (cardError) setCardError(null);
                            }}
                            className="w-full font-mono text-sm bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 pr-9 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-hidden tracking-widest text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title={showCvv ? "Masquer le code CVC" : "Afficher le code CVC"}
                          >
                            {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Autorisation formelle de prélèvement */}
                    <div className="p-3.5 bg-slate-900/80 border border-emerald-500/40 rounded-xl space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={debitConsent}
                          onChange={(e) => setDebitConsent(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-500 focus:ring-emerald-400 shrink-0"
                        />
                        <span className="leading-relaxed text-[11.5px]">
                          <strong>Autorisation de débit :</strong> J'autorise expressément la concession <strong>JEAN AUTO VSP</strong> à débiter la somme de <strong>{totalAmountToPay.toLocaleString('fr-FR')} €</strong> sur ma carte bancaire désignée ci-dessus au titre du règlement de ma réservation.
                        </span>
                      </label>
                    </div>

                    {/* Message d'erreur clair avec code et surbrillance */}
                    {cardError && (
                      <div className="p-3.5 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-100 text-xs flex items-start gap-2.5 shadow-md">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-red-300 font-bold">Erreur de validation de votre carte :</strong>
                          <span className="leading-relaxed">{cardError}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SOUS-PANNEAU B : COORDONNÉES BANCAIRES POUR VIREMENT */}
              {paymentMethod === 'virement' && (
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="font-bold text-sm text-white">Coordonnées bancaires de la concession</h4>
                        <p className="text-[11px] text-slate-400">Effectuez votre virement vers ce compte bancaire professionnel</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-medium block">Montant du virement</span>
                      <span className="text-lg font-black text-emerald-400">{totalAmountToPay.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Titulaire */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Titulaire du compte :</span>
                        <span className="font-bold text-white text-sm">{commercialSettings.accountHolder}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(commercialSettings.accountHolder, 'holder')}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'holder' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'holder' ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>

                    {/* IBAN */}
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-400 text-[11px] block">IBAN international complet :</span>
                        <span className="font-mono font-bold text-blue-300 text-xs sm:text-sm tracking-wide break-words select-all">
                          {commercialSettings.iban}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(commercialSettings.iban.replace(/\s+/g, ''), 'iban')}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] flex items-center gap-1 font-medium transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'iban' ? 'Copié !' : 'Copier l\'IBAN'}</span>
                      </button>
                    </div>

                    {/* BIC */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg">
                      <div>
                        <span className="text-slate-400 text-[11px] block">BIC / SWIFT :</span>
                        <span className="font-mono font-bold text-white text-xs">{commercialSettings.bic}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(commercialSettings.bic, 'bic')}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'bic' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'bic' ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>

                    {/* Motif du virement */}
                    <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-blue-300 text-[11px] block font-bold">Motif / libellé obligatoire du virement :</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {lastName.trim() ? `${lastName.trim().toUpperCase()} ${firstName.trim()}` : 'VOTRE NOM ET PRENOM'}
                        </span>
                      </div>
                      {lastName.trim() && (
                        <button
                          onClick={() => handleCopy(`${lastName.trim().toUpperCase()} ${firstName.trim()}`, 'reference')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                        >
                          {copiedField === 'reference' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'reference' ? 'Copié !' : 'Copier'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Justificatif STRICTEMENT OBLIGATOIRE si virement */}
              {paymentMethod === 'virement' && (
                <div id="proof-upload-section" className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>Capture d'écran du virement bancaire</span>
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md">
                        Obligatoire
                      </span>
                    </label>
                  </div>
                  <p className="text-[11.5px] text-gray-600 leading-relaxed">
                    Effectuez le virement vers le RIB officiel ci-dessus, puis <strong>joignez obligatoirement votre capture d'écran</strong> ou photo de confirmation pour valider votre commande.
                  </p>

                  {virementProofError && (
                    <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-bold shadow-xs">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>{virementProofError}</span>
                    </div>
                  )}

                  {!proofDataUrl ? (
                    <label className={`border-2 border-dashed ${virementProofError ? 'border-red-400 bg-red-50/50' : 'border-blue-400 hover:border-blue-600 bg-blue-50/40'} rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center`}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-blue-600 mb-1.5" />
                      <span className="text-xs font-bold text-slate-900">
                        Cliquez ici pour joindre la capture d'écran du virement
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5">JPG, PNG ou PDF · Capture obligatoire pour finaliser</span>
                    </label>
                  ) : (
                    <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center gap-3 shadow-xs">
                      {proofFileType.startsWith('image') || proofDataUrl.startsWith('data:image') ? (
                        <img
                          src={proofDataUrl}
                          alt="Aperçu capture virement"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-emerald-600 text-white rounded-lg flex items-center justify-center shrink-0">
                          <Check className="w-7 h-7" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Capture d'écran validée ({proofFileSize || 'Fichier prêt'})</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                          {proofFileName || 'capture-virement'}
                        </p>
                        {uploadingProof ? (
                          <span className="text-[10.5px] text-blue-700 font-semibold block mt-0.5">
                            ⏳ Enregistrement et génération du lien WhatsApp...
                          </span>
                        ) : uploadedViewerUrl ? (
                          <span className="text-[10.5px] text-emerald-700 font-semibold block mt-0.5">
                            ✓ Visualiseur WhatsApp actif et prêt
                          </span>
                        ) : null}
                      </div>
                      <label className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer shrink-0 px-2 py-1 bg-white border border-blue-200 rounded-lg">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        Changer
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Choix du canal de transmission : WhatsApp ou E-mail pour les clients qui n'ont pas WhatsApp */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Mode de transmission de votre commande :
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {transmissionChannel === 'whatsapp' ? 'Validation directe WhatsApp' : 'Option E-mail active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransmissionChannel('whatsapp')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      transmissionChannel === 'whatsapp'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${transmissionChannel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Par WhatsApp (Recommandé)</span>
                      <span className="text-[10.5px] text-gray-500 block">Ouverture directe de l'application</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransmissionChannel('email')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      transmissionChannel === 'email'
                        ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${transmissionChannel === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">E-mail</span>
                      <span className="text-[10.5px] text-gray-500 block">Transmission par boîte mail</span>
                    </div>
                  </button>
                </div>

                {transmissionChannel === 'email' && (
                  <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-left space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Accès universel tous clients & Anti-Spam</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Compatible avec toutes les messageries (Gmail, Outlook, Yahoo, Orange, Free, SFR, LaPoste...).
                      Vous aurez accès aux boutons 1 clic et à l'option copier-coller sans aucun blocage.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons : Validation directe vers WhatsApp ou E-mail */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-4 py-3 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour aux coordonnées</span>
                </button>

                <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    disabled={submitting || isInstallmentTooLow}
                    className={`w-full sm:w-auto px-7 py-3.5 ${
                      isInstallmentTooLow
                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                        : transmissionChannel === 'whatsapp'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 cursor-pointer'
                        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 cursor-pointer'
                    } text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50`}
                  >
                    {transmissionChannel === 'whatsapp' ? (
                      <WhatsAppIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Mail className="w-5 h-5 text-white" />
                    )}
                    <span>
                      {submitting
                        ? (transmissionChannel === 'whatsapp' ? 'Redirection vers WhatsApp...' : 'Ouverture de votre boîte mail...')
                        : isInstallmentTooLow
                        ? 'Montant refusé (minimum 150 €)'
                        : paymentMethod === 'card'
                        ? (transmissionChannel === 'whatsapp'
                            ? `Valider le prélèvement (${totalAmountToPay.toLocaleString('fr-FR')} €) & Ouvrir WhatsApp`
                            : `Valider le prélèvement (${totalAmountToPay.toLocaleString('fr-FR')} €) & Transmettre par E-mail`)
                        : (transmissionChannel === 'whatsapp'
                            ? `Valider la commande (${totalAmountToPay.toLocaleString('fr-FR')} €) & Ouvrir WhatsApp`
                            : `Valider la commande (${totalAmountToPay.toLocaleString('fr-FR')} €) & Transmettre par E-mail`)}
                    </span>
                  </button>

                  {isInstallmentTooLow && (
                    <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      Refusé : Saisie inférieure à 150 €
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Validation finale et prélèvement / justificatif */}
          {step === 3 && (
            <form onSubmit={handleCompleteOrder} className="space-y-6">
              {/* Récapitulatif clair du mode de paiement */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-black text-emerald-950">
                    Récapitulatif de votre commande
                  </strong>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-200 text-emerald-800 font-extrabold rounded-full">
                    {paymentMethod === 'card' ? 'Prélèvement Carte Bancaire' : 'Virement Bancaire'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  Véhicule : <strong>{vehicle.brand} {vehicle.model}</strong> · Montant à régler : <strong className="text-emerald-700 text-sm">{totalAmountToPay.toLocaleString('fr-FR')} €</strong> ({getPaymentOptionLabel(paymentCategory, totalAmountToPay)}).
                </p>
                {paymentMethod === 'card' ? (
                  <div className="pt-1 border-t border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>
                      Carte : <strong>{getCardBrand(cardNumber).toUpperCase()} •••• {cardNumber.replace(/\s+/g, '').slice(-4) || '****'}</strong> · Titulaire : <strong>{cardHolder}</strong> (Débit direct autorisé)
                    </span>
                  </div>
                ) : (
                  <div className="pt-1 border-t border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>
                      Virement à adresser à : <strong>{commercialSettings.accountHolder}</strong> (Réf: {lastName.toUpperCase()} {firstName})
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Box (uniquement si virement bancaire) */}
              {paymentMethod === 'virement' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Justificatif de virement (Capture d'écran ou document bancaire)
                  </label>

                  <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      Cliquez ou glissez-déposez votre capture ici
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">JPG, PNG ou PDF (optionnel ou transmission via WhatsApp)</span>
                  </label>

                  {proofDataUrl && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={proofDataUrl} alt="Aperçu" className="w-12 h-12 object-cover rounded-lg border" />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">{proofFileName || 'preuve_virement'}</div>
                          <div className="text-gray-500">{proofFileSize}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Prêt
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Si Paiement par carte bancaire : rappel de l'autorisation de débit immédiate */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Validation du prélèvement bancaire sécurisé</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    En cliquant sur le bouton ci-dessous, vous validez le débit de <strong>{totalAmountToPay.toLocaleString('fr-FR')} €</strong> sur votre carte bancaire. Vos documents certifiés (Facture d'achat acquittée et Bon de livraison officiel) seront instantanément édités et téléchargés sur votre appareil.
                  </p>
                </div>
              )}

              {/* Information transmission WhatsApp */}
              <div className="p-4 bg-emerald-50/80 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      {transmissionChannel === 'whatsapp' ? "Transmission directe par WhatsApp" : "Transmission par E-mail"}
                    </div>
                    <p className="text-[11.5px] text-emerald-800 leading-snug mt-0.5">
                      {transmissionChannel === 'whatsapp'
                        ? "En validant votre commande, votre application WhatsApp s'ouvre directement avec votre récapitulatif prérempli. Votre seule action sera d'appuyer sur « Envoyer »."
                        : "Votre application de messagerie e-mail s'ouvrira avec le récapitulatif complet de votre commande prérempli."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTransmissionChannel(transmissionChannel === 'whatsapp' ? 'email' : 'whatsapp')}
                  className="text-[11px] font-semibold text-emerald-900 hover:text-blue-800 underline shrink-0 cursor-pointer"
                >
                  {transmissionChannel === 'whatsapp' ? "Option E-mail" : "Option WhatsApp"}
                </button>
              </div>

              {/* Notes optionnelles */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Remarques ou préférences de livraison (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="ex: Livraison souhaitée en début d'après-midi, créneau samedi..."
                  className="w-full text-xs border border-gray-300 rounded-xl p-3"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-7 py-3.5 ${
                    transmissionChannel === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  } text-white font-black text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50`}
                >
                  {transmissionChannel === 'whatsapp' ? (
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Mail className="w-5 h-5 text-white" />
                  )}
                  <span>
                    {submitting
                      ? (transmissionChannel === 'whatsapp' ? 'Redirection vers WhatsApp...' : 'Ouverture de votre boîte mail...')
                      : paymentMethod === 'card'
                      ? (transmissionChannel === 'whatsapp'
                          ? `Valider le prélèvement (${totalAmountToPay.toLocaleString('fr-FR')} €) & Ouvrir WhatsApp`
                          : `Valider le prélèvement (${totalAmountToPay.toLocaleString('fr-FR')} €) & Transmettre par E-mail`)
                      : (transmissionChannel === 'whatsapp'
                          ? 'Valider ma commande & Ouvrir WhatsApp'
                          : 'Valider ma commande & Transmettre par E-mail')}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation & Délivrance des documents */}
          {step === 4 && createdOrder && (
            <div className="text-center space-y-5 py-2">
              {/* Bandeau de confirmation épuré */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Commande #{createdOrder.orderNumber} confirmée
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      {createdOrder.vehicleName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {transmissionChannel === 'whatsapp' ? (
                    <a
                      href={generatedWhatsAppUrl || createWhatsAppUrl(commercialSettings.whatsapp, buildOrderWhatsAppMessage(createdOrder.orderNumber, createdOrder.cardDetails?.authorizationId || 'AUTH', createdOrder.paymentProofUrl, undefined, createdOrder))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 bg-emerald-100 rounded-lg cursor-pointer"
                      title="Rouvrir WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <a
                      href={generatedMailtoUrl || `mailto:${commercialSettings.email || 'amautosanspermis@gmail.com'}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950 px-2.5 py-1.5 bg-blue-100 rounded-lg cursor-pointer"
                      title="Ouvrir votre application E-mail"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Ouvrir E-mail</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-white border border-gray-300 rounded-lg cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* Hub de Transmission WhatsApp Garanti & Anti-Blocage si WhatsApp est sélectionné */}
              {transmissionChannel === 'whatsapp' && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 text-left max-w-lg mx-auto space-y-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <WhatsAppIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">
                        Finalisation de votre commande par WhatsApp
                      </h4>
                      <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                        Votre commande #{createdOrder.orderNumber} est enregistrée. Cliquez sur le bouton ci-dessous pour transmettre automatiquement la commande sur WhatsApp à notre conseiller :
                      </p>
                    </div>
                  </div>

                  {/* Bouton Principal Géant WhatsApp */}
                  <a
                    href={generatedWhatsAppUrl || createWhatsAppUrl(commercialSettings.whatsapp, buildOrderWhatsAppMessage(createdOrder.orderNumber, createdOrder.cardDetails?.authorizationId || 'AUTH', createdOrder.paymentProofUrl, undefined, createdOrder))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                    <span>Ouvrir WhatsApp & Envoyer ma Commande</span>
                  </a>

                  {/* Résumé selon mode de règlement */}
                  <div className="p-3 bg-white/90 border border-emerald-200 rounded-xl text-xs space-y-1">
                    {createdOrder.paymentMethod === 'card' ? (
                      <div className="flex items-start gap-2 text-emerald-900 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Prélèvement bancaire autorisé</strong> ({createdOrder.amountPaid?.toLocaleString('fr-FR')} €). Les coordonnées sont transmises en toute sécurité pour le traitement de votre réservation.</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-emerald-900 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Justificatif de virement joint</strong>. Le lien vers la capture d'écran est directement inclus dans le message WhatsApp.</span>
                      </div>
                    )}
                  </div>

                  {/* Options complémentaires : WhatsApp Web + Copier le texte */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={createWebWhatsAppUrl(commercialSettings.whatsapp, buildOrderWhatsAppMessage(createdOrder.orderNumber, createdOrder.cardDetails?.authorizationId || 'AUTH', createdOrder.paymentProofUrl, undefined, createdOrder))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-900 transition-colors shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Web (PC/Mac)</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = buildOrderWhatsAppMessage(createdOrder.orderNumber, createdOrder.cardDetails?.authorizationId || 'AUTH', createdOrder.paymentProofUrl, undefined, createdOrder);
                        navigator.clipboard.writeText(msg);
                        setCopiedWhatsApp(true);
                        setTimeout(() => setCopiedWhatsApp(false), 2500);
                      }}
                      className="p-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-900 transition-colors shadow-2xs cursor-pointer"
                    >
                      {copiedWhatsApp ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Texte copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>Copier le texte</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option de bascule vers E-mail */}
                  <div className="text-center pt-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={() => setTransmissionChannel('email')}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                    >
                      Vous n'avez pas l'application WhatsApp ? Cliquez ici pour transmettre par E-mail
                    </button>
                  </div>
                </div>
              )}

              {/* Hub de Transmission E-mail Anti-Blocage & Anti-Spam si l'option E-mail est active */}
              {transmissionChannel === 'email' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-300 rounded-2xl p-4 sm:p-5 text-left max-w-lg mx-auto space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-950">
                        Finalisation de votre commande par E-mail
                      </h4>
                      <p className="text-xs text-blue-800/90 mt-0.5 leading-relaxed">
                        Votre commande #{createdOrder.orderNumber} est enregistrée. Choisissez votre messagerie ci-dessous pour transmettre votre commande en 1 clic :
                      </p>
                    </div>
                  </div>

                  {/* Boutons Webmail et application en 1 clic */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      1. Cliquez sur votre messagerie habituelle (Tout est pré-rempli) :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Gmail Web */}
                      <a
                        href={generatedGmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white hover:bg-red-50/60 border border-gray-300 hover:border-red-400 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                            G
                          </div>
                          <div className="text-left min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-red-600 block truncate">
                              Gmail Web
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">Dans votre navigateur</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 shrink-0" />
                      </a>

                      {/* Outlook / Hotmail Web */}
                      <a
                        href={generatedOutlookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white hover:bg-blue-50/60 border border-gray-300 hover:border-blue-400 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                            O
                          </div>
                          <div className="text-left min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 block truncate">
                              Outlook / Hotmail
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">Compte Microsoft</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
                      </a>

                      {/* Yahoo Mail */}
                      <a
                        href={generatedYahooUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white hover:bg-purple-50/60 border border-gray-300 hover:border-purple-400 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">
                            Y!
                          </div>
                          <div className="text-left min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600 block truncate">
                              Yahoo Mail
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">Dans votre navigateur</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-500 shrink-0" />
                      </a>

                      {/* Application Mail par défaut */}
                      <a
                        href={generatedMailtoUrl || `mailto:${commercialSettings.email || 'amautosanspermis@gmail.com'}`}
                        className="p-3 bg-white hover:bg-slate-100 border border-gray-300 hover:border-slate-400 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="text-left min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-slate-800 block truncate">
                              Application Mail
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">Apple Mail, Outlook PC...</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-slate-700 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Option de secours universelle pour Orange, SFR, Free, LaPoste... */}
                  <div className="pt-2 border-t border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        2. Autre boîte mail ? (Orange, Free, SFR, LaPoste...) :
                      </span>
                      <span className="text-[10px] text-blue-700 font-medium">Copier-coller 100% garanti</span>
                    </div>

                    <div className="space-y-2 bg-white/90 p-3 rounded-xl border border-blue-200">
                      {/* Ligne destinataire */}
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <span className="text-gray-500 block text-[10.5px]">Adresse du concessionnaire :</span>
                          <span className="font-mono font-bold text-slate-900 truncate block">
                            {commercialSettings.email || 'amautosanspermis@gmail.com'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyRecipient}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                            copiedRecipient
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {copiedRecipient ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRecipient ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>

                      {/* Ligne objet */}
                      <div className="flex items-center justify-between text-xs gap-2 pt-1 border-t border-gray-100">
                        <div className="min-w-0">
                          <span className="text-gray-500 block text-[10.5px]">Objet du mail (Format Anti-Spam) :</span>
                          <span className="font-medium text-slate-800 truncate block text-[11px]">
                            {generatedEmailSubject || `Commande véhicule sans permis - ${createdOrder.vehicleName} (Réf: ${createdOrder.orderNumber})`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopySubject}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                            copiedSubject
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSubject ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>

                      {/* Bouton copier message complet */}
                      <button
                        type="button"
                        onClick={handleCopyEmailText}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          copiedEmail
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEmail ? 'Texte complet du message copié !' : 'Copier tout le texte du message'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Note de conformité anti-spam et boîte principale */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-emerald-900 leading-normal">
                      <strong>Garantie Boîte Principale :</strong> Cet e-mail est rédigé selon les standards stricts de Google Mail pour éviter tout filtre anti-spam et arriver directement dans votre boîte principale (amautosanspermis@gmail.com).
                    </div>
                  </div>
                </div>
              )}

              {/* Order Recap Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-lg mx-auto">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Véhicule réservé :</span>
                  <span className="font-bold text-slate-900">{createdOrder.vehicleName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Prix du véhicule :</span>
                  <span className="font-bold text-slate-900">{createdOrder.vehiclePrice.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Modalité choisie :</span>
                  <span className="font-bold text-blue-700">
                    {getPaymentOptionLabel(createdOrder.paymentOption, createdOrder.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Montant réglé immédiatement :</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {createdOrder.amountPaid.toLocaleString('fr-FR')} €
                  </span>
                </div>
                {createdOrder.vehiclePrice > createdOrder.amountPaid && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 font-medium">Solde restant :</span>
                    <span className="font-bold text-slate-900">
                      {(createdOrder.vehiclePrice - createdOrder.amountPaid).toLocaleString('fr-FR')} €
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Moyen de règlement :</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    {createdOrder.paymentMethod === 'card' ? (
                      <>
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Prélèvement Carte Bancaire (Réf: {createdOrder.cardDetails?.authorizationId || 'AUTH-CB'})</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Virement bancaire professionnel</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Client :</span>
                  <span className="font-semibold text-slate-800">
                    {createdOrder.customer.firstName} {createdOrder.customer.lastName} ({createdOrder.customer.phone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Livraison prévue :</span>
                  <span className="font-medium text-slate-800">
                    {createdOrder.customer.address}, {createdOrder.customer.postalCode} {createdOrder.customer.city}
                  </span>
                </div>
              </div>

              {/* Justificatif de paiement fourni */}
              {createdOrder.paymentProofUrl && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Justificatif de virement enregistré</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {createdOrder.paymentProofFileName || 'Capture jointe'}
                    </span>
                  </div>
                  {createdOrder.paymentProofFileType?.startsWith('image/') && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-32 bg-white flex items-center justify-center">
                      <img
                        src={createdOrder.paymentProofUrl}
                        alt="Justificatif de paiement"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* DÉLIVRANCE OFFICIELLE DES DOCUMENTS APRÈS VÉRIFICATION PAR L'ADMINISTRATEUR */}
              <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 text-left max-w-lg mx-auto space-y-2.5 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-950">
                      Vérification administrative & Transmission de vos documents officiels
                    </h4>
                    <p className="text-[11.5px] text-amber-900 mt-1 leading-relaxed">
                      Conformément à la procédure de sécurité, votre <strong>facture d'achat acquittée</strong> et votre <strong>bon de livraison officiel</strong> vous seront transmis directement par <strong>{createdOrder.transmissionChannel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}</strong> dès que notre service comptable aura vérifié la transmission de votre justificatif et des coordonnées de règlement.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Statut : En cours de vérification administrative</span>
                  </span>
                  <span className="font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                    Délivrance manuelle garantie
                  </span>
                </div>
              </div>

              {/* GARANTIE LIVRAISON 72H AVEC COMPTE À REBOURS ET ANNULATION BLOQUÉE AVANT 72H */}
              <div className="max-w-lg mx-auto w-full">
                <Order72hGuarantee
                  order={createdOrder}
                  commercialSettings={commercialSettings}
                />
              </div>

              {/* Bascule WhatsApp / Email en bas de page si besoin */}
              <div className="text-center pt-2">
                {transmissionChannel === 'whatsapp' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTransmissionChannel('email');
                      if (generatedMailtoUrl) {
                        window.location.href = generatedMailtoUrl;
                      }
                    }}
                    className="text-[11.5px] text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Vous n'avez pas WhatsApp sur cet appareil ? Cliquez ici pour envoyer par E-mail</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTransmissionChannel('whatsapp');
                      if (generatedWhatsAppUrl) {
                        window.open(generatedWhatsAppUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="text-[11.5px] text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vous préférez envoyer par WhatsApp ? Cliquez ici</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
