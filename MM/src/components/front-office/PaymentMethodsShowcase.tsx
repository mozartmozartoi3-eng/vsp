import React from 'react';
import { CreditCard, Building2, ShieldCheck, FileCheck, CheckCircle2, Clock, Truck, Award, ArrowRight, Lock } from 'lucide-react';

interface PaymentMethodsShowcaseProps {
  onScrollToCatalog?: () => void;
}

export const PaymentMethodsShowcase: React.FC<PaymentMethodsShowcaseProps> = ({ onScrollToCatalog }) => {
  const handleScrollToCatalog = () => {
    if (onScrollToCatalog) {
      onScrollToCatalog();
      return;
    }
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="modes-de-paiement" className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Transparence & Sécurité Bancaire Certifiée</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nos 2 Modes de Paiement Sécurisés
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Pour réserver votre voiture sans permis chez <strong>JEAN AUTO VSP</strong>, choisissez la méthode qui vous convient le mieux. Chaque commande est protégée, enregistrée officiellement et fait l’objet de l'émission immédiate de vos documents légaux (Facture et Bon de livraison certifiés).
          </p>
        </div>

        {/* The 2 Payment Method Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Prélèvement sécurisé par Carte Bancaire */}
          <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border-2 border-blue-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-bl-xl tracking-wider">
              Recommandé & Instantané
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Mode n°1 · Réservation en ligne
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Prélèvement par Carte Bancaire
                  </h3>
                </div>
              </div>

              {/* Highlight Pill */}
              <div className="p-3.5 bg-blue-100/70 border border-blue-200 rounded-xl mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="text-xs font-extrabold text-blue-950">
                    Simple acompte de 150 € pour bloquer le véhicule
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                  CB · Visa · Mastercard
                </span>
              </div>

              {/* Key Features */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Débit direct et sécurisé :</strong> Saisie de vos coordonnées de carte bancaire avec protocole de sécurité bancaire SSL 256 bits et 3D Secure.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Validation immédiate :</strong> Votre véhicule est instantanément bloqué à votre nom sans délai d'attente.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Facture & Bon de livraison automatiques :</strong> Vos deux documents certifiés avec autorisation de prélèvement sont immédiatement édités et téléchargés au format PDF.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Paiement du solde à la livraison :</strong> Vous ne réglez le solde restant qu'au moment de la livraison à votre domicile, après essai et remise des clés.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-blue-100">
              <button
                type="button"
                onClick={handleScrollToCatalog}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <span>Choisir un véhicule et régler par prélèvement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Virement Bancaire Professionnel */}
          <div className="bg-gradient-to-b from-slate-50/70 to-white rounded-2xl border-2 border-slate-300/80 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-800 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-bl-xl tracking-wider">
              Compte Professionnel Officiel
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mode n°2 · Règlement interbancaire
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Virement Bancaire Professionnel
                  </h3>
                </div>
              </div>

              {/* Highlight Pill */}
              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-900">
                    IBAN & BIC officiels JEAN AUTO VSP
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                  Virement instantané ou SEPA
                </span>
              </div>

              {/* Key Features */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Coordonnées bancaires transparentes :</strong> RIB, IBAN et BIC fournis directement dans le formulaire de commande avec copie en un clic.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Téléversement du justificatif :</strong> Vous joignez votre capture d'écran ou document de virement directement sur le site.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Redirection automatique WhatsApp :</strong> Dès votre validation, vous êtes automatiquement redirigé vers notre messagerie WhatsApp avec le lien direct de votre preuve et le récapitulatif prérempli.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Souplesse de montant :</strong> Possibilité de régler un acompte de 150 € pour réserver ou l'intégralité au comptant selon votre choix.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleScrollToCatalog}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Choisir un véhicule et payer par virement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Guarantees bar below the two payment modes */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Garantie 12 à 24 mois</div>
              <div className="text-[11px] text-slate-500">Moteur, boîte & électronique</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Livraison 48h - 72h</div>
              <div className="text-[11px] text-slate-500">Directement à votre domicile</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">14 Jours d'essai</div>
              <div className="text-[11px] text-slate-500">Satisfait ou 100% remboursé</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Documents immédiats</div>
              <div className="text-[11px] text-slate-500">Facture & Bon de livraison PDF</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
