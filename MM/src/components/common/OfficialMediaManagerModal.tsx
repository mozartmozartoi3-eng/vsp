import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Check,
  X,
  Sparkles,
  Eye,
  RotateCcw,
  Sliders
} from 'lucide-react';

interface OfficialMediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialMediaManagerModal: React.FC<OfficialMediaManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [heroImg, setHeroImg] = useState<string>('');
  const [showroomImg, setShowroomImg] = useState<string>('');
  const [heroOpacity, setHeroOpacity] = useState<number>(30);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [uploadingHero, setUploadingHero] = useState<boolean>(false);
  const [uploadingShowroom, setUploadingShowroom] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const storedHero = localStorage.getItem('jean_auto_custom_hero_img') || '';
      const storedShowroom = localStorage.getItem('jean_auto_custom_showroom_img') || '';
      const storedOpacity = localStorage.getItem('jean_auto_hero_opacity');
      setHeroImg(storedHero);
      setShowroomImg(storedShowroom);
      if (storedOpacity) {
        setHeroOpacity(Number(storedOpacity));
      }
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'hero' | 'showroom'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'hero') setUploadingHero(true);
    else setUploadingShowroom(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (type === 'hero') {
        setHeroImg(base64);
        localStorage.setItem('jean_auto_custom_hero_img', base64);
        // Also persist on server
        try {
          await fetch('/api/upload-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: 'IMG-20260910-WA0001.jpg',
              base64Data: base64,
            }),
          });
        } catch (err) {
          console.warn('Server upload optional fallback:', err);
        }
        setUploadingHero(false);
      } else {
        setShowroomImg(base64);
        localStorage.setItem('jean_auto_custom_showroom_img', base64);
        // Also persist on server
        try {
          await fetch('/api/upload-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: 'IMG-20260910-WA0000.jpg',
              base64Data: base64,
            }),
          });
        } catch (err) {
          console.warn('Server upload optional fallback:', err);
        }
        setUploadingShowroom(false);
      }

      window.dispatchEvent(new Event('custom-media-updated'));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveOpacity = (val: number) => {
    setHeroOpacity(val);
    localStorage.setItem('jean_auto_hero_opacity', String(val));
    window.dispatchEvent(new Event('custom-media-updated'));
  };

  const handleReset = (type: 'hero' | 'showroom' | 'all') => {
    if (type === 'hero' || type === 'all') {
      localStorage.removeItem('jean_auto_custom_hero_img');
      setHeroImg('');
    }
    if (type === 'showroom' || type === 'all') {
      localStorage.removeItem('jean_auto_custom_showroom_img');
      setShowroomImg('');
    }
    window.dispatchEvent(new Event('custom-media-updated'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Intégration de vos 2 captures officielles
              </h2>
              <p className="text-xs text-slate-500">
                Téléversez directement vos 2 images WhatsApp sans passer par une conversion externe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Image enregistrée avec succès et appliquée instantanément sur votre site !</span>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* 1. Image 1 : Hero Background */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  Image 1 (Fond Section Héro)
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Votre visuel voiture noire & accents rouges (IMG-20260910-WA0001.jpg)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  S'affiche en fond subtil et non-opaque avec dégradé protecteur pour un contraste parfait du texte.
                </p>
              </div>
              {heroImg && (
                <button
                  onClick={() => handleReset('hero')}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            {heroImg ? (
              <div className="relative rounded-lg overflow-hidden h-32 bg-slate-900 border border-slate-300">
                <img
                  src={heroImg}
                  alt="Aperçu fond Héro"
                  className="w-full h-full object-cover object-center"
                  style={{ opacity: heroOpacity / 100 }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent flex items-center px-4">
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    Aperçu rendu direct avec contraste (opacité : {heroOpacity}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                <Upload className="w-6 h-6 mb-1 text-slate-400" />
                <span className="text-xs font-medium">Glissez votre fichier IMG-20260910-WA0001.jpg ici</span>
              </div>
            )}

            {/* Opacity slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Opacité du fond (fond non opaque & lisible)
                </span>
                <span className="font-bold text-slate-900">{heroOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={heroOpacity}
                onChange={(e) => handleSaveOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingHero ? 'Téléversement...' : 'Sélectionner l\'image 1 (WA0001)'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'hero')}
              />
            </label>
          </div>

          {/* 2. Image 2 : Showroom Concession */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  Image 2 (Section Showroom Concession)
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Votre photo du stand showroom Aixam (IMG-20260910-WA0000.jpg)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Intégrée élégamment dans le showroom officiel de la concession avec les horaires et badges de confiance.
                </p>
              </div>
              {showroomImg && (
                <button
                  onClick={() => handleReset('showroom')}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            {showroomImg ? (
              <div className="relative rounded-lg overflow-hidden h-32 bg-slate-900 border border-slate-300">
                <img
                  src={showroomImg}
                  alt="Aperçu Showroom"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-semibold">
                  Photo active dans le showroom officiel
                </div>
              </div>
            ) : (
              <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                <Upload className="w-6 h-6 mb-1 text-slate-400" />
                <span className="text-xs font-medium">Glissez votre fichier IMG-20260910-WA0000.jpg ici</span>
              </div>
            )}

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingShowroom ? 'Téléversement...' : 'Sélectionner l\'image 2 (WA0000)'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'showroom')}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Les images sont sauvegardées et appliquées automatiquement.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
