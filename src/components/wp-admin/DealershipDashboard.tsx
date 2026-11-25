import React from 'react';
import {
  Car,
  Receipt,
  Users,
  ShieldCheck,
  Building2,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import {
  Vehicle,
  VehicleOrder,
  CommercialBankSettings,
  AdminMenuKey,
} from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';
import { OfficialMediaManagerModal } from '../common/OfficialMediaManagerModal';
import { ADMIN_EMAIL } from '../../firebase';

interface DealershipDashboardProps {
  vehicles: Vehicle[];
  orders: VehicleOrder[];
  commercialSettings: CommercialBankSettings;
  isFirebaseAdmin?: boolean;
  googleConnectLoading?: boolean;
  googleConnectError?: string | null;
  onConnectGoogle?: () => Promise<void> | void;
  onNavigate: (menu: AdminMenuKey) => void;
  onToggleFrontOffice: () => void;
  onOpenNewVehicle: () => void;
}

export const DealershipDashboard: React.FC<DealershipDashboardProps> = ({
  vehicles = [],
  orders = [],
  commercialSettings,
  isFirebaseAdmin = false,
  googleConnectLoading = false,
  googleConnectError = null,
  onConnectGoogle,
  onNavigate,
  onToggleFrontOffice,
  onOpenNewVehicle,
}) => {
  const [copiedIban, setCopiedIban] = React.useState(false);
  const [showMediaModal, setShowMediaModal] = React.useState(false);

  // Statistics
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.availability === 'available').length;
  const reservedVehicles = vehicles.filter((v) => v.availability === 'reserved').length;
  const soldVehicles = vehicles.filter((v) => v.availability === 'sold').length;

  const totalStockValue = vehicles
    .filter((v) => v.availability !== 'sold')
    .reduce((acc, v) => acc + (v.price || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'paiement_a_verifier');
  const confirmedOrders = orders.filter((o) => o.status === 'paiement_confirme' || o.status === 'commande_confirmee');
  const totalDepositsCollected = confirmedOrders.reduce((acc, o) => acc + (o.amountPaid || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentVehicles = [...vehicles]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleValidateOrder = async (orderId: string) => {
    try {
      await WordPressFirebaseService.updateOrderStatus(
        orderId,
        'paiement_confirme',
        'Acompte de 150 € validé depuis le tableau de bord par la direction.',
        `${commercialSettings.accountHolder || 'PHILIPPE JEAN L STIERS'} (Admin)`
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Pilotage Concession
            </span>
            <span className="text-xs text-gray-500 font-medium">Aix-les-Bains (73100)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Tableau de Bord JEAN AUTO VSP
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Supervision du parc de véhicules sans permis, suivi des acomptes de 150 € et validation des virements bancaires.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowMediaModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photos officielles (Hero & Showroom)</span>
          </button>
          <button
            onClick={onOpenNewVehicle}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un véhicule</span>
          </button>
          <button
            onClick={onToggleFrontOffice}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <span>Voir le site public</span>
          </button>
        </div>
      </div>

      {/* Official Media Modal */}
      <OfficialMediaManagerModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
      />

      {/* Single shared Google Cloud sync banner if logged in via password only */}
      {!isFirebaseAdmin && onConnectGoogle && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-blue-950">
              <strong className="block font-bold">Synchronisation Cloud Firestore non active (mode local uniquement)</strong>
              <span className="text-blue-800">
                Connectez le compte Google commun ({ADMIN_EMAIL}) pour que les véhicules, photos et coordonnées bancaires soient visibles entre le propriétaire et le concepteur.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onConnectGoogle()}
              disabled={googleConnectLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer disabled:opacity-60"
            >
              {googleConnectLoading ? 'Connexion...' : 'Connecter Google (Cloud)'}
            </button>
          </div>
          {googleConnectError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-medium">
              {googleConnectError}
            </div>
          )}
        </div>
      )}

      {/* Alert Banner if pending transfers */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-950">
                {pendingOrders.length} virement(s) en attente de vérification
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Des clients ont réservé un véhicule et téléversé leur preuve de virement vers le compte <strong>{commercialSettings.accountHolder || 'PHILIPPE JEAN L STIERS'}</strong>. Vérifiez votre compte bancaire pour valider la réservation.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Vérifier les virements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Véhicules en Stock */}
        <div
          onClick={() => onNavigate('vehicles')}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Parc Véhicules</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">{totalVehicles}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
            <span className="text-emerald-600 font-bold">{availableVehicles} dispo</span>
            <span>·</span>
            <span className="text-amber-600 font-bold">{reservedVehicles} réservé(s)</span>
            <span>·</span>
            <span className="text-gray-400">{soldVehicles} vendu(s)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Valeur du stock actif</span>
            <span className="font-bold text-slate-700">{totalStockValue.toLocaleString('fr-FR')} €</span>
          </div>
        </div>

        {/* KPI 2: Acomptes Encaissés (150 €) */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Acomptes Reçus</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">
            {totalDepositsCollected.toLocaleString('fr-FR')} €
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{confirmedOrders.length} réservation(s) validée(s)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Formule acompte fixe</span>
            <span className="font-bold text-slate-700">150 € / véhicule</span>
          </div>
        </div>

        {/* KPI 3: Virements à Vérifier */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">À Rapprocher</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                pendingOrders.length > 0 ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">{pendingOrders.length}</div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            {pendingOrders.length > 0 ? (
              <span className="text-amber-700 font-bold">Justificatif client téléversé</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Aucun virement en retard</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Compte virement</span>
            <span className="font-bold text-slate-700 truncate max-w-[120px]">
              {commercialSettings.accountHolder}
            </span>
          </div>
        </div>

        {/* KPI 4: Fichier Clients */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clients & Prospects</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">{orders.length}</div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Prospects et réservations enregistrés
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Origine</span>
            <span className="font-bold text-slate-700">Aix-les-Bains & France</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Recent Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dernières Commandes & Réservations</h2>
              <p className="text-xs text-slate-500">Suivi des acomptes de 150 € et paiements comptants</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Aucune commande enregistrée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 font-semibold">
                    <th className="pb-3">Commande</th>
                    <th className="pb-3">Acheteur</th>
                    <th className="pb-3">Véhicule</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-800">{ord.orderNumber}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">
                          {ord.customer.firstName} {ord.customer.lastName}
                        </div>
                        <div className="text-[11px] text-gray-400">{ord.customer.phone}</div>
                      </td>
                      <td className="py-3 font-medium text-slate-700 max-w-[140px] truncate">
                        {ord.vehicleName}
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {ord.amountPaid} €
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {ord.paymentOption === 'installment' ? 'Acompte 150 €' : 'Comptant total'}
                        </span>
                      </td>
                      <td className="py-3">
                        {ord.status === 'paiement_a_verifier' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            À vérifier
                          </span>
                        )}
                        {(ord.status === 'paiement_confirme' || ord.status === 'commande_confirmee') && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {ord.paymentOption === 'installment' ? 'Acompte validé' : 'Payé comptant'}
                          </span>
                        )}
                        {ord.status === 'nouvelle' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Nouvelle
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {ord.status === 'paiement_a_verifier' ? (
                          <button
                            onClick={() => handleValidateOrder(ord.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            Valider l'acompte
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate('orders')}
                            className="text-blue-600 hover:underline text-[11px] font-semibold cursor-pointer"
                          >
                            Détails
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Active Banking Details & Garage Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Bank Account Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Coordonnées Bancaires Actives</h3>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                Officiel
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ces coordonnées sont celles communiquées aux clients pour le virement de l'acompte de 150 € :
            </p>

            <div className="space-y-2 text-xs font-mono bg-slate-800/80 rounded-xl p-3 border border-slate-700">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Titulaire :</span>
                <strong className="text-white text-sm">{commercialSettings.accountHolder}</strong>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 text-[10px] block font-sans">IBAN :</span>
                <span className="text-blue-300 break-all">{commercialSettings.iban}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">BIC :</span>
                <span className="text-white">{commercialSettings.bic}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">RIB :</span>
                <span className="text-slate-300">{commercialSettings.rib}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => handleCopy(commercialSettings.iban)}
                className="text-xs text-blue-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIban ? 'IBAN copié !' : 'Copier l\'IBAN'}</span>
              </button>

              <button
                onClick={() => onNavigate('commercial-settings')}
                className="text-xs font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
