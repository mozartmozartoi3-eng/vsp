import React, { useState } from 'react';
import {
  Plus,
  Search,
  Layers,
  ArrowLeft,
  Check,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { WPPage, PageStatus } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpPagesProps {
  pages: WPPage[];
  editingPageId: string | null;
  isCreating: boolean;
  onEditPage: (id: string) => void;
  onCancelEdit: () => void;
  onViewPageInFront: (slug: string) => void;
}

export const WpPages: React.FC<WpPagesProps> = ({
  pages,
  editingPageId,
  isCreating,
  onEditPage,
  onCancelEdit,
  onViewPageInFront,
}) => {
  const pageToEdit = pages.find((p) => p.id === editingPageId);

  const [title, setTitle] = useState(pageToEdit?.title || '');
  const [content, setContent] = useState(pageToEdit?.content || '');
  const [status, setStatus] = useState<PageStatus>(pageToEdit?.status || 'publish');
  const [template, setTemplate] = useState(pageToEdit?.template || 'Par défaut');
  const [order, setOrder] = useState<number>(pageToEdit?.order || 0);
  const [parent, setParent] = useState<string>(pageToEdit?.parent || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isCreating) {
      setTitle('');
      setContent('');
      setStatus('publish');
      setTemplate('Par défaut');
      setOrder(0);
      setParent('');
      setMessage(null);
    } else if (pageToEdit) {
      setTitle(pageToEdit.title);
      setContent(pageToEdit.content);
      setStatus(pageToEdit.status);
      setTemplate(pageToEdit.template || 'Par défaut');
      setOrder(pageToEdit.order || 0);
      setParent(pageToEdit.parent || '');
      setMessage(null);
    }
  }, [editingPageId, isCreating]);

  const handleSavePage = async (forcedStatus?: PageStatus) => {
    if (!title.trim()) {
      setMessage('Veuillez saisir un titre pour la page.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await WordPressFirebaseService.savePage({
        id: editingPageId || undefined,
        title,
        content,
        status: forcedStatus || status,
        template,
        order,
        parent,
        author: 'admin',
      });
      setMessage('Page enregistrée avec succès dans Firebase !');
      setTimeout(() => {
        setMessage(null);
        onCancelEdit();
      }, 1000);
    } catch (e: any) {
      setMessage(`Erreur: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isCreating || editingPageId) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-300">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancelEdit}
              className="flex items-center space-x-1 text-[#2271b1] hover:underline font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Pages</span>
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-normal text-[#1d2327]">
              {isCreating ? 'Ajouter une page' : `Modifier la page : ${title || 'Sans titre'}`}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSavePage('draft')}
              disabled={saving}
              className="px-3 py-1.5 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-blue-50 rounded font-medium"
            >
              Enregistrer brouillon
            </button>
            <button
              onClick={() => handleSavePage('publish')}
              disabled={saving}
              className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-bold"
            >
              {saving ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Saisissez le titre de la page"
              className="w-full text-2xl font-semibold px-4 py-3 bg-white border border-[#c3c4c7] rounded shadow-2xs focus:border-[#2271b1] outline-none text-[#1d2327]"
            />

            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-4">
              <label className="block text-gray-700 font-semibold mb-2">Contenu de la page</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Rédigez le contenu de votre page..."
                className="w-full p-3 font-mono text-sm border border-gray-200 rounded outline-none focus:border-[#2271b1]"
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs">
              <div className="px-4 py-2.5 bg-[#f0f0f1] border-b border-[#c3c4c7] font-semibold text-gray-800">
                Attributs de page
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-gray-600 mb-1">Modèle</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="Par défaut">Modèle par défaut</option>
                    <option value="Pleine largeur">Pleine largeur</option>
                    <option value="Page d'accueil">Page d'accueil</option>
                    <option value="Contact">Page de contact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Pages</h1>
          <button
            onClick={() => onEditPage('new')}
            className="px-2.5 py-1 border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded text-xs font-semibold"
          >
            Ajouter une page
          </button>
        </div>
        <div className="text-gray-500">{pages.length} page(s)</div>
      </div>

      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
              <th className="p-3">Titre</th>
              <th className="p-3">Auteur</th>
              <th className="p-3">Modèle</th>
              <th className="p-3">Ordre</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-[#f6f7f7] group">
                <td className="p-3 font-medium">
                  <button
                    onClick={() => onEditPage(page.id)}
                    className="text-[#2271b1] hover:underline font-bold text-sm text-left block"
                  >
                    {page.title}
                  </button>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => onEditPage(page.id)} className="text-[#2271b1] hover:underline">
                      Modifier
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => WordPressFirebaseService.trashPage(page.id)}
                      className="text-red-600 hover:underline"
                    >
                      Corbeille
                    </button>
                    <span>|</span>
                    <button onClick={() => onViewPageInFront(page.slug)} className="text-[#2271b1] hover:underline">
                      Afficher
                    </button>
                  </div>
                </td>
                <td className="p-3 text-gray-600">{page.author}</td>
                <td className="p-3 text-gray-600">{page.template || 'Par défaut'}</td>
                <td className="p-3 text-gray-600">{page.order}</td>
                <td className="p-3 text-gray-500">
                  {new Date(page.createdAt).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
