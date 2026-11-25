import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Lock
} from 'lucide-react';
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
    <footer className="bg-slate-900 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 3 Columns Layout: Brand, Navigation, Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Presentation */}
          <div className="space-y-3">
            <div className="text-white font-black text-lg tracking-tight">
              <span>{commercialSettings.companyName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Votre concessionnaire de référence en voitures sans permis neuves et occasions révisées à Aix-les-Bains et en région Auvergne-Rhône-Alpes. Livraison soignée à domicile partout en France.
            </p>
            <div className="text-[11px] text-slate-300">
              <span className="text-slate-100 font-semibold">Repère :</span> {commercialSettings.landmark}
            </div>
          </div>

          {/* Col 2: Navigation rapide */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigateSection('home')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Accueil de la concession
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('catalog')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Nos véhicules en stock
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('about')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Qui sommes-nous ?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('process')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Acompte de 150 € et réservation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('faq')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Foire aux questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('contact')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Contact et horaires
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Concession et contact direct */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider">Concession et contact</h4>
            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <div className="font-semibold text-white">{commercialSettings.address}, {commercialSettings.postalCode} {commercialSettings.city}</div>
                  <div className="text-slate-400 text-[10px]">({commercialSettings.landmark})</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`} className="font-bold text-white hover:text-emerald-300 transition-colors text-xs">
                  {commercialSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`mailto:${commercialSettings.email}`} className="hover:text-white transition-colors">
                  {commercialSettings.email}
                </a>
              </div>
              <div className="text-slate-400 text-[10px] pt-1">
                Ouvert du lundi au samedi de 08h30 à 19h00
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Legal links maintained only below copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} {commercialSettings.companyName}. Tous droits réservés. Vente de véhicules sans permis à Aix-les-Bains.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenLegal?.('cgv')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Conditions générales de vente (CGV)
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenLegal?.('mentions-legales')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Mentions légales
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenLegal?.('confidentialite')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Politique de confidentialité
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                if (onBackToAdmin) {
                  onBackToAdmin();
                } else {
                  window.location.hash = '#/admin';
                }
              }}
              className="text-slate-600 hover:text-slate-300 transition-colors cursor-pointer p-1 rounded hover:bg-slate-800/60"
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
