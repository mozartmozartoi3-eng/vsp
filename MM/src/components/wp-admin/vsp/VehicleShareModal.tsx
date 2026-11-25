import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Eye,
  Info
} from 'lucide-react';
import { Vehicle, CommercialBankSettings } from '../../../types/wordpress';

interface VehicleShareModalProps {
  vehicle: Vehicle | null;
  commercialSettings: CommercialBankSettings;
  onClose: () => void;
  onViewSpotlight?: (vehicleId: string) => void;
}

export const VehicleShareModal: React.FC<VehicleShareModalProps> = ({
  vehicle,
  commercialSettings,
  onClose,
  onViewSpotlight,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  if (!vehicle) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const spotlightUrl = `${origin}/?vsp=${encodeURIComponent(vehicle.id)}`;
  const depositAmount = commercialSettings.installmentDepositAmount || 150;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(spotlightUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyTemplate = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(key);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  // Pre-written social templates
  const tiktokTemplate = `🔥 DISPONIBLE CHEZ JEAN AUTO VSP !
🚗 ${vehicle.brand} ${vehicle.model} (${vehicle.year})
⚡ ${vehicle.mileage?.toLocaleString('fr-FR')} km • Énergie : ${vehicle.energy}
💰 Prix : ${vehicle.price?.toLocaleString('fr-FR')} € ou seulement ${depositAmount} € d'acompte à la commande !
🛡️ Révisée avec garantie ${vehicle.warrantyMonths || 12} mois incluse
📍 Visible à Aix-les-Bains (Livraison toute France possible)
👇 Cliquez sur le lien pour voir toutes les photos et réserver directement :
${spotlightUrl}`;

  const facebookTemplate = `📢 NOUVELLE ENTRÉE EN STOCK — SANS PERMIS
✨ ${vehicle.brand} ${vehicle.model}
• Année : ${vehicle.year}
• Kilométrage certifié : ${vehicle.mileage?.toLocaleString('fr-FR')} km
• Boîte automatique • ${vehicle.energy}
• Couleur : ${vehicle.color || 'Gris'}
• Contrôle 100 points en atelier & Garantie ${vehicle.warrantyMonths || 12} mois

💶 Prix TTC clé en main : ${vehicle.price?.toLocaleString('fr-FR')} €
🔒 Acompte sécurisé : ${depositAmount} € (solde à la livraison)

👉 Accédez directement à la fiche exclusive et réservez en ligne :
${spotlightUrl}

Concession JEAN AUTO VSP
${commercialSettings.address}, ${commercialSettings.postalCode} ${commercialSettings.city}
📞 ${commercialSettings.phone || '02 59 50 89 31'} | WhatsApp : ${commercialSettings.whatsapp || '06 37 38 55 90'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Lien exclusif pour vos publications (TikTok / Facebook)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pour mettre en avant <strong>{vehicle.brand} {vehicle.model}</strong> sans afficher le reste du site.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explication du comportement */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Comment fonctionne ce lien ?</span>
            <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
              Le visiteur qui clique sur ce lien dans votre annonce ou story est redirigé <strong>directement et exclusivement vers ce véhicule</strong>. Le catalogue général et les autres modèles sont masqués pour éviter toute distraction et maximiser les réservations.
            </p>
          </div>
        </div>

        {/* Le Lien Direct Unique */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Lien direct vers la page de cette voiture :
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={spotlightUrl}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-mono select-all focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copié !' : 'Copier le lien'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Partagez ce lien en bio TikTok, description de vidéo ou publication Facebook.</span>
            <button
              type="button"
              onClick={() => {
                if (onViewSpotlight) {
                  onViewSpotlight(vehicle.id);
                  onClose();
                } else {
                  window.open(spotlightUrl, '_blank');
                }
              }}
              className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tester la vue client</span>
            </button>
          </div>
        </div>

        {/* Modèles de textes prêts à poster */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Textes pré-rédigés pour vos publications</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Template TikTok / Insta */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span>📱 Format TikTok / Reels / Stories</span>
                </div>
                <pre className="text-[10px] text-slate-600 font-sans whitespace-pre-line line-clamp-4 mt-1 bg-white p-2 rounded-lg border border-slate-200">
                  {tiktokTemplate}
                </pre>
              </div>
              <button
                type="button"
                onClick={() => handleCopyTemplate(tiktokTemplate, 'tiktok')}
                className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedTemplate === 'tiktok' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTemplate === 'tiktok' ? 'Texte copié !' : 'Copier texte TikTok'}</span>
              </button>
            </div>

            {/* Template Facebook */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span>📢 Format Publication Facebook</span>
                </div>
                <pre className="text-[10px] text-slate-600 font-sans whitespace-pre-line line-clamp-4 mt-1 bg-white p-2 rounded-lg border border-slate-200">
                  {facebookTemplate}
                </pre>
              </div>
              <button
                type="button"
                onClick={() => handleCopyTemplate(facebookTemplate, 'facebook')}
                className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedTemplate === 'facebook' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTemplate === 'facebook' ? 'Texte copié !' : 'Copier texte Facebook'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
