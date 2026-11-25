import React, { useState, useEffect } from 'react';
import { X, FileText, Lock, Scale, Building2, CheckCircle2 } from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';

export type LegalPageType = 'cgv' | 'mentions-legales' | 'confidentialite';

interface LegalPagesModalProps {
  initialTab?: LegalPageType | null;
  pageType?: LegalPageType | null;
  onClose: () => void;
  commercialSettings: CommercialBankSettings;
  onSelectTab?: (type: LegalPageType) => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  initialTab,
  pageType,
  onClose,
  commercialSettings,
  onSelectTab,
}) => {
  const activeTabProp = initialTab || pageType;
  const [currentTab, setCurrentTab] = useState<LegalPageType>(activeTabProp || 'cgv');

  useEffect(() => {
    if (activeTabProp) {
      setCurrentTab(activeTabProp);
    }
  }, [activeTabProp]);

  const handleTabChange = (tab: LegalPageType) => {
    setCurrentTab(tab);
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {currentTab === 'cgv' && 'Conditions générales de vente (CGV)'}
                {currentTab === 'mentions-legales' && 'Mentions légales et informations légales'}
                {currentTab === 'confidentialite' && 'Politique de confidentialité (RGPD)'}
              </h2>
              <p className="text-xs text-slate-500">
                {commercialSettings.companyName} · {commercialSettings.address}, {commercialSettings.postalCode} {commercialSettings.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-slate-100/60 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => handleTabChange('cgv')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              currentTab === 'cgv'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Conditions générales de vente (CGV)</span>
          </button>
          <button
            onClick={() => handleTabChange('mentions-legales')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              currentTab === 'mentions-legales'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mentions légales</span>
          </button>
          <button
            onClick={() => handleTabChange('confidentialite')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              currentTab === 'confidentialite'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Politique de confidentialité</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-6">
          {/* TAB 1: CGV */}
          {currentTab === 'cgv' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs leading-relaxed">
                <strong>En vigueur au 1er janvier 2026.</strong> Les présentes conditions régissent de plein droit l'ensemble des ventes et réservations de véhicules sans permis (neufs et occasions révisées) conclues par l'établissement JEAN AUTO VSP, que la commande soit validée en ligne ou directement au garage d'Aix-les-Bains.
              </div>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 1 : Identification du vendeur
                </h3>
                <p>
                  Le vendeur est l'établissement commercial <strong>JEAN AUTO VSP</strong>, spécialisé dans le négoce automobile, la vente et l'entretien de véhicules sans permis, dont les coordonnées officielles sont :
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <p><strong>Siège et concession :</strong> 11 Avenue du Grand Port, 73100 Aix-les-Bains (à côté de La Poste)</p>
                  <p><strong>Téléphone :</strong> {commercialSettings.phone} · <strong>WhatsApp :</strong> {commercialSettings.whatsapp}</p>
                  <p><strong>Courrier électronique :</strong> {commercialSettings.email}</p>
                  <p><strong>Horaires d'ouverture :</strong> Du lundi au samedi de 08h30 à 19h00</p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 2 : Véhicules et révision technique
                </h3>
                <p>
                  Chaque véhicule proposé à la vente par JEAN AUTO VSP est rigoureusement expertisé en atelier. Il fait l'objet d'un contrôle complet en plus de 100 points comprenant :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Contrôle du groupe motopropulseur, variateur de vitesse et courroie de transmission.</li>
                  <li>Système de freinage complet (plaquettes, disques, tambours, liquide de frein).</li>
                  <li>Trains roulants, amortisseurs, géométrie et état des pneumatiques.</li>
                  <li>Éclairage, signalisation, batterie et circuit électrique.</li>
                  <li>Vidange moteur complète et remplacement des filtres (huile, gazole, air).</li>
                  <li>Délivrance d'un certificat de situation administrative (non-gage) officiel vierge.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 3 : Réservation et acompte bloquant de 150 €
                </h3>
                <p>
                  Afin d'assurer le blocage immédiat du véhicule au profit exclusif de l'acheteur et de retirer le véhicule de la vente, un <strong>acompte forfaitaire de cent cinquante euros (150 €)</strong> est exigé au moment de la réservation.
                </p>
                <p>
                  Le règlement de l'acompte s'effectue par virement bancaire sécurisé sur le compte bancaire officiel de la concession, dont les coordonnées complètes (IBAN et titulaire certifié) sont transmises de manière sécurisée lors de l'enregistrement de la demande de réservation.
                </p>
                <p>
                  La transmission de la preuve de virement (capture d'écran ou récépissé bancaire) sur la plateforme ou via WhatsApp entraîne le passage immédiat du véhicule sous le statut « Réservé » et l'édition du bon de commande officiel.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 4 : Règlement du solde
                </h3>
                <p>
                  Le solde restant dû (correspondant au prix total du véhicule diminué de l'acompte de 150 € déjà versé) est réglé selon la modalité convenue au bon de commande :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Au comptant :</strong> Par virement bancaire sécurisé au moment de la livraison ou lors de la remise des clés en concession.</li>
                  <li><strong>En facilités de paiement échelonnées :</strong> Selon l'échéancier personnalisé validé avec l'acheteur, sans frais cachés.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 5 : Droit de rétractation (vente à distance)
                </h3>
                <p>
                  Conformément à l'article L. 221-18 du Code de la consommation, pour toute commande réalisée à distance, l'acquéreur dispose d'un délai légal de <strong>quatorze (14) jours calendaires</strong> à compter de la réception du véhicule pour exercer son droit de rétractation, sans pénalité et sans avoir à justifier de motif.
                </p>
                <p>
                  En cas d'exercice régulier du droit de rétractation, JEAN AUTO VSP rembourse la totalité des sommes versées dans un délai maximal de quatorze (14) jours suivant la restitution du véhicule dans son état d'origine.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 6 : Modalités de mise à disposition et livraison
                </h3>
                <p>
                  L'acquéreur a le choix entre :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Le <strong>retrait direct au garage</strong> d'Aix-les-Bains au 11 Avenue du Grand Port, avec démonstration et prise en main accompagnées.</li>
                  <li>La <strong>livraison à domicile par camion plateau dédié</strong> sur rendez-vous sous 48 à 72 heures en Savoie (73), Haute-Savoie (74), Isère (38) et sur devis dans toute la France.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Article 7 : Garanties légales et contractuelles
                </h3>
                <p>
                  Les véhicules bénéficient de la garantie légale de conformité (art. L. 217-4 et suivants du Code de la consommation) et de la garantie des vices cachés (art. 1641 du Code civil). En outre, chaque voiture sans permis est couverte par une <strong>garantie contractuelle pièces et main d'œuvre de 6 à 12 mois</strong> couvrant le moteur, le variateur, la boîte de vitesses et les éléments de sécurité essentiels.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: MENTIONS LÉGALES */}
          {currentTab === 'mentions-legales' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  1. Présentation de l'établissement
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <p><strong>Dénomination commerciale :</strong> {commercialSettings.companyName}</p>
                  <p><strong>Forme juridique :</strong> Établissement commercial de vente automobile</p>
                  <p><strong>Adresse de la concession :</strong> {commercialSettings.address}, {commercialSettings.postalCode} {commercialSettings.city}, France</p>
                  <p><strong>Point de repère :</strong> {commercialSettings.landmark}</p>
                  <p><strong>Téléphone accueil :</strong> {commercialSettings.phone}</p>
                  <p><strong>Assistance WhatsApp :</strong> {commercialSettings.whatsapp}</p>
                  <p><strong>Courriel de contact :</strong> {commercialSettings.email}</p>
                  <p><strong>Registre du commerce :</strong> RCS Chambéry (Savoie) B 894 721 845</p>
                  <p><strong>Habilitation Ministère de l'Intérieur :</strong> Agréé SIV pour les démarches d'immatriculation et cartes grises</p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  2. Direction et responsabilité éditoriale
                </h3>
                <p>
                  La direction de la publication et la gestion des contenus du présent site sont assurées par la direction commerciale de JEAN AUTO VSP.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  3. Hébergement de la plateforme
                </h3>
                <p>
                  Le site internet et sa base de données sont hébergés sur des serveurs sécurisés haute disponibilité situés au sein de l'Union Européenne, respectant l'ensemble des normes européennes de protection des données et le protocole de chiffrement TLS 1.3.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  4. Propriété intellectuelle et marques
                </h3>
                <p>
                  Les marques commerciales Aixam, Ligier, Microcar, Chatenet, Bellier et Casalini demeurent la propriété exclusive de leurs détenteurs respectifs. Leur mention sur ce site a pour unique finalité d'identifier les modèles et les pièces détachées commercialisés.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  5. Règlement amiable des litiges et médiation
                </h3>
                <p>
                  En cas de réclamation non résolue par le service client, le consommateur peut faire appel gratuitement au médiateur de la consommation compétent pour le secteur du commerce automobile, conformément aux articles L. 612-1 et suivants du Code de la consommation. La juridiction compétente est celle du ressort de la Cour d'appel de Chambéry.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: CONFIDENTIALITÉ */}
          {currentTab === 'confidentialite' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  1. Protection de vos données personnelles (RGPD)
                </h3>
                <p>
                  JEAN AUTO VSP s'engage formellement à respecter la confidentialité et la sécurité de vos informations personnelles, en conformité avec le Règlement Général sur la Protection des Données (RGPD n° 2016/679) et la loi Informatique et Libertés.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  2. Données strictement nécessaires collectées
                </h3>
                <p>
                  Dans le cadre de l'utilisation de nos services, nous recueillons uniquement les informations requises pour traiter votre demande et honorer votre commande :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Identité et coordonnées :</strong> Nom, prénom, numéro de téléphone portable et adresse e-mail.</li>
                  <li><strong>Adresse de livraison :</strong> Adresse complète pour l'acheminement du véhicule et l'établissement du certificat d'immatriculation SIV.</li>
                  <li><strong>Dossier de commande :</strong> Choix du modèle, formule de règlement retenue (comptant ou acompte 150 €), justificatif de virement transmis.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  3. Utilisation de vos données
                </h3>
                <p>
                  Vos informations sont exclusivement utilisées aux fins suivantes :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Édition du bon de commande et du certificat de cession officiel.</li>
                  <li>Immatriculation préfectorale de votre véhicule auprès du Ministère de l'Intérieur.</li>
                  <li>Organisation logistique de la mise à disposition ou de la livraison à domicile.</li>
                  <li>Suivi de votre garantie mécanique et du service après-vente.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  4. Engagement de non-cession à des tiers
                </h3>
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs">
                  <strong>Aucun partage ni revente commerciale :</strong> Vos données ne font l'objet d'aucune vente, location ou transmission à des organismes tiers ou régies publicitaires. Seuls les collaborateurs habilités de JEAN AUTO VSP ont accès à votre dossier.
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  5. Exercice de vos droits d'accès et d'effacement
                </h3>
                <p>
                  Vous disposez à tout moment d'un droit d'accès, de modification, de rectification et de suppression totale de vos données. Pour exercer ce droit, il vous suffit de nous adresser un simple message par e-mail à : <strong>{commercialSettings.email}</strong> ou par courrier postal adressé à la concession JEAN AUTO VSP à Aix-les-Bains.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer with Close Button */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Document contractuel certifié {commercialSettings.companyName}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Fermer cette fenêtre</span>
          </button>
        </div>
      </div>
    </div>
  );
};
