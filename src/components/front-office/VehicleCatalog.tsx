import React, { useState } from 'react';
import { Car, Search } from 'lucide-react';
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

  const publishedVehicles = vehicles.filter((v) => v.status === 'publish');

  const filteredVehicles = publishedVehicles.filter((v) => {
    const query = searchTerm.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.color.toLowerCase().includes(query);

    const matchBrand =
      selectedBrand === 'all' || v.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchEnergy =
      selectedEnergy === 'all' || v.energy.toLowerCase() === selectedEnergy.toLowerCase();

    return matchSearch && matchBrand && matchEnergy;
  });

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedBrand !== 'all' || selectedEnergy !== 'all';

  return (
    <section id="catalog" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Nos véhicules sans permis en stock
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Contrôle 100 points atelier, garantie incluse et réservation possible dès 150 € d'acompte.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-700 tabular-nums shrink-0">
            {filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? 's' : ''} disponible{filteredVehicles.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Single-row WordPress Flexbox Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-8 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par marque, modèle ou couleur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
            />
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            aria-label="Filtrer par marque"
            className="md:w-48 text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-blue-700"
          >
            <option value="all">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedEnergy}
            onChange={(e) => setSelectedEnergy(e.target.value)}
            aria-label="Filtrer par motorisation"
            className="md:w-48 text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-blue-700"
          >
            <option value="all">Toutes motorisations</option>
            <option value="diesel">Diesel</option>
            <option value="électrique">Électrique</option>
            <option value="essence">Essence</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('all');
                setSelectedEnergy('all');
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer shrink-0"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Vehicle Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 max-w-xl mx-auto">
            <Car className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            {publishedVehicles.length === 0 ? (
              <>
                <h3 className="text-base font-semibold text-slate-800">
                  Catalogue en cours de mise à jour
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Contactez la concession par téléphone ou WhatsApp pour connaître nos arrivages du jour.
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-slate-800">
                  Aucun véhicule ne correspond à votre recherche.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBrand('all');
                    setSelectedEnergy('all');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Afficher tous les véhicules
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => {
              const coverImg = vehicle.mainImage || (vehicle.gallery && vehicle.gallery[0]) || '';
              return (
                <article
                  key={vehicle.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  {/* 4:3 Image */}
                  <div
                    onClick={() => onSelectVehicle(vehicle)}
                    className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-emerald-700 text-white text-[11px] font-semibold">
                      Disponible
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                          {vehicle.brand}
                        </span>
                        <span className="text-xs text-slate-500">
                          Garantie {vehicle.warrantyMonths || 12} mois
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectVehicle(vehicle)}
                        className="text-base font-semibold text-slate-900 hover:text-blue-700 cursor-pointer mt-1 line-clamp-1"
                      >
                        {vehicle.model}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100 tabular-nums">
                        {vehicle.year} · {vehicle.mileage.toLocaleString('fr-FR')} km · {vehicle.energy}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xl font-bold text-slate-900 tabular-nums">
                          {vehicle.price.toLocaleString('fr-FR')} €{' '}
                          <span className="text-xs font-normal text-slate-500">TTC</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Ou dès 150 € d'acompte
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => onSelectVehicle(vehicle)}
                          className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors cursor-pointer"
                        >
                          Détails
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOrderModal(vehicle);
                          }}
                          className="flex-1 py-2.5 px-3 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Commander
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
