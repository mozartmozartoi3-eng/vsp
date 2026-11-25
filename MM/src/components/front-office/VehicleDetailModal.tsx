import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle,
  Check,
  Car,
  ArrowRight
} from 'lucide-react';
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
  const allImages = vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.mainImage];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto my-6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {vehicle.brand} · Réf. #{vehicle.id}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {vehicle.brand} {vehicle.model}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 flex-1">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={allImages[activeImageIndex] || vehicle.mainImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                  En stock et disponible
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-white backdrop-blur-xs">
                  Garantie {vehicle.warrantyMonths || 12} mois
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === i ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Vignette" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & 2 Direct Purchase Options (No questions, direct choice) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Prix clé en main
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {vehicle.price.toLocaleString('fr-FR')} € <span className="text-sm font-normal text-slate-500">TTC</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Disponible au comptant ou dès <strong>150 € d'acompte</strong> en plusieurs fois</span>
              </p>
            </div>

            {/* Single direct purchase action */}
            <div className="w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrderModal(vehicle);
                }}
                className="w-full md:w-auto px-8 py-3.5 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 transition-all bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]"
              >
                <span>Commander ce véhicule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Technical Specs Sheet */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>Fiche technique</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Année</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.year}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Kilométrage</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Motorisation</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.energy}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Boîte de vitesses</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.gearbox}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">État</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.condition}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Couleur</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.color}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Puissance</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.power}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Garantie garage</span>
                <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{vehicle.warrantyMonths || 12} mois</span>
              </div>
            </div>
          </div>

          {/* Features / Equipments */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-gray-200">
                Équipements inclus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {vehicle.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-gray-200">
                Présentation du véhicule
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Reassurance points */}
          <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Engagements du garage à Aix-les-Bains</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Véhicule entièrement révisé avant livraison, vidange et filtres neufs.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Démarches de carte grise effectuées par nos soins.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Accessible dès 14 ans avec permis AM ou sans permis pour les personnes nées avant 1988.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
