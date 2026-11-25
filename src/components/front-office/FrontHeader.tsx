import React from 'react';
import { Menu, X } from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';

interface FrontHeaderProps {
  commercialSettings: CommercialBankSettings;
  onNavigateSection: (sectionId: string) => void;
  onBackToAdmin?: () => void;
  currentSection?: string;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Accueil' },
  { id: 'catalog', label: 'Véhicules' },
  { id: 'process', label: 'Achat & Acompte' },
  { id: 'about', label: 'À propos' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

export const FrontHeader: React.FC<FrontHeaderProps> = ({
  commercialSettings,
  onNavigateSection,
  currentSection = 'home',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <button
          type="button"
          onClick={() => onNavigateSection('home')}
          className="text-left font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {commercialSettings.companyName || 'JEAN AUTO VSP'}
        </button>

        {/* Zone 2: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentSection === item.id ||
              (item.id === 'home' && currentSection === 'hero');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateSection(item.id)}
                className={`whitespace-nowrap py-1 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-700 text-blue-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateSection('catalog')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Voir le stock
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigateSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              onNavigateSection('catalog');
              setMobileMenuOpen(false);
            }}
            className="mt-2 w-full px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg text-center cursor-pointer"
          >
            Voir le stock
          </button>
        </div>
      )}
    </header>
  );
};
