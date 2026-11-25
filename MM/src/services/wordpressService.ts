import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import {
  db,
  auth,
  isAuthorizedAdminUser,
  handleFirestoreError,
  OperationType,
  firebaseConfig,
} from '../firebase';
import {
  WPPost,
  WPPage,
  WPMedia,
  WPCategory,
  WPComment,
  WPUser,
  WPSiteSettings,
  Vehicle,
  VehicleOrder,
  VehicleBrand,
  CustomerRecord,
  FaqItem,
  ActivityLog,
  CommercialBankSettings,
  SeoSettings,
  OrderStatus,
  VehicleAvailability,
  VehicleEnergy,
  VehicleCondition
} from '../types/wordpress';
import {
  fitDataUrlToMaxBytes,
  fitVehicleImagesToFirestoreBudget,
} from '../utils/vehicleColors';

// --- INITIAL DEFAULT DATA FOR JEAN AUTO VSP ---
export const initialDefaultCommercialSettings: CommercialBankSettings = {
  companyName: 'JEAN AUTO VSP',
  address: '11 Avenue du Grand Port',
  postalCode: '73100',
  city: 'Aix-les-Bains',
  landmark: 'Juste à côté de La Poste',
  phone: '+33 2 59 50 89 31',
  whatsapp: '+33 6 37 38 55 90',
  email: 'amautosanspermis@gmail.com',
  accountHolder: 'PHILIPPE JEAN L STIERS',
  iban: 'FR76 1723 8000 0100 4953 3957 778',
  bic: 'SCSYFRP2',
  rib: '17238 00001 00495339577 78',
  mandatoryReferenceInstruction: 'Nom Prénom uniquement',
  installmentDepositAmount: 150,
  openingHours: 'Du Lundi au Samedi : 08h30 - 19h00',
};

export const initialDefaultSeoSettings: SeoSettings = {
  metaTitle: 'JEAN AUTO VSP | Vente de Véhicules Sans Permis à Aix-les-Bains',
  metaDescription: 'Concessionnaire spécialiste des voitures sans permis neuves et occasions révisées à Aix-les-Bains. Aixam, Ligier, Microcar, Chatenet. Acompte 150€ et commande sécurisée.',
  canonicalUrl: 'https://jean-auto-vsp.fr',
  ogImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80',
  allowRobotsIndex: true,
  structuredDataEnabled: true,
  sitemapGeneratedAt: new Date().toISOString(),
};

export const initialDefaultBrands: VehicleBrand[] = [
  { id: 'brand-aixam', name: 'Aixam', slug: 'aixam', description: 'Leader français de la voiture sans permis depuis 1983.', count: 2 },
  { id: 'brand-ligier', name: 'Ligier', slug: 'ligier', description: 'Design sportif, motorisations DCI et finition premium.', count: 1 },
  { id: 'brand-microcar', name: 'Microcar', slug: 'microcar', description: 'Rapport qualité-prix imbattable et volume de chargement généreux.', count: 1 },
  { id: 'brand-chatenet', name: 'Chatenet', slug: 'chatenet', description: 'Ligne audacieuse, finitions luxueuses et caractère affirmed.', count: 1 },
  { id: 'brand-bellier', name: 'Bellier', slug: 'bellier', description: 'Constructeur historique français avec des séries spéciales uniques.', count: 1 },
  { id: 'brand-casalini', name: 'Casalini', slug: 'casalini', description: 'Élégance italienne et structure composite ultra-sécurisée.', count: 0 },
  { id: 'brand-citroen', name: 'Citroën', slug: 'citroen', description: 'Mobilité électrique urbaine compacte et accessible (Ami).', count: 0 },
  { id: 'brand-jdm', name: 'JDM', slug: 'jdm', description: 'Spécialiste de la compacité urbaine et de la fiabilité éprouvée.', count: 0 },
  { id: 'brand-minauto', name: 'Minauto', slug: 'minauto', description: 'La gamme essentielle accessible pour tous les budgets.', count: 0 },
];

export const initialDefaultVehicles: Vehicle[] = [];

export const initialDefaultOrders: VehicleOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'CMD-2026-8941',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    customer: {
      firstName: 'Marc',
      lastName: 'Dubois',
      phone: '+33 6 12 34 56 78',
      whatsapp: '+33 6 12 34 56 78',
      email: 'marc.dubois@gmail.com',
      address: '24 Rue des Alpes',
      city: 'Chambéry',
      postalCode: '73000',
    },
    vehicleId: 'veh-1',
    vehicleName: 'Aixam City Pack Sensation',
    vehiclePrice: 8990,
    vehicleImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
    paymentOption: 'installment',
    amountPaid: 150,
    status: 'paiement_a_verifier',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    paymentProofFileName: 'recu_virement_acompte.jpg',
    paymentProofFileType: 'image/jpeg',
    paymentProofSize: '142 Ko',
    whatsappSent: true,
    notes: 'Client habitant à 15km d\'Aix-les-Bains. Demande une livraison possible ou un retrait au garage.',
    history: [
      {
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'nouvelle',
        note: 'Commande initiée via le site avec option acompte de 150 €',
        author: 'Client',
      },
      {
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'paiement_a_verifier',
        note: 'Preuve de virement téléversée. En attente de contrôle bancaire.',
        author: 'Système',
      }
    ],
    bankDetailsUsed: {
      accountHolder: 'PHILIPPE JEAN L STIERS',
      iban: 'FR76 1723 8000 0100 4953 3957 778',
      bic: 'SCSYFRP2',
      rib: '17238 00001 00495339577 78',
      mandatoryReference: 'Dubois Marc',
    }
  }
];

export const initialDefaultCustomers: CustomerRecord[] = [
  {
    id: 'cust-1',
    firstName: 'Marc',
    lastName: 'Dubois',
    email: 'marc.dubois@gmail.com',
    phone: '+33 6 12 34 56 78',
    whatsapp: '+33 6 12 34 56 78',
    city: 'Chambéry',
    postalCode: '73000',
    address: '24 Rue des Alpes',
    ordersCount: 1,
    totalSpent: 150,
    lastOrderDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

export const initialDefaultFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Qui est autorisé à conduire une voiture sans permis en France ?',
    answer: 'En France, toute personne âgée d’au moins 14 ans titulaire du permis AM (option quadricycle léger, anciennement BSR) peut conduire une voiturette. Pour toutes les personnes nées avant le 1er janvier 1988, la conduite est autorisée sans aucun permis ni formation requise.',
    category: 'Permis et réglementation',
    order: 1,
  },
  {
    id: 'faq-2',
    question: 'Pourquoi un acompte de 150 € et comment garantit-il la réservation ?',
    answer: 'L’acompte forfaitaire de 150 € est une mesure de blocage contractuel. Il garantit que le véhicule choisi vous est immédiatement attribué et retiré de la vente pour qu\'aucun autre acheteur ne puisse le réserver. Dès transmission de votre justificatif de virement, le véhicule passe au statut « Réservé » à votre nom.',
    category: 'Acompte et paiement',
    order: 2,
  },
  {
    id: 'faq-3',
    question: 'Quand et comment dois-je régler le solde restant de la voiture ?',
    answer: 'Le solde restant (prix du véhicule moins les 150 € d\'acompte) ne se règle qu\'au moment où vous prenez possession du véhicule : soit au comptant par virement sécurisé lors de la livraison ou du retrait au garage, soit selon les facilités de paiement échelonnées convenues au bon de commande.',
    category: 'Acompte et paiement',
    order: 3,
  },
  {
    id: 'faq-4',
    question: 'Dans quel état mécanique et esthétique sont préparés les véhicules ?',
    answer: 'Chaque voiture sans permis subit un contrôle technique complet en atelier sur plus de 100 points : moteur, variateur, courroie, freinage, trains roulants, batterie et pneumatiques. Une vidange complète et le remplacement de tous les filtres sont réalisés, accompagnés d\'un certificat de non-gage officiel.',
    category: 'Véhicules et garantie',
    order: 4,
  },
  {
    id: 'faq-5',
    question: 'Quelle est la durée de la garantie et que couvre-t-elle exactement ?',
    answer: 'Tous nos véhicules sont couverts par une garantie contractuelle pièces et main d\'œuvre de 6 à 12 mois couvrant les organes essentiels (moteur, variateur, transmission et direction). La prise en charge s\'effectue dans notre atelier ou chez un garage partenaire agréé proche de chez vous.',
    category: 'Véhicules et garantie',
    order: 5,
  },
  {
    id: 'faq-6',
    question: 'Comment s\'organise la livraison à domicile et sous quel délai ?',
    answer: 'Nous livrons sous 48 à 72 heures en Savoie (73), Haute-Savoie (74), Isère (38) et partout en France métropolitaine par camion plateau dédié. Notre technicien effectue le tour du véhicule et vous accompagne pour une prise en main en conditions réelles.',
    category: 'Livraison et démarches',
    order: 6,
  },
  {
    id: 'faq-7',
    question: 'Qui s\'occupe de la carte grise et des démarches administratives ?',
    answer: 'JEAN AUTO VSP est habilité et agréé par le Ministère de l\'Intérieur et le SIV. Nous gérons l\'intégralité des formalités d\'immatriculation pour vous. Votre certificat d\'immatriculation définitif est envoyé sous pli sécurisé directement à votre domicile.',
    category: 'Livraison et démarches',
    order: 7,
  },
  {
    id: 'faq-8',
    question: 'Puis-je venir essayer les véhicules directement à la concession ?',
    answer: 'Tout à fait. Notre concession d\'Aix-les-Bains est située au 11 Avenue du Grand Port (à côté de La Poste), ouverte du lundi au samedi de 08h30 à 19h00. Vous pouvez découvrir l\'ensemble des modèles en stock et réaliser un essai sur route.',
    category: 'Véhicules et garantie',
    order: 8,
  }
];

