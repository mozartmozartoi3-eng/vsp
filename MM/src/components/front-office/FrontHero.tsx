import React from 'react';
import {
  Car,
  ShieldCheck,
  CreditCard,
  MapPin,
  Phone,
  Award,
  Truck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
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
  const [heroOpacity, setHeroOpacity] = React.useState<number>(() => {
    const stored = localStorage.getItem('jean_auto_hero_opacity');
    return stored ? Number(stored) : 25;
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const custom = localStorage.getItem('jean_auto_custom_hero_img');
      if (custom) setHeroImageSrc(custom);
      const op = localStorage.getItem('jean_auto_hero_opacity');
      if (op) setHeroOpacity(Number(op));
    };
    window.addEventListener('custom-media-updated', handleUpdate);
    return () => window.removeEventListener('custom-media-updated', handleUpdate);
  }, []);

  return (
    <section id="hero" className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 lg:py-24 overflow-hidden">
      {/* Background Hero Image with Non-Opaque Soft Overlay & Contrast Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={heroImageSrc}
          alt="Voiture sans permis sport JEAN AUTO VSP"
          referrerPolicy="no-referrer"
          onError={() => setHeroImageSrc(heroVspSportBg)}
          style={{ opacity: heroOpacity / 100 }}
          className="w-full h-full object-cover object-center lg:object-right filter brightness-90 contrast-110 transition-opacity duration-500"
        />
        {/* Multilayer contrast protect gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
      </div>

      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Concessionnaire VSP à Aix-les-Bains (73100)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Votre voiture sans permis <span className="text-blue-400">clé en main</span>, révisée et garantie
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Spécialiste de la vente de véhicules sans permis à Aix-les-Bains. Découvrez notre parc d'occasions récentes et modèles neufs (Aixam, Ligier, Microcar). Achetez au comptant ou en plusieurs fois dès <strong>150 €</strong> d'acompte.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreVehicles}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>Voir nos véhicules en stock</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLearnProcess}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <span>Comment réserver (acompte de 150 €)</span>
              </button>
            </div>

            {/* Quick Trust Checks */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100 points de contrôle atelier</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Garantie 12 mois incluse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Livraison possible partout en France</span>
              </div>
            </div>
          </div>

          {/* Right Card / Reassurance Focus */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Démarche simple et rapide
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Acheter ou réserver en 3 étapes
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  150€
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100 text-sm block">Sélectionnez votre véhicule</strong>
                    <p className="text-slate-400 mt-0.5">Consultez photos, kilométrage, équipements et garantie de notre parc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100 text-sm block">Achat au comptant ou en plusieurs fois</strong>
                    <p className="text-slate-400 mt-0.5">
                      Réglez au comptant ou versez un acompte de 150 € pour bloquer le véhicule. Le RIB officiel du garage vous est fourni.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100 text-sm block">Retrait au garage ou livraison à domicile</strong>
                    <p className="text-slate-400 mt-0.5">
                      Prise en main à Aix-les-Bains (11 Avenue du Grand Port) ou livraison sécurisée directement chez vous.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Call / WhatsApp Box */}
              <div className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${commercialSettings.phone}`}
                  className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>Appeler le {commercialSettings.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour JEAN AUTO VSP, je souhaite des informations sur vos véhicules sans permis disponibles.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>WhatsApp direct</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
