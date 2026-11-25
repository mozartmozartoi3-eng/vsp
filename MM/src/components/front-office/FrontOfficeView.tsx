import React, { useState } from 'react';
import {
  WPPost,
  WPPage,
  WPComment,
  WPSiteSettings,
  Vehicle,
  VehicleBrand,
  VehicleOrder,
  FaqItem,
  CommercialBankSettings,
  SeoSettings,
  PaymentOption
} from '../../types/wordpress';
import { FrontHeader } from './FrontHeader';
import { FrontHero } from './FrontHero';
import { VehicleCatalog } from './VehicleCatalog';
import { VehicleDetailModal } from './VehicleDetailModal';
import { OrderFunnelModal } from './OrderFunnelModal';
import { FrontFaq } from './FrontFaq';
import { FrontContact } from './FrontContact';
import { FrontFooter } from './FrontFooter';
import { FrontStatsCounter } from './FrontStatsCounter';
import { CustomerReviewsTicker } from './CustomerReviewsTicker';
import { LegalPagesModal } from './LegalPagesModal';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { AiAssistantLea } from './AiAssistantLea';
import { ConcessionShowroomBanner } from './ConcessionShowroomBanner';
import { PaymentMethodsShowcase } from './PaymentMethodsShowcase';
import { FrontAbout } from './FrontAbout';
import { AntiScamAlertBanner } from './AntiScamAlertBanner';
import { PromoDiscountPopup } from './PromoDiscountPopup';
import { CookieConsentBanner } from './CookieConsentBanner';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Phone,
  Car,
  FileText,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface FrontOfficeViewProps {
  posts: WPPost[];
  pages: WPPage[];
  comments: WPComment[];
  settings: WPSiteSettings;
  vehicles?: Vehicle[];
  brands?: VehicleBrand[];
  orders?: VehicleOrder[];
  faqs?: FaqItem[];
  commercialSettings?: CommercialBankSettings;
  seoSettings?: SeoSettings;
  activePostSlug?: string | null;
  activePageSlug?: string | null;
  activeVehicleSlug?: string | null;
  onBackToAdmin?: () => void;
  onSelectPost: (slug: string) => void;
  onSelectPage: (slug: string) => void;
  onSelectVehicle?: (slug: string) => void;
}

const defaultCommercialSettings: CommercialBankSettings = {
  companyName: 'JEAN AUTO VSP',
  legalName: 'JEAN AUTO VSP',
  address: '11 Avenue du Grand Port',
  city: 'Aix-les-Bains',
  postalCode: '73100',
  country: 'France',
  landmark: 'Juste à côté de La Poste',
  phone: '+33 2 59 50 89 31',
  whatsapp: '+33 6 37 38 55 90',
  email: 'amautosanspermis@gmail.com',
  accountHolder: 'PHILIPPE JEAN L STIERS',
  iban: 'FR76 1723 8000 0100 4953 3957 778',
  bic: 'SCSYFRP2',
  rib: '17238 00001 00495339577 78',
  openingHours: 'Lun - Sam : 08h30 - 19h00',
  installmentDepositAmount: 150,
  updatedAt: new Date().toISOString(),
};

export type FrontSection = 'home' | 'catalog' | 'about' | 'process' | 'faq' | 'contact';

