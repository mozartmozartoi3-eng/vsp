import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Phone,
  Search,
  CheckCircle2,
  Car,
  CreditCard,
  Truck,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
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
    answer: `L’acompte forfaitaire de 150 € est une mesure de réservation contractuelle et de blocage immédiat. Face à la forte demande sur nos modèles, cet acompte garantit que le véhicule que vous avez choisi vous est immédiatement attribué et retiré du marché.
Les coordonnées bancaires officielles de la concession vous sont transmises de façon sécurisée lors de l'enregistrement de votre réservation. Dès transmission de votre preuve de virement (sur le site ou par WhatsApp), le véhicule passe sous le statut « Réservé » à votre nom.`,
    category: 'Acompte et paiement',
    order: 2,
  },
  {
    id: 'faq-solde-reglement',
    question: 'Quand et comment dois-je régler le solde restant de la voiture ?',
    answer: `Le solde restant dû (prix du véhicule diminué des 150 € d'acompte déjà versés) ne se règle qu'au moment où vous prenez possession du véhicule :
• Paiement au comptant : par virement bancaire sécurisé lors de la livraison à domicile ou lors de la remise des clés à notre concession d'Aix-les-Bains.
• En facilités de paiement échelonnées : selon l'échéancier personnalisé consigné sur votre bon de commande officiel, sans aucun frais caché ni mauvaise surprise.`,
    category: 'Acompte et paiement',
    order: 3,
  },
  {
    id: 'faq-etat-revision',
    question: 'Dans quel état mécanique et esthétique sont préparés les véhicules ?',
    answer: `Chaque véhicule sans permis commercialisé par JEAN AUTO VSP bénéficie d'une révision rigoureuse en atelier :
• Contrôle systématique en plus de 100 points (moteur, variateur, courroie, freinage, trains roulants, batterie et faisceau électrique).
• Vidange moteur complète et remplacement de tous les filtres (huile, gazole, air).
• Nettoyage complet de l'habitacle et polissage carrosserie.
• Certificat de situation administrative (non-gage) officiel vierge remis à chaque acheteur.`,
    category: 'Véhicules et garantie',
    order: 4,
  },
  {
    id: 'faq-garantie-atelier',
    question: 'Quelle est la durée de la garantie et que couvre-t-elle exactement ?',
    answer: `Tous nos véhicules sont couverts par une garantie contractuelle pièces et main d'œuvre de 6 à 12 mois (selon le modèle et l'année). Cette garantie couvre les éléments mécaniques essentiels : moteur, variateur de vitesse, boîte-pont de transmission et composants majeurs. En cas de besoin, la prise en charge peut s'effectuer directement dans notre atelier d'Aix-les-Bains ou auprès d'un réparateur automobile agréé proche de votre domicile.`,
    category: 'Véhicules et garantie',
    order: 5,
  },
  {
    id: 'faq-livraison-domicile',
    question: 'Comment s\'organise la livraison à domicile et quels sont les délais ?',
    answer: `Nous disposons d'un service de convoyage dédié sur camion plateau sécurisé. Nous assurons la livraison sous 48 à 72 heures en Savoie (73), Haute-Savoie (74), Isère (38) et partout en France métropolitaine.
Le jour de la livraison, notre chauffeur-technicien effectue le tour complet du véhicule avec vous et vous accompagne lors d'une première prise en main sur route. Vous pouvez également choisir le retrait direct et gratuit à notre concession d'Aix-les-Bains.`,
    category: 'Livraison et démarches',
    order: 6,
  },
  {
    id: 'faq-carte-grise-siv',
    question: 'Qui s\'occupe de la carte grise et des démarches administratives ?',
    answer: `JEAN AUTO VSP est habilité et agréé par la Préfecture et le Ministère de l'Intérieur (Système SIV). Nous prenons en charge 100 % des formalités d'immatriculation et du changement de carte grise à votre nom.
Vous n'avez aucune démarche compliquée en ligne à accomplir : votre carte grise définitive vous est expédiée directement par l'Imprimerie Nationale sous pli sécurisé à votre adresse postale.`,
    category: 'Livraison et démarches',
    order: 7,
  },
  {
    id: 'faq-assurance-vsp',
    question: 'L\'assurance est-elle obligatoire et comment m\'assurer avant la réception ?',
    answer: `Oui, une assurance automobile (au minimum la responsabilité civile au tiers) est légalement obligatoire pour tout véhicule circulant sur la voie publique.
Dès validation de votre réservation et réception de l'acompte de 150 €, notre équipe vous transmet la copie de la carte grise et la facture proforma par e-mail. Ces documents vous permettent d'obtenir votre attestation d'assurance auprès de votre assureur en quelques minutes, bien avant le jour de la livraison.`,
    category: 'Permis et réglementation',
    order: 8,
  },
  {
    id: 'faq-essai-visite-garage',
    question: 'Puis-je venir essayer les véhicules directement à la concession ?',
    answer: `Bien sûr. Notre parc d'exposition est situé au 11 Avenue du Grand Port, 73100 Aix-les-Bains (juste à côté de La Poste). Nous vous accueillons du lundi au samedi de 08h30 à 19h00.
Vous pouvez examiner tous les véhicules en stock, vous asseoir à bord et effectuer un essai routier en conditions réelles accompagné de l'un de nos conseillers.`,
    category: 'Véhicules et garantie',
    order: 9,
  },
  {
    id: 'faq-reprise-ancien-vehicule',
    question: 'Proposez-vous la reprise de mon ancienne voiturette ou d\'un deux-roues ?',
    answer: `Oui, nous étudions toute proposition de reprise de votre ancienne voiture sans permis (toutes marques confondues : Aixam, Ligier, Microcar, Chatenet, Bellier) ou d'un scooter.
La valeur de reprise convenue est alors déduite directement du montant restant dû sur votre nouveau véhicule. Vous pouvez nous solliciter par téléphone ou sur WhatsApp avec des photos pour obtenir une première estimation sous 24 heures.`,
    category: 'Acompte et paiement',
    order: 10,
  }
];

