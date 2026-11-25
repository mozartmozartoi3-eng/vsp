import React, { useState } from 'react';
import { ChevronDown, Phone, Search } from 'lucide-react';
import { FaqItem, CommercialBankSettings } from '../../types/wordpress';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface FrontFaqProps {
  faqs?: FaqItem[];
  commercialSettings: CommercialBankSettings;
}

const detailedDefaultFaqs: FaqItem[] = [
  {
    id: 'faq-conduite-permis',
    question: 'Qui est autorisé à conduire une voiture sans permis en France ?',
    answer: `En France, la conduite d'une voiture sans permis (quadricycle léger à moteur) est ouverte :
• Dès 14 ans pour toute personne titulaire du permis AM (option quadricycle léger, anciennement BSR).
• Sans aucun permis ni code pour toutes les personnes nées avant le 1er janvier 1988.
• Pour les conducteurs ayant fait l'objet d'une suspension ou d'une annulation de permis de conduire B classique (sauf décision judiciaire rare d'interdiction totale de conduire tout véhicule à moteur).`,
    category: 'Permis et réglementation',
    order: 1,
  },
  {
    id: 'faq-acompte-150',
    question: 'Pourquoi un acompte de 150 € et comment garantit-il la réservation ?',
    answer: `L’acompte forfaitaire de 150 € est une mesure de réservation contractuelle et de blocage immédiat. Cet acompte garantit que le véhicule que vous avez choisi vous est immédiatement attribué et retiré de la vente.
Les coordonnées bancaires officielles de la concession vous sont transmises lors de l'enregistrement de votre commande.`,
    category: 'Acompte et paiement',
    order: 2,
  },
  {
    id: 'faq-solde-reglement',
    question: 'Quand et comment dois-je régler le solde restant de la voiture ?',
    answer: `Le solde restant dû (prix du véhicule diminué des 150 € d'acompte déjà versés) se règle au moment de la mise à disposition du véhicule :
• Paiement au comptant par virement bancaire sécurisé lors de la livraison ou du retrait à Aix-les-Bains.
• Facilités de paiement échelonnées selon l'échéancier indiqué sur votre bon de commande.`,
    category: 'Acompte et paiement',
    order: 3,
  },
  {
    id: 'faq-etat-revision',
    question: 'Dans quel état mécanique et esthétique sont préparés les véhicules ?',
    answer: `Chaque véhicule commercialisé par JEAN AUTO VSP bénéficie d'une révision rigoureuse en atelier :
• Contrôle systématique sur plus de 100 points (moteur, variateur, courroie, freinage, trains roulants, batterie).
• Vidange moteur complète et remplacement des filtres.
• Nettoyage complet et certificat de non-gage vierge remis à l'acheteur.`,
    category: 'Véhicules et garantie',
    order: 4,
  },
  {
    id: 'faq-garantie-atelier',
    question: 'Quelle est la durée de la garantie et que couvre-t-elle ?',
    answer: `Tous nos véhicules sont couverts par une garantie contractuelle pièces et main d'œuvre de 6 à 12 mois couvrant les organes mécaniques essentiels (moteur, variateur, boîte-pont). La prise en charge s'effectue dans notre atelier d'Aix-les-Bains ou chez un réparateur agréé proche de chez vous.`,
    category: 'Véhicules et garantie',
    order: 5,
  },
  {
    id: 'faq-livraison-domicile',
    question: "Comment s'organise la livraison à domicile et quels sont les délais ?",
    answer: `Nous assurons la livraison sur camion plateau sécurisé sous 48 à 72 heures en Savoie, Haute-Savoie, Isère et partout en France métropolitaine, avec prise en main complète à l'arrivée. Le retrait direct en concession à Aix-les-Bains est gratuit.`,
    category: 'Livraison et démarches',
    order: 6,
  },
  {
    id: 'faq-carte-grise-siv',
    question: "Qui s'occupe de la carte grise et des démarches administratives ?",
    answer: `JEAN AUTO VSP est habilité au système d'immatriculation des véhicules (SIV). Nous réalisons les formalités d'immatriculation à votre nom et la carte grise définitive est expédiée directement à votre adresse.`,
    category: 'Livraison et démarches',
    order: 7,
  },
  {
    id: 'faq-assurance-vsp',
    question: "L'assurance est-elle obligatoire avant la réception ?",
    answer: `Oui, une attestation d'assurance (minimum responsabilité civile) est obligatoire pour circuler. Dès validation de la réservation, nous vous transmettons les éléments nécessaires pour assurer le véhicule auprès de votre compagnie avant la livraison.`,
    category: 'Permis et réglementation',
    order: 8,
  },
];

export const FrontFaq: React.FC<FrontFaqProps> = ({ faqs = [], commercialSettings }) => {
  const allFaqs = faqs.length > 0 ? faqs : detailedDefaultFaqs;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(allFaqs[0]?.id || null);

  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'Permis et réglementation', label: 'Permis & Loi' },
    { id: 'Acompte et paiement', label: 'Acompte & Paiement' },
    { id: 'Véhicules et garantie', label: 'Véhicules & Garantie' },
    { id: 'Livraison et démarches', label: 'Livraison & Carte grise' },
  ];

  const filteredFaqs = allFaqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      faq.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Acompte et paiement' && faq.category.toLowerCase().includes('acompte'));

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Informations pratiques
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Foire aux questions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Réglementation sans permis, acompte de 150 €, garanties atelier et livraison.
          </p>
        </div>

        {/* Search & Category Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question (permis AM, acompte 150 €, garantie, livraison...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              Aucune réponse ne correspond à votre recherche.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block mb-0.5">
                        {faq.category}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-700' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Direct Contact Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Une autre question ?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Notre équipe à {commercialSettings.city} vous répond par téléphone ou WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{commercialSettings.phone}</span>
            </a>
            <a
              href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Bonjour JEAN AUTO VSP, j'ai une question concernant vos véhicules sans permis.")}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
