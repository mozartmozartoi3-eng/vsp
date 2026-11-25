import React, { useState, useEffect } from 'react';
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
  PaymentOption,
} from '../../types/wordpress';
import { FrontHeader } from './FrontHeader';
import { FrontHero } from './FrontHero';
import { VehicleCatalog } from './VehicleCatalog';
import { VehicleDetailModal } from './VehicleDetailModal';
import { OrderFunnelModal } from './OrderFunnelModal';
import { FrontFaq } from './FrontFaq';
import { FrontContact } from './FrontContact';
import { FrontFooter } from './FrontFooter';
import { LegalPagesModal } from './LegalPagesModal';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { FrontAbout } from './FrontAbout';
import { CookieConsentBanner } from './CookieConsentBanner';
import concessionShowroomImg from '../../assets/images/concession_showroom_1789025372611.jpg';
import { ArrowLeft, Car, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

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
  vehicles = [],
  brands = [],
  faqs = [],
  commercialSettings = defaultCommercialSettings,
  activePostSlug,
  activePageSlug,
  activeVehicleSlug,
  onBackToAdmin,
  onSelectPost,
  onSelectPage,
}) => {
  const [currentSection, setCurrentSection] = useState<FrontSection>('home');
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [vehicleForOrder, setVehicleForOrder] = useState<Vehicle | null>(null);
  const [orderPaymentOption, setOrderPaymentOption] = useState<PaymentOption>('installment');
  const [legalModalTab, setLegalModalTab] = useState<
    'cgv' | 'mentions-legales' | 'confidentialite' | null
  >(null);

  useEffect(() => {
    if (activeVehicleSlug && vehicles.length > 0) {
      const matched = vehicles.find((v) => v.slug === activeVehicleSlug);
      if (matched) setSelectedVehicleForDetail(matched);
    }
  }, [activeVehicleSlug, vehicles]);

  const handleOpenOrderModal = (vehicle: Vehicle, option: PaymentOption = 'installment') => {
    setSelectedVehicleForDetail(null);
    setOrderPaymentOption(option);
    setVehicleForOrder(vehicle);
  };

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
  const currentPost = activePostSlug
    ? publishedPosts.find((p) => p.slug === activePostSlug)
    : null;
  const currentPage = activePageSlug
    ? publishedPages.find((p) => p.slug === activePageSlug)
    : null;

  const renderSectionBreadcrumb = (title: string) => (
    <div className="bg-white border-b border-slate-200 py-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => handleNavigateSection('home')}
          className="text-xs font-semibold text-slate-700 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </button>
        <div className="text-xs text-slate-500 hidden sm:block">
          Accueil / <strong className="text-slate-900">{title}</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <div>
        <FrontHeader
          commercialSettings={commercialSettings}
          onNavigateSection={handleNavigateSection}
          onBackToAdmin={onBackToAdmin}
          currentSection={currentSection}
        />

        {currentPost || currentPage ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <button
              type="button"
              onClick={() => {
                onSelectPost('');
                onSelectPage('');
              }}
              className="text-xs font-semibold text-blue-700 hover:underline mb-6 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
            <article className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
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
            {/* 1. HOME VIEW (Strict 4-section WordPress Flexbox Layout) */}
            {currentSection === 'home' && (
              <>
                <FrontHero
                  commercialSettings={commercialSettings}
                  onExploreVehicles={() => {
                    const el = document.getElementById('catalog-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      handleNavigateSection('catalog');
                    }
                  }}
                  onLearnProcess={() => handleNavigateSection('process')}
                />

                {/* Section 2: Direct Vehicle Catalog */}
                <div id="catalog-section">
                  <VehicleCatalog
                    vehicles={vehicles}
                    brands={brands}
                    onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
                    onOpenOrderModal={(veh, option) =>
                      handleOpenOrderModal(veh, option || 'installment')
                    }
                  />
                </div>

                {/* Section 3: 2-Column WordPress Dealership & 3-Step Reservation Container */}
                <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
                  <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                      {/* Left Column: 3 Clear Steps */}
                      <div className="lg:w-1/2 flex flex-col justify-between space-y-6">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                            Achat simple et transparent
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                            Comment réserver votre véhicule ?
                          </h2>
                          <p className="text-sm text-slate-600 mt-2">
                            Achetez au comptant ou bloquez immédiatement le véhicule de votre choix
                            avec {commercialSettings.installmentDepositAmount || 150} € d'acompte.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="w-7 h-7 rounded-lg bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              1
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">
                                Choisissez votre véhicule
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Consultez les photos réelles, le kilométrage et la fiche technique de nos modèles disponibles.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="w-7 h-7 rounded-lg bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              2
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">
                                Validez votre réservation
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Les coordonnées bancaires officielles de la concession vous sont remises dans le formulaire de commande.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="w-7 h-7 rounded-lg bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              3
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">
                                Retrait ou livraison à domicile
                              </h3>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Retirez le véhicule à {commercialSettings.city} ou recevez-le chez vous sous 48 à 72h partout en France.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleNavigateSection('process')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                          >
                            <span>En savoir plus sur la procédure</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Physical Dealership Showcase */}
                      <div className="lg:w-1/2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
                        <div className="aspect-[16/10] bg-slate-200 overflow-hidden">
                          <img
                            src={concessionShowroomImg}
                            alt={`Concession ${commercialSettings.companyName} à ${commercialSettings.city}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                              <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                              <span>
                                {commercialSettings.address}, {commercialSettings.postalCode}{' '}
                                {commercialSettings.city}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Showroom et atelier de préparation ouverts {commercialSettings.openingHours}.
                              Essai routier sans rendez-vous sur notre parc.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => handleNavigateSection('contact')}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Prendre contact
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavigateSection('faq')}
                              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Consulter la FAQ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* 2. CATALOG */}
            {currentSection === 'catalog' && (
              <div>
                {renderSectionBreadcrumb('Nos véhicules en stock')}
                <VehicleCatalog
                  vehicles={vehicles}
                  brands={brands}
                  onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
                  onOpenOrderModal={(veh, option) =>
                    handleOpenOrderModal(veh, option || 'installment')
                  }
                />
              </div>
            )}

            {/* 3. ABOUT */}
            {currentSection === 'about' && (
              <div>
                {renderSectionBreadcrumb('À propos')}
                <FrontAbout
                  commercialSettings={commercialSettings}
                  onNavigateCatalog={() => handleNavigateSection('catalog')}
                  onNavigateContact={() => handleNavigateSection('contact')}
                  onNavigateProcess={() => handleNavigateSection('process')}
                />
              </div>
            )}

            {/* 4. PROCESS */}
            {currentSection === 'process' && (
              <div className="bg-slate-50 border-b border-slate-200">
                {renderSectionBreadcrumb('Achat & Acompte')}
                <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
                  <div className="max-w-2xl">
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Procédure officielle
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                      Comment réserver votre véhicule avec {commercialSettings.installmentDepositAmount || 150} € d'acompte ?
                    </h1>
                    <p className="text-sm text-slate-600 mt-2">
                      Un processus transparent pour bloquer votre voiture sans permis immédiatement à votre nom.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
                      <span className="inline-flex w-8 h-8 rounded-lg bg-blue-700 text-white text-xs font-bold items-center justify-center">
                        1
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Choix du véhicule et dossier
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Sélectionnez le véhicule souhaité et cliquez sur « Commander » pour saisir vos coordonnées sur le bon de réservation.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
                      <span className="inline-flex w-8 h-8 rounded-lg bg-blue-700 text-white text-xs font-bold items-center justify-center">
                        2
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Virement de l'acompte ({commercialSettings.installmentDepositAmount || 150} €)
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Les coordonnées bancaires du garage vous sont fournies directement lors de l'étape de validation de la commande.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
                      <span className="inline-flex w-8 h-8 rounded-lg bg-blue-700 text-white text-xs font-bold items-center justify-center">
                        3
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        Préparation et livraison
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Dès réception du justificatif, le véhicule est bloqué, révisé sur 100 points et livré ou mis à disposition en concession.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Protection des coordonnées bancaires
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                          Le RIB certifié de la concession (IBAN, BIC, titulaire) est communiqué uniquement à l'étape finale de votre bon de réservation officiel.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('catalog')}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                    >
                      <Car className="w-4 h-4" />
                      <span>Choisir un véhicule</span>
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* 5. FAQ */}
            {currentSection === 'faq' && (
              <div>
                {renderSectionBreadcrumb('FAQ')}
                <FrontFaq faqs={faqs} commercialSettings={commercialSettings} />
              </div>
            )}

            {/* 6. CONTACT */}
            {currentSection === 'contact' && (
              <div>
                {renderSectionBreadcrumb('Contact')}
                <FrontContact commercialSettings={commercialSettings} />
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

      {/* Order Funnel Modal */}
      {vehicleForOrder && (
        <OrderFunnelModal
          vehicle={vehicleForOrder}
          commercialSettings={commercialSettings}
          initialPaymentOption={orderPaymentOption}
          onClose={() => setVehicleForOrder(null)}
          onOrderCreated={(order) => {
            console.log('Commande créée avec succès :', order.orderNumber);
          }}
        />
      )}

      {/* Legal Modal */}
      {legalModalTab && (
        <LegalPagesModal
          initialTab={legalModalTab}
          commercialSettings={commercialSettings}
          onClose={() => setLegalModalTab(null)}
        />
      )}

      <FrontFooter
        commercialSettings={commercialSettings}
        onNavigateSection={handleNavigateSection}
        onBackToAdmin={onBackToAdmin}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
      />

      {/* Single Clean WhatsApp Quick Contact */}
      <a
        href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          'Bonjour JEAN AUTO VSP, je souhaite des renseignements sur vos véhicules sans permis.'
        )}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 left-5 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
        aria-label="Contacter sur WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
        <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
          WhatsApp
        </span>
      </a>

      <CookieConsentBanner onOpenPrivacyPolicy={() => setLegalModalTab('confidentialite')} />
    </div>
  );
};