export const FrontFaq: React.FC<FrontFaqProps> = ({ faqs = [], commercialSettings }) => {
  // Use enriched detailed list or merge with custom faqs
  const allFaqs = faqs.length > 0 ? faqs : detailedDefaultFaqs;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(allFaqs[0]?.id || null);

  const categories = [
    { id: 'all', label: 'Toutes les questions' },
    { id: 'Permis et réglementation', label: 'Permis et réglementation' },
    { id: 'Acompte et paiement', label: 'Acompte de 150 € et solde' },
    { id: 'Véhicules et garantie', label: 'Véhicules et garantie' },
    { id: 'Livraison et démarches', label: 'Livraison et carte grise' },
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
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-3">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Réponses aux questions courantes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Foire aux questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
            Toutes les réponses claires et certifiées sur la réglementation sans permis, l'acompte de 150 €, les garanties en atelier et la livraison à domicile.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une question (permis AM, acompte 150 €, garantie, livraison...)"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-gray-200 text-slate-500 text-xs">
              Aucune réponse ne correspond à votre recherche. Essayez un autre mot-clé ou contactez notre conseiller directement.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen
                      ? 'border-blue-300 bg-white shadow-xs ring-2 ring-blue-500/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md shrink-0">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 bg-slate-50/50 leading-relaxed border-t border-gray-100 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Direct Contact Card */}
        <div className="mt-10 bg-slate-50 border border-gray-200 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Vous avez une question spécifique sur un modèle ou votre commande ?
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Notre conseiller commercial à Aix-les-Bains répond à toutes vos questions par téléphone ou directement sur WhatsApp.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{commercialSettings.phone}</span>
            </a>
            <a
              href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour JEAN AUTO VSP, j\'ai une question concernant vos véhicules sans permis.')}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Échanger sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
