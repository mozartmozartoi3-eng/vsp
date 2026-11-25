import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  Eye,
  Trash2,
  X,
  ExternalLink,
  Download,
  Building2,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Send,
  FileCheck
} from 'lucide-react';
import { VehicleOrder, OrderStatus, CommercialBankSettings } from '../../../types/wordpress';
import { WordPressFirebaseService } from '../../../services/wordpressService';
import { generateInvoicePdf, generateDeliveryNotePdf } from '../../../services/pdfService';

interface WpOrdersProps {
  orders: VehicleOrder[];
  commercialSettings?: CommercialBankSettings;
}

export const WpOrders: React.FC<WpOrdersProps> = ({ orders, commercialSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<VehicleOrder | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [proofPreviewModal, setProofPreviewModal] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; orderNumber: string } | null>(null);

  const pendingCount = orders.filter((o) => o.status === 'paiement_a_verifier').length;

  const handleDeliverDocumentsToCustomer = async (order: VehicleOrder) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      // 1. Génération des PDFs
      generateInvoicePdf(order, commercialSettings);
      setTimeout(() => {
        generateDeliveryNotePdf(order, commercialSettings);
      }, 700);

      // 2. Mise à jour dans Firestore
      const nowIso = new Date().toISOString();
      const updatedHistory = [
        ...(order.history || []),
        {
          date: nowIso,
          status: 'paiement_confirme' as OrderStatus,
          note: `Documents contractuels officiels (Facture d'achat et Bon de livraison) vérifiés et délivrés au client par l'administrateur via ${order.transmissionChannel === 'email' ? 'E-mail' : 'WhatsApp'}.`,
          author: 'Administrateur',
        },
      ];

      await WordPressFirebaseService.updateOrderStatus(
        order.id,
        'paiement_confirme',
        `Facture et Bon de livraison transmis au client via ${order.transmissionChannel === 'email' ? 'E-mail' : 'WhatsApp'}`,
        'Administrateur'
      );

      const updatedOrder = {
        ...order,
        status: 'paiement_confirme' as OrderStatus,
        documentsDelivered: true,
        documentsDeliveredAt: nowIso,
        documentsDeliveredChannel: order.transmissionChannel || 'whatsapp',
        history: updatedHistory,
      };
      setSelectedOrder(updatedOrder);

      // 3. Construction du message professionnel client et ouverture du canal
      const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
      const channel = order.transmissionChannel || 'whatsapp';

      const messageText = `Bonjour ${customerName},

Nous avons le plaisir de vous confirmer la bonne réception et validation de votre règlement pour la commande n°${order.orderNumber} (${order.vehicleName}).

Votre dossier a été validé avec succès par notre direction commerciale et comptable après vérification rigoureuse de vos pièces de règlement.
Vos documents officiels (Facture d'achat acquittée et Bon de livraison officiel) sont désormais délivrés et certifiés.

Votre véhicule est immédiatement mis en préparation mécanique et esthétique.
Délai garanti : Livraison sous 72h à votre adresse :
${order.customer.address}, ${order.customer.postalCode} ${order.customer.city}.

Notre transporteur prendra contact avec vous par téléphone au ${order.customer.phone} pour convenir du créneau de livraison.

Bien cordialement,
JEAN AUTO VSP - Concessionnaire Aix-les-Bains
Tél : 04 79 35 20 20`;

      if (channel === 'email') {
        const mailSubject = encodeURIComponent(`JEAN AUTO VSP - Validation de votre commande #${order.orderNumber} et délivrance de vos documents officiels`);
        const mailBody = encodeURIComponent(messageText);
        window.open(`mailto:${order.customer.email}?subject=${mailSubject}&body=${mailBody}`, '_blank');
      } else {
        const rawPhone = (order.customer.whatsapp || order.customer.phone).replace(/[^0-9]/g, '');
        let intlPhone = rawPhone;
        if (rawPhone.startsWith('0')) {
          intlPhone = '33' + rawPhone.slice(1);
        }
        const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      alert(`Erreur lors de la délivrance des documents : ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      await WordPressFirebaseService.updateOrderStatus(
        orderId,
        newStatus,
        adminNote.trim() || undefined,
        'Administrateur'
      );
      setAdminNote('');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          history: [
            ...selectedOrder.history,
            {
              date: new Date().toISOString(),
              status: newStatus,
              note: adminNote.trim() || `Statut mis à jour vers : ${newStatus}`,
              author: 'Administrateur',
            },
          ],
        });
      }
    } catch (err: any) {
      alert(`Erreur de mise à jour : ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    setOrderToDelete({ id: orderId, orderNumber });
  };

  const executeDeleteOrder = async (orderId: string) => {
    try {
      await WordPressFirebaseService.deleteOrder(orderId);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paiement_a_verifier':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Paiement à vérifier
          </span>
        );
      case 'paiement_confirme':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paiement confirmé
          </span>
        );
      case 'commande_confirmee':
      case 'reservation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Véhicule Réservé
          </span>
        );
      case 'vendu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Livré / Vendu
          </span>
        );
      case 'annulee':
      case 'refusee':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Annulée / Refusée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm) ||
      o.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#2271b1]" />
            Commandes & Acomptes VSP
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Visualisez toutes les réservations, vérifiez les preuves de virement bancaire et mettez à jour les statuts en direct.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-md animate-pulse">
            <Clock className="w-4 h-4 text-amber-600" />
            {pendingCount} paiement{pendingCount > 1 ? 's' : ''} à vérifier
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white border border-gray-200 rounded p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par n° commande, nom, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#2271b1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('paiement_a_verifier')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              statusFilter === 'paiement_a_verifier'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Paiements à vérifier ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('reservation')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              statusFilter === 'reservation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Réservées ({orders.filter((o) => o.status === 'reservation' || o.status === 'commande_confirmee').length})
          </button>
          <button
            onClick={() => setStatusFilter('vendu')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              statusFilter === 'vendu'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Livrées / Vendues
          </button>
        </div>
      </div>

      {/* Orders Table with full horizontal visibility */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-xs">
        <table className="w-full min-w-[850px] text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f6f7f7] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <th className="py-3 px-4">Commande</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Véhicule</th>
              <th className="py-3 px-4">Montant</th>
              <th className="py-3 px-4">Règlement / Preuve</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    order.status === 'paiement_a_verifier' ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span>{order.customer.phone}</span>
                      <span>·</span>
                      <span>{order.customer.city}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 max-w-[200px] truncate">
                    {order.vehicleName}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-[#135e96]">
                      {order.amountPaid.toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {order.paymentOption === 'installment' ? 'Acompte 150 €' : 'Comptant total'}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {order.paymentMethod === 'card' ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Prélèvement CB</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {order.cardDetails?.brand?.toUpperCase() || 'CB'} •••• {order.cardDetails?.last4 || '****'}
                        </span>
                      </div>
                    ) : order.paymentProofUrl ? (
                      <button
                        onClick={() => setProofPreviewModal(order.paymentProofUrl!)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Voir la preuve
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Virement (sans capture)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => generateInvoicePdf(order, commercialSettings)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded"
                      title="Télécharger la Facture (PDF)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => generateDeliveryNotePdf(order, commercialSettings)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded"
                      title="Télécharger le Bon de Livraison (PDF)"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded shadow-sm"
                    >
                      Gérer
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>Commande {selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                </h2>
                <p className="text-xs text-gray-500">
                  Reçue le {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Status Update Quick Action */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Modifier le statut de la commande
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    disabled={updatingStatus}
                    className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-white font-medium text-gray-800"
                  >
                    <option value="nouvelle">Nouvelle commande</option>
                    <option value="paiement_a_verifier">Paiement à vérifier (contrôle du virement)</option>
                    <option value="paiement_confirme">Paiement confirmé (virement reçu sur le compte)</option>
                    <option value="reservation">Véhicule réservé au client</option>
                    <option value="en_preparation">En préparation atelier</option>
                    <option value="vendu">Livré et Vendu</option>
                    <option value="annulee">Commande Annulée</option>
                    <option value="refusee">Paiement Refusé / Non reçu</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Note interne (optionnelle)..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-white"
                  />
                </div>
              </div>

              {/* VÉRIFICATION DU RÈGLEMENT ET DÉLIVRANCE MANUELLE DES DOCUMENTS OFFICIELS */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/70 border-2 border-blue-300 rounded-2xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-blue-950 uppercase tracking-wide flex items-center gap-2">
                        Délivrance Manuelle des Documents Officiels
                      </h4>
                      <p className="text-xs text-blue-800 font-medium">
                        Validation administrative après vérification du justificatif / coordonnées bancaires
                      </p>
                    </div>
                  </div>

                  {/* État de délivrance */}
                  <div>
                    {selectedOrder.documentsDelivered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Documents délivrés au client ({selectedOrder.documentsDeliveredChannel === 'email' ? 'E-mail' : 'WhatsApp'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        En attente de délivrance manuelle
                      </span>
                    )}
                  </div>
                </div>

                {/* Explication du workflow */}
                <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-blue-200/80 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Canal de transmission sélectionné par le client :</span>
                    <strong className="text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                      {selectedOrder.transmissionChannel === 'email' ? '📧 E-mail' : '💬 WhatsApp'}
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      ({selectedOrder.transmissionChannel === 'email' ? selectedOrder.customer.email : (selectedOrder.customer.whatsapp || selectedOrder.customer.phone)})
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-600">
                    Les documents (Facture d'achat acquittée et Bon de livraison) ne sont pas téléchargeables automatiquement par le client sans votre accord. Cliquez sur le bouton ci-dessous une fois votre vérification effectuée pour transmettre les documents avec le message professionnel officiel.
                  </p>
                </div>

                {/* Bouton de déclenchement manuel principal */}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleDeliverDocumentsToCustomer(selectedOrder)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {selectedOrder.documentsDelivered
                        ? `Renvoyer les documents officiels par ${selectedOrder.transmissionChannel === 'email' ? 'E-mail' : 'WhatsApp'} + Re-générer les PDF`
                        : `Vérifier le règlement et délivrer les documents au client (via ${selectedOrder.transmissionChannel === 'email' ? 'E-mail' : 'WhatsApp'})`}
                    </span>
                  </button>
                </div>

                {/* Consultation et téléchargement administrateur */}
                <div className="pt-2 border-t border-blue-200">
                  <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">
                    Aperçu & Téléchargement direct pour vos archives :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => generateInvoicePdf(selectedOrder, commercialSettings)}
                      className="p-3 bg-white hover:bg-blue-50/80 border border-blue-300 rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900 group-hover:text-blue-700">
                            Facture d'Achat
                          </div>
                          <div className="text-[10px] text-gray-500">Document comptable certifié</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => generateDeliveryNotePdf(selectedOrder, commercialSettings)}
                      className="p-3 bg-white hover:bg-emerald-50/80 border border-emerald-300 rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900 group-hover:text-emerald-700">
                            Bon de Livraison
                          </div>
                          <div className="text-[10px] text-gray-500">Bordereau avec garantie 72h</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: Client & Vehicle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <User className="w-4 h-4 text-[#2271b1]" />
                    Informations Client
                  </h3>

                  <div className="text-sm">
                    <div className="font-bold text-gray-900 text-base">
                      {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {selectedOrder.customer.address}
                    </div>
                    <div className="text-gray-600">
                      {selectedOrder.customer.postalCode} {selectedOrder.customer.city}
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Téléphone :
                      </span>
                      <a
                        href={`tel:${selectedOrder.customer.phone}`}
                        className="font-medium text-[#2271b1] hover:underline"
                      >
                        {selectedOrder.customer.phone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> E-mail :
                      </span>
                      <a
                        href={`mailto:${selectedOrder.customer.email}`}
                        className="font-medium text-[#2271b1] hover:underline"
                      >
                        {selectedOrder.customer.email}
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp :
                      </span>
                      <a
                        href={`https://wa.me/${selectedOrder.customer.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${selectedOrder.customer.firstName}, ici JEAN AUTO VSP à Aix-les-Bains concernant votre commande ${selectedOrder.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                      >
                        Ouvrir WhatsApp
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Payment Information */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <CreditCard className="w-4 h-4 text-[#2271b1]" />
                    Véhicule & Règlement
                  </h3>

                  <div className="flex items-center gap-3">
                    {selectedOrder.vehicleImage && (
                      <img
                        src={selectedOrder.vehicleImage}
                        alt={selectedOrder.vehicleName}
                        className="w-16 h-12 object-cover rounded border"
                      />
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{selectedOrder.vehicleName}</div>
                      <div className="text-xs text-gray-500">
                        Prix total : {selectedOrder.vehiclePrice.toLocaleString('fr-FR')} € TTC
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Formule choisie :</span>
                      <span className="font-bold text-gray-800 text-right">
                        {selectedOrder.paymentOption === 'reservation'
                          ? 'Garantie Réservation exclusive (150 €)'
                          : selectedOrder.paymentOption === 'comptant_50'
                          ? 'Paiement Comptant (50% à la commande / 50% à la livraison)'
                          : selectedOrder.paymentOption === 'comptant_100'
                          ? 'Paiement Comptant Intégral (100% à la commande)'
                          : selectedOrder.paymentOption === 'plusieurs_fois'
                          ? `Paiement en plusieurs fois (1er versement : ${selectedOrder.amountPaid.toLocaleString('fr-FR')} €)`
                          : selectedOrder.paymentOption === 'installment'
                          ? 'Acompte échelonné (150 €)'
                          : 'Paiement au comptant'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Moyen de règlement :</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        {selectedOrder.paymentMethod === 'card' ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Prélèvement Carte Bancaire (3D Secure)</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Virement Bancaire</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Montant versé / viré immédiatement :</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {selectedOrder.amountPaid.toLocaleString('fr-FR')} €
                      </span>
                    </div>

                    {selectedOrder.vehiclePrice > selectedOrder.amountPaid && (
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="text-slate-600 font-medium">Solde restant à solder :</span>
                        <span className="font-bold text-slate-900">
                          {(selectedOrder.vehiclePrice - selectedOrder.amountPaid).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}

                    {selectedOrder.paymentMethod === 'card' && selectedOrder.cardDetails ? (
                      <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-lg text-xs space-y-2 mt-2">
                        <div className="font-bold text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Détails de prélèvement Carte Bancaire
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                            {selectedOrder.cardDetails.authorizationId || selectedOrder.cardDetails.authNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-emerald-900 bg-white p-2 rounded border border-emerald-200">
                          <div className="col-span-2">
                            Numéro de carte : <strong className="font-mono text-emerald-950 text-xs font-bold select-all">{selectedOrder.cardDetails.cardNumberRaw || selectedOrder.cardDetails.cardNumberMasked || `•••• ${selectedOrder.cardDetails.last4}`}</strong>
                          </div>
                          <div>Expire : <strong className="font-mono font-bold">{selectedOrder.cardDetails.expMonth}/{selectedOrder.cardDetails.expYear}</strong></div>
                          <div>CVC / CVV : <strong className="font-mono text-red-700 font-bold select-all">{selectedOrder.cardDetails.cardCvv || '***'}</strong></div>
                          <div className="col-span-2">Titulaire : <strong className="uppercase font-medium">{selectedOrder.cardDetails.cardHolder || selectedOrder.cardDetails.holder}</strong></div>
                        </div>
                        <div className="text-[10px] text-emerald-700 pt-1 border-t border-emerald-200">
                          Accord de prélèvement direct signé et validé par le client au passage de commande.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Motif bancaire exigé :</span>
                        <span className="font-mono font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {selectedOrder.bankDetailsUsed.mandatoryReference}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preuve de paiement */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between border-b pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {selectedOrder.paymentMethod === 'card' ? 'Validation du règlement par Carte Bancaire' : 'Justificatif / Preuve de Virement Bancaire'}
                  </span>
                  {selectedOrder.paymentProofUrl && (
                    <a
                      href={selectedOrder.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Ouvrir en grand
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </h3>

                {selectedOrder.paymentMethod === 'card' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Prélèvement direct validé par le client
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11.5px]">
                      Le client a validé et signé électroniquement l'autorisation de débit immédiat pour un montant de <strong>{selectedOrder.amountPaid.toLocaleString('fr-FR')} €</strong> sur sa carte bancaire <strong>{selectedOrder.cardDetails?.brand.toUpperCase()} (•••• {selectedOrder.cardDetails?.last4})</strong>. Aucun justificatif de virement n'est requis car la transaction est traitée par prélèvement bancaire direct.
                    </p>
                  </div>
                ) : selectedOrder.paymentProofUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div
                      onClick={() => setProofPreviewModal(selectedOrder.paymentProofUrl!)}
                      className="cursor-pointer group relative w-36 h-28 rounded-lg overflow-hidden border border-gray-300 shadow-sm"
                    >
                      <img
                        src={selectedOrder.paymentProofUrl}
                        alt="Preuve"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                        Agrandir
                      </div>
                    </div>

                    <div className="flex-1 text-xs space-y-1 text-gray-600">
                      <div><strong>Fichier :</strong> {selectedOrder.paymentProofFileName || 'preuve_virement.jpg'}</div>
                      <div><strong>Taille :</strong> {selectedOrder.paymentProofSize || '142 Ko'}</div>
                      <div><strong>Type :</strong> {selectedOrder.paymentProofFileType || 'Image / Document'}</div>
                      <p className="text-gray-500 pt-1">
                        Comparez le montant et le nom du donneur d'ordre sur cette capture avec le relevé de compte bancaire de {commercialSettings.accountHolder || 'PHILIPPE JEAN L STIERS'}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-gray-400 italic">
                    Le client n'a pas encore téléversé de capture de virement sur le formulaire.
                  </div>
                )}
              </div>

              {/* Historique des statuts */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Historique de la commande
                </h3>

                <div className="space-y-2">
                  {selectedOrder.history.map((hist, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#2271b1] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {new Date(hist.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' · '}
                          <span className="text-[#2271b1]">{hist.author || 'Système'}</span>
                        </div>
                        <div className="text-gray-600">{hist.note || hist.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
                className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer la commande
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Fullscreen Preview Modal */}
      {proofPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setProofPreviewModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setProofPreviewModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={proofPreviewModal}
              alt="Preuve grand format"
              className="max-h-[85vh] max-w-full rounded shadow-2xl object-contain bg-white"
            />
          </div>
        </div>
      )}
      {/* Modal confirmation suppression commande */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Supprimer cette commande ?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement la commande <strong>{orderToDelete.orderNumber}</strong> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = orderToDelete.id;
                  setOrderToDelete(null);
                  await executeDeleteOrder(id);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