export const FrontOfficeView: React.FC<FrontOfficeViewProps> = ({
  posts,
  pages,
  comments,
  settings,
  vehicles = [],
  brands = [],
  orders = [],
  faqs = [],
  commercialSettings = defaultCommercialSettings,
  seoSettings,
  activePostSlug,
  activePageSlug,
  activeVehicleSlug,
  onBackToAdmin,
  onSelectPost,
  onSelectPage,
  onSelectVehicle,
}) => {
  const [currentSection, setCurrentSection] = useState<FrontSection>('home');
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [vehicleForOrder, setVehicleForOrder] = useState<Vehicle | null>(null);
  const [orderPaymentOption, setOrderPaymentOption] = useState<PaymentOption>('installment');
  const [legalModalTab, setLegalModalTab] = useState<'cgv' | 'mentions-legales' | 'confidentialite' | null>(null);

  const handleOpenOrderModal = (vehicle: Vehicle, option: PaymentOption = 'installment') => {
    setSelectedVehicleForDetail(null);
    setOrderPaymentOption(option);
    setVehicleForOrder(vehicle);
  };

  // Section switcher & isolation handler
  const handleNavigateSection = (sectionId: string) => {
    if (activePostSlug || activePageSlug) {
      onSelectPost('');
      onSelectPage('');
    }

    if (sectionId === 'hero' || sectionId === 'home') {
      setCurrentSection('home');
    } else if (['catalog', 'about', 'process', 'faq', 'contact'].includes(sectionId)) {
      setCurrentSection(sectionId as FrontSection);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publishedPosts = posts.filter((p) => p.status === 'publish');
  const publishedPages = pages.filter((p) => p.status === 'publish');

  const currentPost = activePostSlug ? publishedPosts.find((p) => p.slug === activePostSlug) : null;
  const currentPage = activePageSlug ? publishedPages.find((p) => p.slug === activePageSlug) : null;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <FrontHeader
          commercialSettings={commercialSettings}
          onNavigateSection={handleNavigateSection}
          onBackToAdmin={onBackToAdmin}
          currentSection={currentSection}
        />

        {/* DEDICATED ARTICLE / PAGE VIEW (IF OPENED FROM BACKOFFICE PREVIEW) */}
        {currentPost || currentPage ? (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <button
              onClick={() => {
                onSelectPost('');
                onSelectPage('');
              }}
              className="text-xs font-bold text-blue-600 hover:underline mb-6 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil JEAN AUTO VSP</span>
            </button>
            <article className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
                {currentPost ? currentPost.title : currentPage?.title}
              </h1>
              <div
                className="prose max-w-none text-slate-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: currentPost ? currentPost.content : currentPage?.content || '',
                }}
              />
            </article>
          </div>
        ) : (
          <main>
            {/* 1. HOME VIEW */}
            {currentSection === 'home' && (
              <>
                {/* Hero section */}
                <FrontHero
                  commercialSettings={commercialSettings}
                  onExploreVehicles={() => handleNavigateSection('catalog')}
                  onLearnProcess={() => handleNavigateSection('process')}
                />

                {/* Digital Key Metrics Counter */}
                <FrontStatsCounter />

                {/* Real Verified Customer Reviews Ticker (Scrolling Left to Right) */}
                <CustomerReviewsTicker />

                {/* Highly Visible Anti-Scam & Trust Alert Banner */}
                <AntiScamAlertBanner
                  commercialSettings={commercialSettings}
                  onNavigateCatalog={() => handleNavigateSection('catalog')}
                  onNavigateContact={() => handleNavigateSection('contact')}
                />

                {/* Section Cards Navigation Hub */}
                <section className="py-12 bg-white border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Explorez nos services et véhicules
                      </h2>
                      <p className="text-slate-600 text-xs sm:text-sm mt-2">
                        Accédez directement à la rubrique de votre choix pour afficher les informations dédiées.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Card 1: Catalog */}
                      <div
                        onClick={() => handleNavigateSection('catalog')}
                        className="p-6 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                            <Car className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                            Nos véhicules en stock
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Consultez notre inventaire à jour avec fiches techniques détaillées, photos réelles et prix tout compris.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center text-blue-600 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Voir le catalogue</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 2: Process */}
                      <div
                        onClick={() => handleNavigateSection('process')}
                        className="p-6 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Acompte de 150 € et réservation
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Découvrez la procédure certifiée pour réserver immédiatement votre voiture sans permis par virement officiel.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center text-emerald-700 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Consulter la démarche</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 3: FAQ */}
                      <div
                        onClick={() => handleNavigateSection('faq')}
                        className="p-6 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-gray-200 hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                            <HelpCircle className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                            Foire aux questions
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Âge requis (dès 14 ans), permis AM, assurances, garanties 12 mois, livraison à domicile : toutes les réponses.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center text-purple-600 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Consulter la FAQ</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 4: Contact & Access */}
                      <div
                        onClick={() => handleNavigateSection('contact')}
                        className="p-6 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-gray-200 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                            Contact et horaires
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            11 Avenue du Grand Port à Aix-les-Bains. Formulaire direct, numéro de téléphone et WhatsApp de la concession.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center text-amber-700 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Voir les coordonnées</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Quick Trust Ribbons */}
                <div className="bg-slate-900 border-y border-slate-800 py-6 text-white text-xs">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">Véhicules 100 % révisés</div>
                        <div className="text-slate-400 text-[11px]">Contrôle 100 points atelier</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">Acompte de 150 € sécurisé</div>
                        <div className="text-slate-400 text-[11px]">Réservation immédiate certifiée</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">Concession à Aix-les-Bains</div>
                        <div className="text-slate-400 text-[11px]">11 Avenue du Grand Port</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">Livraison à domicile</div>
                        <div className="text-slate-400 text-[11px]">Partout en Savoie et en France</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SHOWCASE COMPLET DES 2 MODES DE PAIEMENT SÉCURISÉS (PRÉLÈVEMENT CB & VIREMENT BANCAIRE) */}
                <PaymentMethodsShowcase
                  onScrollToCatalog={() => {
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* VÉHICULES EN DIRECT SUR L'ACCUEIL */}
                <section id="catalog-section" className="py-14 bg-slate-50 border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-200">
                          <Car className="w-3.5 h-3.5" />
                          <span>Inventaire officiel en direct</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          Nos voitures sans permis en stock
                        </h2>
                        <p className="text-slate-600 text-xs sm:text-sm mt-1">
                          Tout véhicule ajouté ou modifié depuis le backoffice apparaît automatiquement ici. Révisés 100 points, garantis avec possibilité de réservation par acompte de 150 €.
                        </p>
                      </div>

                      <button
                        onClick={() => handleNavigateSection('catalog')}
                        className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Voir tout le catalogue ({vehicles.filter(v => v.status === 'publish').length} véhicules)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <VehicleCatalog
                      vehicles={vehicles}
                      brands={brands}
                      onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
                      onOpenOrderModal={(veh, option) => handleOpenOrderModal(veh, option || 'installment')}
                    />
                  </div>
                </section>

                {/* Concession Showroom & Physical Dealership Showcase */}
                <ConcessionShowroomBanner
                  commercialSettings={commercialSettings}
                  onNavigateContact={() => handleNavigateSection('contact')}
                  onNavigateCatalog={() => handleNavigateSection('catalog')}
                />
              </>
            )}

            {/* 2. ISOLATED SECTION: CATALOG */}
            {currentSection === 'catalog' && (
              <div className="bg-slate-50/50 min-h-screen">
                {/* Top return bar & breadcrumb */}
                <div className="bg-white border-b border-gray-200 py-4 shadow-xs">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleNavigateSection('home')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour à l'accueil</span>
                    </button>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <span>Accueil</span> <span className="mx-1">/</span> <strong className="text-slate-900">Nos véhicules en stock</strong>
                    </div>
                  </div>
                </div>

                {/* Content: ONLY the catalog */}
                <VehicleCatalog
                  vehicles={vehicles}
                  brands={brands}
                  onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
                  onOpenOrderModal={(veh, option) => handleOpenOrderModal(veh, option || 'installment')}
                />

                {/* Bottom return bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center border-t border-gray-200">
                  <button
                    onClick={() => handleNavigateSection('home')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil du site</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: QUI SOMMES-NOUS ? */}
            {currentSection === 'about' && (
              <div className="bg-slate-50/50 min-h-screen">
                {/* Top return bar & breadcrumb */}
                <div className="bg-white border-b border-gray-200 py-4 shadow-xs">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleNavigateSection('home')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour à l'accueil</span>
                    </button>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <span>Accueil</span> <span className="mx-1">/</span> <strong className="text-slate-900">Qui sommes-nous ?</strong>
                    </div>
                  </div>
                </div>

                {/* Content: ONLY FrontAbout */}
                <FrontAbout
                  commercialSettings={commercialSettings}
                  onNavigateCatalog={() => handleNavigateSection('catalog')}
                  onNavigateContact={() => handleNavigateSection('contact')}
                  onNavigateProcess={() => handleNavigateSection('process')}
                />

                {/* Bottom return bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center border-t border-gray-200">
                  <button
                    onClick={() => handleNavigateSection('home')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil du site</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. ISOLATED SECTION: PROCESS ACOMPTE 150 € */}
            {currentSection === 'process' && (
              <div className="bg-white min-h-screen">
                {/* Top return bar & breadcrumb */}
                <div className="bg-white border-b border-gray-200 py-4 shadow-xs">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleNavigateSection('home')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour à l'accueil</span>
                    </button>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <span>Accueil</span> <span className="mx-1">/</span> <strong className="text-slate-900">Acompte de 150 € et réservation</strong>
                    </div>
                  </div>
                </div>

                {/* Content: ONLY the Reservation Process Information */}
                <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Procédure de réservation</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      Comment réserver votre véhicule avec 150 € d'acompte ?
                    </h1>
                    <p className="text-slate-600 text-sm mt-3">
                      Pour garantir une sécurité totale et bloquer immédiatement le véhicule à votre nom, nous appliquons un protocole simple et transparent.
                    </p>
                  </div>

                  {/* 3 Step Process Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Step 1 */}
                    <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 relative shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md mb-4">
                        1
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Choix du véhicule et saisie des coordonnées</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Sélectionnez la voiture sans permis de votre choix dans notre inventaire. Cliquez sur "Réserver (150 €)" et renseignez vos coordonnées nécessaires à l'établissement du bon de réservation officiel.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 relative shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md mb-4">
                        2
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Virement bancaire sécurisé de l'acompte</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Les coordonnées bancaires certifiées du garage vous sont communiquées lors de la validation du formulaire. Effectuez le virement de l'acompte de 150 € en mentionnant impérativement votre nom et prénom en motif.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 relative shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md mb-4">
                        3
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Blocage garanti et livraison ou retrait</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Dès transmission de votre preuve de virement (sur le site ou par WhatsApp), le véhicule passe sous statut "Réservé". Nous organisons ensuite le retrait au garage d'Aix-les-Bains ou la livraison à votre domicile.
                      </p>
                    </div>
                  </div>

                  {/* Trust & Safe Notice Banner (No public bank coordinates) */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confidentialité et protection des paiements</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-white">
                          Coordonnées bancaires communiquées lors de la commande
                        </h3>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                          Conformément à nos protocoles de sécurité, le RIB officiel certifié de la concession (IBAN, BIC et titulaire) vous est remis directement et de façon confidentielle dans le formulaire officiel de réservation au moment où vous saisissez votre commande.
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          onClick={() => handleNavigateSection('catalog')}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Car className="w-4 h-4" />
                          <span>Choisir un véhicule à réserver</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Bottom return bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center border-t border-gray-200">
                  <button
                    onClick={() => handleNavigateSection('home')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil du site</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. ISOLATED SECTION: FAQ */}
            {currentSection === 'faq' && (
              <div className="bg-slate-50/50 min-h-screen">
                {/* Top return bar & breadcrumb */}
                <div className="bg-white border-b border-gray-200 py-4 shadow-xs">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleNavigateSection('home')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour à l'accueil</span>
                    </button>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <span>Accueil</span> <span className="mx-1">/</span> <strong className="text-slate-900">Foire aux questions</strong>
                    </div>
                  </div>
                </div>

                {/* Content: ONLY the FAQ */}
                <FrontFaq faqs={faqs} commercialSettings={commercialSettings} />

                {/* Bottom return bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center border-t border-gray-200">
                  <button
                    onClick={() => handleNavigateSection('home')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil du site</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. ISOLATED SECTION: CONTACT & LOCATION */}
            {currentSection === 'contact' && (
              <div className="bg-slate-50/50 min-h-screen">
                {/* Top return bar & breadcrumb */}
                <div className="bg-white border-b border-gray-200 py-4 shadow-xs">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleNavigateSection('home')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour à l'accueil</span>
                    </button>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <span>Accueil</span> <span className="mx-1">/</span> <strong className="text-slate-900">Contact et horaires</strong>
                    </div>
                  </div>
                </div>

                {/* Content: ONLY FrontContact (clean address, form, and contact info) */}
                <FrontContact commercialSettings={commercialSettings} />

                {/* Bottom return bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center border-t border-gray-200">
                  <button
                    onClick={() => handleNavigateSection('home')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil du site</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          commercialSettings={commercialSettings}
          onClose={() => setSelectedVehicleForDetail(null)}
          onOpenOrderModal={(veh, option) => handleOpenOrderModal(veh, option || 'installment')}
        />
      )}

      {/* Order Funnel Modal (where official bank details appear) */}
      {vehicleForOrder && (
        <OrderFunnelModal
          vehicle={vehicleForOrder}
          commercialSettings={commercialSettings}
          initialPaymentOption={orderPaymentOption}
          onClose={() => setVehicleForOrder(null)}
          onOrderCreated={(order) => {
            console.log("Commande créée avec succès :", order.orderNumber);
          }}
        />
      )}

      {/* Legal & Trust Pages Modal with window close action */}
      {legalModalTab && (
        <LegalPagesModal
          initialTab={legalModalTab}
          commercialSettings={commercialSettings}
          onClose={() => setLegalModalTab(null)}
        />
      )}

      {/* Footer with legal trust links */}
      <FrontFooter
        commercialSettings={commercialSettings}
        onNavigateSection={handleNavigateSection}
        onBackToAdmin={onBackToAdmin}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
      />

      {/* Floating WhatsApp Button with official WhatsApp logo (Bottom Left) */}
      <a
        href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour JEAN AUTO VSP, je souhaite des renseignements sur vos véhicules sans permis.')}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 left-5 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-emerald-500/30 flex items-center gap-2.5 transition-all transform hover:scale-105 group cursor-pointer"
        aria-label="Contacter sur WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5 sm:w-5 sm:h-5 text-white shrink-0" />
        <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">
          WhatsApp direct
        </span>
      </a>

      {/* AI Assistant Léa (Bottom Right) */}
      <AiAssistantLea
        vehicles={vehicles}
        commercialSettings={commercialSettings}
        onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
        onOpenOrderModal={(veh) => handleOpenOrderModal(veh, 'installment')}
      />

      {/* Promotional Discount Popup (-5% after 7 seconds) */}
      <PromoDiscountPopup
        onNavigateToCatalog={() => handleNavigateSection('catalog')}
      />

      {/* Cookie Consent Banner (RGPD / Cookies 🍪) */}
      <CookieConsentBanner
        onOpenPrivacyPolicy={() => setLegalModalTab('confidentialite')}
      />
    </div>
  );
};
