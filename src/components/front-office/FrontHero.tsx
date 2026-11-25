import React from 'react';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';
import heroVspSportBg from '../../assets/images/hero_vsp_sport_1789025391428.jpg';

interface FrontHeroProps {
  commercialSettings: CommercialBankSettings;
  onExploreVehicles: () => void;
  onLearnProcess: () => void;
}

export const FrontHero: React.FC<FrontHeroProps> = ({
  commercialSettings,
  onExploreVehicles,
  onLearnProcess,
}) => {
  const [heroImageSrc, setHeroImageSrc] = React.useState<string>(() => {
    return localStorage.getItem('jean_auto_custom_hero_img') || heroVspSportBg;
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const custom = localStorage.getItem('jean_auto_custom_hero_img');
      if (custom) setHeroImageSrc(custom);
    };
    window.addEventListener('custom-media-updated', handleUpdate);
    return () => window.removeEventListener('custom-media-updated', handleUpdate);
  }, []);

  return (
    <section id="hero" className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
          {/* Left Column: Editorial Copy & Single Dominant Action */}
          <div className="flex-1 flex flex-col justify-center space-y-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Concessionnaire VSP · {commercialSettings.city} ({commercialSettings.postalCode})
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
              Votre voiture sans permis, révisée et garantie
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Parc de véhicules neufs et occasions récentes Aixam, Ligier et Microcar à{' '}
              {commercialSettings.city}. Achat au comptant ou réservation immédiate dès{' '}
              <strong className="text-slate-900 font-semibold">
                {commercialSettings.installmentDepositAmount || 150} €
              </strong>{' '}
              d'acompte, avec retrait au garage ou livraison à domicile.
            </p>

            {/* Primary CTA & Direct Link */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={onExploreVehicles}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <span>Voir nos véhicules en stock</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onLearnProcess}
                className="inline-flex items-center px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 bg-white rounded-lg transition-colors cursor-pointer"
              >
                Comment réserver
              </button>
            </div>

            {/* Clean Reassurance Strip */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Révision 100 points</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garantie 12 mois</span>
              </span>
              <a
                href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-blue-700"
              >
                <Phone className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>{commercialSettings.phone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Framed Dealership Photo */}
          <div className="lg:w-[48%] flex">
            <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] lg:aspect-auto lg:min-h-[340px]">
              <img
                src={heroImageSrc}
                alt="Voiture sans permis JEAN AUTO VSP Aix-les-Bains"
                referrerPolicy="no-referrer"
                onError={() => setHeroImageSrc(heroVspSportBg)}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
