import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  Server,
  Layers,
  FileText,
  ShieldCheck,
  ExternalLink,
  Code2
} from 'lucide-react';
import { firebaseConfig, FirebaseConnectionStatus, auth, isAuthorizedAdminUser } from '../../firebase';
import { WordPressFirebaseService } from '../../services/wordpressService';
import { WPPost, WPPage, WPMedia, WPComment, WPCategory, WPUser } from '../../types/wordpress';

interface WpFirebaseDiagnosticProps {
  connectionStatus: FirebaseConnectionStatus;
  onTestConnection: () => void;
  posts: WPPost[];
  pages: WPPage[];
  media: WPMedia[];
  comments: WPComment[];
  categories: WPCategory[];
  users: WPUser[];
}

export const WpFirebaseDiagnostic: React.FC<WpFirebaseDiagnosticProps> = ({
  connectionStatus,
  onTestConnection,
  posts,
  pages,
  media,
  comments,
  categories,
  users,
}) => {
  const [copiedRules, setCopiedRules] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const currentUser = auth.currentUser;
  const adminAuthorized = isAuthorizedAdminUser(currentUser);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccess(null);
    setSeedError(null);
    try {
      const ok = await WordPressFirebaseService.seedInitialDataIfEmpty();
      onTestConnection();
      if (ok) {
        setSeedSuccess('Collections et véhicules synchronisés avec votre base Cloud Firestore !');
      } else {
        setSeedError("Connectez-vous d'abord avec l'accès administrateur pour synchroniser en écriture.");
      }
      setTimeout(() => setSeedSuccess(null), 5000);
    } catch (e: any) {
      setSeedError(`Erreur lors de l'initialisation : ${e?.message || 'Erreur inconnue'}`);
    } finally {
      setSeeding(false);
    }
  };

  const sampleRules = `// Extrait des règles déployées (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && (request.auth.token.email.lower() == "amautosanspermis@gmail.com"
          || request.auth.token.email.lower() == "mozartmozartoi3@gmail.com")
        && request.auth.token.email_verified == true;
    }

    // Catalogue public (statut 'publish'), écriture strictement réservée à l'admin
    match /vsp_vehicles/{vehicleId} {
      allow read: if resource.data.status == 'publish' || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // Commandes et fiches clients (PII isolées côté admin uniquement)
    match /vsp_orders/{orderId} {
      allow read, update, delete: if isAdmin();
      allow create: if exists(/databases/$(database)/documents/vsp_vehicles/$(request.resource.data.vehicleId));
    }

    match /vsp_customers/{customerId} {
      allow read, write: if isAdmin();
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <div className="flex items-center space-x-2">
          <Database className="w-6 h-6 text-[#f0b849]" />
          <div>
            <h1 className="text-2xl font-normal text-[#1d2327]">Liaison Base de Données Firebase</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Diagnostic et confirmation en direct de la connexion avec votre base Cloud Firestore permanente.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTestConnection}
            disabled={connectionStatus.testing}
            className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
            <span>{connectionStatus.testing ? 'Test en cours...' : 'Tester le ping Firebase'}</span>
          </button>
        </div>
      </div>

      {seedSuccess && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{seedSuccess}</span>
        </div>
      )}

      {seedError && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="font-semibold">{seedError}</span>
        </div>
      )}

      {/* Main Connection Status Card */}
      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-6 space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-950 text-sm">
              {connectionStatus.connected
                ? 'Base Cloud Firestore permanente connectée et protégée !'
                : 'Vérification de la connexion Cloud Firestore en cours...'}
            </h3>
            <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
              Projet :{' '}
              <strong className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded">{firebaseConfig.projectId}</strong>
              {' · '}Base Firestore :{' '}
              <strong className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded">
                {firebaseConfig.firestoreDatabaseId || '(default)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <div className="text-gray-500 text-[11px]">Projet Firebase</div>
            <div className="font-mono font-bold text-gray-900 truncate mt-1">{firebaseConfig.projectId}</div>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <div className="text-gray-500 text-[11px]">Session Admin</div>
            <div className={`font-bold text-xs mt-1 truncate ${adminAuthorized ? 'text-emerald-700' : 'text-amber-700'}`}>
              {adminAuthorized ? currentUser?.email : 'Non connecté (lecture seule)'}
            </div>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <div className="text-gray-500 text-[11px]">Latence serveur</div>
            <div className="font-bold text-emerald-700 text-sm mt-1">
              {connectionStatus.latencyMs !== undefined ? `${connectionStatus.latencyMs} ms` : 'Connecté'}
            </div>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <div className="text-gray-500 text-[11px]">Dernière vérification</div>
            <div className="font-semibold text-gray-800 mt-1">
              {connectionStatus.lastChecked?.toLocaleTimeString() || 'À l\'instant'}
            </div>
          </div>
        </div>
      </div>

      {/* Collections Live Inspection */}
      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-800">Collections Firestore actives</h2>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded font-semibold text-xs transition-colors cursor-pointer"
          >
            {seeding ? 'Synchronisation...' : 'Synchroniser les collections'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-800">wp_posts</span>
              <span className="bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold">{posts.length}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Stocke les articles, brouillons et étiquettes.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-800">wp_pages</span>
              <span className="bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold">{pages.length}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Stocke les pages statiques et modèles.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-800">wp_media</span>
              <span className="bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold">{media.length}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Stocke les fichiers et URLs de la médiathèque.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-800">wp_comments</span>
              <span className="bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold">{comments.length}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Stocke les avis, réponses et statuts de modération.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-800">wp_categories</span>
              <span className="bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold">{categories.length}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Taxonomies des articles du blog.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-800">wp_users</span>
              <span className="bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold">{users.length}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Comptes administrateurs, éditeurs et auteurs.</p>
          </div>
        </div>
      </div>

      {/* Security Rules Helper snippet */}
      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#2271b1]" />
            <h2 className="text-sm font-bold text-gray-800">Règles de sécurité Firestore actives</h2>
          </div>
          <button
            onClick={copyRulesToClipboard}
            className="flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold border border-gray-300 transition-colors cursor-pointer"
          >
            {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRules ? 'Copié !' : 'Copier l\'extrait'}</span>
          </button>
        </div>
        <p className="text-gray-600 text-xs">
          Les règles permanentes ci-dessous (fichier <code className="font-mono bg-gray-100 px-1 rounded">firestore.rules</code>) n'expirent jamais (contrairement au mode Test de 30 jours), protègent les données clients (PII) et réservent les écritures catalogue à l'administrateur authentifié :
        </p>
        <pre className="p-3 bg-gray-900 text-gray-100 rounded text-[11px] font-mono overflow-x-auto leading-relaxed max-h-56">
          {sampleRules}
        </pre>
      </div>
    </div>
  );
};
