import React from 'react';
import { MapPin, Phone, Mail, Lock } from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';

interface FrontFooterProps {
  commercialSettings: CommercialBankSettings;
  onNavigateSection: (sectionId: string) => void;
  onBackToAdmin?: () => void;
  onOpenLegal?: (tab: 'cgv' | 'mentions-legales' | 'confidentialite') => void;
}

export const FrontFooter: React.FC<FrontFooterProps> = ({
  commercialSettings,
  onNavigateSection,
  onOpenLegal,
  onBackToAdmin,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* 3-Column Flexbox Layout */}
        <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-slate-800">
          {/* Col 1: Dealership Identity */}
          <div className="md:w-1/3 space-y-3">
            <div className="text-white font-bold text-base tracking-tight">
              {commercialSettings.companyName}
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Spécialiste de la vente de voitures sans permis révisées et garanties à{' '}
              {commercialSettings.city}. Retrait en concession ou livraison sécurisée partout en France.
            </p>
            <div className="text-xs text-slate-400">
              {commercialSettings.openingHours || 'Lun - Sam : 08h30 - 19h00'}
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:w-1/4 space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Véhicules en stock
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('process')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Achat & Acompte 150 €
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  À propos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="md:w-1/3 space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Concession
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white">
                    {commercialSettings.address}, {commercialSettings.postalCode}{' '}
                    {commercialSettings.city}
                  </div>
                  {commercialSettings.landmark && (
                    <div className="text-slate-400 text-[11px]">{commercialSettings.landmark}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
                  className="font-semibold text-white hover:text-blue-400 transition-colors"
                >
                  {commercialSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${commercialSettings.email}`}
                  className="hover:text-white transition-colors"
                >
                  {commercialSettings.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {commercialSettings.companyName}. Tous droits réservés.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenLegal?.('cgv')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              CGV
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.('mentions-legales')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Mentions légales
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.('confidentialite')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Confidentialité
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                if (onBackToAdmin) {
                  onBackToAdmin();
                } else {
                  window.location.hash = '#/login';
                }
              }}
              className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer p-1"
              title="Accès administration"
              aria-label="Accès administration"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
