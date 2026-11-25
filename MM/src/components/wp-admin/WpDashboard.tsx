import React, { useState } from 'react';
import {
  FileText,
  Layers,
  MessageSquare,
  Database,
  RotateCw,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  Server,
  Car,
  ShoppingBag,
  CreditCard,
  Building2,
  Users,
  MessageCircle,
  Phone
} from 'lucide-react';
import {
  WPPost,
  WPPage,
  WPComment,
  WPMedia,
  WPSiteSettings,
  AdminMenuKey,
  Vehicle,
  VehicleOrder,
  CommercialBankSettings
} from '../../types/wordpress';
import { firebaseConfig, FirebaseConnectionStatus } from '../../firebase';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpDashboardProps {
  posts: WPPost[];
  pages: WPPage[];
  comments: WPComment[];
  media: WPMedia[];
  settings: WPSiteSettings;
  vehicles?: Vehicle[];
  orders?: VehicleOrder[];
  commercialSettings?: CommercialBankSettings;
  connectionStatus: FirebaseConnectionStatus;
  onTestConnection: () => void;
  onNavigate: (menu: AdminMenuKey) => void;
  onOpenNewPost: () => void;
  onOpenNewPage: () => void;
  onToggleFrontOffice: () => void;
  onCommentStatusChange: (commentId: string, status: WPComment['status']) => void;
}

