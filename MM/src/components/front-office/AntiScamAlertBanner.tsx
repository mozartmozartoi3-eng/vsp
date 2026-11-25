import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Building2,
  CreditCard,
  PhoneCall,
  FileCheck,
  Video,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface AntiScamAlertBannerProps {
  commercialSettings: CommercialBankSettings;
  onNavigateContact?: () => void;
  onNavigateCatalog?: () => void;
}

export const AntiScamAlertBanner: React.FC<AntiScamAlertBannerProps> = ({
  commercialSettings,
  onNavigateContact,
  onNavigateCatalog,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-gradient-to-r from-amber-500/10 via-red-500/5 to-blue-500/10 border-y-2 border-amber-400/50 py-6 sm:py-8 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Alert Card */}
        <div className="bg-white rounded-3xl border border-amber-300 shadow-lg p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle watermarked shield */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Vigilance & Sécurité Acheteur</span>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Concessionnaire 100 % Certifié & Contrôlé</span>
            </div>
          </div>

          {/* Title & Awareness Statement */}
          <div className="max-w-4xl space-y-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Alerte Arnaques sur Internet : <span className="text-blue-700">Pourquoi vous êtes en totale sécurité</span> chez JEAN AUTO VSP
            </h2>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              Nous sommes <strong>pleinement conscients de la recrudescence d'arnaques</strong> dans le domaine de la vente de voitures sans permis sur internet (faux vendeurs Leboncoin ou Facebook, fausses concessions fantômes, demandes d'acomptes exorbitants, coupons PCS, Transcash ou faux transporteurs exigeant la totalité du paiement avant livraison).
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Notre engagement absolu :</strong> Chez JEAN AUTO VSP, il n'est pas question que vous preniez le moindre risque. Nous refusons catégoriquement les pratiques douteuses et mettons à votre disposition des <strong>garanties concrètes, juridiques et physiques vérifiables</strong>.
              </div>
            </div>
          </div>

          {/* 6 Unforgeable Proofs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Proof 1: Real physical showroom */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">1. Vraie concession physique</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Notre showroom et atelier sont situés au <strong>11 Avenue du Grand Port, 73100 Aix-les-Bains</strong> (juste à côté de La Poste). Nous existons réellement et vous accueillons du lundi au samedi de 8h30 à 19h00.
                </p>
              </div>
            </div>

            {/* Proof 2: 150€ deposit only */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">2. Acompte de 150 € seulement</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vous ne payez <strong>JAMAIS le véhicule à l'avance</strong>. Seul un acompte de 150 € est requis pour bloquer le véhicule. <strong>Le solde n'est payé QU'À LA LIVRAISON</strong> après essai et inspection du véhicule !
                </p>
              </div>
            </div>

            {/* Proof 3: French registered company */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">3. Société française au RCS</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Entreprise française officiellement immatriculée au Registre du Commerce. SIRET officiel vérifiable en toute transparence sur societe.com, Infogreffe et dans nos mentions légales.
                </p>
              </div>
            </div>

            {/* Proof 4: Regulated payment channels */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">4. Circuits bancaires tracés</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paiement sécurisé par <strong>Carte Bancaire 3D Secure</strong> ou <strong>Virement bancaire professionnel</strong>. Nous ne vous demanderons <strong>JAMAIS</strong> de coupons PCS, Transcash ou mandat cash.
                </p>
              </div>
            </div>

            {/* Proof 5: 14-day refund & 12-24m warranty */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">5. 14 jours satisfait ou remboursé</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vous disposez d'un délai légal de 14 jours pour essayer le véhicule en conditions réelles. Si le véhicule ne correspond pas à vos attentes, nous le reprenons avec remboursement intégral sans complication.
                </p>
              </div>
            </div>

            {/* Proof 6: Video call on WhatsApp */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">6. Appel vidéo en direct</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Un doute ? Demandez-nous un <strong>appel vidéo WhatsApp</strong> ! Nos conseillers vous montrent le véhicule en direct dans notre atelier, son moteur en marche et les papiers officiels.
                </p>
              </div>
            </div>
          </div>

          {/* Direct contact action strip */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Parler à un conseiller maintenant :</span>
              <a
                href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{commercialSettings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour, je souhaite échanger de vive voix ou par appel vidéo sur un véhicule sans permis.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp : {commercialSettings.whatsapp}</span>
              </a>
            </div>

            {onNavigateCatalog && (
              <button
                onClick={onNavigateCatalog}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Explorer nos véhicules en toute sérénité
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
