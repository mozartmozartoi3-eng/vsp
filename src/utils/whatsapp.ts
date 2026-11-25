/**
 * Utilitaire de formatage et sécurisation des liens WhatsApp
 * Garantit la conformité internationale requise par wa.me (indicatif 33 pour la France)
 */

export const cleanWhatsAppNumber = (rawPhone?: string): string => {
  if (!rawPhone) return '33637385590';
  let digits = rawPhone.replace(/[^0-9]/g, '');
  
  if (digits.startsWith('0033')) {
    digits = '33' + digits.substring(4);
  } else if (digits.startsWith('0') && digits.length === 10) {
    digits = '33' + digits.substring(1);
  } else if (!digits.startsWith('33') && digits.length === 9) {
    digits = '33' + digits;
  }
  
  return digits || '33637385590';
};

export const createWhatsAppUrl = (phone?: string, message?: string): string => {
  const clean = cleanWhatsAppNumber(phone);
  if (!message) {
    return `https://wa.me/${clean}`;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
};

export const createWebWhatsAppUrl = (phone?: string, message?: string): string => {
  const clean = cleanWhatsAppNumber(phone);
  if (!message) {
    return `https://web.whatsapp.com/send?phone=${clean}`;
  }
  return `https://web.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
};
