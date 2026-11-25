import React from 'react';
import {
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  UserCheck,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { FirebaseConnectionStatus } from '../../firebase';
import { CommercialBankSettings, AdminMenuKey } from '../../types/wordpress';

interface DealershipHeaderProps {
  commercialSettings: CommercialBankSettings;
  connectionStatus: FirebaseConnectionStatus;
  pendingOrdersCount: number;
  isFirebaseAdmin?: boolean;
  googleConnectLoading?: boolean;
  onConnectGoogle?: () => Promise<void> | void;
  onNavigate: (key: AdminMenuKey) => void;
  onTestConnection: () => void;
  onToggleFrontOffice: () => void;
  onOpenNewVehicle: () => void;
  onLogout?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const DealershipHeader: React.FC<DealershipHeaderProps> = ({
  commercialSettings,
  connectionStatus,
  pendingOrdersCount,
  isFirebaseAdmin = false,
  googleConnectLoading = false,
  onConnectGoogle,
  onNavigate,
  onTestConnection,
  onToggleFrontOffice,
  onOpenNewVehicle,
  onLogout,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  return (
    <header className="h-16 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40 select-none shadow-sm">
      {/* Left: Mobile hamburger + Brand / Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Menu de navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              JEAN AUTO <span className="text-blue-400">VSP</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Aix-les-Bains (73100) · Concession & Parc Véhicules
          </span>
        </div>
      </div>

      {/* Center: Realtime Database Connection */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
        {connectionStatus.connected && isFirebaseAdmin ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-200 text-[11px] font-medium">
              Cloud Firestore synchronisé
            </span>
          </>
        ) : connectionStatus.connected ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-300 text-[11px]">
              Session locale
            </span>
            {onConnectGoogle && (
              <button
                onClick={() => onConnectGoogle()}
                disabled={googleConnectLoading}
                className="ml-1 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {googleConnectLoading ? 'Connexion...' : 'Synchroniser Cloud (Google)'}
              </button>
            )}
          </>
        ) : connectionStatus.testing ? (
          <span className="text-slate-300 text-[11px]">Connexion base de données...</span>
        ) : (
          <>
            <span className="text-slate-300 text-[11px]">Mode serveur actif</span>
            <button
              onClick={onTestConnection}
              className="text-blue-400 hover:underline text-[11px] ml-1 flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" /> Reconnecter
            </button>
          </>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Button: Voir le site public */}
        <button
          onClick={onToggleFrontOffice}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Consulter le site web public tel que le voient les visiteurs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span>Voir le site public</span>
        </button>

        {/* Button: Déconnexion Administrateur */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-800/60 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Fermer la session d'administration"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        )}

        {/* Manager User Pill */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-200 text-xs">Direction Concession</div>
            <div className="text-[10px] text-slate-400">{commercialSettings.accountHolder}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
