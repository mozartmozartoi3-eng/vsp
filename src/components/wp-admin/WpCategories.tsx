import React, { useState } from 'react';
import { Plus, Trash2, Folder, Check } from 'lucide-react';
import { WPCategory, WPPost } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpCategoriesProps {
  categories: WPCategory[];
  posts: WPPost[];
}

export const WpCategories: React.FC<WpCategoriesProps> = ({ categories, posts }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await WordPressFirebaseService.saveCategory({
        name,
        slug: slug || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
        description,
        count: 0,
      });
      setName('');
      setSlug('');
      setDescription('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (catName === 'Non classé') {
      alert('La catégorie « Non classé » est la catégorie par défaut et ne peut pas être supprimée.');
      return;
    }
    if (confirm(`Supprimer la catégorie « ${catName} » ?`)) {
      try {
        await WordPressFirebaseService.deleteCategory(id);
      } catch (err: any) {
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      <div className="pb-3 border-b border-gray-300">
        <h1 className="text-2xl font-normal text-[#1d2327]">Catégories</h1>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Catégorie ajoutée avec succès dans Firebase !</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Add Form */}
        <div className="space-y-4">
          <h2 className="font-bold text-sm text-[#1d2327]">Ajouter une nouvelle catégorie</h2>
          <form onSubmit={handleAddCategory} className="bg-white p-4 border border-[#c3c4c7] rounded shadow-2xs space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Le nom tel qu’il apparaîtra sur votre site"
                required
                className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Identifiant (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="version-normalisee-du-nom"
                className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="La description n’est pas visible par défaut..."
                className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold rounded disabled:opacity-50 transition-colors"
            >
              {saving ? 'Ajout en cours...' : 'Ajouter une nouvelle catégorie'}
            </button>
          </form>
        </div>

        {/* Right Col: Categories Table */}
        <div className="md:col-span-2">
          <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Identifiant</th>
                  <th className="p-3 text-right">Nombre d’articles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => {
                  const postCount = posts.filter((p) => p.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#f6f7f7] group">
                      <td className="p-3 font-medium">
                        <div className="font-bold text-[#2271b1] text-sm">{cat.name}</div>
                        {cat.name !== 'Non classé' && (
                          <div className="text-[11px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="text-red-600 hover:underline"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">{cat.description || '—'}</td>
                      <td className="p-3 text-gray-500 font-mono">{cat.slug}</td>
                      <td className="p-3 text-right font-bold text-gray-800">{postCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
