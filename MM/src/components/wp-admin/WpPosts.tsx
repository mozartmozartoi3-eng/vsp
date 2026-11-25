import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  MessageSquare,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Tag,
  Folder,
  ArrowLeft,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
  Bold,
  Italic,
  List,
  Heading,
  Quote,
  Link as LinkIcon
} from 'lucide-react';
import { WPPost, WPCategory, WPMedia, PostStatus } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpPostsProps {
  posts: WPPost[];
  categories: WPCategory[];
  media: WPMedia[];
  editingPostId: string | null;
  isCreating: boolean;
  onEditPost: (id: string) => void;
  onCancelEdit: () => void;
  onViewPostInFront: (slug: string) => void;
  onOpenNewCategory: () => void;
}

export const WpPosts: React.FC<WpPostsProps> = ({
  posts,
  categories,
  media,
  editingPostId,
  isCreating,
  onEditPost,
  onCancelEdit,
  onViewPostInFront,
}) => {
  // Filter states
  const [currentTab, setCurrentTab] = useState<'all' | 'publish' | 'draft' | 'trash'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Editor states
  const postToEdit = posts.find((p) => p.id === editingPostId);
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [content, setContent] = useState(postToEdit?.content || '');
  const [excerpt, setExcerpt] = useState(postToEdit?.excerpt || '');
  const [status, setStatus] = useState<PostStatus>(postToEdit?.status || 'publish');
  const [category, setCategory] = useState(postToEdit?.category || (categories[0]?.name || 'Non classé'));
  const [tagsInput, setTagsInput] = useState(postToEdit?.tags?.join(', ') || '');
  const [featuredImage, setFeaturedImage] = useState(postToEdit?.featuredImage || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Sync editor when postToEdit changes
  React.useEffect(() => {
    if (isCreating) {
      setTitle('');
      setContent('');
      setExcerpt('');
      setStatus('publish');
      setCategory(categories[0]?.name || 'Non classé');
      setTagsInput('');
      setFeaturedImage('');
      setSaveSuccess(null);
      setSaveError(null);
    } else if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setExcerpt(postToEdit.excerpt || '');
      setStatus(postToEdit.status);
      setCategory(postToEdit.category);
      setTagsInput(postToEdit.tags?.join(', ') || '');
      setFeaturedImage(postToEdit.featuredImage || '');
      setSaveSuccess(null);
      setSaveError(null);
    }
  }, [editingPostId, isCreating]);

  // Tab counts
  const allCount = posts.filter((p) => p.status !== 'trash').length;
  const publishedCount = posts.filter((p) => p.status === 'publish').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const trashCount = posts.filter((p) => p.status === 'trash').length;

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (currentTab === 'all' && p.status === 'trash') return false;
    if (currentTab === 'publish' && p.status !== 'publish') return false;
    if (currentTab === 'draft' && p.status !== 'draft') return false;
    if (currentTab === 'trash' && p.status !== 'trash') return false;

    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPosts(filteredPosts.map((p) => p.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedPosts.length === 0) return;
    try {
      if (bulkAction === 'trash') {
        for (const id of selectedPosts) {
          await WordPressFirebaseService.trashPost(id);
        }
      } else if (bulkAction === 'restore') {
        for (const id of selectedPosts) {
          await WordPressFirebaseService.restorePost(id);
        }
      } else if (bulkAction === 'delete') {
        if (confirm(`Supprimer définitivement ${selectedPosts.length} article(s) ?`)) {
          for (const id of selectedPosts) {
            await WordPressFirebaseService.deletePostPermanently(id);
          }
        }
      }
      setSelectedPosts([]);
      setBulkAction('');
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    }
  };

  const handleSavePost = async (forceStatus?: PostStatus) => {
    if (!title.trim()) {
      setSaveError('Veuillez saisir un titre pour l’article.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const effectiveStatus = forceStatus || status;
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await WordPressFirebaseService.savePost({
        id: editingPostId || undefined,
        title,
        content,
        excerpt,
        status: effectiveStatus,
        category,
        tags: tagsArray,
        featuredImage,
        author: 'admin',
        createdAt: postToEdit?.createdAt || new Date().toISOString(),
      });
      setSaveSuccess(`Article ${effectiveStatus === 'publish' ? 'publié' : 'enregistré en brouillon'} dans Firebase !`);
      setTimeout(() => {
        setSaveSuccess(null);
        onCancelEdit();
      }, 1200);
    } catch (err: any) {
      setSaveError(err?.message || 'Erreur lors de l\'enregistrement dans Firebase');
    } finally {
      setSaving(false);
    }
  };

  // Helper toolbar actions for editor
  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setContent((prev) => prev + before + after);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end);
    const replacement = before + selection + after;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  // IF IN EDITOR MODE
  if (isCreating || editingPostId) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto text-xs">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancelEdit}
              className="flex items-center space-x-1 text-[#2271b1] hover:underline font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Articles</span>
            </button>
            <span className="text-gray-300 text-sm">/</span>
            <h1 className="text-lg font-normal text-[#1d2327]">
              {isCreating ? 'Ajouter un article' : `Modifier l'article : ${title || 'Sans titre'}`}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSavePost('draft')}
              disabled={saving}
              className="px-3 py-1.5 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-blue-50 rounded font-medium transition-colors disabled:opacity-50"
            >
              Enregistrer le brouillon
            </button>
            <button
              onClick={() => handleSavePost('publish')}
              disabled={saving}
              className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Publication...' : 'Publier'}</span>
            </button>
          </div>
        </div>

        {saveError && (
          <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 mb-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* 2-Column Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title Input */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Saisissez le titre ici"
                className="w-full text-xl sm:text-2xl font-semibold px-4 py-3 bg-white border border-[#c3c4c7] rounded shadow-2xs focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none text-[#1d2327]"
              />
            </div>

            {/* Permalink preview */}
            {title && (
              <div className="text-gray-500 flex items-center space-x-1 pl-1">
                <span>Permalien :</span>
                <span className="text-gray-400 font-mono">/article/</span>
                <span className="font-mono text-gray-800 font-medium">
                  {postToEdit?.slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}
                </span>
              </div>
            )}

            {/* Visual Editor Toolbar */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
              <div className="bg-[#f0f0f1] px-3 py-2 border-b border-[#c3c4c7] flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertText('**', '**')}
                  className="p-1.5 hover:bg-white rounded text-gray-700"
                  title="Gras"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('*', '*')}
                  className="p-1.5 hover:bg-white rounded text-gray-700"
                  title="Italique"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertText('\n## ', '\n')}
                  className="p-1.5 hover:bg-white rounded text-gray-700 flex items-center font-bold text-[11px]"
                  title="Titre H2"
                >
                  <Heading className="w-3.5 h-3.5 mr-0.5" /> 2
                </button>
                <button
                  type="button"
                  onClick={() => insertText('\n### ', '\n')}
                  className="p-1.5 hover:bg-white rounded text-gray-700 flex items-center font-bold text-[11px]"
                  title="Titre H3"
                >
                  <Heading className="w-3.5 h-3.5 mr-0.5" /> 3
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertText('\n- ')}
                  className="p-1.5 hover:bg-white rounded text-gray-700"
                  title="Liste à puces"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('\n> ')}
                  className="p-1.5 hover:bg-white rounded text-gray-700"
                  title="Citation"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('[', '](https://)')}
                  className="p-1.5 hover:bg-white rounded text-gray-700"
                  title="Lien"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => setShowMediaSelector(true)}
                  className="p-1.5 hover:bg-white rounded text-gray-700 flex items-center space-x-1"
                  title="Insérer un média"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-[11px]">Ajouter un média</span>
                </button>
              </div>

              {/* Editor Textarea */}
              <textarea
                id="post-content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Rédigez votre article ici..."
                className="w-full p-4 font-mono text-sm leading-relaxed text-gray-900 border-none outline-none resize-y"
              ></textarea>
            </div>

            {/* Extrait / Excerpt metabox */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-4">
              <label className="block font-semibold text-gray-800 mb-1">Extrait</label>
              <p className="text-gray-500 text-[11px] mb-2">
                Les extraits sont des résumés facultatifs rédigés manuellement qui décrivent votre contenu.
              </p>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Court résumé de l'article..."
                className="w-full p-2.5 border border-gray-300 rounded outline-none focus:border-[#2271b1]"
              ></textarea>
            </div>
          </div>

          {/* Right Sidebar Metaboxes */}
          <div className="space-y-4">
            {/* Box 1: Publier */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
              <div className="px-4 py-2.5 bg-[#f0f0f1] border-b border-[#c3c4c7] font-semibold text-gray-800">
                Publier
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span>État :</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PostStatus)}
                    className="p-1 border border-gray-300 rounded font-semibold text-xs"
                  >
                    <option value="publish">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="trash">Corbeille</option>
                  </select>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span>Visibilité :</span>
                  <span className="font-semibold text-gray-900">Public</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span>Publier :</span>
                  <span className="font-semibold text-gray-900">
                    {postToEdit ? new Date(postToEdit.createdAt).toLocaleDateString('fr-FR') : 'Immédiatement'}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  {postToEdit && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Déplacer cet article vers la corbeille ?')) {
                          await WordPressFirebaseService.trashPost(postToEdit.id);
                          onCancelEdit();
                        }
                      }}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Déplacer dans la corbeille
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSavePost()}
                    disabled={saving}
                    className="ml-auto px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-bold text-xs"
                  >
                    {saving ? 'Enregistrement...' : status === 'publish' ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Box 2: Catégories */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
              <div className="px-4 py-2.5 bg-[#f0f0f1] border-b border-[#c3c4c7] font-semibold text-gray-800">
                Catégories
              </div>
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center space-x-2 cursor-pointer text-gray-800">
                    <input
                      type="radio"
                      name="post-category"
                      checked={category === cat.name}
                      onChange={() => setCategory(cat.name)}
                      className="text-[#2271b1] focus:ring-[#2271b1]"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Box 3: Étiquettes (Tags) */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
              <div className="px-4 py-2.5 bg-[#f0f0f1] border-b border-[#c3c4c7] font-semibold text-gray-800">
                Étiquettes
              </div>
              <div className="p-4 space-y-2">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Séparer par des virgules"
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                />
                <p className="text-[11px] text-gray-500">Ex: Actualités, Firebase, Tutoriel</p>
              </div>
            </div>

            {/* Box 4: Image mise en avant */}
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
              <div className="px-4 py-2.5 bg-[#f0f0f1] border-b border-[#c3c4c7] font-semibold text-gray-800">
                Image mise en avant
              </div>
              <div className="p-4 space-y-3">
                {featuredImage ? (
                  <div className="space-y-2">
                    <img
                      src={featuredImage}
                      alt="Mise en avant"
                      className="w-full h-36 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Supprimer l'image mise en avant
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowMediaSelector(true)}
                      className="text-[#2271b1] hover:underline font-semibold flex items-center space-x-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Définir l'image mise en avant</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Selector Modal */}
        {showMediaSelector && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-5 border border-gray-200 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-bold text-base text-gray-900">Médiathèque WordPress</h3>
                <button
                  onClick={() => setShowMediaSelector(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="grid grid-cols-3 gap-3">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setFeaturedImage(item.url);
                        setShowMediaSelector(false);
                      }}
                      className="cursor-pointer border-2 border-transparent hover:border-[#2271b1] rounded overflow-hidden group transition-all"
                    >
                      <img src={item.url} alt={item.title} className="w-full h-24 object-cover" />
                      <div className="p-1 text-[11px] truncate text-gray-700 bg-gray-50">{item.title}</div>
                    </div>
                  ))}
                </div>
                {media.length === 0 && (
                  <div className="text-center py-8 text-gray-400 italic">
                    Aucun média dans la médiathèque. Ajoutez une image via l’onglet Médias.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowMediaSelector(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-xs text-gray-800"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TABLE VIEW (TOUS LES ARTICLES)
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Articles</h1>
          <button
            onClick={() => onEditPost('new')}
            className="px-2.5 py-1 border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded text-xs font-semibold transition-colors"
          >
            Ajouter un article
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des articles..."
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:border-[#2271b1] outline-none w-56"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 text-xs border-b border-gray-200 pb-2">
        <button
          onClick={() => setCurrentTab('all')}
          className={`hover:text-[#2271b1] ${currentTab === 'all' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Tous ({allCount})
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setCurrentTab('publish')}
          className={`hover:text-[#2271b1] ${currentTab === 'publish' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Publiés ({publishedCount})
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setCurrentTab('draft')}
          className={`hover:text-[#2271b1] ${currentTab === 'draft' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Brouillons ({draftCount})
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setCurrentTab('trash')}
          className={`hover:text-[#2271b1] ${currentTab === 'trash' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Corbeille ({trashCount})
        </button>
      </div>

      {/* Filter / Bulk Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
        <div className="flex items-center space-x-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
          >
            <option value="">Actions groupées</option>
            {currentTab !== 'trash' ? (
              <option value="trash">Déplacer dans la corbeille</option>
            ) : (
              <>
                <option value="restore">Rétablir</option>
                <option value="delete">Supprimer définitivement</option>
              </>
            )}
          </select>
          <button
            onClick={handleApplyBulkAction}
            disabled={!bulkAction || selectedPosts.length === 0}
            className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded text-xs font-semibold disabled:opacity-40"
          >
            Appliquer
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-gray-500 text-xs">
          {filteredPosts.length} article(s) trouvé(s)
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
              <th className="p-2.5 w-8">
                <input
                  type="checkbox"
                  checked={selectedPosts.length > 0 && selectedPosts.length === filteredPosts.length}
                  onChange={handleSelectAll}
                  className="rounded text-[#2271b1]"
                />
              </th>
              <th className="p-2.5">Titre</th>
              <th className="p-2.5">Auteur</th>
              <th className="p-2.5">Catégories</th>
              <th className="p-2.5">Étiquettes</th>
              <th className="p-2.5 text-center">
                <MessageSquare className="w-3.5 h-3.5 inline text-gray-500" />
              </th>
              <th className="p-2.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPosts.map((post) => {
              const isSelected = selectedPosts.includes(post.id);
              return (
                <tr key={post.id} className="hover:bg-[#f6f7f7] group transition-colors">
                  <td className="p-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(post.id)}
                      className="rounded text-[#2271b1]"
                    />
                  </td>
                  <td className="p-2.5 font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditPost(post.id)}
                        className="text-[#2271b1] hover:underline font-bold text-sm text-left"
                      >
                        {post.title}
                      </button>
                      {post.status === 'draft' && (
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
                          Brouillon
                        </span>
                      )}
                    </div>

                    {/* Quick row hover actions */}
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {post.status !== 'trash' ? (
                        <>
                          <button
                            onClick={() => onEditPost(post.id)}
                            className="text-[#2271b1] hover:underline font-semibold"
                          >
                            Modifier
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => WordPressFirebaseService.trashPost(post.id)}
                            className="text-red-600 hover:underline"
                          >
                            Corbeille
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => onViewPostInFront(post.slug)}
                            className="text-[#2271b1] hover:underline"
                          >
                            Afficher
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => WordPressFirebaseService.restorePost(post.id)}
                            className="text-emerald-700 hover:underline font-semibold"
                          >
                            Rétablir
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer définitivement cet article de Firebase ?')) {
                                WordPressFirebaseService.deletePostPermanently(post.id);
                              }
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Supprimer définitivement
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5 text-gray-600">{post.author}</td>
                  <td className="p-2.5 text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{post.category}</span>
                  </td>
                  <td className="p-2.5 text-gray-500">
                    {post.tags && post.tags.length > 0 ? post.tags.join(', ') : '—'}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                      {post.commentCount || 0}
                    </span>
                  </td>
                  <td className="p-2.5 text-gray-500">
                    <div>{post.status === 'publish' ? 'Publié' : 'Dernière modification'}</div>
                    <div className="text-gray-700 font-medium">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                  Aucun article ne correspond à votre filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
