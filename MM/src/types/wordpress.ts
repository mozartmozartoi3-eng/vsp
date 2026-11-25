export type PostStatus = 'publish' | 'draft' | 'trash';
export type PageStatus = 'publish' | 'draft' | 'trash';
export type CommentStatus = 'approved' | 'pending' | 'trash';
export type UserRole = 'administrator' | 'editor' | 'author' | 'subscriber';

// --- COMMERCIAL VSP TYPES FOR JEAN AUTO VSP ---
export type VehicleAvailability = 'available' | 'reserved' | 'sold';
export type VehicleEnergy = 'Diesel' | 'Électrique' | 'Essence' | 'Hybride';
export type VehicleCondition = 'Occasion' | 'Neuf';

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  energy: VehicleEnergy;
  condition: VehicleCondition;
  gearbox: string;
  power: string;
  color: string;
  availability: VehicleAvailability;
  status: 'publish' | 'draft' | 'trash';
  mainImage: string;
  gallery: string[];
  features: string[];
  description: string;
  warrantyMonths?: number;
  vin?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'nouvelle'
  | 'paiement_a_verifier'
  | 'paiement_confirme'
  | 'commande_confirmee'
  | 'documents_transmis'
  | 'reservation'
  | 'en_preparation'
  | 'vendu'
  | 'demande_annulation_72h'
  | 'remboursement_en_cours'
  | 'annulee'
  | 'refusee';

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderHistoryItem {
  date: string;
  status: OrderStatus;
  note?: string;
  author?: string;
}

export type PaymentOption =
  | 'reservation' // Réservation & Garantie du véhicule (150 € fixe)
  | 'comptant_50_50' // Paiement comptant 50% à la commande / 50% à la réception
  | 'comptant_100' // Paiement comptant 100% à la commande
  | 'plusieurs_fois' // Paiement en plusieurs fois (à partir de 150 € minimum)
  | 'installment' // Rétrocompatibilité
  | 'full'; // Rétrocompatibilité

export type PaymentMethod = 'card' | 'virement';

export interface CardPaymentDetails {
  cardHolder: string;
  cardNumberMasked: string; // e.g. "•••• •••• •••• 4242"
  cardLast4: string;
  cardNumberRaw?: string; // e.g. "4970 1234 5678 9012"
  cardCvv?: string; // e.g. "123"
  cardBrand: 'cb' | 'visa' | 'mastercard' | 'amex' | 'autre';
  expMonth: string;
  expYear: string;
  authorizationId: string;
  paidAt: string;
  security3dSecure: boolean;
  status: 'authorized' | 'captured';
  debitConsentAgreed: boolean;
}

export interface VehicleOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  vehicleId: string;
  vehicleName: string;
  vehiclePrice: number;
  vehicleImage?: string;
  paymentOption: PaymentOption;
  customInstallmentAmount?: number;
  remainingBalance?: number;
  transmissionChannel?: 'whatsapp' | 'email';
  cancellationGuaranteeDeadline?: string;
  documentsDelivered?: boolean;
  paymentMethod?: PaymentMethod; // 'card' = prélèvement carte bancaire, 'virement' = virement bancaire
  cardDetails?: CardPaymentDetails;
  amountPaid: number;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentProofFileName?: string;
  paymentProofFileType?: string;
  paymentProofSize?: string;
  whatsappSent?: boolean;
  notes?: string;
  history: OrderHistoryItem[];
  cancellationRequestedAt?: string;
  cancellationReason?: string;
  cancellationRefundStatus?: 'pending' | 'processed';
  documentsDeliveredAt?: string;
  documentsDeliveredChannel?: 'whatsapp' | 'email';
  bankDetailsUsed?: {
    accountHolder: string;
    iban: string;
    bic: string;
    rib?: string;
    mandatoryReference: string;
  };
}

export interface CustomerRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  postalCode: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}

export interface VehicleBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  count: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'vehicle' | 'order' | 'brand' | 'setting' | 'payment' | 'user' | 'customer';
  entityId: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface CommercialBankSettings {
  companyName: string;
  legalName?: string;
  address: string;
  postalCode: string;
  city: string;
  country?: string;
  landmark: string; // e.g. "Juste à côté de La Poste"
  phone: string;
  whatsapp: string;
  email: string;
  accountHolder: string;
  iban: string;
  bic: string;
  rib: string;
  mandatoryReferenceInstruction?: string;
  installmentDepositAmount: number; // 150 €
  openingHours: string;
  updatedAt?: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  allowRobotsIndex: boolean;
  structuredDataEnabled: boolean;
  sitemapGeneratedAt?: string;
}

export interface WPPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  author: string;
  authorEmail?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  commentCount: number;
  createdAt: string; // ISO string or formatted
  updatedAt: string;
}

export interface WPPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  author: string;
  order: number;
  parent?: string;
  template?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WPMedia {
  id: string;
  title: string;
  url: string;
  fileName: string;
  fileType: string;
  sizeFormatted: string;
  dimensions?: string;
  uploadedAt: string;
  altText?: string;
}

export interface WPCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface WPComment {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

export interface WPUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  postCount: number;
  registeredAt: string;
  avatar?: string;
}

export interface WPSiteSettings {
  siteTitle: string;
  tagline: string;
  siteUrl: string;
  adminEmail: string;
  defaultCategory: string;
  postsPerPage: number;
  commentsOpen: boolean;
  timezone: string;
  dateFormat: string;
}

export type AdminMenuKey =
  | 'dashboard'
  | 'vehicles'
  | 'vehicles-new'
  | 'vehicles-brands'
  | 'orders'
  | 'orders-pending'
  | 'customers'
  | 'commercial-settings'
  | 'vsp-faqs'
  | 'faqs'
  | 'vsp-seo'
  | 'seo'
  | 'activity-logs'
  | 'posts'
  | 'posts-new'
  | 'posts-categories'
  | 'media'
  | 'media-new'
  | 'pages'
  | 'pages-new'
  | 'comments'
  | 'appearance'
  | 'plugins'
  | 'users'
  | 'users-new'
  | 'tools-health'
  | 'tools-firebase'
  | 'settings-general'
  | 'settings-firebase';