export const WpDashboard: React.FC<WpDashboardProps> = ({
  posts,
  pages,
  comments,
  media,
  settings,
  vehicles = [],
  orders = [],
  commercialSettings,
  connectionStatus,
  onTestConnection,
  onNavigate,
  onOpenNewPost,
  onOpenNewPage,
  onToggleFrontOffice,
  onCommentStatusChange,
}) => {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const publishedPostsCount = posts.filter((p) => p.status === 'publish').length;
  const publishedPagesCount = pages.filter((p) => p.status === 'publish').length;
  const approvedCommentsCount = comments.filter((c) => c.status === 'approved').length;
  const recentPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentComments = [...comments].slice(0, 3);

  const handleSaveQuickDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;
    setSavingDraft(true);
    setDraftMessage(null);
    try {
      await WordPressFirebaseService.savePost({
        title: draftTitle,
        content: draftContent,
        status: 'draft',
        author: 'admin',
        category: settings.defaultCategory || 'Non classé',
      });
      setDraftTitle('');
      setDraftContent('');
      setDraftMessage('Brouillon enregistré avec succès dans Firebase !');
      setTimeout(() => setDraftMessage(null), 4000);
    } catch (err: any) {
      setDraftMessage(`Erreur: ${err?.message || 'Impossible d\'enregistrer'}`);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      await WordPressFirebaseService.seedInitialDataIfEmpty();
      onTestConnection();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Tableau de bord</h1>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
            v6.7 • Firestore
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleFrontOffice}
            className="px-3 py-1.5 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-blue-50 text-xs font-semibold rounded shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir le site en direct</span>
          </button>
          <button
            onClick={onOpenNewPost}
            className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un article</span>
          </button>
        </div>
      </div>

      {/* JEAN AUTO VSP - Module Commercial */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">JEAN AUTO VSP — Concession Aix-les-Bains</h2>
              <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-medium">
                Vente & Acomptes VSP
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              11 Avenue du Grand Port, 73100 Aix-les-Bains (à côté de La Poste) · Tél : +33 2 59 50 89 31 · WhatsApp : +33 6 37 38 55 90
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('orders')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Gérer les commandes</span>
            </button>
            <button
              onClick={() => onNavigate('vehicles')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Parc véhicules</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs VSP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div
            onClick={() => onNavigate('vehicles')}
            className="bg-slate-800/80 hover:bg-slate-700/80 cursor-pointer p-4 rounded-lg border border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Voitures VSP</span>
              <Car className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {vehicles.filter((v) => v.availability === 'available').length}{' '}
              <span className="text-xs font-normal text-slate-400">/ {vehicles.length} total</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {vehicles.filter((v) => v.availability === 'available').length} disponibles à l'achat
            </div>
          </div>

          <div
            onClick={() => onNavigate('orders')}
            className="bg-slate-800/80 hover:bg-slate-700/80 cursor-pointer p-4 rounded-lg border border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Acomptes reçus</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2">
              {orders.reduce((acc, o) => acc + (o.amountPaid || 0), 0).toLocaleString('fr-FR')} €
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {orders.length} transaction{orders.length > 1 ? 's' : ''} enregistrée{orders.length > 1 ? 's' : ''}
            </div>
          </div>

          <div
            onClick={() => onNavigate('orders')}
            className="bg-slate-800/80 hover:bg-slate-700/80 cursor-pointer p-4 rounded-lg border border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Paiements à vérifier</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-2">
              {orders.filter((o) => o.status === 'paiement_a_verifier').length}
            </div>
            <div className="text-[11px] text-amber-300 mt-1">
              {orders.filter((o) => o.status === 'paiement_a_verifier').length > 0
                ? 'Preuves de virement en attente'
                : 'Tous les virements sont à jour'}
            </div>
          </div>

          <div
            onClick={() => onNavigate('commercial-settings')}
            className="bg-slate-800/80 hover:bg-slate-700/80 cursor-pointer p-4 rounded-lg border border-slate-700 transition-colors"
          >
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Compte Virement</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white mt-2 truncate">
              {commercialSettings?.accountHolder || 'PHILIPPE JEAN L STIERS'}
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-1 break-all">
              {commercialSettings?.iban || 'FR76 1723 8000 0100 4953 3957 778'}
            </div>
          </div>
        </div>
      </div>

      {/* WordPress Welcome Notice Banner */}
      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-normal text-[#1d2327]">Bienvenue sur WordPress !</h2>
              <p className="text-sm text-gray-600 mt-1">
                Votre backoffice administrateur complet est connecté à votre base de données Firebase{' '}
                <strong className="text-gray-900 font-mono">{firebaseConfig.projectId}</strong>.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Base Firestore connectée</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-5 border-t border-gray-100 text-xs">
            {/* Col 1 */}
            <div>
              <h3 className="font-bold text-[#1d2327] text-sm mb-3">Pour commencer</h3>
              <button
                onClick={onOpenNewPost}
                className="w-full text-left py-1 text-[#2271b1] hover:underline flex items-center space-x-1.5"
              >
                <span>→ Rédiger votre premier article</span>
              </button>
              <button
                onClick={onOpenNewPage}
                className="w-full text-left py-1 text-[#2271b1] hover:underline flex items-center space-x-1.5"
              >
                <span>→ Ajouter une page d'exemple</span>
              </button>
              <button
                onClick={onToggleFrontOffice}
                className="w-full text-left py-1 text-[#2271b1] hover:underline flex items-center space-x-1.5"
              >
                <span>→ Consulter le site en ligne</span>
              </button>
            </div>

            {/* Col 2 */}
            <div>
              <h3 className="font-bold text-[#1d2327] text-sm mb-3">Étapes suivantes</h3>
              <button
                onClick={() => onNavigate('posts')}
                className="w-full text-left py-1 text-[#2271b1] hover:underline"
              >
                Gérer tous les articles ({posts.length})
              </button>
              <button
                onClick={() => onNavigate('media')}
                className="w-full text-left py-1 text-[#2271b1] hover:underline"
              >
                Parcourir la médiathèque ({media.length})
              </button>
              <button
                onClick={() => onNavigate('settings-general')}
                className="w-full text-left py-1 text-[#2271b1] hover:underline"
              >
                Personnaliser le titre et les réglages du site
              </button>
            </div>

            {/* Col 3 */}
            <div>
              <h3 className="font-bold text-[#1d2327] text-sm mb-3">Base de données Firebase</h3>
              <div className="text-gray-600 space-y-1 mb-2">
                <div>Projet : <code className="font-mono text-gray-800">{firebaseConfig.projectId}</code></div>
                <div>Domaine : <code className="font-mono text-gray-800">{firebaseConfig.authDomain}</code></div>
              </div>
              <button
                onClick={() => onNavigate('tools-firebase')}
                className="text-[#2271b1] hover:underline font-semibold flex items-center space-x-1"
              >
                <Database className="w-3.5 h-3.5 mr-1" />
                <span>Diagnostic & inspecteur Firebase</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: At a Glance, Activity, Quick Draft, Firebase Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: D'un coup d'œil */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1d2327]">D’un coup d’œil</h3>
            <span className="text-xs text-gray-500">WordPress 6.7</span>
          </div>
          <div className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
              <button
                onClick={() => onNavigate('posts')}
                className="flex items-center space-x-2 text-left hover:text-[#2271b1] group"
              >
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                <span>
                  <strong className="text-sm font-bold text-gray-900">{publishedPostsCount}</strong>{' '}
                  <span className="text-gray-600">Articles</span>
                </span>
              </button>

              <button
                onClick={() => onNavigate('pages')}
                className="flex items-center space-x-2 text-left hover:text-[#2271b1] group"
              >
                <Layers className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                <span>
                  <strong className="text-sm font-bold text-gray-900">{publishedPagesCount}</strong>{' '}
                  <span className="text-gray-600">Pages</span>
                </span>
              </button>

              <button
                onClick={() => onNavigate('comments')}
                className="flex items-center space-x-2 text-left hover:text-[#2271b1] group"
              >
                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                <span>
                  <strong className="text-sm font-bold text-gray-900">{approvedCommentsCount}</strong>{' '}
                  <span className="text-gray-600">Commentaires</span>
                </span>
              </button>

              <button
                onClick={() => onNavigate('media')}
                className="flex items-center space-x-2 text-left hover:text-[#2271b1] group"
              >
                <Server className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                <span>
                  <strong className="text-sm font-bold text-gray-900">{media.length}</strong>{' '}
                  <span className="text-gray-600">Médias</span>
                </span>
              </button>
            </div>

            <div className="pt-1 text-gray-600 leading-relaxed">
              Propulsé par le thème <strong className="text-gray-800">Twenty Twenty-Four</strong> avec synchronisation Firestore en temps réel.
            </div>
          </div>
        </div>

        {/* Widget 2: État de santé de la base de données Firebase */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#f0b849]" />
              <h3 className="font-semibold text-sm text-[#1d2327]">Santé de la base Firebase</h3>
            </div>
            <button
              onClick={onTestConnection}
              disabled={connectionStatus.testing}
              className="text-xs text-[#2271b1] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
              <span>Tester le ping</span>
            </button>
          </div>
          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200 rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">
                  Projet lié : <span className="font-mono font-bold">{firebaseConfig.projectId}</span>
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                {connectionStatus.latencyMs !== undefined ? `${connectionStatus.latencyMs} ms` : 'Connecté'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-gray-50 border border-gray-200 p-2 rounded">
                <div className="font-bold text-gray-800 text-sm">{posts.length}</div>
                <div className="text-[11px] text-gray-500">docs wp_posts</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2 rounded">
                <div className="font-bold text-gray-800 text-sm">{pages.length}</div>
                <div className="text-[11px] text-gray-500">docs wp_pages</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2 rounded">
                <div className="font-bold text-gray-800 text-sm">{comments.length}</div>
                <div className="text-[11px] text-gray-500">docs wp_comments</div>
              </div>
            </div>

            {posts.length === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                <p className="mb-2">Votre base Firebase est prête mais ne contient pas encore de contenu de départ.</p>
                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="px-3 py-1 bg-[#2271b1] text-white rounded font-medium hover:bg-[#135e96] disabled:opacity-50"
                >
                  {seeding ? 'Initialisation...' : 'Générer les articles & pages par défaut dans Firebase'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Widget 3: Activité récente */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-[#1d2327]">Activité récente</h3>
          </div>
          <div className="p-4 space-y-4 text-xs">
            <div>
              <div className="text-gray-500 font-semibold mb-2">Publié récemment</div>
              {recentPosts.length === 0 ? (
                <div className="text-gray-400 italic">Aucun article publié.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentPosts.map((post) => (
                    <li key={post.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-gray-400 shrink-0">
                          {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                        <button
                          onClick={() => onNavigate('posts')}
                          className="text-[#2271b1] hover:underline font-medium truncate"
                        >
                          {post.title}
                        </button>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold shrink-0 ${
                        post.status === 'publish' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {post.status === 'publish' ? 'Publié' : 'Brouillon'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {recentComments.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-gray-500 font-semibold mb-2">Commentaires récents</div>
                <div className="space-y-2">
                  {recentComments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-gray-50 rounded border border-gray-100">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                        <span className="font-semibold text-gray-800">{c.authorName}</span>
                        <span>sur « {c.postTitle} »</span>
                      </div>
                      <p className="text-gray-700 line-clamp-2 italic mb-2">"{c.content}"</p>
                      <div className="flex items-center space-x-2 text-[11px]">
                        {c.status !== 'approved' && (
                          <button
                            onClick={() => onCommentStatusChange(c.id, 'approved')}
                            className="text-emerald-700 hover:underline font-semibold"
                          >
                            Approuver
                          </button>
                        )}
                        {c.status === 'approved' && (
                          <button
                            onClick={() => onCommentStatusChange(c.id, 'pending')}
                            className="text-amber-700 hover:underline"
                          >
                            Désapprouver
                          </button>
                        )}
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => onCommentStatusChange(c.id, 'trash')}
                          className="text-red-600 hover:underline"
                        >
                          Corbeille
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Widget 4: Brouillon rapide */}
        <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-[#1d2327]">Brouillon rapide</h3>
          </div>
          <form onSubmit={handleSaveQuickDraft} className="p-4 space-y-3 text-xs">
            {draftMessage && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium">
                {draftMessage}
              </div>
            )}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Titre</label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Idée d'article..."
                required
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contenu</label>
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Qu'avez-vous en tête ?"
                rows={3}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none text-xs resize-none"
              ></textarea>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400 flex items-center">
                <Database className="w-3 h-3 mr-1 text-gray-400" />
                Enregistré dans Firestore
              </span>
              <button
                type="submit"
                disabled={savingDraft || !draftTitle.trim()}
                className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-medium disabled:opacity-50 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{savingDraft ? 'Enregistrement...' : 'Enregistrer le brouillon'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
