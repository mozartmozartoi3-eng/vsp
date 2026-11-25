import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Car,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Phone,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { Vehicle, CommercialBankSettings } from '../../types/wordpress';
import leaAvatar from '../../assets/images/lea_ai_avatar_1788964724815.jpg';

interface ChatMessage {
  id: string;
  sender: 'lea' | 'user';
  text: string;
  timestamp: string;
  suggestedVehicles?: Vehicle[];
  quickActions?: { label: string; action: string }[];
}

interface AiAssistantLeaProps {
  vehicles: Vehicle[];
  commercialSettings: CommercialBankSettings;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onOpenOrderModal?: (vehicle: Vehicle) => void;
}

export const AiAssistantLea: React.FC<AiAssistantLeaProps> = ({
  vehicles,
  commercialSettings,
  onSelectVehicle,
  onOpenOrderModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation with warm welcoming message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      sender: 'lea',
      text: `Bonjour ! Je suis Léa, votre conseillère commerciale chez JEAN AUTO VSP à Aix-les-Bains.\n\nJe suis à votre entière disposition pour vous renseigner sur nos voitures sans permis révisées et garanties, notre réservation sécurisée (par Carte Bancaire ou Virement avec acompte de 150 €), notre livraison à domicile partout en France et notre concession en Savoie.\n\nComment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '📍 Où êtes-vous situés ?', action: 'localisation' },
        { label: '🚗 Nos véhicules disponibles', action: 'stock' },
        { label: '💳 Carte Bancaire & Virement', action: 'paiement' },
        { label: '💶 Comment réserver à 150 € ?', action: 'reservation' },
        { label: '🚚 Livraison à domicile & délais', action: 'livraison' },
        { label: '🛡️ Essai 14 jours & garanties', action: 'garantie' },
      ],
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasOpenedBefore(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Helper to remove any markdown asterisks or strange characters
  const cleanPureText = (str: string): string => {
    return str
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_{1,2}/g, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/`{1,3}/g, '')
      .trim();
  };

  // Knowledge-based AI response generator that anticipates needs and knows all site information
  const generateLeaResponse = (userQuery: string): ChatMessage => {
    const rawQ = userQuery.toLowerCase().trim();
    // Normalize without accents for easy matching
    const q = rawQ.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Available vehicles in stock
    const availableVehicles = vehicles.filter((v) => v.status === 'publish' && v.availability !== 'sold');

    // 0. TOP PRIORITY: SÉCURITÉ, CONFIANCE, DOUTE, CRAINTE D'ARNAQUE, VRAI GARAGE, SIRET
    const isTrustOrScamQuery =
      q.includes('arnaque') ||
      q.includes('escroc') ||
      q.includes('confiance') ||
      q.includes('peur') ||
      q.includes('securite') ||
      q.includes('securise') ||
      q.includes('fiable') ||
      q.includes('fiabilite') ||
      q.includes('siret') ||
      q.includes('rcs') ||
      q.includes('vrai') ||
      q.includes('faux') ||
      q.includes('doute') ||
      q.includes('serieux') ||
      q.includes('serieuse') ||
      q.includes('legal') ||
      q.includes('legitime') ||
      q.includes('pourquoi si peu cher') ||
      q.includes('pourquoi pas cher');

    if (isTrustOrScamQuery) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Bonjour ! Je comprends totalement votre prudence, c'est une excellente question avant d'acheter un véhicule en ligne. La transparence et la confiance sont au cœur de nos engagements chez JEAN AUTO VSP.\n\nVoici les garanties concrètes et vérifiables que nous vous apportons :\n\n1. Concession physique réelle & ouverte au public :\nNotre concession et notre atelier se situent au 11 Avenue du Grand Port, 73100 Aix-les-Bains (en Savoie), juste à côté de La Poste. Vous pouvez venir nous rencontrer du lundi au samedi de 8h30 à 19h00 pour essayer nos véhicules et échanger de vive voix.\n\n2. Société française enregistrée au RCS :\nNous sommes une société française immatriculée avec SIRET officiel vérifiable sur les registres légaux (societe.com, Infogreffe) et dans nos mentions légales.\n\n3. Paiement protégé : acompte de 150 € et solde à la livraison :\nPour bloquer votre véhicule et lancer le transport, un acompte de 150 € seulement est demandé (par prélèvement bancaire 3D Secure ou virement professionnel). Le solde n'est payé QU'À LA RÉCEPTION chez vous, après que vous ayez inspecté la voiture sous tous les angles et effectué l'essai routier avec notre convoyeur !\n\n4. Facture officielle immédiate :\nDès votre réservation, votre Facture officielle acquittée avec TVA et votre Bon de livraison vous sont immédiatement délivrés au format PDF.\n\n5. Garantie 14 jours satisfait ou 100% remboursé :\nVous disposez de 14 jours complets pour tester le véhicule. S'il ne vous convient pas, il est repris et vous êtes intégralement remboursé.\n\nN'hésitez pas à nous joindre par téléphone au ${commercialSettings.phone || '+33 2 59 50 89 31'} ou directement sur WhatsApp au ${commercialSettings.whatsapp || '+33 6 37 38 55 90'} si vous souhaitez un échange vidéo ou téléphonique !`,
        timestamp,
        quickActions: [
          { label: '📍 Où êtes-vous situés ?', action: 'localisation' },
          { label: '📞 Joindre un conseiller', action: 'contact' },
          { label: '💬 Échanger sur WhatsApp', action: 'whatsapp' },
          { label: '💶 Comment réserver pour 150 € ?', action: 'reservation' },
        ],
      };
    }

    // 1. LOCALISATION, ADRESSE, SITUATION GÉOGRAPHIQUE, VENIR SUR PLACE
    const isLocationQuery =
      q.includes('situe') ||
      q.includes('situez') ||
      q.includes('situer') ||
      q.includes('situation') ||
      q.includes('localisation') ||
      q.includes('adresse') ||
      q.includes('ou vous trouvez') ||
      q.includes('ou se trouve') ||
      q.includes('ou etes vous') ||
      q.includes('ou vous etes') ||
      q.includes('ou sont vos') ||
      q.includes('ou est le') ||
      q.includes('ou est la') ||
      q.includes('ou est votre') ||
      q.includes('aix les bains') ||
      q.includes('savoie') ||
      q.includes('ville') ||
      q.includes('departement') ||
      q.includes('region') ||
      q.includes('grand port') ||
      q.includes('venir sur place') ||
      q.includes('venir vous voir') ||
      q.includes('visiter la concession') ||
      q.includes('voir le showroom') ||
      q.includes('visiter') ||
      q.includes('ou vous voir') ||
      q.includes('point de vente') ||
      (q.includes('ou') && (q.includes('garage') || q.includes('concession') || q.includes('magasin') || q.includes('trouver') || q.includes('localiser')));

    if (isLocationQuery) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `📍 Notre concession et showroom officiel JEAN AUTO VSP sont situés au :\n\n11 Avenue du Grand Port\n73100 Aix-les-Bains (en Savoie)\n\n📌 Point de repère : nous sommes situés juste à côté du bureau de La Poste.\n\n🕒 Horaires d'accueil :\nDu lundi au samedi, de 8h30 à 19h00 sans interruption.\n\n🚗 Accueil sur place & Essais :\nVous êtes chaleureusement les bienvenus pour visiter notre parc, essayer un véhicule sans permis et rencontrer nos conseillers.\n\n🚚 Livraison partout en France :\nSi vous habitez dans une autre région ou préférez ne pas vous déplacer, nous vous livrons votre véhicule directement à domicile sous 48h à 72h partout en France métropolitaine, avec essai sur place et remise des clés !`,
        timestamp,
        quickActions: [
          { label: '📞 Joindre la concession', action: 'contact' },
          { label: '💬 Poser une question sur WhatsApp', action: 'whatsapp' },
          { label: '🚗 Voir les véhicules en stock', action: 'stock' },
          { label: '🚚 Comment se passe la livraison ?', action: 'livraison' },
        ],
      };
    }

    // 2. MOYENS DE RÈGLEMENT & PRÉLÈVEMENT PAR CARTE BANCAIRE / DÉBIT / VIREMENT
    const isPaymentCardQuery =
      q.includes('carte') ||
      q.includes('cb') ||
      q.includes('prelevement') ||
      q.includes('prelever') ||
      q.includes('visa') ||
      q.includes('mastercard') ||
      q.includes('debiter') ||
      q.includes('debit') ||
      q.includes('defalquer') ||
      q.includes('payer par carte') ||
      q.includes('mode de reglement') ||
      q.includes('moyen de reglement') ||
      q.includes('moyen de paiement') ||
      q.includes('3d secure');

    if (isPaymentCardQuery) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `💳 Chez JEAN AUTO VSP, vous disposez de deux méthodes de règlement officielles et ultra-sécurisées :\n\n1. Prélèvement direct par Carte Bancaire (CB, Visa, Mastercard) :\nVous pouvez renseigner vos coordonnées de carte bancaire directement sur notre bon de commande en ligne. Vos données sont chiffrées (SSL 256 bits et 3D Secure 2.0). Vous signez une autorisation expresse de prélèvement qui nous autorise en toute sécurité à défalquer le montant convenu qui nous revient de droit (soit l'acompte de 150 €, soit le montant comptant total).\n\n2. Virement bancaire professionnel :\nVous pouvez également opter pour le virement bancaire avec le RIB / IBAN officiel de la concession affiché sur le bon de commande.\n\n📄 Documents officiels immédiats :\nDès la validation de votre règlement (CB ou virement), votre Facture officielle acquittée ainsi que votre Bon de livraison avec attestation d'autorisation de prélèvement sont immédiatement délivrés au format PDF !`,
        timestamp,
        quickActions: [
          { label: '💶 Réserver pour 150 €', action: 'reservation' },
          { label: '📄 Facture et Bon de livraison PDF', action: 'documents' },
          { label: '🚗 Voir les véhicules disponibles', action: 'stock' },
        ],
      };
    }

    // 3. POLITE GREETINGS & HELLO (ONLY IF NO SPECIFIC QUESTION)
    const isPureGreeting =
      q === 'bonjour' ||
      q === 'salut' ||
      q === 'bonsoir' ||
      q === 'coucou' ||
      q === 'hello' ||
      q === 'yo' ||
      q === 'bonjour lea' ||
      q === 'salut lea' ||
      q === 'bonjour jean auto' ||
      (q.length <= 15 &&
        (q.startsWith('bonjour') || q.startsWith('salut') || q.startsWith('bonsoir') || q.startsWith('hello')) &&
        !q.includes('?') &&
        !q.includes('ou') &&
        !q.includes('situe') &&
        !q.includes('adresse') &&
        !q.includes('prix') &&
        !q.includes('carte'));

    if (isPureGreeting) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Bonjour ! Je suis ravie de vous accueillir chez JEAN AUTO VSP à Aix-les-Bains. Comment puis-je vous aider aujourd'hui ?\n\nN'hésitez pas à me demander notre adresse exacte, nos véhicules en stock, nos facilités de réservation (acompte de 150 € par Carte Bancaire ou Virement) ou notre service de livraison à domicile partout en France !`,
        timestamp,
        suggestedVehicles: availableVehicles.slice(0, 2),
        quickActions: [
          { label: '📍 Où êtes-vous situés ?', action: 'localisation' },
          { label: '🚗 Voir les véhicules', action: 'stock' },
          { label: '💶 Réserver pour 150 €', action: 'reservation' },
          { label: '🚚 Livraison à domicile', action: 'livraison' },
        ],
      };
    }

    // 2. IDENTITY / WHO ARE YOU
    if (
      q.includes('qui es tu') ||
      q.includes('qui est tu') ||
      q.includes('tu es qui') ||
      q.includes('t es qui') ||
      q.includes('c est qui lea') ||
      q.includes('vous etes qui') ||
      q.includes('qui etes vous') ||
      q.includes('presentation')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Je suis Léa, votre conseillère commerciale chez JEAN AUTO VSP à Aix-les-Bains. Je suis là pour vous renseigner avec précision sur nos voitures sans permis, notre stock, nos facilités d'acompte à 150 € et notre livraison partout en France. N'hésitez pas à me poser vos questions !`,
        timestamp,
        quickActions: [
          { label: '🚗 Quels sont vos véhicules ?', action: 'stock' },
          { label: '💶 Comment fonctionne la réservation ?', action: 'reservation' },
          { label: '📞 Joindre un conseiller humain', action: 'contact' },
        ],
      };
    }

    // 3. COURTESY / THANKS
    if (
      q.includes('merci') ||
      q.includes('parfait') ||
      q.includes('super') ||
      q.includes('genial') ||
      q.includes('d accord') ||
      q.includes('daccord') ||
      q === 'ok' ||
      q.includes('tres bien')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Je vous en prie ! C'est un plaisir de vous renseigner. Si vous avez la moindre autre question ou si vous souhaitez réserver un véhicule, je reste à votre entière écoute.`,
        timestamp,
        quickActions: [
          { label: '🚗 Consulter les véhicules', action: 'stock' },
          { label: '💬 Poser une question sur WhatsApp', action: 'whatsapp' },
        ],
      };
    }

    // 4. FAREWELL / GOODBYE
    if (
      q.includes('au revoir') ||
      q.includes('bonne journee') ||
      q.includes('a bientot') ||
      q.includes('bonne soiree') ||
      q.includes('bye') ||
      q.includes('ciao')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Merci beaucoup pour votre visite et à très bientôt chez JEAN AUTO VSP ! Passez une excellente journée et n'hésitez pas si vous avez besoin d'un conseil ultérieur.`,
        timestamp,
      };
    }

    // 5. STOCK / CATALOGUE / VÉHICULES DISPONIBLES
    if (
      q.includes('stock') ||
      q.includes('disponible') ||
      q.includes('catalogue') ||
      q.includes('voiture') ||
      q.includes('vehicule') ||
      q.includes('modele') ||
      q.includes('aixam') ||
      q.includes('ligier') ||
      q.includes('microcar') ||
      q.includes('chatenet') ||
      q.includes('ami') ||
      q.includes('electrique') ||
      q.includes('diesel') ||
      q.includes('prix') ||
      q.includes('combien')
    ) {
      if (availableVehicles.length === 0) {
        return {
          id: `lea-${Date.now()}`,
          sender: 'lea',
          text: `Notre concession prépare actuellement la mise en ligne de nouveaux véhicules sans permis révisés et garantis. Si vous recherchez un modèle spécifique (Aixam, Ligier, Microcar, Chatenet...) ou si vous souhaitez être prévenu en avant-première de nos arrivages, vous pouvez nous contacter directement par téléphone ou sur WhatsApp !`,
          timestamp,
          quickActions: [
            { label: '💬 Contacter sur WhatsApp', action: 'whatsapp' },
            { label: '📞 Appeler un conseiller', action: 'contact' },
            { label: '💶 Comment fonctionne la réservation ?', action: 'reservation' },
          ],
        };
      }

      let matching = availableVehicles;
      if (q.includes('aixam')) matching = matching.filter((v) => v.brand.toLowerCase().includes('aixam'));
      else if (q.includes('ligier')) matching = matching.filter((v) => v.brand.toLowerCase().includes('ligier'));
      else if (q.includes('microcar')) matching = matching.filter((v) => v.brand.toLowerCase().includes('microcar'));
      else if (q.includes('chatenet')) matching = matching.filter((v) => v.brand.toLowerCase().includes('chatenet'));
      else if (q.includes('ami')) matching = matching.filter((v) => v.brand.toLowerCase().includes('citro') || v.model.toLowerCase().includes('ami'));
      else if (q.includes('electrique')) matching = matching.filter((v) => v.energy === 'Électrique');
      else if (q.includes('diesel')) matching = matching.filter((v) => v.energy === 'Diesel');

      const displayList = matching.length > 0 ? matching.slice(0, 4) : availableVehicles.slice(0, 4);

      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Nous disposons actuellement de ${availableVehicles.length} voiture(s) sans permis disponible(s) immédiatement. Chaque modèle est révisé en 100 points de contrôle dans nos ateliers et bénéficie d'une garantie de 12 à 24 mois.\n\nVoici notre sélection en ligne :`,
        timestamp,
        suggestedVehicles: displayList,
        quickActions: [
          { label: '💶 Comment réserver pour 150 € ?', action: 'reservation' },
          { label: '🚚 Délais de livraison à domicile', action: 'livraison' },
          { label: '💬 Échanger sur WhatsApp', action: 'whatsapp' },
        ],
      };
    }

    // 6. RÉSERVATION / ACOMPTE 150 € / PAIEMENT
    if (
      q.includes('150') ||
      q.includes('acompte') ||
      q.includes('payer') ||
      q.includes('paiement') ||
      q.includes('plusieurs fois') ||
      q.includes('financement') ||
      q.includes('virement') ||
      q.includes('iban') ||
      q.includes('reserver') ||
      q.includes('reserv')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Notre procédure d'achat est simple, transparente et totalement sécurisée :\n\n1. Acompte de réservation de 150 € : vous réglez cet acompte par virement bancaire pour bloquer définitivement le véhicule à votre nom.\n2. Délivrance automatique de vos documents : vous téléchargez immédiatement votre Facture officielle et votre Bon de livraison au format PDF.\n3. Paiement du solde à la livraison : vous ne payez le restant dû qu'à la réception chez vous, après avoir vu et essayé la voiture.\n4. Garantie 14 jours satisfait ou 100% remboursé : vous pouvez tester le véhicule en conditions réelles en toute sérénité.`,
        timestamp,
        quickActions: [
          { label: '📄 Quels documents sont délivrés ?', action: 'documents' },
          { label: '🚚 Délais de livraison à domicile', action: 'livraison' },
          { label: '🚗 Voir les véhicules', action: 'stock' },
        ],
      };
    }

    // 7. LIVRAISON À DOMICILE & DÉLAIS
    if (
      q.includes('livraison') ||
      q.includes('livr') ||
      q.includes('delai') ||
      q.includes('domicile') ||
      q.includes('transport') ||
      q.includes('france')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Nous assurons la livraison à domicile partout en France sous 48h à 72h ouvrées.\n\n• Transport spécialisé : le véhicule arrive sur camion plateau adapté directement à votre adresse.\n• Mise en main complète : le transporteur vous explique les fonctionnalités de la voiture et réalise avec vous le tour du véhicule.\n• Contrôle avant paiement du solde : vous inspectez le véhicule avant de signer le bon de livraison et de régler le solde.`,
        timestamp,
        quickActions: [
          { label: '🛡️ Essai 14 jours & garanties', action: 'garantie' },
          { label: '💶 Réserver pour 150 €', action: 'reservation' },
          { label: '🚗 Choisir mon véhicule', action: 'stock' },
        ],
      };
    }

    // 8. DOCUMENTS : FACTURE ET BON DE LIVRAISON EN PDF
    if (
      q.includes('facture') ||
      q.includes('bon de livraison') ||
      q.includes('pdf') ||
      q.includes('document') ||
      q.includes('papier') ||
      q.includes('contrat') ||
      q.includes('certificat') ||
      q.includes('carte grise')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Dès que votre commande est validée sur notre site, deux documents officiels conformes sont automatiquement générés au format PDF téléchargeable :\n\n1. Votre Facture officielle d'achat précisant les informations du véhicule, le numéro de commande, l'acompte de 150 € et le solde restant.\n2. Votre Bon de livraison officiel avec votre adresse, la désignation du modèle et la zone d'émargement de remise des clés.`,
        timestamp,
        quickActions: [
          { label: '🚗 Voir les véhicules', action: 'stock' },
          { label: '💶 Procédure d acompte 150 €', action: 'reservation' },
          { label: '📞 Joindre notre conseiller', action: 'contact' },
        ],
      };
    }

    // 9. GARANTIE, ATELIER ET ESSAI 14 JOURS
    if (
      q.includes('garanti') ||
      q.includes('panne') ||
      q.includes('reprise') ||
      q.includes('14 jour') ||
      q.includes('rembours') ||
      q.includes('atelier') ||
      q.includes('fiabilit') ||
      q.includes('revision')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Tous nos véhicules font l'objet d'une révision rigoureuse de 100 points de contrôle dans nos ateliers spécialisés. Chaque voiture bénéficie d'une garantie de 12 à 24 mois pièces et main d'œuvre.\n\nDe plus, vous profitez de 14 jours d'essai satisfait ou 100% remboursé : si le véhicule ne correspond pas à vos attentes, nous le reprenons avec remboursement complet.`,
        timestamp,
        quickActions: [
          { label: '🚗 Consulter les véhicules', action: 'stock' },
          { label: '💶 Réserver en toute confiance', action: 'reservation' },
          { label: '🚚 Délais de livraison', action: 'livraison' },
        ],
      };
    }

    // 10. PERMIS / ÂGE / LÉGISLATION (BSR, AM, 14 ANS)
    if (
      q.includes('permis') ||
      q.includes('bsr') ||
      q.includes('am') ||
      q.includes('age') ||
      q.includes('14 ans') ||
      q.includes('conduire')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Les voitures sans permis sont accessibles :\n\n• Dès 14 ans avec le permis AM (l'ancien BSR, obtenu après 8h de formation pratique en auto-école, sans examen).\n• Sans aucun permis pour toutes les personnes nées avant le 1er janvier 1988.\n• En cas d'annulation ou de suspension de permis de conduire classique (sauf interdiction de tout véhicule à moteur).\n• La vitesse est bridée à 45 km/h, autorisée sur toutes les routes sauf autoroutes et voies rapides.`,
        timestamp,
        quickActions: [
          { label: '🚗 Modèles recommandés', action: 'stock' },
          { label: '💶 Comment réserver facilement ?', action: 'reservation' },
        ],
      };
    }

    // 11. CONTACT / TÉLÉPHONE / WHATSAPP / ADRESSE
    if (
      q.includes('contact') ||
      q.includes('telephone') ||
      q.includes('numero') ||
      q.includes('whatsapp') ||
      q.includes('conseiller') ||
      q.includes('adresse') ||
      q.includes('ou etes vous') ||
      q.includes('horaire') ||
      q.includes('mail') ||
      q.includes('email')
    ) {
      return {
        id: `lea-${Date.now()}`,
        sender: 'lea',
        text: `Notre équipe commerciale est à votre disposition du lundi au samedi de 8h30 à 19h00 :\n\n• Téléphone direct : ${commercialSettings.phone || '+33 2 59 50 89 31'}\n• WhatsApp direct : ${commercialSettings.whatsapp || '+33 6 37 38 55 90'}\n• Email : contact@jean-auto-vsp.fr\n• Concession : Aix-les-Bains (Savoie) avec livraison à domicile dans toute la France.`,
        timestamp,
        quickActions: [
          { label: '💬 Échanger sur WhatsApp', action: 'whatsapp' },
          { label: '🚗 Voir les véhicules', action: 'stock' },
        ],
      };
    }

    // DEFAULT INTELLIGENT ASSISTANT GUIDANCE
    return {
      id: `lea-${Date.now()}`,
      sender: 'lea',
      text: `Merci pour votre message ! Je suis à votre entière disposition pour vous guider sur nos véhicules sans permis révisés et garantis, nos modalités de réservation (acompte de 150 € par carte bancaire sécurisée ou virement), ou notre livraison à domicile partout en France sous 48h à 72h.\n\nPour toute question spécifique ou accompagnement personnalisé, vous pouvez également joindre directement nos conseillers au ${commercialSettings.phone || '+33 2 59 50 89 31'} ou via WhatsApp au ${commercialSettings.whatsapp || '+33 6 37 38 55 90'}.\n\nSur quel aspect puis-je vous renseigner en priorité ?`,
      timestamp,
      suggestedVehicles: availableVehicles.slice(0, 2),
      quickActions: [
        { label: '📍 Où êtes-vous situés ?', action: 'localisation' },
        { label: '🚗 Voir les véhicules', action: 'stock' },
        { label: '💶 Réserver pour 150 €', action: 'reservation' },
        { label: '🚚 Livraison à domicile', action: 'livraison' },
        { label: '💬 Discuter sur WhatsApp', action: 'whatsapp' },
      ],
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // 1. Send all questions to the server-side intelligent Gemini AI engine with an 8s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.text && typeof data.text === 'string' && data.text.trim().length > 0) {
          const cleanText = data.text.replace(/\*\*/g, '').replace(/\*/g, '').trim();

          const lower = cleanText.toLowerCase();
          const quickActions: { label: string; action: string }[] = [];
          if (lower.includes('11 avenue') || lower.includes('aix-les-bains') || lower.includes('situe')) {
            quickActions.push({ label: '📞 Joindre la concession', action: 'contact' });
            quickActions.push({ label: '💬 WhatsApp direct', action: 'whatsapp' });
            quickActions.push({ label: '🚗 Voir les véhicules', action: 'stock' });
          } else if (lower.includes('carte') || lower.includes('prelevement') || lower.includes('acompte')) {
            quickActions.push({ label: '💶 Réserver pour 150 €', action: 'reservation' });
            quickActions.push({ label: '📄 Facture et Bon PDF', action: 'documents' });
            quickActions.push({ label: '🚗 Voir les véhicules', action: 'stock' });
          } else if (lower.includes('arnaque') || lower.includes('confiance') || lower.includes('garantie')) {
            quickActions.push({ label: '📍 Concession à Aix-les-Bains', action: 'localisation' });
            quickActions.push({ label: '📞 Appeler la concession', action: 'contact' });
            quickActions.push({ label: '💬 Discuter sur WhatsApp', action: 'whatsapp' });
            quickActions.push({ label: '🚗 Voir les véhicules', action: 'stock' });
          } else {
            quickActions.push({ label: '📍 Où êtes-vous situés ?', action: 'localisation' });
            quickActions.push({ label: '🚗 Voir les véhicules', action: 'stock' });
            quickActions.push({ label: '💬 WhatsApp direct', action: 'whatsapp' });
          }

          setMessages((prev) => [
            ...prev,
            {
              id: `lea-${Date.now()}`,
              sender: 'lea',
              text: cleanText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              quickActions,
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend assistant chat unavailable or timed out, using local smart engine:', err);
    }

    // 2. Guaranteed fallback smart engine if network is disconnected or server unavailable
    setTimeout(() => {
      try {
        const fallbackMsg = generateLeaResponse(query);
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsTyping(false);
      }
    }, 300);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'stock') {
      handleSendMessage('Quels sont les véhicules disponibles actuellement ?');
    } else if (action === 'localisation') {
      handleSendMessage('Vous êtes situé où ? Quelle est votre adresse exacte ?');
    } else if (action === 'paiement') {
      handleSendMessage('Quels sont les moyens de paiement et comment fonctionne le prélèvement par carte bancaire ?');
    } else if (action === 'reservation') {
      handleSendMessage('Comment fonctionne la réservation et l\'acompte de 150 € ?');
    } else if (action === 'livraison') {
      handleSendMessage('Comment se passe la livraison à domicile et quels sont les délais ?');
    } else if (action === 'garantie') {
      handleSendMessage('Quelles sont les garanties et l\'essai 14 jours satisfait ou remboursé ?');
    } else if (action === 'documents') {
      handleSendMessage('Comment sont délivrés la facture et le bon de livraison en PDF ?');
    } else if (action === 'whatsapp') {
      const cleanWa = commercialSettings.whatsapp.replace(/[^0-9]/g, '');
      window.open(
        `https://wa.me/${cleanWa}?text=${encodeURIComponent(
          'Bonjour Léa, je consulte vos voitures sans permis sur votre site et je souhaite obtenir un renseignement personnalisé.'
        )}`,
        '_blank'
      );
    } else if (action === 'contact') {
      handleSendMessage('Quels sont vos moyens de contact directs ?');
    }
  };

  return (
    <>
      {/* FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3 pointer-events-auto">
          {/* Teaser Tooltip Bubble */}
          {!hasOpenedBefore && (
            <div
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2.5 bg-white text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl border border-blue-100 cursor-pointer hover:border-blue-300 transition-all group animate-bounce-subtle"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-xs">
                <span className="font-bold text-blue-900">Léa est en ligne :</span>{' '}
                <span className="text-slate-600">Une question sur un véhicule ?</span>
              </div>
            </div>
          )}

          {/* Round Avatar Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Ouvrir l'assistant Léa"
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 p-0.5 shadow-2xl hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center group focus:outline-hidden focus:ring-4 focus:ring-blue-300"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-2 border-white">
              <img
                src={leaAvatar}
                alt="Léa - Conseillère JEAN AUTO VSP"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  // Fallback to stylized vector if image path fails
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Online Indicator Badge */}
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />

            {/* Chat icon badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-md border-2 border-white">
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </div>
          </button>
        </div>
      )}

      {/* CHAT WINDOW MODAL */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 sm:w-[410px] sm:max-w-[calc(100vw-2rem)] h-full sm:h-[620px] sm:max-h-[85vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-blue-900 shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-blue-400 shrink-0 bg-slate-800">
                <img
                  src={leaAvatar}
                  alt="Léa"
                  className="w-full h-full object-cover object-top"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white truncate">Léa</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    Conseillère VSP
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En ligne · Réponse instantanée</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`tel:${commercialSettings.phone?.replace(/[^0-9+]/g, '') || '+33259508931'}`}
                title="Appeler par téléphone"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                aria-label="Fermer la discussion"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* RASSURANCE SUB-BANNER */}
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-[11px] text-blue-900 flex items-center justify-between shrink-0 font-medium">
            <span className="flex items-center gap-1 text-blue-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Garantie 14 jours satisfait ou remboursé</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>Livraison 48-72h</span>
            </span>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl p-3.5 shadow-2xs leading-relaxed space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-gray-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal">
                    {msg.text.split('\n').map((rawLine, idx) => {
                      const line = cleanPureText(rawLine);
                      if (!line) return <div key={idx} className="h-1" />;
                      if (line.startsWith('• ') || line.startsWith('- ') || /^\d+\.\s/.test(line)) {
                        return (
                          <div key={idx} className="mt-1 font-medium pl-1 text-slate-800">
                            {line}
                          </div>
                        );
                      }
                      return (
                        <span key={idx} className="block mt-0.5 first:mt-0">
                          {line}
                        </span>
                      );
                    })}
                  </div>

                  {/* MINI VEHICLE CARDS IF SUGGESTED */}
                  {msg.suggestedVehicles && msg.suggestedVehicles.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        <span>Véhicules recommandés :</span>
                      </div>
                      <div className="space-y-2">
                        {msg.suggestedVehicles.map((veh) => (
                          <div
                            key={veh.id}
                            className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-14 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
                              <img
                                src={veh.mainImage}
                                alt={veh.model}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {veh.brand} {veh.model}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {veh.year} · {veh.mileage.toLocaleString('fr-FR')} km · {veh.energy}
                              </div>
                              <div className="text-xs font-extrabold text-blue-700 mt-0.5">
                                {veh.price.toLocaleString('fr-FR')} €
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectVehicle?.(veh);
                                setIsOpen(false);
                              }}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors shadow-2xs cursor-pointer"
                            >
                              Voir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right font-medium ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* QUICK ACTIONS UNDER LEA MESSAGE */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickAction(qa.action)}
                        className="text-[11px] font-semibold bg-white hover:bg-blue-50 text-blue-800 hover:text-blue-900 border border-blue-200 rounded-full px-3 py-1 shadow-2xs transition-all cursor-pointer text-left flex items-center gap-1 active:scale-95"
                      >
                        <span>{qa.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 w-fit shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Léa rédige une réponse...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez votre question à Léa..."
                className="flex-1 text-xs bg-slate-100 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                aria-label="Envoyer"
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* WhatsApp Quick Direct Link */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Besoin d'une photo / vidéo spécifique ?</span>
              <a
                href={`https://wa.me/${commercialSettings.whatsapp?.replace(/[^0-9]/g, '') || '33637385590'}?text=${encodeURIComponent(
                  'Bonjour Léa, je souhaite échanger directement avec vous par WhatsApp concernant une voiture sans permis.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>WhatsApp direct</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
