import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Car, Award, ChevronRight } from 'lucide-react';
import showroomImg from '../../assets/images/concession_showroom_1789025372611.jpg';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { CommercialBankSettings } from '../../types/wordpress';

interface ConcessionShowroomBannerProps {
  commercialSettings: CommercialBankSettings;
  onNavigateContact: () => void;
  onNavigateCatalog: () => void;
}

export const ConcessionShowroomBanner: React.FC<ConcessionShowroomBannerProps> = ({
  commercialSettings,
  onNavigateContact,
  onNavigateCatalog,
}) => {
  const [showroomImageSrc, setShowroomImageSrc] = React.useState<string>(() => {
    return localStorage.getItem('jean_auto_custom_showroom_img') || showroomImg;
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const custom = localStorage.getItem('jean_auto_custom_showroom_img');
      if (custom) setShowroomImageSrc(custom);
    };
    window.addEventListener('custom-media-updated', handleUpdate);
    return () => window.removeEventListener('custom-media-updated', handleUpdate);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-white via-slate-50 to-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Showroom & Point de Vente Officiel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Notre concession à Aix-les-Bains (73100)
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
            Venez essayer votre future voiture sans permis dans notre showroom de Savoie ou bénéficiez de notre service de livraison à domicile partout en France sous 48h à 72h.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Immersive Dealership Image with Glass Badges */}
          <div className="lg:col-span-7 relative group">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
              <img
                src={showroomImageSrc}
                alt="Showroom officiel JEAN AUTO VSP à Aix-les-Bains"
                referrerPolicy="no-referrer"
                onError={() => setShowroomImageSrc(showroomImg)}
                className="w-full h-80 sm:h-96 lg:h-[420px] object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Showroom ouvert au public • 8h30 - 19h00</span>
              </div>

              {/* Bottom Reassurance Banner on Image */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">
                    Concessionnaire officiel
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Aixam, Ligier, Microcar & Chatenet</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Essai gratuit sur place</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dealership Key Facts & Access Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Adresse & Accès facilité</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">JEAN AUTO VSP</div>
                  <div className="text-slate-600 mt-0.5">11 Avenue du Grand Port, 73100 Aix-les-Bains</div>
                  <div className="text-xs font-medium text-blue-700 mt-1 flex items-center gap-1">
                    <span>📌 Point de repère :</span>
                    <span>Juste à côté du bureau de La Poste</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Horaires d'ouverture :</strong>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Du lundi au samedi de 8h30 à 19h00 sans interruption.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Essais sur route disponibles :</strong>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Prise en main immédiate et conseils personnalisés par nos techniciens spécialisés.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`tel:${commercialSettings.phone || '+33259508931'}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>

                <a
                  href={`https://wa.me/${(commercialSettings.whatsapp || '+33637385590').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={onNavigateContact}
                  className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Itinéraire</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Nationwide Delivery Reassurance Mini Card */}
            <div className="p-4 rounded-2xl bg-blue-600 text-white flex items-center justify-between gap-4 shadow-md">
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-sm">Vous ne pouvez pas vous déplacer ?</div>
                <div className="text-blue-100">Livraison à domicile sous 48-72h partout en France métropolitaine.</div>
              </div>
              <button
                onClick={onNavigateCatalog}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Commander
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