export const initialDefaultActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'Initialisation de la plateforme JEAN AUTO VSP',
    entityType: 'setting',
    entityId: 'commercial',
    details: 'Mise en place de la boutique VSP, coordonnées bancaires et catalogue officiel.',
    timestamp: new Date().toISOString(),
    user: 'Administrateur',
  },
];

// Default initial data if Firestore collections are empty
export const initialDefaultSettings: WPSiteSettings = {
  siteTitle: 'JEAN AUTO VSP',
  tagline: 'Concessionnaire spécialiste des voitures sans permis à Aix-les-Bains',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://jean-auto-vsp.fr',
  adminEmail: 'mozartmozartoi3@gmail.com',
  defaultCategory: 'Non classé',
  postsPerPage: 10,
  commentsOpen: true,
  timezone: 'Europe/Paris',
  dateFormat: 'j F Y',
};

export const initialDefaultCategories: WPCategory[] = [
  { id: 'cat-1', name: 'Non classé', slug: 'non-classe', description: 'Catégorie par défaut pour tous les articles.', count: 1 },
  { id: 'cat-2', name: 'Actualités', slug: 'actualites', description: 'Toutes les nouvelles du site.', count: 0 },
  { id: 'cat-3', name: 'Tutoriels', slug: 'tutoriels', description: 'Guides et conseils pratiques.', count: 0 },
];

export const initialDefaultPosts: WPPost[] = [
  {
    id: 'post-1',
    title: 'Bienvenue chez JEAN AUTO VSP',
    slug: 'bienvenue-jean-auto-vsp',
    content: `Bienvenue sur le portail officiel JEAN AUTO VSP connecté en temps réel à votre base de données Firebase (**${firebaseConfig.projectId}**).`,
    excerpt: 'Bienvenue sur le portail officiel JEAN AUTO VSP connecté à Firebase...',
    status: 'publish',
    author: 'admin',
    authorEmail: 'mozartmozartoi3@gmail.com',
    category: 'Non classé',
    tags: ['Bienvenue', 'JEAN AUTO VSP'],
    featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    commentCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const initialDefaultPages: WPPage[] = [
  {
    id: 'page-1',
    title: 'Page d\'exemple',
    slug: 'exemple-de-page',
    content: 'Ceci est un exemple de page. Elle est différente d’un article de blog, car elle reste au même endroit et s’affiche dans la navigation de votre site (pour la plupart des thèmes). La plupart des gens commencent par une page À propos pour se présenter à leurs visiteurs.',
    status: 'publish',
    author: 'admin',
    order: 0,
    template: 'Par défaut',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-2',
    title: 'Politique de confidentialité',
    slug: 'politique-de-confidentialite',
    content: 'Notre site respecte votre vie privée. Les données sont stockées de façon sécurisée sur Google Cloud Firestore.',
    status: 'draft',
    author: 'admin',
    order: 1,
    template: 'Pleine largeur',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const initialDefaultMedia: WPMedia[] = [
  {
    id: 'media-1',
    title: 'Espace de travail moderne',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    fileName: 'workspace.jpg',
    fileType: 'image/jpeg',
    sizeFormatted: '184 Ko',
    dimensions: '1920 × 1080',
    uploadedAt: new Date().toISOString(),
    altText: 'Bureau avec ordinateur et carnet',
  },
  {
    id: 'media-2',
    title: 'Graphique et analyse web',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    fileName: 'analytics.jpg',
    fileType: 'image/jpeg',
    sizeFormatted: '210 Ko',
    dimensions: '1920 × 1200',
    uploadedAt: new Date().toISOString(),
    altText: 'Écran montrant des statistiques web',
  }
];

export const initialDefaultComments: WPComment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    postTitle: 'Bonjour tout le monde !',
    authorName: 'Un commentateur WordPress',
    authorEmail: 'wapuu@wordpress.org',
    content: 'Bonjour, ceci est un commentaire. Pour commencer à modérer, modifier ou supprimer des commentaires, veuillez consulter l’écran des Commentaires dans le tableau de bord.',
    status: 'approved',
    createdAt: new Date().toISOString(),
  }
];

export const initialDefaultUsers: WPUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    name: 'Administrateur',
    email: 'mozartmozartoi3@gmail.com',
    role: 'administrator',
    postCount: 1,
    registeredAt: '2026-09-08',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
];

// COLLECTIONS REFERENCES
const COLL_POSTS = 'wp_posts';
const COLL_PAGES = 'wp_pages';
const COLL_MEDIA = 'wp_media';
const COLL_CATEGORIES = 'wp_categories';
const COLL_COMMENTS = 'wp_comments';
const COLL_USERS = 'wp_users';
const COLL_SETTINGS = 'wp_settings';

// JEAN AUTO VSP COLLECTIONS
const COLL_VEHICLES = 'vsp_vehicles';
const COLL_ORDERS = 'vsp_orders';
const COLL_BRANDS = 'vsp_brands';
const COLL_CUSTOMERS = 'vsp_customers';
const COLL_FAQS = 'vsp_faqs';
const COLL_ACTIVITY_LOGS = 'vsp_activity_logs';
const COLL_COMMERCIAL_SETTINGS = 'vsp_commercial_settings';
const COLL_SEO = 'vsp_seo';

function timestampToIso(val: any, fallback?: string): string {
  if (!val) return fallback || new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val?.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (typeof val?.seconds === 'number') {
    return new Date(val.seconds * 1000).toISOString();
  }
  return fallback || new Date().toISOString();
}

function stripUndefined<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (typeof input === 'object' && Object.getPrototypeOf(input) === Object.prototype) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return input;
}

