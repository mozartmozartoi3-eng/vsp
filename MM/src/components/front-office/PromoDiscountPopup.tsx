import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, X, ArrowRight, Check, ShieldCheck } from 'lucide-react';

interface PromoDiscountPopupProps {
  onNavigateToCatalog: () => void;
}

export const PromoDiscountPopup: React.FC<PromoDiscountPopupProps> = ({
  onNavigateToCatalog,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed or used the promo in this session
    const hasSeenPromo = sessionStorage.getItem('jean_auto_promo_seen');
    if (hasSeenPromo) return;

    // Trigger between 5 and 10 seconds (7 seconds)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('jean_auto_promo_seen', 'true');
    setIsOpen(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('BIENVENUE5');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimOffer = () => {
    sessionStorage.setItem('jean_auto_promo_seen', 'true');
    setIsOpen(false);
    onNavigateToCatalog();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-500/30 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Fermer l'offre"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Offre Spéciale Premier Achat</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Bénéficiez de <span className="text-emerald-400">-5% de réduction</span> immédiate !
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
          Pour vous souhaiter la bienvenue chez <strong>JEAN AUTO VSP</strong>, profitez d'une remise exclusive de <strong>-5%</strong> valable sur l'ensemble de nos voitures sans permis en stock (Aixam, Ligier, Microcar, Citroën Ami, Chatenet).
        </p>

        {/* Coupon Code Block */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Votre code avantage :
            </div>
            <div className="text-xl font-black tracking-widest text-emerald-400 font-mono">
              BIENVENUE5
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copié !</span>
              </>
            ) : (
              <>
                <Tag className="w-3.5 h-3.5 text-slate-300" />
                <span>Copier le code</span>
              </>
            )}
          </button>
        </div>

        {/* Trust bullet points */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Acompte de 150 € seulement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Solde réglé à la livraison</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClaimOffer}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Profiter de mes -5% et voir nos véhicules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-3 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Non merci
          </button>
        </div>
      </div>
    </div>
  );
};
