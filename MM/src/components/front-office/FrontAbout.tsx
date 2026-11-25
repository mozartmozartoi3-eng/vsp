import React from 'react';
import {
  Building2,
  Car,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Users,
  MapPin,
  Clock,
  Phone,
  Truck,
  ArrowRight,
  HeartHandshake,
  Award,
  CreditCard
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
    <div className="bg-slate-50/50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Notre Histoire & Nos Engagements</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Qui sommes-nous ?
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Bienvenue chez <strong>{commercialSettings.companyName}</strong>, votre concessionnaire et atelier spécialiste indépendant de la voiture sans permis à Aix-les-Bains (Savoie) et partout en France métropolitaine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNavigateCatalog}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>Découvrir nos véhicules en stock</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateContact}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <span>Nous rendre visite à Aix-les-Bains</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Presentation & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 bg-white p-8 rounded-3xl border border-gray-200 shadow-xs">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Notre Raison d'Être</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rendre la liberté de déplacement accessible à tous en toute sérénité
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              Fondée avec la conviction que chacun mérite une mobilité autonome et fiable, <strong>JEAN AUTO VSP</strong> accompagne les conducteurs de tous horizons :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Dès 14 ans :</strong> avec le permis AM (ancien BSR) pour les jeunes recherchant une alternative sûre au deux-roues.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Sans permis :</strong> pour toute personne née avant le 1er janvier 1988, sans examen requis.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Mobilité préservée :</strong> en cas de suspension ou d'annulation du permis B (sauf décision judiciaire contraire).
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Actifs et seniors :</strong> désirant une voiture citadine compacte, économique et simple à entretenir au quotidien.
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Nous sélectionnons minutieusement les plus grandes marques du marché : <strong>Aixam, Ligier, Microcar, Citroën Ami, Chatenet</strong>, pour vous proposer des modèles récents, garantis et prêts à prendre la route.
            </p>
          </div>

          {/* Right Column: Key Numbers & Physical Address Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Notre Concession en Savoie</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="font-bold text-white text-sm">{commercialSettings.companyName}</div>
                  <div>{commercialSettings.address}</div>
                  <div>{commercialSettings.postalCode} {commercialSettings.city} (Savoie)</div>
                  <div className="text-emerald-400 font-semibold mt-1">📌 {commercialSettings.landmark}</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Horaires d'accueil :</span>
                  </div>
                  <div>{commercialSettings.openingHours}</div>
                  <div className="text-slate-400">Sans interruption, du lundi au samedi</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Livraison à domicile :</span>
                  </div>
                  <div>Sous 48h à 72h partout en France métropolitaine par transporteur spécialisé</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appeler : {commercialSettings.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour JEAN AUTO VSP, je souhaite en savoir plus sur votre concession.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp direct : {commercialSettings.whatsapp}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Our 4 Pillars of Excellence */}
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nos 4 Piliers d'Excellence & de Confiance
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Chaque détail de notre service a été conçu pour votre sécurité technique, juridique et financière.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1: Atelier */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Atelier certifié</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                100 points de contrôle atelier réalisés avant chaque livraison (moteur, variateur, freins, pneus, éclairage, carrosserie). Véhicule 100% prêt à rouler.
              </p>
            </div>

            {/* Pillar 2: Sécurité Financière */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Acompte de 150 € seulement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pas de mauvaise surprise : un acompte symbolique pour bloquer le véhicule, le solde restant n'est réglé qu'à la livraison après essai complet.
              </p>
            </div>

            {/* Pillar 3: Garantie */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Garantie 12 à 24 mois</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tous nos véhicules bénéficient d'une garantie mécanique complète avec prise en charge pièces et main d'œuvre, ainsi que 14 jours d'essai satisfait ou remboursé.
              </p>
            </div>

            {/* Pillar 4: Service Humain */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Accompagnement humain</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Une équipe à votre écoute pour vous conseiller, gérer l'immatriculation (carte grise) et assurer la mise en main personnalisée lors de la livraison.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Bottom Call-to-action */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Envie de concrétiser votre projet de véhicule sans permis ?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            Consultez nos véhicules disponibles immédiatement ou contactez nos conseillers pour planifier un essai sur route à Aix-les-Bains ou une livraison à votre domicile.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onNavigateCatalog}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>Consulter nos véhicules en stock</span>
            </button>
            <button
              onClick={onNavigateProcess}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              <span>Modalités de réservation (150 €)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
