import React from 'react';
import {
  Car,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';

interface FrontHeaderProps {
  commercialSettings: CommercialBankSettings;
  onNavigateSection: (sectionId: string) => void;
  onBackToAdmin?: () => void;
  currentSection?: string;
}

export const FrontHeader: React.FC<FrontHeaderProps> = ({
  commercialSettings,
  onNavigateSection,
  onBackToAdmin,
  currentSection = 'home',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand without vehicle icon */}
        <div
          onClick={() => onNavigateSection('home')}
          className="cursor-pointer flex items-center gap-3 select-none"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-slate-950 font-sans">
                JEAN AUTO <span className="text-blue-600">VSP</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Aix-les-Bains
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Concessionnaire voitures sans permis à Aix-les-Bains (73)
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-semibold">
          <button
            onClick={() => onNavigateSection('home')}
            className={`transition-colors cursor-pointer py-1.5 px-3 rounded-lg ${
              currentSection === 'home' || currentSection === 'hero'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => onNavigateSection('catalog')}
            className={`transition-colors cursor-pointer py-1.5 px-3 rounded-lg ${
              currentSection === 'catalog'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Nos véhicules en stock
          </button>
          <button
            onClick={() => onNavigateSection('about')}
            className={`transition-colors cursor-pointer py-1.5 px-3 rounded-lg ${
              currentSection === 'about'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Qui sommes-nous ?
          </button>
          <button
            onClick={() => onNavigateSection('process')}
            className={`transition-colors cursor-pointer py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
              currentSection === 'process'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            <span>Modes de paiement & Acompte</span>
          </button>
          <button
            onClick={() => onNavigateSection('faq')}
            className={`transition-colors cursor-pointer py-1.5 px-3 rounded-lg ${
              currentSection === 'faq'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Foire aux questions
          </button>
          <button
            onClick={() => onNavigateSection('contact')}
            className={`transition-colors cursor-pointer py-1.5 px-3 rounded-lg ${
              currentSection === 'contact'
                ? 'text-blue-600 bg-blue-50 font-bold'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Contact et horaires
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => onNavigateSection('catalog')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Nos véhicules en stock
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-md"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2">
          <button
            onClick={() => { onNavigateSection('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer ${
              currentSection === 'home' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-800'
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => { onNavigateSection('catalog'); setMobileMenuOpen(false); }}
            className={`w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer ${
              currentSection === 'catalog' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-800'
            }`}
          >
            Nos véhicules en stock
          </button>
          <button
            onClick={() => { onNavigateSection('about'); setMobileMenuOpen(false); }}
            className={`w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer ${
              currentSection === 'about' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-800'
            }`}
          >
            Qui sommes-nous ?
          </button>
          <button
            onClick={() => { onNavigateSection('process'); setMobileMenuOpen(false); }}
            className={`w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer ${
              currentSection === 'process' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-800'
            }`}
          >
            Modes de paiement & Acompte
          </button>
          <button
            onClick={() => { onNavigateSection('faq'); setMobileMenuOpen(false); }}
            className={`w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer ${
              currentSection === 'faq' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-800'
            }`}
          >
            Foire aux questions
          </button>
          <button
            onClick={() => { onNavigateSection('contact'); setMobileMenuOpen(false); }}
            className={`w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer ${
              currentSection === 'contact' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-800'
            }`}
          >
            Contact et horaires
          </button>
        </div>
      )}
    </header>
  );
};
