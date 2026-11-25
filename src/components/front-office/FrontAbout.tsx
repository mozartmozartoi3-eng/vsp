import React from 'react';
import {
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Truck,
  ArrowRight,
  Wrench,
  ShieldCheck,
  CreditCard,
  Users,
} from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface FrontAboutProps {
  commercialSettings: CommercialBankSettings;
  onNavigateCatalog: () => void;
  onNavigateContact: () => void;
  onNavigateProcess: () => void;
}

export const FrontAbout: React.FC<FrontAboutProps> = ({
  commercialSettings,
  onNavigateCatalog,
  onNavigateContact,
  onNavigateProcess,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Intro Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              À propos de la concession
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {commercialSettings.companyName}, votre spécialiste VSP à {commercialSettings.city}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Concessionnaire et atelier indépendant dédié aux voitures sans permis à{' '}
              {commercialSettings.city} (Savoie) avec livraison sécurisée partout en France
              métropolitaine. Chaque véhicule est préparé, contrôlé sur 100 points et garanti.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <span>Découvrir le stock</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onNavigateContact}
                className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Nous contacter
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Flexbox: Mission + Concession Info */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="lg:w-7/12 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Une mobilité accessible à tous en toute confiance
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nous accompagnons chaque conducteur dans le choix d'un quadricycle léger fiable
              (Aixam, Ligier, Microcar, Citroën Ami, Chatenet) adapté à son quotidien :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Dès 14 ans :</strong> avec le permis AM (ancien BSR) pour une alternative sûre au deux-roues.
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Sans permis :</strong> pour toute personne née avant le 1er janvier 1988.
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Suspension de permis :</strong> solution de continuité professionnelle (hors interdiction judiciaire).
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Actifs & seniors :</strong> véhicule compact, économique et simple à stationner.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-5/12 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-700" />
                <span>Notre concession en Savoie</span>
              </h3>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{commercialSettings.companyName}</div>
                  <div>{commercialSettings.address}</div>
                  <div>
                    {commercialSettings.postalCode} {commercialSettings.city}
                  </div>
                  {commercialSettings.landmark && (
                    <div className="text-xs text-slate-500 mt-1">{commercialSettings.landmark}</div>
                  )}
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Horaires d'ouverture</strong>
                    <span>{commercialSettings.openingHours}</span>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs">
                  <Truck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Livraison à domicile</strong>
                    <span>Sous 48h à 72h partout en France métropolitaine</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{commercialSettings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour JEAN AUTO VSP, je souhaite en savoir plus sur votre concession.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp direct</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Commitments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <Wrench className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-sm text-slate-900">Atelier certifié</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              100 points de contrôle réalisés avant chaque mise en vente (moteur, variateur, freins, pneus, carrosserie).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <CreditCard className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-sm text-slate-900">Acompte de 150 €</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Réservation claire et immédiate de votre véhicule ; le solde est réglé selon la formule choisie.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-sm text-slate-900">Garantie 12 mois</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Garantie mécanique pièces et main d'œuvre avec prise en charge en concession ou réseau agréé.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <Users className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-sm text-slate-900">Démarches incluses</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gestion complète de l'immatriculation SIV et accompagnement lors de la remise des clés.
            </p>
          </div>
        </div>

        {/* Process Link Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Besoin de détails sur la réservation à distance ?
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Consultez notre procédure complète en 3 étapes ou parcourez le parc disponible.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateProcess}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Procédure d'acompte (150 €)
            </button>
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Voir les véhicules
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
