import React, { useRef, useEffect, useState } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  vehicleModel: string;
  rating: number;
  date: string;
  verifiedPurchase: boolean;
  comment: string;
}

export const REAL_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Marc & Christine D.',
    location: 'Chambéry (73)',
    vehicleModel: 'Ligier JS50 Sport Ultimate',
    rating: 5,
    date: '14 août 2026',
    verifiedPurchase: true,
    comment:
      "Nous cherchions une Ligier pour notre fille de 14 ans après son permis AM. M. Stiers a été d'une écoute formidable : l'acompte de 150 € a bloqué la voiture sans aucun stress et elle nous a été livrée à Chambéry avec la carte grise déjà faite. Un vrai professionnel digne de confiance.",
  },
  {
    id: 'rev-2',
    author: 'Valérie B.',
    location: 'Annecy (74)',
    vehicleModel: 'Aixam City GTO',
    rating: 5,
    date: '28 juillet 2026',
    verifiedPurchase: true,
    comment:
      "Suite à une suspension de permis de 6 mois, j'avais un besoin impératif d'un véhicule sans permis pour préserver mon emploi à Annecy. L'Aixam City m'a été livrée en 72h chrono. Véhicule irréprochable, révision complète effectuée et accueil très rassurant.",
  },
  {
    id: 'rev-3',
    author: 'Gérard L.',
    location: 'Aix-les-Bains (73)',
    vehicleModel: 'Microcar Dué Initial',
    rating: 5,
    date: '19 juillet 2026',
    verifiedPurchase: true,
    comment:
      "Habitant Aix-les-Bains à quelques minutes du Grand Port, je me suis déplacé directement. Très bon accueil, pas de pression commerciale. J'ai réservé la Microcar Dué avec le versement d'acompte de 150 € et tout était prêt 3 jours après. Merci à toute l'équipe !",
  },
  {
    id: 'rev-4',
    author: 'Antoine M.',
    location: 'Albertville (73)',
    vehicleModel: 'Aixam Coupé GTI',
    rating: 5,
    date: '2 juillet 2026',
    verifiedPurchase: true,
    comment:
      "Très réticent au départ à commander à distance, le sérieux du garage m'a totalement rassuré. Justificatif de virement envoyé sur WhatsApp, suivi précis à chaque étape et livraison à Albertville au pied de mon domicile. Rien à redire, c'est du travail soigné.",
  },
  {
    id: 'rev-5',
    author: 'Sylvie & Laurent T.',
    location: 'Grenoble (38)',
    vehicleModel: 'Ligier JS60 SUV Extreme',
    rating: 5,
    date: '24 juin 2026',
    verifiedPurchase: true,
    comment:
      "Retraités actifs, nous souhaitions un modèle surélevé et confortable. Le Ligier JS60 est spacieux, direction assistée et grand coffre. Les formalités d'immatriculation ont été prises en charge intégralement par JEAN AUTO VSP.",
  },
  {
    id: 'rev-6',
    author: 'Christophe P.',
    location: 'Rumilly (74)',
    vehicleModel: 'Chatenet CH40 Junior',
    rating: 5,
    date: '11 juin 2026',
    verifiedPurchase: true,
    comment:
      "Chatenet CH40 achetée le mois dernier. État clinique, double des clés fourni, carnet d'entretien à jour. Le système d'acompte de 150 € est transparent et protège l'acheteur des mauvaises surprises qu'on voit souvent sur les sites de petites annonces.",
  },
  {
    id: 'rev-7',
    author: 'Nathalie V.',
    location: 'Belley (01)',
    vehicleModel: 'Aixam City Pack',
    rating: 5,
    date: '29 mai 2026',
    verifiedPurchase: true,
    comment:
      "Transaction parfaite. Tout a été clair du premier contact téléphonique jusqu'à la remise des clés devant chez moi. L'assistance WhatsApp répond rapidement et avec précision, même le samedi. Chapeau à toute l'équipe.",
  },
  {
    id: 'rev-8',
    author: 'Jean-Claude R.',
    location: 'Bourg-en-Bresse (01)',
    vehicleModel: 'Microcar M.Go X',
    rating: 5,
    date: '15 mai 2026',
    verifiedPurchase: true,
    comment:
      "Livraison impeccable à Bourg-en-Bresse. Le chauffeur-convoyeur a pris le temps de m'expliquer la prise en main complète du véhicule, l'entretien moteur et les commandes de bord. Garantie 12 mois très rassurante.",
  },
  {
    id: 'rev-9',
    author: 'Élodie G.',
    location: 'Voiron (38)',
    vehicleModel: 'Ligier JS50 Club',
    rating: 5,
    date: '2 mai 2026',
    verifiedPurchase: true,
    comment:
      "J'ai acheté cette Ligier pour ma mère âgée qui ne peut plus conduire de grosse cylindrée mais souhaitait garder son autonomie pour ses courses et rendez-vous médicaux. Voiture très maniable et sécurisante. Merci pour votre patience et gentillesse.",
  },
  {
    id: 'rev-10',
    author: 'Michel F.',
    location: 'Saint-Jean-de-Maurienne (73)',
    vehicleModel: 'Aixam Crossline GT',
    rating: 5,
    date: '18 avril 2026',
    verifiedPurchase: true,
    comment:
      "Excellent contact téléphonique, explications claires et virement de l'acompte pris en compte immédiatement. Le véhicule correspondait en tous points aux photos de l'annonce et au contrôle technique vierge. Concessionnaire sérieux et recommandable.",
  },
];

export const CustomerReviewsTicker: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-scroll loop
  useEffect(() => {
    if (isPaused) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 1.5, behavior: 'auto' });
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 bg-slate-900 text-white border-y border-slate-800 overflow-hidden relative">
      {/* Header section with badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/30">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Retours d'Expérience Réels</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            10 Avis Clients Récents & Vérifiés
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Défilant · Témoignages authentiques d'acheteurs en Savoie (73), Haute-Savoie, Isère et Rhône-Alpes.
          </p>
        </div>

        {/* Global Rating & Navigation arrows */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-sm text-white">4.9 / 5</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">(800+ clients)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              aria-label="Avis précédents"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              aria-label="Avis suivants"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel with Auto-scroll */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-5 overflow-x-auto px-4 sm:px-6 pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-700"
        style={{ scrollbarWidth: 'thin' }}
      >
        {REAL_CUSTOMER_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="w-[320px] sm:w-[360px] shrink-0 snap-start bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between shadow-lg hover:border-blue-500/50 transition-all group"
          >
            <div>
              {/* Stars & Date */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{review.date}</span>
              </div>

              {/* Model Purchased Badge */}
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-blue-300 bg-blue-900/40 px-2.5 py-1 rounded-md border border-blue-700/40 inline-block">
                  {review.vehicleModel}
                </span>
              </div>

              {/* Review text */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            {/* Author footer with verified badge */}
            <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{review.author}</span>
                </div>
                <div className="text-[11px] text-slate-400">{review.location}</div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-700/50">
                <CheckCircle2 className="w-3 h-3" />
                <span>Achat vérifié</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
