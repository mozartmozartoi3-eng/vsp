import React, { useState } from 'react';
import {
  Car,
  Search,
  Fuel,
  Calendar,
  Gauge,
  ShieldCheck,
  CheckCircle,
  Eye,
  CreditCard,
  Banknote,
  ArrowRight
} from 'lucide-react';
import { Vehicle, VehicleBrand, PaymentOption } from '../../types/wordpress';

interface VehicleCatalogProps {
  vehicles: Vehicle[];
  brands: VehicleBrand[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenOrderModal: (vehicle: Vehicle, initialPaymentOption?: PaymentOption) => void;
}

export const VehicleCatalog: React.FC<VehicleCatalogProps> = ({
  vehicles,
  brands,
  onSelectVehicle,
  onOpenOrderModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedEnergy, setSelectedEnergy] = useState('all');

  const filteredVehicles = vehicles.filter((v) => {
    if (v.status !== 'publish') return false;

    const matchSearch =
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.color.toLowerCase().includes(searchTerm.toLowerCase());

    const matchBrand = selectedBrand === 'all' || v.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchEnergy = selectedEnergy === 'all' || v.energy.toLowerCase() === selectedEnergy.toLowerCase();

    return matchSearch && matchBrand && matchEnergy;
  });

  return (
    <section id="catalog" className="py-16 bg-slate-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Car className="w-4 h-4 text-blue-600" />
            <span>Notre parc de véhicules</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Voitures sans permis révisées et disponibles
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Chaque véhicule bénéficie de 100 points de contrôle en atelier et d'une garantie complète. Achetez au comptant ou en plusieurs fois avec 150 € d'acompte.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher marque, modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Brand */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700"
              >
                <option value="all">Toutes les marques</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Energy */}
            <div>
              <select
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700"
              >
                <option value="all">Toutes les motorisations</option>
                <option value="diesel">Diesel</option>
                <option value="électrique">Électrique</option>
                <option value="essence">Essence</option>
              </select>
            </div>

            {/* Vehicle Count Badge */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                <Car className="w-3.5 h-3.5" />
                <span>{filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? 's' : ''} au parc</span>
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 max-w-xl mx-auto shadow-xs">
            <Car className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            {vehicles.length === 0 ? (
              <>
                <h3 className="text-base font-bold text-slate-800">Catalogue en cours de renouvellement</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  De nouveaux véhicules sans permis révisés et garantis sont en cours d'enregistrement par notre équipe.
                  Vous pouvez également nous joindre directement par téléphone ou via WhatsApp pour connaître nos arrivages imminents.
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-700">Aucun véhicule ne correspond à vos critères de recherche.</p>
                <p className="text-xs text-gray-500 mt-1">Modifiez ou réinitialisez vos filtres pour voir les autres véhicules.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBrand('all');
                    setSelectedEnergy('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Afficher tous les véhicules
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Container */}
                <div
                  className="relative h-52 bg-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => onSelectVehicle(vehicle)}
                >
                  <img
                    src={vehicle.mainImage}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Disponible
                    </span>
                  </div>

                  {/* Warranty Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      Garantie {vehicle.warrantyMonths || 12} mois
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {vehicle.brand}
                    </div>
                    <h3
                      onClick={() => onSelectVehicle(vehicle)}
                      className="font-bold text-lg text-slate-900 hover:text-blue-600 cursor-pointer transition-colors mt-0.5 line-clamp-1"
                    >
                      {vehicle.model}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mt-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{vehicle.year}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{vehicle.mileage.toLocaleString('fr-FR')} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{vehicle.energy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Direct Purchase Options */}
                  <div className="pt-2 space-y-3">
                    {/* Price display */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          {vehicle.price.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-gray-500">TTC</span>
                        </div>
                        <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span>Ou dès 150 € d'acompte en plusieurs fois</span>
                        </div>
                      </div>
                    </div>

                    {/* Single Clean Action: Commander button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenOrderModal(vehicle);
                        }}
                        className="w-full py-3 px-4 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]"
                      >
                        <span>Commander</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtle details view */}
                    <div className="text-center pt-0.5">
                      <button
                        onClick={() => onSelectVehicle(vehicle)}
                        className="text-[12px] text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Fiche technique & photos</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