function sanitizeSafeId(raw: string, prefix = 'item'): string {
  const cleaned = (raw || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return cleaned || `${prefix}-${Date.now()}`;
}

export class WordPressFirebaseService {
  // Initialize default content in Firestore ONLY when authenticated as verified admin
  static async seedInitialDataIfEmpty(): Promise<boolean> {
    if (!isAuthorizedAdminUser(auth.currentUser)) {
      return false;
    }
    try {
      const commercialSnap = await getDoc(doc(db, COLL_COMMERCIAL_SETTINGS, 'main'));
      if (!commercialSnap.exists()) {
        await setDoc(doc(db, COLL_COMMERCIAL_SETTINGS, 'main'), stripUndefined(initialDefaultCommercialSettings));
      } else {
        const existingCommercial = commercialSnap.data() as CommercialBankSettings;
        const normalizedIban = (existingCommercial?.iban || '').replace(/\s+/g, '');
        if (
          normalizedIban === 'FR7617238000010025617620609' ||
          existingCommercial?.accountHolder === 'Romeo Torvic'
        ) {
          await setDoc(
            doc(db, COLL_COMMERCIAL_SETTINGS, 'main'),
            stripUndefined({
              ...existingCommercial,
              accountHolder: initialDefaultCommercialSettings.accountHolder,
              iban: initialDefaultCommercialSettings.iban,
              bic: initialDefaultCommercialSettings.bic,
              rib: initialDefaultCommercialSettings.rib,
              updatedAt: new Date().toISOString(),
            })
          );
        }
      }

      const seoSnap = await getDoc(doc(db, COLL_SEO, 'main'));
      if (!seoSnap.exists()) {
        await setDoc(doc(db, COLL_SEO, 'main'), stripUndefined(initialDefaultSeoSettings));
      }

      const brandsSnap = await getDocs(collection(db, COLL_BRANDS));
      if (brandsSnap.empty) {
        for (const b of initialDefaultBrands) {
          await setDoc(doc(db, COLL_BRANDS, b.id), stripUndefined(b));
        }
      }

      const faqsSnap = await getDocs(collection(db, COLL_FAQS));
      if (faqsSnap.empty) {
        for (const f of initialDefaultFaqs) {
          await setDoc(doc(db, COLL_FAQS, f.id), stripUndefined(f));
        }
      }

      const settingsSnap = await getDoc(doc(db, COLL_SETTINGS, 'general'));
      if (!settingsSnap.exists()) {
        await setDoc(doc(db, COLL_SETTINGS, 'general'), stripUndefined(initialDefaultSettings));
      }

      const postsSnap = await getDocs(collection(db, COLL_POSTS));
      if (postsSnap.empty) {
        for (const post of initialDefaultPosts) {
          await setDoc(doc(db, COLL_POSTS, post.id), stripUndefined(post));
        }
        for (const page of initialDefaultPages) {
          await setDoc(doc(db, COLL_PAGES, page.id), stripUndefined(page));
        }
        for (const cat of initialDefaultCategories) {
          await setDoc(doc(db, COLL_CATEGORIES, cat.id), stripUndefined(cat));
        }
        for (const m of initialDefaultMedia) {
          await setDoc(doc(db, COLL_MEDIA, m.id), stripUndefined(m));
        }
        for (const c of initialDefaultComments) {
          await setDoc(doc(db, COLL_COMMENTS, c.id), stripUndefined(c));
        }
      }

      // Push any local/server vehicles up to Firestore so they are never lost
      await WordPressFirebaseService.syncLocalVehiclesToFirestore();
      return true;
    } catch (err) {
      console.warn('Initial Firestore seed warning:', err);
      return false;
    }
  }

  // --- POSTS ---
  static subscribePosts(callback: (posts: WPPost[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_POSTS),
      (snapshot) => {
        const posts: WPPost[] = [];
        snapshot.forEach((docSnap) => {
          posts.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(posts);
      },
      (error) => {
        console.error("Error subscribing to posts:", error);
        onError?.(error);
      }
    );
  }

  static async savePost(post: Partial<WPPost> & { title: string; content: string }): Promise<string> {
    try {
      const id = post.id || `post-${Date.now()}`;
      const now = new Date().toISOString();
      const slug = post.slug || post.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      const postData: WPPost = {
        id,
        title: post.title,
        slug: slug || 'article-sans-titre',
        content: post.content || '',
        excerpt: post.excerpt || post.content.slice(0, 140) + '...',
        status: post.status || 'publish',
        author: post.author || 'admin',
        authorEmail: post.authorEmail || 'admin@base-de-donnees-p.firebaseapp.com',
        category: post.category || 'Non classé',
        tags: post.tags || [],
        featuredImage: post.featuredImage || '',
        commentCount: post.commentCount || 0,
        createdAt: post.createdAt || now,
        updatedAt: now,
      };

      await setDoc(doc(db, COLL_POSTS, id), postData);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_POSTS);
    }
  }

  static async trashPost(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLL_POSTS, id), { status: 'trash', updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLL_POSTS}/${id}`);
    }
  }

  static async restorePost(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLL_POSTS, id), { status: 'publish', updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLL_POSTS}/${id}`);
    }
  }

  static async deletePostPermanently(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_POSTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_POSTS}/${id}`);
    }
  }

  // --- PAGES ---
  static subscribePages(callback: (pages: WPPage[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_PAGES),
      (snapshot) => {
        const pages: WPPage[] = [];
        snapshot.forEach((docSnap) => {
          pages.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(pages);
      },
      (error) => {
        console.error("Error subscribing to pages:", error);
        onError?.(error);
      }
    );
  }

  static async savePage(page: Partial<WPPage> & { title: string; content: string }): Promise<string> {
    try {
      const id = page.id || `page-${Date.now()}`;
      const now = new Date().toISOString();
      const slug = page.slug || page.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      const pageData: WPPage = {
        id,
        title: page.title,
        slug: slug || 'page-sans-titre',
        content: page.content || '',
        status: page.status || 'publish',
        author: page.author || 'admin',
        order: page.order || 0,
        parent: page.parent || '',
        template: page.template || 'Par défaut',
        createdAt: page.createdAt || now,
        updatedAt: now,
      };

      await setDoc(doc(db, COLL_PAGES, id), pageData);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_PAGES);
    }
  }

  static async trashPage(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLL_PAGES, id), { status: 'trash', updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLL_PAGES}/${id}`);
    }
  }

  static async deletePagePermanently(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_PAGES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_PAGES}/${id}`);
    }
  }

  // --- MEDIA ---
  static subscribeMedia(callback: (media: WPMedia[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_MEDIA),
      (snapshot) => {
        const mediaList: WPMedia[] = [];
        snapshot.forEach((docSnap) => {
          mediaList.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(mediaList);
      },
      (error) => {
        console.error("Error subscribing to media:", error);
        onError?.(error);
      }
    );
  }

  static async addMedia(item: Omit<WPMedia, 'id'>): Promise<string> {
    try {
      const id = `media-${Date.now()}`;
      const mediaData: WPMedia = { id, ...item };
      await setDoc(doc(db, COLL_MEDIA, id), mediaData);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_MEDIA);
    }
  }

  static async deleteMedia(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_MEDIA, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_MEDIA}/${id}`);
    }
  }

  // --- CATEGORIES ---
  static subscribeCategories(callback: (cats: WPCategory[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_CATEGORIES),
      (snapshot) => {
        const cats: WPCategory[] = [];
        snapshot.forEach((docSnap) => {
          cats.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(cats);
      },
      (error) => {
        console.error("Error subscribing to categories:", error);
        onError?.(error);
      }
    );
  }

  static async saveCategory(cat: Partial<WPCategory> & { name: string }): Promise<string> {
    try {
      const id = cat.id || `cat-${Date.now()}`;
      const slug = cat.slug || cat.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      const catData: WPCategory = {
        id,
        name: cat.name,
        slug,
        description: cat.description || '',
        count: cat.count || 0,
      };
      await setDoc(doc(db, COLL_CATEGORIES, id), catData);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_CATEGORIES);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_CATEGORIES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_CATEGORIES}/${id}`);
    }
  }

  // --- COMMENTS ---
  static subscribeComments(callback: (comments: WPComment[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_COMMENTS),
      (snapshot) => {
        const comments: WPComment[] = [];
        snapshot.forEach((docSnap) => {
          comments.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(comments);
      },
      (error) => {
        console.error("Error subscribing to comments:", error);
        onError?.(error);
      }
    );
  }

  static async addComment(comment: Omit<WPComment, 'id'>): Promise<string> {
    try {
      const id = `comment-${Date.now()}`;
      const data: WPComment = { id, ...comment };
      await setDoc(doc(db, COLL_COMMENTS, id), data);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_COMMENTS);
    }
  }

  static async updateCommentStatus(id: string, status: WPComment['status']): Promise<void> {
    try {
      await updateDoc(doc(db, COLL_COMMENTS, id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLL_COMMENTS}/${id}`);
    }
  }

  static async deleteComment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_COMMENTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_COMMENTS}/${id}`);
    }
  }

  // --- USERS ---
  static subscribeUsers(callback: (users: WPUser[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_USERS),
      (snapshot) => {
        const users: WPUser[] = [];
        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(users);
      },
      (error) => {
        console.error("Error subscribing to users:", error);
        onError?.(error);
      }
    );
  }

  static async saveUser(user: Partial<WPUser> & { username: string; email: string }): Promise<string> {
    try {
      const id = user.id || `user-${Date.now()}`;
      const userData: WPUser = {
        id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role || 'author',
        postCount: user.postCount || 0,
        registeredAt: user.registeredAt || new Date().toISOString().split('T')[0],
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`,
      };
      await setDoc(doc(db, COLL_USERS, id), userData);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_USERS);
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_USERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_USERS}/${id}`);
    }
  }

  // --- SETTINGS ---
  static subscribeSettings(callback: (settings: WPSiteSettings) => void, onError?: (err: any) => void) {
    return onSnapshot(
      doc(db, COLL_SETTINGS, 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as WPSiteSettings);
        } else {
          callback(initialDefaultSettings);
        }
      },
      (error) => {
        console.error("Error subscribing to settings:", error);
        onError?.(error);
      }
    );
  }

  static async updateSettings(settings: Partial<WPSiteSettings>): Promise<void> {
    try {
      await setDoc(doc(db, COLL_SETTINGS, 'general'), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLL_SETTINGS}/general`);
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : VEHICLES (VSP) ---
  // ==========================================
  private static memoryVehiclesCache: Vehicle[] | null = null;
  private static activeCloudSyncPromise: Promise<number> | null = null;

  private static openVehiclesIDB(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open('jean_auto_vsp_db', 1);
        req.onupgradeneeded = () => {
          const idb = req.result;
          if (!idb.objectStoreNames.contains('vehicles_store')) {
            idb.createObjectStore('vehicles_store');
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private static async idbSaveVehicles(list: Vehicle[]): Promise<void> {
    const idb = await WordPressFirebaseService.openVehiclesIDB();
    if (!idb) return;
    return new Promise((resolve) => {
      try {
        const tx = idb.transaction('vehicles_store', 'readwrite');
        tx.objectStore('vehicles_store').put(list, 'all_vehicles');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private static async idbLoadVehicles(): Promise<Vehicle[] | null> {
    const idb = await WordPressFirebaseService.openVehiclesIDB();
    if (!idb) return null;
    return new Promise((resolve) => {
      try {
        const tx = idb.transaction('vehicles_store', 'readonly');
        const req = tx.objectStore('vehicles_store').get('all_vehicles');
        req.onsuccess = () => {
          resolve(Array.isArray(req.result) ? req.result : null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  static getPendingCloudSyncIds(): Set<string> {
    try {
      const raw = localStorage.getItem('vsp_pending_cloud_sync_ids');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr.filter((x) => typeof x === 'string'));
      }
    } catch {}
    return new Set();
  }

  private static savePendingCloudSyncIds(set: Set<string>) {
    try {
      const arr = Array.from(set);
      localStorage.setItem('vsp_pending_cloud_sync_ids', JSON.stringify(arr));
      window.dispatchEvent(new CustomEvent('vsp-cloud-sync-status', { detail: arr }));
    } catch {}
  }

  private static markPendingCloudSync(id: string) {
    const set = WordPressFirebaseService.getPendingCloudSyncIds();
    set.add(id);
    WordPressFirebaseService.savePendingCloudSyncIds(set);
  }

  private static clearPendingCloudSync(id: string) {
    const set = WordPressFirebaseService.getPendingCloudSyncIds();
    if (set.has(id)) {
      set.delete(id);
      WordPressFirebaseService.savePendingCloudSyncIds(set);
    }
  }

  private static getDeletedVehicleIds(): Set<string> {
    try {
      const raw = localStorage.getItem('vsp_deleted_vehicle_ids');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr.filter((x) => typeof x === 'string'));
      }
    } catch {}
    return new Set();
  }

  private static markVehicleDeleted(id: string) {
    try {
      const set = WordPressFirebaseService.getDeletedVehicleIds();
      set.add(id);
      localStorage.setItem('vsp_deleted_vehicle_ids', JSON.stringify(Array.from(set).slice(-500)));
    } catch {}
    WordPressFirebaseService.clearPendingCloudSync(id);
  }

  private static unmarkVehicleDeleted(id: string) {
    try {
      const set = WordPressFirebaseService.getDeletedVehicleIds();
      if (set.has(id)) {
        set.delete(id);
        localStorage.setItem('vsp_deleted_vehicle_ids', JSON.stringify(Array.from(set)));
      }
    } catch {}
  }

  private static normalizeEnergy(raw: any): VehicleEnergy {
    const s = String(raw || '').toLowerCase().trim();
    if (s.includes('electr') || s.includes('électr')) return 'Électrique';
    if (s.includes('essenc')) return 'Essence';
    if (s.includes('hybr')) return 'Hybride';
    return 'Diesel';
  }

  private static normalizeCondition(raw: any): VehicleCondition {
    const s = String(raw || '').toLowerCase().trim();
    if (s.includes('neuf')) return 'Neuf';
    return 'Occasion';
  }

  private static normalizeVehicle(raw: any): Vehicle {
    const availability: VehicleAvailability =
      raw?.availability === 'reserved' || raw?.availability === 'sold'
        ? raw.availability
        : 'available';
    const status: 'publish' | 'draft' | 'trash' =
      raw?.status === 'trash'
        ? 'trash'
        : raw?.status === 'draft'
        ? 'draft'
        : 'publish';
    const rawMain = String(raw?.mainImage || '').trim();
    const safeMain = (
      rawMain ||
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80'
    ).slice(0, 500000);

    const safeGallery = Array.isArray(raw?.gallery)
      ? raw.gallery
          .filter((g: any) => typeof g === 'string' && g.trim().length > 0)
          .map((g: string) => g.slice(0, 500000))
          .slice(0, 30)
      : [safeMain];

    return {
      ...raw,
      id: sanitizeSafeId(String(raw?.id || ''), 'veh'),
      slug: String(raw?.slug || 'vehicule-vsp').slice(0, 160),
      brand: String(raw?.brand || 'Aixam').slice(0, 80),
      model: String(raw?.model || 'Modèle VSP').slice(0, 140),
      price: Math.max(1, Math.min(500000, Number(raw?.price) || 8990)),
      year: Math.max(1980, Math.min(2100, Number(raw?.year) || new Date().getFullYear())),
      mileage: Math.max(0, Math.min(1000000, Number(raw?.mileage) || 0)),
      energy: WordPressFirebaseService.normalizeEnergy(raw?.energy),
      condition: WordPressFirebaseService.normalizeCondition(raw?.condition),
      gearbox: String(raw?.gearbox || 'Automatique (variateur)').slice(0, 80),
      power: String(raw?.power || '1 ch fiscal / 6 kW').slice(0, 80),
      color: String(raw?.color || 'Gris').slice(0, 80),
      availability,
      status,
      mainImage: safeMain,
      gallery: safeGallery,
      features: Array.isArray(raw?.features)
        ? raw.features
            .filter((f: any) => typeof f === 'string' && f.trim().length > 0)
            .map((f: string) => f.slice(0, 200))
            .slice(0, 40)
        : [],
      description: String(raw?.description || '').slice(0, 10000),
      warrantyMonths: raw?.warrantyMonths !== undefined ? Math.max(0, Math.min(120, Number(raw.warrantyMonths))) : 12,
      vin: raw?.vin ? String(raw.vin).slice(0, 64) : '',
      seoTitle: raw?.seoTitle ? String(raw.seoTitle).slice(0, 200) : '',
      seoDescription: raw?.seoDescription ? String(raw.seoDescription).slice(0, 500) : '',
      createdAt: timestampToIso(raw?.createdAt),
      updatedAt: timestampToIso(raw?.updatedAt),
    } as Vehicle;
  }

  // Compresses uploaded photos into durable self-contained Data URLs so they persist forever inside Cloud Firestore
  // (never relying on ephemeral container disk paths like /uploads/vehicles/...)
  static async uploadVehicleImage(imageDataOrUrl: string, _filename = 'vsp-photo.jpg'): Promise<string> {
    if (!imageDataOrUrl || !imageDataOrUrl.startsWith('data:image/')) {
      return imageDataOrUrl;
    }
    return fitDataUrlToMaxBytes(imageDataOrUrl, 160000);
  }

  // Helper to get local cached vehicles (NEVER silently filters or wipes any valid vehicle!)
  static getLocalVehicles(): Vehicle[] {
    if (WordPressFirebaseService.memoryVehiclesCache !== null) {
      return WordPressFirebaseService.memoryVehiclesCache;
    }
    try {
      const cached = localStorage.getItem('vsp_vehicles_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((v: any) => v && v.id)
            .map((v: any) => WordPressFirebaseService.normalizeVehicle(v));
          WordPressFirebaseService.memoryVehiclesCache = cleaned;
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('Could not read local vehicles cache:', e);
    }
    return [];
  }

  // Helper to set local cached vehicles safely (unlimited via IndexedDB + best-effort localStorage)
  static setLocalVehicles(vehicles: Vehicle[]) {
    const cleaned = vehicles
      .filter((v) => v && v.id)
      .map((v) => WordPressFirebaseService.normalizeVehicle(v));

    WordPressFirebaseService.memoryVehiclesCache = cleaned;
    void WordPressFirebaseService.idbSaveVehicles(cleaned);
    try {
      localStorage.setItem('vsp_vehicles_cache', JSON.stringify(cleaned));
    } catch (e) {
      // If catalog grows beyond 5MB, keep localStorage clean instead of stale, while IndexedDB + Firestore hold everything
      try {
        localStorage.removeItem('vsp_vehicles_cache');
      } catch {}
      console.warn('localStorage 5MB limit reached; unlimited IndexedDB + Cloud Firestore active:', e);
    }
    window.dispatchEvent(new CustomEvent('vsp-vehicles-sync', { detail: cleaned }));
  }

  private static async fetchServerVehicles(): Promise<Vehicle[] | null> {
    try {
      const res = await fetch('/api/vehicles');
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.success && Array.isArray(data.vehicles)) {
        return data.vehicles.map((v: any) => WordPressFirebaseService.normalizeVehicle(v));
      }
    } catch (e) {
      console.warn('Could not fetch vehicles from server API:', e);
    }
    return null;
  }

  private static mergeVehicles(primary: Vehicle[], secondary: Vehicle[]): Vehicle[] {
    const map = new Map<string, Vehicle>();
    for (const v of secondary) {
      if (v && v.id) map.set(v.id, WordPressFirebaseService.normalizeVehicle(v));
    }
    for (const v of primary) {
      if (v && v.id) map.set(v.id, WordPressFirebaseService.normalizeVehicle(v));
    }
    return Array.from(map.values()).sort((a, b) => {
      const tA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tB - tA;
    });
  }

  static async syncLocalVehiclesToFirestore(): Promise<number> {
    if (!isAuthorizedAdminUser(auth.currentUser)) {
      return 0;
    }
    if (WordPressFirebaseService.activeCloudSyncPromise) {
      return WordPressFirebaseService.activeCloudSyncPromise;
    }
    const runSync = async (): Promise<number> => {
      try {
        const [serverList, idbList] = await Promise.all([
          WordPressFirebaseService.fetchServerVehicles(),
          WordPressFirebaseService.idbLoadVehicles(),
        ]);
        const localList = WordPressFirebaseService.getLocalVehicles();
        const deletedSet = WordPressFirebaseService.getDeletedVehicleIds();
        const pendingSet = WordPressFirebaseService.getPendingCloudSyncIds();

        const combined = WordPressFirebaseService.mergeVehicles(
          localList,
          WordPressFirebaseService.mergeVehicles(idbList || [], serverList || [])
        ).filter((v) => !deletedSet.has(v.id));

        const fsSnap = await getDocs(collection(db, COLL_VEHICLES));
        const existingIds = new Set(fsSnap.docs.map((d) => d.id));
        let synced = 0;

        for (const rawVeh of combined) {
          const needsPush = !existingIds.has(rawVeh.id) || pendingSet.has(rawVeh.id);
          if (!needsPush) continue;

          const budgeted = await fitVehicleImagesToFirestoreBudget(
            rawVeh.mainImage,
            rawVeh.gallery,
            760000
          );
          const veh = WordPressFirebaseService.normalizeVehicle({
            ...rawVeh,
            mainImage: budgeted.mainImage,
            gallery: budgeted.gallery,
          });
          const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = veh;

          if (existingIds.has(veh.id)) {
            await updateDoc(
              doc(db, COLL_VEHICLES, veh.id),
              stripUndefined({
                ...rest,
                updatedAt: serverTimestamp(),
              })
            );
          } else {
            await setDoc(
              doc(db, COLL_VEHICLES, veh.id),
              stripUndefined({
                id: veh.id,
                ...rest,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
            );
          }
          WordPressFirebaseService.clearPendingCloudSync(veh.id);
          synced++;
        }

        if (synced > 0) {
          await this.logActivity({
            action: 'Synchronisation stock vers Cloud Firestore',
            entityType: 'vehicle',
            entityId: 'sync',
            details: `${synced} véhicule(s) sauvegardé(s) de façon permanente dans Cloud Firestore.`,
            user: auth.currentUser?.email || 'Administrateur',
          });
        }
        return synced;
      } catch (err) {
        console.error('syncLocalVehiclesToFirestore error:', err);
        throw err;
      } finally {
        WordPressFirebaseService.activeCloudSyncPromise = null;
      }
    };
    WordPressFirebaseService.activeCloudSyncPromise = runSync();
    return WordPressFirebaseService.activeCloudSyncPromise;
  }

  static async clearAllVehicles(): Promise<void> {
    const existing = WordPressFirebaseService.getLocalVehicles();
    existing.forEach((v) => WordPressFirebaseService.markVehicleDeleted(v.id));
    WordPressFirebaseService.savePendingCloudSyncIds(new Set());
    WordPressFirebaseService.setLocalVehicles([]);
    try {
      await fetch('/api/vehicles', { method: 'DELETE' });
    } catch (e) {
      console.warn('Error clearing vehicles on server:', e);
    }
    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        const snap = await getDocs(collection(db, COLL_VEHICLES));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, COLL_VEHICLES, d.id));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, COLL_VEHICLES);
      }
    }
  }

  static subscribeVehicles(
    callback: (vehicles: Vehicle[]) => void,
    onError?: (err: any) => void,
    isAdmin = false
  ) {
    let isDisposed = false;

    // 1. Immediately emit synchronous local cached vehicles
    const current = WordPressFirebaseService.getLocalVehicles();
    callback(current);

    // 1b. Hydrate unlimited IndexedDB mirror asynchronously
    WordPressFirebaseService.idbLoadVehicles().then((idbList) => {
      if (isDisposed || !idbList || idbList.length === 0) return;
      const deletedSet = WordPressFirebaseService.getDeletedVehicleIds();
      const merged = WordPressFirebaseService.mergeVehicles(
        WordPressFirebaseService.getLocalVehicles(),
        idbList
      ).filter((v) => !deletedSet.has(v.id));
      WordPressFirebaseService.setLocalVehicles(merged);
      callback(merged);
    });

    // 2. Listen to local broadcast events for immediate UI sync
    const handleSyncEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Vehicle[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener('vsp-vehicles-sync', handleSyncEvent);

    // 3. Load from persistent server API (/api/vehicles)
    WordPressFirebaseService.fetchServerVehicles().then(async (serverList) => {
      if (isDisposed || serverList === null) return;
      const deletedSet = WordPressFirebaseService.getDeletedVehicleIds();
      const localList = WordPressFirebaseService.getLocalVehicles();

      if (serverList.length > 0) {
        const merged = WordPressFirebaseService.mergeVehicles(localList, serverList).filter(
          (v) => !deletedSet.has(v.id)
        );
        WordPressFirebaseService.setLocalVehicles(merged);
        callback(merged);
      } else if (localList.length > 0) {
        for (const v of localList) {
          try {
            await fetch('/api/vehicles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(v),
            });
          } catch {}
        }
      }
    });

    // 4. Firestore live real-time sync (public query uses status == 'publish' matching firestore.rules)
    const vehiclesQuery = isAdmin
      ? collection(db, COLL_VEHICLES)
      : query(collection(db, COLL_VEHICLES), where('status', '==', 'publish'));

    const unsubFirestore = onSnapshot(
      vehiclesQuery,
      async (snapshot) => {
        const firestoreList: Vehicle[] = [];
        snapshot.forEach((docSnap) => {
          firestoreList.push(
            WordPressFirebaseService.normalizeVehicle({
              id: docSnap.id,
              ...(docSnap.data() as any),
            })
          );
        });

        const deletedSet = WordPressFirebaseService.getDeletedVehicleIds();
        const pendingSet = WordPressFirebaseService.getPendingCloudSyncIds();
        const currentLocal = WordPressFirebaseService.getLocalVehicles();
        const pendingLocals = currentLocal.filter(
          (v) => pendingSet.has(v.id) && !deletedSet.has(v.id)
        );

        // Clean pending flags for vehicles now confirmed present in Cloud Firestore server snapshot
        if (!snapshot.metadata.fromCache) {
          for (const fsVeh of firestoreList) {
            if (pendingSet.has(fsVeh.id)) {
              WordPressFirebaseService.clearPendingCloudSync(fsVeh.id);
            }
          }
        }

        if (firestoreList.length > 0) {
          // Always keep Cloud Firestore + any pending unsynced locals; only keep other locals if fromCache
          const baseList = snapshot.metadata.fromCache
            ? WordPressFirebaseService.mergeVehicles(firestoreList, currentLocal)
            : WordPressFirebaseService.mergeVehicles(firestoreList, pendingLocals);

          const finalList = baseList.filter((v) => !deletedSet.has(v.id));
          WordPressFirebaseService.setLocalVehicles(finalList);
          callback(finalList);
        } else if (!snapshot.metadata.fromCache && pendingLocals.length > 0) {
          WordPressFirebaseService.setLocalVehicles(pendingLocals);
          callback(pendingLocals);
        }
      },
      (error) => {
        console.warn('Firestore vehicles sync warning:', error);
        callback(WordPressFirebaseService.getLocalVehicles());
        onError?.(error);
      }
    );

    return () => {
      isDisposed = true;
      window.removeEventListener('vsp-vehicles-sync', handleSyncEvent);
      unsubFirestore();
    };
  }

  static async saveVehicle(
    vehicle: Partial<Vehicle> & { brand: string; model: string; price: number }
  ): Promise<string> {
    const id = sanitizeSafeId(vehicle.id || `veh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, 'veh');
    WordPressFirebaseService.unmarkVehicleDeleted(id);
    const now = new Date().toISOString();
    const rawSlug =
      vehicle.slug ||
      `${vehicle.brand}-${vehicle.model}-${vehicle.year || 2024}`
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const slug = (rawSlug || `vehicule-${Date.now()}`).slice(0, 160);

    const rawMain =
      vehicle.mainImage ||
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80';
    const rawGallery = vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [rawMain];

    // Ensure every photo is durable and total document payload fits well inside Cloud Firestore (< 1 MB)
    const budgetedImages = await fitVehicleImagesToFirestoreBudget(rawMain, rawGallery, 760000);

    const data = WordPressFirebaseService.normalizeVehicle({
      id,
      slug,
      brand: vehicle.brand,
      model: vehicle.model,
      price: Number(vehicle.price) || 1,
      year: Number(vehicle.year) || new Date().getFullYear(),
      mileage: Number(vehicle.mileage) || 0,
      energy: vehicle.energy || 'Diesel',
      condition: vehicle.condition || 'Occasion',
      gearbox: vehicle.gearbox || 'Automatique (variateur)',
      power: vehicle.power || '1 ch fiscal / 6 kW',
      color: vehicle.color || 'Gris',
      availability: vehicle.availability || 'available',
      status: vehicle.status || 'publish',
      mainImage: budgetedImages.mainImage,
      gallery: budgetedImages.gallery,
      features: vehicle.features || [],
      description: vehicle.description || '',
      warrantyMonths: vehicle.warrantyMonths !== undefined ? Number(vehicle.warrantyMonths) : 12,
      vin: vehicle.vin || '',
      seoTitle:
        vehicle.seoTitle ||
        `${vehicle.brand} ${vehicle.model} sans permis à Aix-les-Bains | JEAN AUTO VSP`,
      seoDescription:
        vehicle.seoDescription ||
        `Découvrez cette ${vehicle.brand} ${vehicle.model} sans permis chez JEAN AUTO VSP. Révisée, garantie et disponible de suite. Acompte 150€.`,
      createdAt: vehicle.createdAt || now,
      updatedAt: now,
    });

    // 1. Immediately save to local persistent cache (memory + unlimited IndexedDB) & notify UI
    const currentVehicles = WordPressFirebaseService.getLocalVehicles();
    const existingIndex = currentVehicles.findIndex((v) => v.id === id);
    let updatedVehicles: Vehicle[];
    if (existingIndex >= 0) {
      updatedVehicles = [...currentVehicles];
      updatedVehicles[existingIndex] = data;
    } else {
      updatedVehicles = [data, ...currentVehicles];
    }
    WordPressFirebaseService.setLocalVehicles(updatedVehicles);

    // 2. Persist to server API (/api/vehicles)
    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Server saveVehicle warning:', err);
    }

    // 3. Synchronize to Cloud Firestore permanently when signed in as verified admin
    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        const vehRef = doc(db, COLL_VEHICLES, id);
        const existingSnap = await getDoc(vehRef);
        const { id: _id, createdAt: _c, updatedAt: _u, ...updatableFields } = data;

        if (existingSnap.exists()) {
          await updateDoc(
            vehRef,
            stripUndefined({
              ...updatableFields,
              updatedAt: serverTimestamp(),
            })
          );
        } else {
          await setDoc(
            vehRef,
            stripUndefined({
              id,
              ...updatableFields,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          );
        }

        WordPressFirebaseService.clearPendingCloudSync(id);

        await this.logActivity({
          action: existingSnap.exists() ? 'Modification véhicule' : 'Création véhicule',
          entityType: 'vehicle',
          entityId: id,
          details: `${data.brand} ${data.model} (${data.price} €) - Statut: ${data.availability}`,
          user: auth.currentUser?.email || 'Administrateur',
        });
      } catch (error) {
        WordPressFirebaseService.markPendingCloudSync(id);
        handleFirestoreError(error, OperationType.WRITE, `${COLL_VEHICLES}/${id}`);
      }
    } else {
      // Queue for automatic Cloud Firestore sync as soon as Google Admin is connected
      WordPressFirebaseService.markPendingCloudSync(id);
    }

    return id;
  }

  static async exportVehiclesBackup(): Promise<Vehicle[]> {
    const [serverList, idbList] = await Promise.all([
      WordPressFirebaseService.fetchServerVehicles(),
      WordPressFirebaseService.idbLoadVehicles(),
    ]);
    const localList = WordPressFirebaseService.getLocalVehicles();
    let cloudList: Vehicle[] = [];
    try {
      const q = isAuthorizedAdminUser(auth.currentUser)
        ? collection(db, COLL_VEHICLES)
        : query(collection(db, COLL_VEHICLES), where('status', '==', 'publish'));
      const snap = await getDocs(q);
      cloudList = snap.docs.map((d) =>
        WordPressFirebaseService.normalizeVehicle({ id: d.id, ...(d.data() as any) })
      );
    } catch {}

    return WordPressFirebaseService.mergeVehicles(
      cloudList,
      WordPressFirebaseService.mergeVehicles(localList, WordPressFirebaseService.mergeVehicles(idbList || [], serverList || []))
    );
  }

  static async importVehiclesBackup(items: any[]): Promise<number> {
    if (!Array.isArray(items) || items.length === 0) return 0;
    let imported = 0;
    for (const raw of items) {
      if (!raw || !raw.brand || !raw.model) continue;
      await WordPressFirebaseService.saveVehicle({
        ...raw,
        id: raw.id ? sanitizeSafeId(String(raw.id), 'veh') : `veh-${Date.now()}-${imported}`,
        price: Number(raw.price) || 8990,
      });
      imported++;
    }
    return imported;
  }

  static async updateVehicleAvailability(
    id: string,
    availability: VehicleAvailability
  ): Promise<void> {
    const now = new Date().toISOString();
    const currentVehicles = WordPressFirebaseService.getLocalVehicles();
    const updated = currentVehicles.map((v) =>
      v.id === id ? { ...v, availability, updatedAt: now } : v
    );
    WordPressFirebaseService.setLocalVehicles(updated);

    try {
      await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
    } catch (e) {
      console.warn('Server updateVehicleAvailability warning:', e);
    }

    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        await updateDoc(doc(db, COLL_VEHICLES, id), {
          availability,
          updatedAt: serverTimestamp(),
        });
        await this.logActivity({
          action: 'Mise à jour disponibilité véhicule',
          entityType: 'vehicle',
          entityId: id,
          details: `Disponibilité passée à: ${availability}`,
          user: auth.currentUser?.email || 'Administrateur',
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${COLL_VEHICLES}/${id}`);
      }
    }
  }

  static async duplicateVehicle(original: Vehicle): Promise<string> {
    const newId = `veh-${Date.now()}`;
    const duplicated: Partial<Vehicle> & { brand: string; model: string; price: number } = {
      ...original,
      id: newId,
      model: `${original.model} (Copie)`,
      slug: `${original.slug}-copie-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveVehicle(duplicated);
  }

  static async trashVehicle(id: string): Promise<void> {
    const now = new Date().toISOString();
    const currentVehicles = WordPressFirebaseService.getLocalVehicles();
    const updated = currentVehicles.map((v) =>
      v.id === id ? { ...v, status: 'trash' as const, updatedAt: now } : v
    );
    WordPressFirebaseService.setLocalVehicles(updated);

    try {
      await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'trash' }),
      });
    } catch {}

    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        await updateDoc(doc(db, COLL_VEHICLES, id), {
          status: 'trash',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${COLL_VEHICLES}/${id}`);
      }
    }
  }

  static async restoreVehicle(id: string): Promise<void> {
    const now = new Date().toISOString();
    const currentVehicles = WordPressFirebaseService.getLocalVehicles();
    const updated = currentVehicles.map((v) =>
      v.id === id ? { ...v, status: 'publish' as const, updatedAt: now } : v
    );
    WordPressFirebaseService.setLocalVehicles(updated);

    try {
      await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'publish' }),
      });
    } catch {}

    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        await updateDoc(doc(db, COLL_VEHICLES, id), {
          status: 'publish',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${COLL_VEHICLES}/${id}`);
      }
    }
  }

  static async deleteVehiclePermanently(id: string): Promise<void> {
    WordPressFirebaseService.markVehicleDeleted(id);
    const currentVehicles = WordPressFirebaseService.getLocalVehicles();
    const deletedVeh = currentVehicles.find((v) => v.id === id);
    const filtered = currentVehicles.filter((v) => v.id !== id);
    WordPressFirebaseService.setLocalVehicles(filtered);

    try {
      await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Server deleteVehiclePermanently warning:', e);
    }

    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        await deleteDoc(doc(db, COLL_VEHICLES, id));
        if (deletedVeh) {
          await this.logActivity({
            action: 'Suppression définitive véhicule',
            entityType: 'vehicle',
            entityId: id,
            details: `Véhicule supprimé: ${deletedVeh.brand} ${deletedVeh.model}`,
            user: auth.currentUser?.email || 'Administrateur',
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLL_VEHICLES}/${id}`);
      }
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : ORDERS (COMMANDES) ---
  // ==========================================
  static getLocalOrders(): VehicleOrder[] {
    try {
      const cached = localStorage.getItem('vsp_orders_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read local orders cache:', e);
    }
    return initialDefaultOrders;
  }

  static setLocalOrders(orders: VehicleOrder[]) {
    try {
      localStorage.setItem('vsp_orders_cache', JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('vsp-orders-sync', { detail: orders }));
    } catch (e) {
      console.warn('Could not write to local orders cache:', e);
    }
  }

  static subscribeOrders(
    callback: (orders: VehicleOrder[]) => void,
    onError?: (err: any) => void,
    isAdmin = false
  ) {
    const local = WordPressFirebaseService.getLocalOrders();
    callback(local);

    const handleSyncEvent = (e: Event) => {
      const customEvent = e as CustomEvent<VehicleOrder[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener('vsp-orders-sync', handleSyncEvent);

    // PII Isolation: only subscribe to vsp_orders on Firestore when verified admin is authenticated
    if (!isAdmin) {
      return () => {
        window.removeEventListener('vsp-orders-sync', handleSyncEvent);
      };
    }

    const unsubFirestore = onSnapshot(
      collection(db, COLL_ORDERS),
      (snapshot) => {
        const list: VehicleOrder[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          list.push({
            ...data,
            id: docSnap.id,
            createdAt: timestampToIso(data?.createdAt),
            updatedAt: timestampToIso(data?.updatedAt),
          });
        });
        if (list.length > 0) {
          const currentLocal = WordPressFirebaseService.getLocalOrders();
          const merged = [...list];
          for (const loc of currentLocal) {
            if (!merged.some((m) => m.id === loc.id)) {
              merged.unshift(loc);
            }
          }
          WordPressFirebaseService.setLocalOrders(merged);
          callback(merged);
        } else {
          callback(WordPressFirebaseService.getLocalOrders());
        }
      },
      (error) => {
        console.warn('Firestore orders sync fallback:', error);
        callback(WordPressFirebaseService.getLocalOrders());
        onError?.(error);
      }
    );

    return () => {
      window.removeEventListener('vsp-orders-sync', handleSyncEvent);
      unsubFirestore();
    };
  }

  static async createVehicleOrder(
    params: Omit<VehicleOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status' | 'history'> & {
      id?: string;
      orderNumber?: string;
      status?: OrderStatus;
    }
  ): Promise<VehicleOrder> {
    const now = new Date().toISOString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = params.orderNumber || `CMD-2026-${randomNum}`;
    const id = sanitizeSafeId(params.id || `order-${Date.now()}`, 'order');
    const defaultStatus: OrderStatus =
      params.status || (params.paymentMethod === 'card' ? 'paiement_confirme' : 'paiement_a_verifier');
    const noteText =
      params.paymentMethod === 'card'
        ? `Paiement sécurisé par Carte Bancaire (${params.cardDetails?.cardBrand?.toUpperCase() || 'CB'} •••• ${params.cardDetails?.cardLast4 || '****'}) de ${params.amountPaid} € - Autorisation N° ${params.cardDetails?.authorizationId || 'AUTH-OK'}`
        : params.paymentOption === 'installment' || params.paymentOption === 'reservation'
        ? `Réservation en ligne avec acompte de ${params.amountPaid} € par virement bancaire`
        : `Paiement comptant de ${params.amountPaid} € par virement bancaire`;

    const fullOrder: VehicleOrder = stripUndefined({
      ...params,
      id,
      orderNumber,
      vehicleId: sanitizeSafeId(params.vehicleId, 'veh'),
      status: defaultStatus,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          date: now,
          status: defaultStatus,
          note: noteText.slice(0, 1000),
          author: `${params.customer.firstName} ${params.customer.lastName}`.slice(0, 120),
        },
      ],
    });

    const currentOrders = WordPressFirebaseService.getLocalOrders();
    const updatedOrders = [fullOrder, ...currentOrders.filter((o) => o.id !== id)];
    WordPressFirebaseService.setLocalOrders(updatedOrders);

    // Only write customer & activity log on Firestore when admin is signed in (PII rules)
    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        await this.saveCustomerFromOrder(fullOrder);
      } catch (e) {
        console.warn('Customer save warning:', e);
      }
    }

    try {
      const { createdAt: _c, updatedAt: _u, ...orderBody } = fullOrder;
      await setDoc(
        doc(db, COLL_ORDERS, id),
        stripUndefined({
          ...orderBody,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      if (isAuthorizedAdminUser(auth.currentUser)) {
        await this.logActivity({
          action: 'Réservation véhicule en ligne',
          entityType: 'order',
          entityId: id,
          details: `${orderNumber} - ${params.customer.firstName} ${params.customer.lastName} (${params.vehicleName}) - Montant: ${params.amountPaid} €`,
          user: `${params.customer.firstName} ${params.customer.lastName}`,
        });
      }
    } catch (error) {
      console.warn('Firestore createVehicleOrder warning (order preserved locally & via email relay):', error);
    }

    return fullOrder;
  }

  static async saveOrder(
    order: Omit<VehicleOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'history'> & { id?: string }
  ): Promise<string> {
    const created = await this.createVehicleOrder(order);
    return created.id;
  }

  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    user = 'Administrateur'
  ): Promise<void> {
    const now = new Date().toISOString();
    const historyItem = {
      date: now,
      status,
      note: (note || `Statut mis à jour vers: ${status}`).slice(0, 1000),
      author: user.slice(0, 120),
    };

    const currentOrders = WordPressFirebaseService.getLocalOrders();
    const updatedOrders = currentOrders.map((o) => {
      if (o.id === id) {
        return {
          ...o,
          status,
          updatedAt: now,
          history: [...(o.history || []), historyItem].slice(-50),
        };
      }
      return o;
    });
    WordPressFirebaseService.setLocalOrders(updatedOrders);

    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        const orderRef = doc(db, COLL_ORDERS, id);
        const targetOrder = updatedOrders.find((o) => o.id === id);
        if (targetOrder) {
          await updateDoc(orderRef, {
            status,
            updatedAt: serverTimestamp(),
            history: targetOrder.history,
          });
        }

        await this.logActivity({
          action: 'Mise à jour statut commande',
          entityType: 'order',
          entityId: id,
          details: `Nouveau statut: ${status}. Note: ${note || 'Aucune'}`,
          user,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${COLL_ORDERS}/${id}`);
      }
    }
  }

  static async deleteOrder(id: string): Promise<void> {
    const currentOrders = WordPressFirebaseService.getLocalOrders();
    const updatedOrders = currentOrders.filter((o) => o.id !== id);
    WordPressFirebaseService.setLocalOrders(updatedOrders);

    if (isAuthorizedAdminUser(auth.currentUser)) {
      try {
        await deleteDoc(doc(db, COLL_ORDERS, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLL_ORDERS}/${id}`);
      }
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : CUSTOMERS (PII ADMIN ONLY) ---
  // ==========================================
  static subscribeCustomers(
    callback: (customers: CustomerRecord[]) => void,
    onError?: (err: any) => void,
    isAdmin = false
  ) {
    if (!isAdmin) {
      callback(initialDefaultCustomers);
      return () => {};
    }

    return onSnapshot(
      collection(db, COLL_CUSTOMERS),
      (snapshot) => {
        const list: CustomerRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as any;
          list.push({
            ...d,
            id: docSnap.id,
            lastOrderDate: timestampToIso(d?.lastOrderDate),
            createdAt: timestampToIso(d?.createdAt),
          });
        });
        callback(list.length > 0 ? list : initialDefaultCustomers);
      },
      (error) => {
        console.error('Error subscribing to customers:', error);
        callback(initialDefaultCustomers);
        onError?.(error);
      }
    );
  }

  static async saveCustomerFromOrder(order: VehicleOrder): Promise<void> {
    if (!isAuthorizedAdminUser(auth.currentUser)) return;
    try {
      const custId = sanitizeSafeId(
        `cust-${order.customer.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        'cust'
      );
      const custRef = doc(db, COLL_CUSTOMERS, custId);
      const snap = await getDoc(custRef);
      const existing = snap.exists() ? (snap.data() as CustomerRecord) : undefined;

      const updatedRecord: CustomerRecord = stripUndefined({
        id: custId,
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone,
        whatsapp: order.customer.whatsapp || order.customer.phone,
        city: order.customer.city,
        postalCode: order.customer.postalCode,
        address: order.customer.address,
        ordersCount: (existing?.ordersCount || 0) + 1,
        totalSpent: (existing?.totalSpent || 0) + order.amountPaid,
        lastOrderDate: timestampToIso(order.createdAt),
        createdAt: existing?.createdAt ? timestampToIso(existing.createdAt) : timestampToIso(order.createdAt),
      });

      await setDoc(custRef, updatedRecord);
    } catch (e) {
      console.warn('Could not sync customer record:', e);
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : BRANDS ---
  // ==========================================
  static subscribeBrands(callback: (brands: VehicleBrand[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_BRANDS),
      (snapshot) => {
        const list: VehicleBrand[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.length > 0 ? list : initialDefaultBrands);
      },
      (error) => {
        console.error('Error subscribing to brands:', error);
        callback(initialDefaultBrands);
        onError?.(error);
      }
    );
  }

  static async saveBrand(brand: Partial<VehicleBrand> & { name: string }): Promise<string> {
    try {
      const id = sanitizeSafeId(
        brand.id || `brand-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        'brand'
      );
      const slug =
        brand.slug ||
        brand.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      const data: VehicleBrand = stripUndefined({
        id,
        name: brand.name.slice(0, 80),
        slug: slug.slice(0, 100),
        description: (brand.description || '').slice(0, 1000),
        logoUrl: (brand.logoUrl || '').slice(0, 2000),
        count: Number(brand.count) || 0,
      });
      await setDoc(doc(db, COLL_BRANDS, id), data);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_BRANDS);
    }
  }

  static async deleteBrand(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_BRANDS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_BRANDS}/${id}`);
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : FAQS ---
  // ==========================================
  static subscribeFaqs(callback: (faqs: FaqItem[]) => void, onError?: (err: any) => void) {
    return onSnapshot(
      collection(db, COLL_FAQS),
      (snapshot) => {
        const list: FaqItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        list.sort((a, b) => a.order - b.order);
        callback(list.length > 0 ? list : initialDefaultFaqs);
      },
      (error) => {
        console.error('Error subscribing to faqs:', error);
        callback(initialDefaultFaqs);
        onError?.(error);
      }
    );
  }

  static async saveFaq(faq: Partial<FaqItem> & { question: string; answer: string }): Promise<string> {
    try {
      const id = sanitizeSafeId(faq.id || `faq-${Date.now()}`, 'faq');
      const data: FaqItem = stripUndefined({
        id,
        question: faq.question.slice(0, 500),
        answer: faq.answer.slice(0, 5000),
        category: (faq.category || 'Général').slice(0, 100),
        order: faq.order !== undefined ? Number(faq.order) : 1,
      });
      await setDoc(doc(db, COLL_FAQS, id), data);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLL_FAQS);
    }
  }

  static async deleteFaq(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLL_FAQS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLL_FAQS}/${id}`);
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : ACTIVITY LOGS (ADMIN ONLY) ---
  // ==========================================
  static subscribeActivityLogs(
    callback: (logs: ActivityLog[]) => void,
    onError?: (err: any) => void,
    isAdmin = false
  ) {
    if (!isAdmin) {
      callback(initialDefaultActivityLogs);
      return () => {};
    }

    return onSnapshot(
      collection(db, COLL_ACTIVITY_LOGS),
      (snapshot) => {
        const list: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(list.length > 0 ? list : initialDefaultActivityLogs);
      },
      (error) => {
        console.error('Error subscribing to activity logs:', error);
        callback(initialDefaultActivityLogs);
        onError?.(error);
      }
    );
  }

  static async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    if (!isAuthorizedAdminUser(auth.currentUser)) return;
    try {
      const id = `log-${Date.now()}`;
      const item: ActivityLog = stripUndefined({
        id,
        action: log.action.slice(0, 200),
        entityType: log.entityType,
        entityId: sanitizeSafeId(log.entityId, 'ent'),
        details: log.details.slice(0, 2000),
        user: log.user.slice(0, 120),
        timestamp: new Date().toISOString(),
      });
      await setDoc(doc(db, COLL_ACTIVITY_LOGS, id), item);
    } catch (e) {
      console.warn('Could not write activity log:', e);
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : COMMERCIAL SETTINGS ---
  // ==========================================
  private static migrateLegacyCommercialSettings(data: CommercialBankSettings): CommercialBankSettings {
    const normalizedIban = (data?.iban || '').replace(/\s+/g, '');
    if (
      normalizedIban === 'FR7617238000010025617620609' ||
      data?.accountHolder === 'Romeo Torvic'
    ) {
      return {
        ...data,
        accountHolder: initialDefaultCommercialSettings.accountHolder,
        iban: initialDefaultCommercialSettings.iban,
        bic: initialDefaultCommercialSettings.bic,
        rib: initialDefaultCommercialSettings.rib,
      };
    }
    return data;
  }

  static subscribeCommercialSettings(
    callback: (settings: CommercialBankSettings) => void,
    onError?: (err: any) => void
  ) {
    return onSnapshot(
      doc(db, COLL_COMMERCIAL_SETTINGS, 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          callback(
            WordPressFirebaseService.migrateLegacyCommercialSettings(
              docSnap.data() as CommercialBankSettings
            )
          );
        } else {
          callback(initialDefaultCommercialSettings);
        }
      },
      (error) => {
        console.error('Error subscribing to commercial settings:', error);
        callback(initialDefaultCommercialSettings);
        onError?.(error);
      }
    );
  }

  static async updateCommercialSettings(settings: Partial<CommercialBankSettings>): Promise<void> {
    try {
      const merged: CommercialBankSettings = stripUndefined({
        ...initialDefaultCommercialSettings,
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, COLL_COMMERCIAL_SETTINGS, 'main'), merged);
      await this.logActivity({
        action: 'Mise à jour paramètres commerciaux & bancaires',
        entityType: 'setting',
        entityId: 'commercial',
        details: 'Modification des coordonnées bancaires ou de l\'adresse du garage',
        user: auth.currentUser?.email || 'Administrateur',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLL_COMMERCIAL_SETTINGS}/main`);
    }
  }

  // ==========================================
  // --- JEAN AUTO VSP : SEO SETTINGS ---
  // ==========================================
  static subscribeSeoSettings(callback: (seo: SeoSettings) => void, onError?: (err: any) => void) {
    return onSnapshot(
      doc(db, COLL_SEO, 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as SeoSettings);
        } else {
          callback(initialDefaultSeoSettings);
        }
      },
      (error) => {
        console.error('Error subscribing to SEO settings:', error);
        callback(initialDefaultSeoSettings);
        onError?.(error);
      }
    );
  }

  static async updateSeoSettings(seo: Partial<SeoSettings>): Promise<void> {
    try {
      const merged: SeoSettings = stripUndefined({
        ...initialDefaultSeoSettings,
        ...seo,
      });
      await setDoc(doc(db, COLL_SEO, 'main'), merged);
      await this.logActivity({
        action: 'Mise à jour paramètres SEO & indexation',
        entityType: 'setting',
        entityId: 'seo',
        details: 'Mise à jour des balises meta, sitemap ou structured data',
        user: auth.currentUser?.email || 'Administrateur',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLL_SEO}/main`);
    }
  }
}
