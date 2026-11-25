import React, { useState } from 'react';
import {
  Gauge,
  Pin,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Palette,
  Plug,
  Users,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Database,
  Car,
  ShoppingBag,
  CreditCard,
  Globe,
  HelpCircle,
  Activity,
  Tag,
  Building2,
  Clock
} from 'lucide-react';
import { AdminMenuKey } from '../../types/wordpress';

interface WpSidebarProps {
  activeMenu: AdminMenuKey;
  onNavigate: (menu: AdminMenuKey) => void;
  pendingCommentsCount: number;
  pendingOrdersCount?: number;
}

export const WpSidebar: React.FC<WpSidebarProps> = ({
  activeMenu,
  onNavigate,
  pendingCommentsCount,
  pendingOrdersCount = 0,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(() => {
    if (activeMenu.startsWith('vehicles')) return 'vehicles';
    if (activeMenu.startsWith('posts')) return 'posts';
    if (activeMenu.startsWith('media')) return 'media';
    if (activeMenu.startsWith('pages')) return 'pages';
    if (activeMenu.startsWith('users')) return 'users';
    if (activeMenu.startsWith('tools')) return 'tools';
    if (activeMenu.startsWith('settings')) return 'settings';
    return 'dashboard';
  });

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isCurrent = (key: AdminMenuKey) => activeMenu === key;
  const isSectionActive = (prefix: string) => activeMenu.startsWith(prefix);

  return (
    <aside
      id="adminmenuwrap"
      className={`fixed top-8 bottom-0 left-0 bg-[#1d2327] text-[#c3c4c7] text-[13px] select-none z-40 transition-all duration-200 flex flex-col border-r border-[#2c3338] ${
        collapsed ? 'w-12' : 'w-48'
      }`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' }}
    >
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-700">
        {/* Tableau de bord */}
        <div className="mb-0.5">
          <button
            onClick={() => { onNavigate('dashboard'); setOpenSection('dashboard'); }}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('dashboard') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Tableau de bord"
          >
            <Gauge className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">Tableau de bord</span>}
          </button>
        </div>

        {/* Section Header: JEAN AUTO VSP */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            JEAN AUTO VSP
          </div>
        )}
        <div className="h-px bg-[#2c3338] my-1 mx-2"></div>

        {/* Parc Véhicules VSP */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('vehicles'); onNavigate('vehicles'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('vehicles') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Véhicules sans permis"
          >
            <div className="flex items-center">
              <Car className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Parc Véhicules</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'vehicles' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'vehicles' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('vehicles')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('vehicles') ? 'text-white font-bold' : ''}`}
              >
                Tous les véhicules
              </button>
              <button
                onClick={() => onNavigate('vehicles-new')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('vehicles-new') ? 'text-white font-bold' : ''}`}
              >
                Ajouter un véhicule
              </button>
              <button
                onClick={() => onNavigate('vehicles-brands')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('vehicles-brands') ? 'text-white font-bold' : ''}`}
              >
                Marques constructeurs
              </button>
            </div>
          )}
        </div>

        {/* Commandes & Acomptes */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('orders')}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('orders') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Commandes & Acomptes"
          >
            <div className="flex items-center">
              <ShoppingBag className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Commandes & Acomptes</span>}
            </div>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Clients & Fichier */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('customers')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('customers') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Clients & Prospects"
          >
            <Users className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">Clients & Prospects</span>}
          </button>
        </div>

        {/* Coordonnées & Banque */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('commercial-settings')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('commercial-settings') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Paramètres Commerciaux & RIB"
          >
            <Building2 className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">Paramètres VSP & RIB</span>}
          </button>
        </div>

        {/* SEO & Référencement */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('seo')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('seo') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="SEO & Référencement"
          >
            <Globe className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">SEO & Google SERP</span>}
          </button>
        </div>

        {/* FAQ Rassurance */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('faqs')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('faqs') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="FAQ & Rassurance"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">FAQ Commerciale</span>}
          </button>
        </div>

        {/* Journal d'audit */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('activity-logs')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('activity-logs') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Journal d'activité"
          >
            <Activity className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">Journal d'activité</span>}
          </button>
        </div>

        {/* Section Header: CMS WORDPRESS CLASSIQUE */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            CMS & Blog
          </div>
        )}
        <div className="h-px bg-[#2c3338] my-1 mx-2"></div>

        {/* Articles */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('posts'); onNavigate('posts'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('posts') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Articles"
          >
            <div className="flex items-center">
              <Pin className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Articles</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'posts' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'posts' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('posts')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('posts') ? 'text-white font-bold' : ''}`}
              >
                Tous les articles
              </button>
              <button
                onClick={() => onNavigate('posts-new')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('posts-new') ? 'text-white font-bold' : ''}`}
              >
                Ajouter un article
              </button>
              <button
                onClick={() => onNavigate('posts-categories')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('posts-categories') ? 'text-white font-bold' : ''}`}
              >
                Catégories
              </button>
            </div>
          )}
        </div>

        {/* Médias */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('media'); onNavigate('media'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('media') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Médias"
          >
            <div className="flex items-center">
              <ImageIcon className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Médias</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'media' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'media' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('media')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('media') ? 'text-white font-bold' : ''}`}
              >
                Médiathèque
              </button>
              <button
                onClick={() => onNavigate('media-new')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('media-new') ? 'text-white font-bold' : ''}`}
              >
                Ajouter un fichier
              </button>
            </div>
          )}
        </div>

        {/* Pages */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('pages'); onNavigate('pages'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('pages') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Pages"
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Pages</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'pages' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'pages' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('pages')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('pages') ? 'text-white font-bold' : ''}`}
              >
                Toutes les pages
              </button>
              <button
                onClick={() => onNavigate('pages-new')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('pages-new') ? 'text-white font-bold' : ''}`}
              >
                Ajouter une page
              </button>
            </div>
          )}
        </div>

        {/* Commentaires */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('comments')}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('comments') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Commentaires"
          >
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Commentaires</span>}
            </div>
            {pendingCommentsCount > 0 && (
              <span className="bg-[#d63638] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCommentsCount}
              </span>
            )}
          </button>
        </div>

        <div className="h-px bg-[#2c3338] my-1 mx-2"></div>

        {/* Apparence */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('appearance')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('appearance') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Apparence"
          >
            <Palette className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">Apparence</span>}
          </button>
        </div>

        {/* Extensions */}
        <div className="mb-0.5">
          <button
            onClick={() => onNavigate('plugins')}
            className={`w-full flex items-center px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isCurrent('plugins') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Extensions"
          >
            <Plug className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && <span className="ml-2.5 truncate">Extensions</span>}
          </button>
        </div>

        {/* Utilisateurs */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('users'); onNavigate('users'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('users') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Utilisateurs"
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Utilisateurs</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'users' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'users' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('users')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('users') ? 'text-white font-bold' : ''}`}
              >
                Tous les utilisateurs
              </button>
              <button
                onClick={() => onNavigate('users-new')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('users-new') ? 'text-white font-bold' : ''}`}
              >
                Ajouter
              </button>
            </div>
          )}
        </div>

        {/* Outils & Firebase */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('tools'); onNavigate('tools-health'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('tools') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Outils"
          >
            <div className="flex items-center">
              <Wrench className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Outils</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'tools' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'tools' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('tools-health')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('tools-health') ? 'text-white font-bold' : ''}`}
              >
                Santé du site
              </button>
              <button
                onClick={() => onNavigate('tools-firebase')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] flex items-center justify-between ${isCurrent('tools-firebase') ? 'text-white font-bold' : ''}`}
              >
                <span>Liaison Firebase</span>
                <Database className="w-3 h-3 text-[#f0b849]" />
              </button>
            </div>
          )}
        </div>

        {/* Réglages */}
        <div className="mb-0.5">
          <button
            onClick={() => { toggleSection('settings'); onNavigate('settings-general'); }}
            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#135e96] hover:text-white transition-colors text-left ${
              isSectionActive('settings') ? 'bg-[#2271b1] text-white font-semibold' : ''
            }`}
            title="Réglages"
          >
            <div className="flex items-center">
              <Settings className="w-4 h-4 shrink-0 text-current" />
              {!collapsed && <span className="ml-2.5 truncate">Réglages</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={`w-3 h-3 transition-transform ${openSection === 'settings' ? 'rotate-180' : ''}`} />
            )}
          </button>
          {!collapsed && openSection === 'settings' && (
            <div className="bg-[#2c3338] py-1 text-xs text-gray-300">
              <button
                onClick={() => onNavigate('settings-general')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] ${isCurrent('settings-general') ? 'text-white font-bold' : ''}`}
              >
                Général
              </button>
              <button
                onClick={() => onNavigate('settings-firebase')}
                className={`w-full text-left px-8 py-1.5 hover:text-[#72aee6] flex items-center justify-between ${isCurrent('settings-firebase') ? 'text-white font-bold' : ''}`}
              >
                <span>Base Firebase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-[#2c3338] p-2 bg-[#1d2327]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center text-gray-400 hover:text-white px-2 py-1.5 rounded text-xs transition-colors"
          title={collapsed ? "Déplier le menu" : "Réduire le menu"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Réduire le menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
