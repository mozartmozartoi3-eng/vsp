import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { VehicleBrand } from '../../../types/wordpress';
import { WordPressFirebaseService } from '../../../services/wordpressService';

interface WpBrandsProps {
  brands: VehicleBrand[];
}

export const WpBrands: React.FC<WpBrandsProps> = ({ brands }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await WordPressFirebaseService.saveBrand({
        id: editingId || undefined,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        logoUrl: logoUrl.trim(),
      });
      setName('');
      setSlug('');
      setDescription('');
      setLogoUrl('');
      setEditingId(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: VehicleBrand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setSlug(brand.slug);
    setDescription(brand.description || '');
    setLogoUrl(brand.logoUrl || '');
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (confirm(`Supprimer la marque "${brandName}" ?`)) {
      try {
        await WordPressFirebaseService.deleteBrand(id);
      } catch (err: any) {
        alert(`Erreur : ${err.message}`);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-[#2271b1]" />
          Marques de Voitures Sans Permis
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Gérez les constructeurs VSP présentés sur le site (Aixam, Ligier, Microcar, Chatenet, Bellier, etc.).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Add / Edit */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">
            {editingId ? 'Modifier la marque' : 'Ajouter une nouvelle marque'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nom de la marque *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Aixam, Ligier, Bellier..."
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Identifiant (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="aixam"
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Historique ou spécialité de la marque..."
                className="w-full text-sm border border-gray-300 rounded p-2"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter la marque'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setName(''); setSlug(''); setDescription(''); }}
                  className="px-3 py-2 border border-gray-300 text-gray-600 rounded"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Brands List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#f6f7f7] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase">
                <th className="py-3 px-4">Marque</th>
                <th className="py-3 px-4">Identifiant (Slug)</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">{b.name}</td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-500">{b.slug}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">
                    {b.description || '—'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
