import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Sparkles,
  Lock,
  MapPin,
  Clock,
  ExternalLink,
  Award,
  AlertTriangle,
  CreditCard,
  Building2,
  Share2,
  Check,
  ChevronRight
} from 'lucide-react';
import { Vehicle, CommercialBankSettings } from '../../types/wordpress';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { OrderFunnelModal } from './OrderFunnelModal';

interface VehicleSpotlightPageProps {
  vehicle: Vehicle;
  commercialSettings: CommercialBankSettings;
  onExitSpotlight?: () => void;
}

export const VehicleSpotlightPage: React.FC<VehicleSpotlightPageProps> = ({
  vehicle,
  commercialSettings,
  onExitSpotlight,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = vehicle.gallery && vehicle.gallery.length > 0
    ? vehicle.gallery
    : [vehicle.mainImage];

  const currentImage = images[activeImageIndex] || vehicle.mainImage;
  const depositAmount = commercialSettings.installmentDepositAmount || 150;

  const whatsappPhone = (commercialSettings.whatsapp || '+33 6 37 38 55 90').replace(/[^0-9]/g, '');
  const whatsappPreFilled = `Bonjour Jean Auto VSP, je vous contacte suite à votre annonce TikTok / Facebook pour le véhicule : ${vehicle.brand} ${vehicle.model} (${vehicle.price.toLocaleString('fr-FR')} €). Est-il toujours disponible pour réservation ?`;
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappPreFilled)}`;

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Banner Exclusif Réseaux Sociaux */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onExitSpotlight && (
              <button
                onClick={onExitSpotlight}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Visiter tout le site"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  {commercialSettings.companyName || 'JEAN AUTO VSP'}
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Offre Réseaux Sociaux
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>{commercialSettings.city || 'Aix-les-Bains'} • Concessionnaire Agréé</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Partager le lien de cette voiture"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Lien copié !' : 'Partager'}</span>
            </button>

            <a
              href={`tel:${(commercialSettings.phone || '+33 2 59 50 89 31').replace(/[^0-9+]/g, '')}`}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{commercialSettings.phone || '02 59 50 89 31'}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Spotlight : Exclusivement le véhicule sélectionné */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Anti-Arnaque & Badge Authenticité */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Véhicule certifié en stock physique</span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Concession Réelle
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Ce véhicule est visible à notre concession au <strong>{commercialSettings.address}, {commercialSettings.postalCode} {commercialSettings.city}</strong>.
                Aucune arnaque : Bon de commande officiel et facture édités avant tout règlement. Acompte bloqué et sécurisé.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Vérifier en direct sur WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Fiche Centrale du Véhicule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne Gauche : Galerie Photos HD */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <img
                src={currentImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-slate-700">
                {vehicle.brand}
              </div>
              <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                En stock immédiat
              </div>

              {vehicle.warrantyMonths && (
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Garantie {vehicle.warrantyMonths} mois incluse</span>
                </div>
              )}
            </div>

            {/* Sélecteur de miniatures si plusieurs photos */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Vue ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 4 Piliers Sécurité & Transparence */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-base font-black text-white">{vehicle.year}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Année</div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-base font-black text-white">{vehicle.mileage?.toLocaleString('fr-FR')} km</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Kilométrage</div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-base font-black text-white">{vehicle.energy}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Énergie</div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-base font-black text-white">{vehicle.condition}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">État</div>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Prix, Détails & Boutons d'Action Immédiate */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                Voiture Sans Permis • Aix-les-Bains
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Couleur : <strong className="text-slate-200">{vehicle.color || 'Gris'}</strong> • Boîte : <strong className="text-slate-200">{vehicle.gearbox || 'Automatique'}</strong>
              </p>
            </div>

            {/* Bloc Prix & Formule Réservation */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div>
                <div className="text-xs text-slate-400 font-medium">Prix comptant TTC clé en main :</div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  {vehicle.price?.toLocaleString('fr-FR')} €
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-emerald-300">
                  <span>Option Réservation Immédiate</span>
                  <span>{depositAmount} € d'acompte</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Bloquez ce véhicule dès maintenant pour <strong>seulement {depositAmount} €</strong>. Le solde restant est réglé à la livraison après inspection du véhicule.
                </p>
              </div>

              {/* Boutons d'action géants */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CreditCard className="w-5 h-5 text-slate-950" />
                  <span>Réserver / Commander ce véhicule</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Discuter sur WhatsApp à propos de cette voiture</span>
                </a>

                <a
                  href={`tel:${(commercialSettings.phone || '+33 2 59 50 89 31').replace(/[^0-9+]/g, '')}`}
                  className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Appeler notre conseiller ({commercialSettings.phone || '02 59 50 89 31'})</span>
                </a>
              </div>
            </div>

            {/* Équipements & Options du véhicule */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Équipements & Options incluses</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vehicle.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description du véhicule */}
            {vehicle.description && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Description du concessionnaire
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reassurance Finale & Coordonnées de la Concession */}
        <div className="border-t border-slate-800 pt-8 pb-12">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <Building2 className="w-4 h-4" />
                <span>Concessionnaire Physique Vérifié</span>
              </div>
              <h4 className="text-lg font-black text-white">
                {commercialSettings.companyName || 'JEAN AUTO VSP'} — Aix-les-Bains
              </h4>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Adresse : <strong>{commercialSettings.address}, {commercialSettings.postalCode} {commercialSettings.city}</strong> ({commercialSettings.landmark || 'Près de La Poste'}).
                <br />
                Horaires : <strong>{commercialSettings.openingHours || 'Du Lundi au Samedi : 08h30 - 19h00'}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-colors cursor-pointer text-center"
              >
                Réserver ce modèle
              </button>

              {onExitSpotlight && (
                <button
                  type="button"
                  onClick={onExitSpotlight}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Découvrir le reste de la concession →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal du Tunnel de Commande pour ce véhicule */}
      {isOrderModalOpen && (
        <OrderFunnelModal
          vehicle={vehicle}
          commercialSettings={commercialSettings}
          onClose={() => setIsOrderModalOpen(false)}
          onOrderCompleted={() => {
            setIsOrderModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
