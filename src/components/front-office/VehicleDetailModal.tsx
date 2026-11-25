import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Vehicle, CommercialBankSettings, PaymentOption } from '../../types/wordpress';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  commercialSettings: CommercialBankSettings;
  onClose: () => void;
  onOpenOrderModal: (vehicle: Vehicle, initialPaymentOption?: PaymentOption) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  commercialSettings,
  onClose,
  onOpenOrderModal,
}) => {
  const allImages =
    vehicle.gallery && vehicle.gallery.length > 0
      ? vehicle.gallery
      : vehicle.mainImage
      ? [vehicle.mainImage]
      : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto my-6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              {vehicle.brand} · Réf. {vehicle.id}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {vehicle.brand} {vehicle.model}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={allImages[activeImageIndex] || vehicle.mainImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-emerald-700 text-white text-xs font-semibold">
                Disponible · Garantie {vehicle.warrantyMonths || 12} mois
              </span>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === i
                        ? 'border-blue-700'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Photo ${i + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Prix clé en main
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5 tabular-nums">
                {vehicle.price.toLocaleString('fr-FR')} €{' '}
                <span className="text-sm font-normal text-slate-500">TTC</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Paiement au comptant ou réservation dès {commercialSettings.installmentDepositAmount || 150} € d'acompte.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrderModal(vehicle);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Commander ce véhicule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Specs Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
              Caractéristiques techniques
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Année</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block tabular-nums">
                  {vehicle.year}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Kilométrage</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block tabular-nums">
                  {vehicle.mileage.toLocaleString('fr-FR')} km
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Motorisation</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {vehicle.energy}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Boîte de vitesses</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {vehicle.gearbox}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">État</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {vehicle.condition}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Couleur</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {vehicle.color}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Puissance</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {vehicle.power}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Garantie</span>
                <span className="font-semibold text-emerald-700 text-sm mt-0.5 block">
                  {vehicle.warrantyMonths || 12} mois
                </span>
              </div>
            </div>
          </div>

          {/* Equipments */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Équipements inclus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {vehicle.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                  >
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2 pb-2 border-b border-slate-200">
                Présentation du véhicule
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Dealership Commitment */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">
                Engagement {commercialSettings.companyName} ({commercialSettings.city})
              </strong>
              Révision atelier complète (vidange et filtres neufs), démarches carte grise incluses, conduite possible dès 14 ans avec permis AM ou sans permis avant 1988.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
