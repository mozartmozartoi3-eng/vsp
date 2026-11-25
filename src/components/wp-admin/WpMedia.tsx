import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Upload,
  Grid,
  List,
  Trash2,
  ExternalLink,
  Check,
  Search,
  X
} from 'lucide-react';
import { WPMedia } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpMediaProps {
  media: WPMedia[];
  isAddingNew: boolean;
  onCloseAddNew: () => void;
}

export const WpMedia: React.FC<WpMediaProps> = ({
  media,
  isAddingNew,
  onCloseAddNew,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<WPMedia | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(isAddingNew);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (isAddingNew) {
      setShowUploadModal(true);
    }
  }, [isAddingNew]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !imageTitle.trim()) return;

    setUploading(true);
    try {
      await WordPressFirebaseService.addMedia({
        title: imageTitle,
        url: imageUrl,
        fileName: `${imageTitle.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        fileType: 'image/jpeg',
        sizeFormatted: '240 Ko',
        dimensions: '1920 × 1080',
        uploadedAt: new Date().toISOString(),
        altText: imageAlt,
      });
      setImageUrl('');
      setImageTitle('');
      setImageAlt('');
      setShowUploadModal(false);
      onCloseAddNew();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer définitivement ce fichier média de Firebase ?')) {
      try {
        await WordPressFirebaseService.deleteMedia(id);
        setSelectedMedia(null);
      } catch (e: any) {
        alert(`Erreur: ${e.message}`);
      }
    }
  };

  const filteredMedia = media.filter((m) =>
    searchTerm ? m.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Médiathèque</h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-2.5 py-1 border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded text-xs font-semibold"
          >
            Ajouter un fichier
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500'}`}
              title="Vue en grille"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500'}`}
              title="Vue en liste"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des médias..."
              className="pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[#2271b1] w-48"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group aspect-square bg-gray-100 border border-gray-300 rounded overflow-hidden cursor-pointer relative hover:border-[#2271b1] shadow-2xs transition-all"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-1 text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {item.title}
              </div>
            </div>
          ))}

          {filteredMedia.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 italic bg-white border border-gray-200 rounded">
              Aucun fichier média trouvé. Cliquez sur « Ajouter un fichier » pour importer des images.
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
                <th className="p-2.5 w-16">Fichier</th>
                <th className="p-2.5">Titre</th>
                <th className="p-2.5">Auteur</th>
                <th className="p-2.5">Taille</th>
                <th className="p-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedia.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="hover:bg-[#f6f7f7] cursor-pointer"
                >
                  <td className="p-2.5">
                    <img src={item.url} alt="" className="w-12 h-12 object-cover rounded border border-gray-200" />
                  </td>
                  <td className="p-2.5 font-bold text-[#2271b1]">{item.title}</td>
                  <td className="p-2.5 text-gray-600">admin</td>
                  <td className="p-2.5 text-gray-500">{item.sizeFormatted}</td>
                  <td className="p-2.5 text-gray-500">
                    {new Date(item.uploadedAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-5 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">Téléverser un nouveau média</h3>
              <button
                onClick={() => { setShowUploadModal(false); onCloseAddNew(); }}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4 py-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Choisir un fichier image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#2271b1] file:text-white hover:file:bg-[#135e96] cursor-pointer"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-gray-400 text-[11px]">OU via URL</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">URL de l'image</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Titre de l'image</label>
                <input
                  type="text"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  placeholder="Ex: Bannière de présentation"
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Texte alternatif (Alt)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description pour l'accessibilité"
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
                />
              </div>

              {imageUrl && (
                <div className="mt-2">
                  <div className="text-[11px] text-gray-500 mb-1">Aperçu :</div>
                  <img
                    src={imageUrl}
                    alt="Aperçu"
                    className="w-full h-32 object-cover rounded border border-gray-200"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); onCloseAddNew(); }}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !imageUrl || !imageTitle}
                  className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-bold disabled:opacity-50"
                >
                  {uploading ? 'Enregistrement...' : 'Ajouter à la médiathèque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-5 border border-gray-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">Détails du fichier média</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto">
              <div>
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="w-full h-64 object-contain bg-gray-900 rounded"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-500">Nom du fichier :</span>
                  <div className="font-semibold text-gray-800">{selectedMedia.fileName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Titre :</span>
                  <div className="font-semibold text-gray-800">{selectedMedia.title}</div>
                </div>
                <div>
                  <span className="text-gray-500">Dimensions :</span>
                  <div className="font-semibold text-gray-800">{selectedMedia.dimensions || '1920 × 1080'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Téléversé le :</span>
                  <div className="font-semibold text-gray-800">
                    {new Date(selectedMedia.uploadedAt).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">URL du fichier :</span>
                  <input
                    type="text"
                    readOnly
                    value={selectedMedia.url}
                    className="w-full p-1.5 bg-gray-100 border border-gray-300 rounded font-mono text-[11px] text-gray-700 select-all"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteMedia(selectedMedia.id)}
                    className="text-red-600 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer définitivement</span>
                  </button>

                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="px-4 py-1.5 bg-[#2271b1] text-white rounded font-bold hover:bg-[#135e96]"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
