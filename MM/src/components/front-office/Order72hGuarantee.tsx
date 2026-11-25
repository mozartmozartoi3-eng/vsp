import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Lock,
  Unlock,
  CreditCard,
  Building2,
  X,
  Sparkles
} from 'lucide-react';
import { VehicleOrder } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface Order72hGuaranteeProps {
  order: VehicleOrder;
  onOrderUpdated?: (order: VehicleOrder) => void;
}

export const Order72hGuarantee: React.FC<Order72hGuaranteeProps> = ({
  order,
  onOrderUpdated,
}) => {
  // 72 heures en millisecondes = 72 * 60 * 60 * 1000 = 259 200 000 ms
  const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000;

  // Calcul du temps restant
  const orderCreatedTimestamp = new Date(order.createdAt || Date.now()).getTime();
  const targetTimestamp = orderCreatedTimestamp + SEVENTY_TWO_HOURS_MS;

  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    return Math.max(0, targetTimestamp - Date.now());
  });

  // Outil de simulation pour les tests (permet de simuler que les 72h sont déjà passées)
  const [simulate72hElapsed, setSimulate72hElapsed] = useState<boolean>(false);

  // Modal d'annulation et de remboursement
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Véhicule non réceptionné après 72 heures');
  const [cancelNotes, setCancelNotes] = useState('');
  const [processingCancellation, setProcessingCancellation] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState(
    order.status === 'demande_annulation_72h' ||
    order.status === 'remboursement_en_cours' ||
    order.status === 'annulee'
  );

  // Chronomètre décomptant chaque seconde
  useEffect(() => {
    if (simulate72hElapsed) {
      setTimeLeftMs(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, targetTimestamp - Date.now());
      setTimeLeftMs(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, simulate72hElapsed]);

  const is72hElapsed = simulate72hElapsed || timeLeftMs === 0;

  // Formatage du compte à rebours : HH h MM min SS s
  const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  // Calcul du pourcentage de temps écoulé
  const elapsedMs = SEVENTY_TWO_HOURS_MS - timeLeftMs;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / SEVENTY_TWO_HOURS_MS) * 100)));

  // Traitement de l'annulation et du remboursement automatique
  const handleConfirmCancellation = async () => {
    setProcessingCancellation(true);
    try {
      const cancellationDate = new Date().toISOString();
      const updatedOrder: VehicleOrder = {
        ...order,
        status: 'demande_annulation_72h',
        cancellationRequestedAt: cancellationDate,
        cancellationReason: `${cancelReason}${cancelNotes ? ` - Précisions : ${cancelNotes}` : ''}`,
        cancellationRefundStatus: 'pending',
        history: [
          ...(order.history || []),
          {
            date: cancellationDate,
            status: 'demande_annulation_72h',
            note: `Demande d'annulation et remboursement automatique formulée par le client (délai de 72h dépassé) : ${cancelReason}`,
            author: 'Client',
          },
        ],
      };

      await WordPressFirebaseService.updateOrderStatus(
        order.id,
        'demande_annulation_72h',
        `Demande d'annulation 72h reçue : ${cancelReason}`,
        'Client (Automatique)'
      );

      setCancellationSuccess(true);
      setShowCancelModal(false);
      if (onOrderUpdated) {
        onOrderUpdated(updatedOrder);
      }
    } catch (err: any) {
      console.warn("Erreur lors de la demande d'annulation :", err);
      // Mode hors-ligne / fallback
      setCancellationSuccess(true);
      setShowCancelModal(false);
    } finally {
      setProcessingCancellation(false);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-200/90 rounded-2xl p-4 sm:p-5 text-left max-w-lg mx-auto shadow-sm space-y-4">
      {/* En-tête : Garantie 72h & Statut */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-950">
                Garantie Livraison 72h ou Remboursement Intégral
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Charte Garage
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Conformément à nos engagements JEAN AUTO VSP, nos véhicules sont révisés et acheminés en 72 heures maximum.
            </p>
          </div>
        </div>
      </div>

      {/* Cadre du chronomètre / Compte à rebours */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-xl p-4 text-white shadow-inner space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold flex items-center gap-1.5 text-blue-300">
            <Clock className="w-4 h-4 text-blue-400" />
            {is72hElapsed ? 'Délai contractuel de 72h atteint' : 'Chronomètre contractuel de livraison'}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {is72hElapsed ? '100% écoulé' : `${progressPercent}% écoulé`}
          </span>
        </div>

        {/* Chiffres du chronomètre */}
        {!is72hElapsed ? (
          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {String(hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Heures</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
              <div className="text-2xl font-black font-mono text-blue-400 tracking-tight">
                {String(minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Minutes</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
              <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                {String(seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Secondes</div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-lg text-center space-y-1">
            <div className="text-amber-300 font-extrabold text-sm flex items-center justify-center gap-1.5">
              <Unlock className="w-4 h-4 text-amber-300" />
              <span>Délai de 72 heures dépassé</span>
            </div>
            <p className="text-[11px] text-slate-200">
              Si votre véhicule n'est pas réceptionné, vous êtes immédiatement éligible à l'annulation et au remboursement automatique garanti de votre versement ({order.amountPaid?.toLocaleString('fr-FR')} €).
            </p>
          </div>
        )}

        {/* Barre de progression temporelle */}
        <div className="space-y-1">
          <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                is72hElapsed ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Commande validée (T=0)</span>
            <span>Délai garanti 72h</span>
          </div>
        </div>
      </div>

      {/* Règle d'annulation 72h stricte */}
      {cancellationSuccess ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-xs">
          <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Demande d'annulation et remboursement automatique enregistrée</span>
          </div>
          <p className="text-emerald-800 text-[11px] leading-relaxed">
            Votre demande a été prise en compte avec succès. Le montant versé de <strong>{order.amountPaid?.toLocaleString('fr-FR')} €</strong> est en cours de recréditation intégrale sur votre compte ({order.paymentMethod === 'card' ? 'recrédit direct carte bancaire' : 're-virement bancaire sous 24h'}).
          </p>
        </div>
      ) : !is72hElapsed ? (
        /* PENDANT LES PREMIÈRES 72H : LE BOUTON ANNULER EST STRICTEMENT MASQUÉ */
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Annulation verrouillée pendant le délai contractuel de 72h</span>
          </div>
          <p className="text-[11.5px] text-slate-600 leading-relaxed">
            Conformément à nos conditions de vente, la préparation mécanique, le contrôle technique et le transport logistique sont irrévocablement lancés dès votre commande. <strong>Le bouton d'annulation est masqué avant l'expiration des 72 heures</strong>. Si votre véhicule n'est pas livré une fois ce délai atteint, le bouton de remboursement automatique s'activera immédiatement ici.
          </p>

          {/* Outil de démonstration / simulation pour les tests */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="italic">Besoin de tester l'apparition du bouton ?</span>
            <button
              type="button"
              onClick={() => setSimulate72hElapsed(true)}
              className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
            >
              Simuler 72h écoulées (Test)
            </button>
          </div>
        </div>
      ) : (
        /* APRÈS 72H : LE BOUTON ANNULER APPARAÎT ET DEVIENT ACTIONNABLE */
        <div className="space-y-2.5">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Délai de livraison de 72h dépassé</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Si vous n'avez pas encore été livré de votre véhicule sans permis <strong>{order.vehicleName}</strong>, vous êtes en droit de demander l'annulation immédiate avec remboursement automatique sans aucune pénalité.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Demander l'annulation & le remboursement automatique ({order.amountPaid?.toLocaleString('fr-FR')} €)</span>
          </button>

          {simulate72hElapsed && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setSimulate72hElapsed(false)}
                className="text-[10.5px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Réinitialiser le chronomètre réel
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMATION D'ANNULATION ET REMBOURSEMENT */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">
                  Demande d'annulation & remboursement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vous demandez l'annulation de la commande <strong>#{order.orderNumber}</strong> pour le véhicule <strong>{order.vehicleName}</strong> suite au dépassement du délai garanti de 72h.
            </p>

            {/* Détail du remboursement */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-red-950">
                <span>Montant à vous rembourser :</span>
                <span className="text-sm font-black text-red-700">{order.amountPaid?.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-[11px] text-red-800">
                <span>Mode de restitution :</span>
                <span>{order.paymentMethod === 'card' ? 'Recrédit direct Carte Bancaire' : 'Re-virement sur votre compte'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-red-800">
                <span>Délai légal de remboursement :</span>
                <span className="font-bold">Immédiat / sous 24h ouvrées</span>
              </div>
            </div>

            {/* Motif d'annulation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Motif principal de l'annulation *
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden focus:border-red-500"
              >
                <option value="Véhicule non réceptionné après 72 heures">
                  Véhicule non réceptionné après 72 heures (Garantie de livraison)
                </option>
                <option value="Empêchement majeur / Impossibilité de réception">
                  Empêchement personnel majeur
                </option>
                <option value="Changement de projet / Droit de rétractation">
                  Changement de situation
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Remarque ou message complémentaire (optionnel)
              </label>
              <textarea
                rows={2}
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Précisions éventuelles..."
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:outline-hidden focus:border-red-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={processingCancellation}
                onClick={handleConfirmCancellation}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingCancellation ? 'Enregistrement...' : 'Confirmer le remboursement automatique'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
