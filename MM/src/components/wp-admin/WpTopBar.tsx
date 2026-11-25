import React, { useState } from 'react';
import {
  Globe,
  Plus,
  MessageSquare,
  RotateCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  ExternalLink,
  Sliders,
  Layers,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { firebaseConfig, FirebaseConnectionStatus } from '../../firebase';
import { WPSiteSettings } from '../../types/wordpress';

interface WpTopBarProps {
  settings: WPSiteSettings;
  connectionStatus: FirebaseConnectionStatus;
  unreadCommentsCount: number;
  onNavigate: (key: any) => void;
  onTestConnection: () => void;
  isFrontOffice: boolean;
  onToggleFrontOffice: () => void;
  onOpenNewPost: () => void;
  onOpenNewPage: () => void;
  onOpenNewMedia: () => void;
}

export const WpTopBar: React.FC<WpTopBarProps> = ({
  settings,
  connectionStatus,
  unreadCommentsCount,
  onNavigate,
  onTestConnection,
  isFrontOffice,
  onToggleFrontOffice,
  onOpenNewPost,
  onOpenNewPage,
  onOpenNewMedia,
}) => {
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  return (
    <>
      <header
        id="wpadminbar"
        className="h-8 bg-[#1d2327] text-[#f0f0f1] text-[13px] flex items-center justify-between px-3 fixed top-0 left-0 right-0 z-50 select-none border-b border-[#2c3338]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' }}
      >
        {/* Left Section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* WordPress W Logo */}
          <div
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#2271b1] cursor-pointer text-white font-bold text-sm tracking-tighter"
            title="À propos de WordPress & Firebase"
            onClick={() => onNavigate('dashboard')}
          >
            <span className="font-serif italic font-black text-base">W</span>
          </div>

          {/* Site Title & View Site toggle */}
          <button
            id="wp-topbar-site-link"
            onClick={onToggleFrontOffice}
            className={`flex items-center space-x-1.5 px-2.5 h-8 hover:bg-[#2271b1] transition-colors rounded-none font-semibold ${
              isFrontOffice ? 'bg-[#2271b1]' : ''
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-gray-300" />
            <span className="hidden sm:inline truncate max-w-[160px]">{settings.siteTitle || 'Mon Site'}</span>
            <span className="text-[11px] text-gray-300 font-normal ml-1">
              {isFrontOffice ? '← Backoffice' : 'Visiter le site'}
            </span>
          </button>

          {/* Comments Quick Counter */}
          <button
            id="wp-topbar-comments"
            onClick={() => onNavigate('comments')}
            className="flex items-center space-x-1 px-2 h-8 hover:bg-[#2271b1] text-gray-300 hover:text-white"
            title={`${unreadCommentsCount} commentaire(s) en attente`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="bg-[#d63638] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCommentsCount}
            </span>
          </button>

          {/* "+ Créer" Dropdown */}
          <div className="relative">
            <button
              id="wp-topbar-create-btn"
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              onBlur={() => setTimeout(() => setShowCreateDropdown(false), 200)}
              className="flex items-center space-x-1 px-2.5 h-8 hover:bg-[#2271b1] text-gray-200 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Créer</span>
            </button>

            {showCreateDropdown && (
              <div className="absolute top-8 left-0 w-44 bg-[#2c3338] text-gray-200 shadow-xl py-1 z-50 text-xs border-t border-[#3c434a]">
                <button
                  onClick={() => { setShowCreateDropdown(false); onOpenNewPost(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>Article</span>
                </button>
                <button
                  onClick={() => { setShowCreateDropdown(false); onOpenNewMedia(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>Fichier média</span>
                </button>
                <button
                  onClick={() => { setShowCreateDropdown(false); onOpenNewPage(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2"
                >
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>Page</span>
                </button>
                <button
                  onClick={() => { setShowCreateDropdown(false); onNavigate('users-new'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>Utilisateur</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Firebase Status Pill & Profile */}
        <div className="flex items-center space-x-2">
          {/* Firebase Connection Pill */}
          <button
            id="wp-topbar-firebase-status"
            onClick={() => setShowFirebaseModal(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              connectionStatus.connected
                ? 'bg-[#007017]/40 hover:bg-[#007017]/70 text-[#70db87] border border-[#00a32a]/50'
                : 'bg-[#d63638]/30 hover:bg-[#d63638]/50 text-[#ff8085] border border-[#d63638]/60'
            }`}
            title="Cliquez pour inspecter la connexion Firebase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-sans font-semibold">Firebase:</span>
            <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current"></span>
            <span className="font-semibold">{firebaseConfig.projectId}</span>
            {connectionStatus.latencyMs !== undefined && (
              <span className="text-[10px] opacity-80">({connectionStatus.latencyMs}ms)</span>
            )}
          </button>

          {/* Admin Profile */}
          <div className="relative">
            <button
              id="wp-topbar-profile-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
              className="flex items-center space-x-1.5 px-2 h-8 hover:bg-[#2271b1] transition-colors"
            >
              <span className="text-gray-300 hidden md:inline">Salutations, </span>
              <span className="font-semibold text-white">admin</span>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover ml-1 border border-gray-600"
              />
            </button>

            {showUserDropdown && (
              <div className="absolute top-8 right-0 w-48 bg-[#2c3338] text-gray-200 shadow-xl py-2 z-50 text-xs border-t border-[#3c434a]">
                <div className="px-3 py-2 border-b border-gray-700 flex items-center space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-white">Administrateur</div>
                    <div className="text-[10px] text-gray-400 truncate">admin@base-de-donnees-p</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowUserDropdown(false); onNavigate('users'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>Modifier mon profil</span>
                </button>
                <button
                  onClick={() => { setShowUserDropdown(false); setShowFirebaseModal(true); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-gray-400" />
                  <span>État Firebase</span>
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={() => { setShowUserDropdown(false); onTestConnection(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2271b1] hover:text-white flex items-center space-x-2 text-gray-300"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tester le ping Firebase</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Firebase Inspector Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white text-gray-900 rounded-lg shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-[#1d2327] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-[#f0b849]" />
                <h3 className="font-semibold text-base">Vérification de la base de données Firebase</h3>
              </div>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="text-gray-400 hover:text-white text-xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded">
                {connectionStatus.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {connectionStatus.connected
                      ? 'Liaison Firebase active et confirmée'
                      : 'Connexion Firebase en cours ou en attente'}
                  </h4>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Le site et le backoffice WordPress sont directement connectés au projet Firebase{' '}
                    <code className="bg-gray-200 px-1 rounded font-mono font-bold text-gray-800">
                      {firebaseConfig.projectId}
                    </code>.
                  </p>
                </div>
              </div>

              {/* Details table */}
              <div className="border border-gray-200 rounded overflow-hidden text-xs">
                <div className="grid grid-cols-3 p-2 bg-gray-100 font-semibold border-b border-gray-200">
                  <span>Paramètre</span>
                  <span className="col-span-2">Valeur configurée</span>
                </div>
                <div className="grid grid-cols-3 p-2 border-b border-gray-100">
                  <span className="text-gray-600">Project ID</span>
                  <span className="col-span-2 font-mono font-medium text-gray-900">{firebaseConfig.projectId}</span>
                </div>
                <div className="grid grid-cols-3 p-2 border-b border-gray-100">
                  <span className="text-gray-600">Auth Domain</span>
                  <span className="col-span-2 font-mono text-gray-800">{firebaseConfig.authDomain}</span>
                </div>
                <div className="grid grid-cols-3 p-2 border-b border-gray-100">
                  <span className="text-gray-600">Storage Bucket</span>
                  <span className="col-span-2 font-mono text-gray-800">{firebaseConfig.storageBucket}</span>
                </div>
                <div className="grid grid-cols-3 p-2 border-b border-gray-100">
                  <span className="text-gray-600">App ID</span>
                  <span className="col-span-2 font-mono text-gray-800 truncate">{firebaseConfig.appId}</span>
                </div>
                <div className="grid grid-cols-3 p-2 border-b border-gray-100">
                  <span className="text-gray-600">Latence ping</span>
                  <span className="col-span-2 font-medium text-emerald-700">
                    {connectionStatus.latencyMs !== undefined ? `${connectionStatus.latencyMs} ms` : 'Non mesuré'}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-gray-600">Dernier test</span>
                  <span className="col-span-2 text-gray-700">
                    {connectionStatus.lastChecked?.toLocaleTimeString() || 'À l\'instant'}
                  </span>
                </div>
              </div>

              {connectionStatus.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  <div className="font-semibold mb-1">Avis de synchronisation :</div>
                  <div>{connectionStatus.error}</div>
                </div>
              )}

              <div className="bg-blue-50 text-blue-900 p-3 rounded text-xs leading-relaxed border border-blue-200">
                <span className="font-bold">Collections Firestore gérées en temps réel :</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800">
                  <li><code className="font-mono">wp_posts</code> : Articles et billets de blog</li>
                  <li><code className="font-mono">wp_pages</code> : Pages statiques (Accueil, À propos, etc.)</li>
                  <li><code className="font-mono">wp_media</code> : Fichiers et images de la médiathèque</li>
                  <li><code className="font-mono">wp_comments</code> : Commentaires et modération</li>
                  <li><code className="font-mono">wp_categories</code> : Taxonomies et catégories</li>
                  <li><code className="font-mono">wp_settings</code> : Options et configuration générale</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={onTestConnection}
                disabled={connectionStatus.testing}
                className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
                <span>{connectionStatus.testing ? 'Test en cours...' : 'Tester le ping maintenant'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFirebaseModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-medium cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
