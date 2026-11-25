import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Info } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacyPolicy,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vsp_cookie_consent');
    if (!consent) {
      // Small 1s delay so page loads smoothly first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vsp_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('vsp_cookie_consent', 'refused');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Gestion des cookies"
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 max-w-lg w-full bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-5 transition-all animate-slide-up"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xl border border-amber-500/30">
          🍪
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>Gestion des cookies et confidentialité</span>
            </h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Nous utilisons des cookies pour assurer le bon fonctionnement de notre site, sécuriser vos démarches de réservation (acompte de 150 €) et mesurer la fréquentation. Vous pouvez choisir d'accepter ou de refuser à tout moment.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tout accepter</span>
            </button>

            <button
              onClick={handleRefuse}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Refuser</span>
            </button>

            {onOpenPrivacyPolicy && (
              <button
                onClick={onOpenPrivacyPolicy}
                className="text-xs text-slate-400 hover:text-blue-400 underline underline-offset-2 ml-auto cursor-pointer"
              >
                En savoir plus
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
