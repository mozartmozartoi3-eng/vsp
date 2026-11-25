import React from 'react';
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Tag,
  Receipt,
  Users,
  Building2,
  HelpCircle,
  Search,
  History,
  ExternalLink,
  MapPin,
  Phone,
  X
} from 'lucide-react';
import { AdminMenuKey } from '../../types/wordpress';

interface DealershipSidebarProps {
  activeMenu: AdminMenuKey;
  onNavigate: (key: AdminMenuKey) => void;
  pendingOrdersCount: number;
  vehiclesCount: number;
  onToggleFrontOffice: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const DealershipSidebar: React.FC<DealershipSidebarProps> = ({
  activeMenu,
  onNavigate,
  pendingOrdersCount,
  vehiclesCount,
  onToggleFrontOffice,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isSelected = (key: AdminMenuKey) => activeMenu === key;

  const handleNavClick = (key: AdminMenuKey) => {
    onNavigate(key);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full select-none bg-slate-900 text-slate-300">
      {/* Mobile Drawer Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <div className="font-extrabold text-sm text-white">JEAN AUTO VSP</div>
          <div className="text-[10px] text-slate-400">Navigation Gestion</div>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="py-4 px-3 space-y-6 overflow-y-auto flex-1">
        {/* SECTION 1: PILOTAGE */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Gestion du Parc
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('dashboard')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => handleNavClick('vehicles')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('vehicles')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 shrink-0" />
                <span>Parc Véhicules</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {vehiclesCount}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('vehicles-new')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('vehicles-new')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Ajouter un véhicule</span>
            </button>

            <button
              onClick={() => handleNavClick('vehicles-brands')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('vehicles-brands')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span>Marques & Catégories</span>
            </button>
          </nav>
        </div>

        {/* SECTION 2: VENTES ET FINANCES */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Ventes & Règlements
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('orders') || isSelected('orders-pending')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Commandes & Acomptes</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('customers')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Fichier Clients</span>
            </button>

            <button
              onClick={() => handleNavClick('commercial-settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('commercial-settings')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Coordonnées Bancaires (RIB)</span>
            </button>
          </nav>
        </div>

        {/* SECTION 3: VITRINE & OUTILS */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Vitrine & Traçabilité
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('seo')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('seo') || isSelected('vsp-seo')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Référencement SEO</span>
            </button>

            <button
              onClick={() => handleNavClick('activity-logs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected('activity-logs')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Journal d'Activité</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer: Quick FrontOffice Switch */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => {
            onToggleFrontOffice();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Voir la vitrine publique</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
