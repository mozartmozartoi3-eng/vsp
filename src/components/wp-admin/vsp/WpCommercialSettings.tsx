import React, { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Save,
  CheckCircle,
  Copy,
  AlertCircle
} from 'lucide-react';
import { CommercialBankSettings } from '../../../types/wordpress';
import { WordPressFirebaseService } from '../../../services/wordpressService';

import { ADMIN_EMAIL } from '../../../firebase';

interface WpCommercialSettingsProps {
  settings: CommercialBankSettings;
  isFirebaseAdmin?: boolean;
  googleConnectLoading?: boolean;
  googleConnectError?: string | null;
  onConnectGoogle?: () => Promise<void> | void;
}

export const WpCommercialSettings: React.FC<WpCommercialSettingsProps> = ({
  settings,
  isFirebaseAdmin = false,
  googleConnectLoading = false,
  googleConnectError = null,
  onConnectGoogle,
}) => {
  const [formData, setFormData] = useState<CommercialBankSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; cloudSynced: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await WordPressFirebaseService.updateCommercialSettings(formData);
      setSaveMessage({
        cloudSynced: res.cloudSynced,
        text: res.cloudSynced
          ? 'Coordonnées commerciales et bancaires enregistrées dans Cloud Firestore et actives immédiatement sur le site.'
          : `Modifications enregistrées localement. Connectez Google (${ADMIN_EMAIL}) pour les publier vers Cloud Firestore sur tous les appareils.`,
      });
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(`Erreur de sauvegarde : ${err?.message || 'Action impossible'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#2271b1]" />
          Paramètres Commerciaux & Bancaires - JEAN AUTO VSP
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configurez l'identité de la concession, l'adresse à Aix-les-Bains et modifiez librement les coordonnées bancaires (titulaire, IBAN, BIC, RIB, montant d'acompte).
        </p>
      </div>

      {!isFirebaseAdmin && onConnectGoogle && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Pour synchroniser vos nouveaux paramètres bancaires en ligne pour tous les clients, connectez le compte Google commun ({ADMIN_EMAIL}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => onConnectGoogle()}
              disabled={googleConnectLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shrink-0 cursor-pointer disabled:opacity-60"
            >
              {googleConnectLoading ? 'Connexion...' : 'Connecter Google (Cloud)'}
            </button>
          </div>
          {googleConnectError && (
            <div className="p-2.5 bg-red-50 border border-red-300 rounded text-xs text-red-800 font-medium">
              {googleConnectError}
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-900 text-sm rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {saveMessage && (
        <div
          className={`mb-6 p-4 border text-sm rounded-lg flex items-center gap-2 ${
            saveMessage.cloudSynced
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <CheckCircle className={`w-5 h-5 shrink-0 ${saveMessage.cloudSynced ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span>{saveMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Identité Concession */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
            <Building2 className="w-5 h-5 text-[#2271b1]" />
            1. Identité & Adresse de la Concession
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom Commercial</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Repère d'Accès / Proximité</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="ex: Juste à côté de La Poste"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse de la concession</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Code Postal</label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Horaires d'ouverture</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Canaux de communication */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3 mb-4">
            <Phone className="w-5 h-5 text-emerald-600" />
            2. Coordonnées & Lignes directes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Téléphone Garage (Appels)
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                WhatsApp Commercial (Preuves & Devis)
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-medium text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail Officiel</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Coordonnées Bancaires Officielles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2271b1]" />
              3. Coordonnées Bancaires Officielles pour les Virements
            </h2>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded font-medium">
              Virement sécurisé
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Titulaire du compte bancaire
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(formData.accountHolder, 'holder')}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-xs font-medium rounded flex items-center gap-1 text-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedKey === 'holder' ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">IBAN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="flex-1 text-sm font-mono border border-gray-300 rounded px-3 py-2 tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(formData.iban, 'iban')}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-xs font-medium rounded flex items-center gap-1 text-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedKey === 'iban' ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">BIC (SWIFT)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.bic}
                    onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                    className="flex-1 text-sm font-mono border border-gray-300 rounded px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.bic, 'bic')}
                    className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-xs font-medium rounded flex items-center gap-1 text-gray-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === 'bic' ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">RIB (Code banque/guichet/compte)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.rib}
                    onChange={(e) => setFormData({ ...formData, rib: e.target.value })}
                    className="flex-1 text-sm font-mono border border-gray-300 rounded px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.rib, 'rib')}
                    className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-xs font-medium rounded flex items-center gap-1 text-gray-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === 'rib' ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motif obligatoire à indiquer par le client
                </label>
                <input
                  type="text"
                  required
                  value={formData.mandatoryReferenceInstruction}
                  onChange={(e) => setFormData({ ...formData, mandatoryReferenceInstruction: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-semibold text-amber-900 bg-amber-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Montant fixe de l'acompte initial (€)
                </label>
                <input
                  type="number"
                  required
                  value={formData.installmentDepositAmount}
                  onChange={(e) => setFormData({ ...formData, installmentDepositAmount: Number(e.target.value) })}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-bold text-[#135e96]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-bold rounded shadow-md flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement en cours...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
};
