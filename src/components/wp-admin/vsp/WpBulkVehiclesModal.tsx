import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Car,
  Upload,
  Check,
  Loader2,
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { VehicleBrand, VehicleEnergy, VehicleCondition } from '../../../types/wordpress';
import { WordPressFirebaseService } from '../../../services/wordpressService';
import { compressImageFile } from '../../../utils/vehicleColors';

const MAX_IMAGES_PER_VEHICLE = 5;

export interface BulkVehicleSlot {
  id: string;
  enabled: boolean;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  energy: VehicleEnergy;
  condition: VehicleCondition;
  color: string;
  images: string[];
  warrantyMonths: number;
}

export const INITIAL_6_VSP_PRESETS: BulkVehicleSlot[] = [
  {
    id: 'bulk-preset-1',
    enabled: true,
    brand: 'Aixam',
    model: 'City Pack',
    price: 8990,
    year: 2024,
    mileage: 8500,
    energy: 'Diesel',
    condition: 'Occasion',
    color: 'Gris Titane Métallisé',
    images: [],
    warrantyMonths: 12,
  },
  {
    id: 'bulk-preset-2',
    enabled: true,
    brand: 'Ligier',
    model: 'JS50 Sport',
    price: 9990,
    year: 2024,
    mileage: 5000,
    energy: 'Diesel',
    condition: 'Occasion',
    color: 'Blanc Nacré',
    images: [],
    warrantyMonths: 12,
  },
  {
    id: 'bulk-preset-3',
    enabled: true,
    brand: 'Microcar',
    model: 'Due Initial',
    price: 7990,
    year: 2023,
    mileage: 14000,
    energy: 'Diesel',
    condition: 'Occasion',
    color: 'Rouge',
    images: [],
    warrantyMonths: 12,
  },
  {
    id: 'bulk-preset-4',
    enabled: true,
    brand: 'Chatenet',
    model: 'CH40',
    price: 11200,
    year: 2024,
    mileage: 3800,
    energy: 'Diesel',
    condition: 'Occasion',
    color: 'Noir',
    images: [],
    warrantyMonths: 12,
  },
  {
    id: 'bulk-preset-5',
    enabled: true,
    brand: 'Citroën',
    model: 'Ami',
    price: 6900,
    year: 2024,
    mileage: 4100,
    energy: 'Électrique',
    condition: 'Occasion',
    color: 'Bleu',
    images: [],
    warrantyMonths: 12,
  },
  {
    id: 'bulk-preset-6',
    enabled: true,
    brand: 'Bellier',
    model: 'B8',
    price: 8400,
    year: 2023,
    mileage: 11500,
    energy: 'Diesel',
    condition: 'Occasion',
    color: 'Bleu',
    images: [],
    warrantyMonths: 12,
  },
];

const createBlankSlot = (index: number, defaultBrand: string): BulkVehicleSlot => ({
  id: `bulk-slot-${Date.now()}-${index}`,
  enabled: true,
  brand: defaultBrand || 'Aixam',
  model: '',
  price: 8990,
  year: new Date().getFullYear(),
  mileage: 10000,
  energy: 'Diesel',
  condition: 'Occasion',
  color: 'Gris Titane Métallisé',
  images: [],
  warrantyMonths: 12,
});

interface WpBulkVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: VehicleBrand[];
  isFirebaseAdmin?: boolean;
  onSaved: (count: number) => void;
}

export const WpBulkVehiclesModal: React.FC<WpBulkVehiclesModalProps> = ({
  isOpen,
  onClose,
  brands,
  isFirebaseAdmin = false,
  onSaved,
}) => {
  const defaultBrand = brands[0]?.name || 'Aixam';
  const [slots, setSlots] = useState<BulkVehicleSlot[]>(() => [
    createBlankSlot(1, defaultBrand),
    createBlankSlot(2, defaultBrand),
  ]);
  const [saving, setSaving] = useState(false);
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const slotCounterRef = useRef(3);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setFormError(null);
      setProgress(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  const isSlotStarted = (s: BulkVehicleSlot) =>
    s.model.trim().length > 0 || s.images.length > 0;

  const readyToSaveSlots = slots.filter(
    (s) => s.enabled && (isSlotStarted(s) || slots.length === 1)
  );
  const enabledCount = slots.filter((s) => s.enabled).length;

  const handleToggleSlot = (id: string) => {
    setFormError(null);
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleUpdateSlot = <K extends keyof BulkVehicleSlot>(
    id: string,
    field: K,
    value: BulkVehicleSlot[K]
  ) => {
    setFormError(null);
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleAddSlot = () => {
    setFormError(null);
    const nextNum = slotCounterRef.current++;
    setSlots((prev) => [...prev, createBlankSlot(nextNum, defaultBrand)]);
  };

  const handleRemoveSlot = (id: string) => {
    setFormError(null);
    setSlots((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  };

  const handleSelectAll = (select: boolean) => {
    setFormError(null);
    setSlots((prev) => prev.map((s) => ({ ...s, enabled: select })));
  };

  const handleLoadPresets = () => {
    setFormError(null);
    setSlots(
      INITIAL_6_VSP_PRESETS.map((p, idx) => ({
        ...p,
        id: `bulk-preset-${Date.now()}-${idx + 1}`,
        images: [],
      }))
    );
  };

  const handleClearForm = () => {
    setFormError(null);
    const a = slotCounterRef.current++;
    const b = slotCounterRef.current++;
    setSlots([
      createBlankSlot(a, defaultBrand),
      createBlankSlot(b, defaultBrand),
    ]);
  };

  const compressAndUploadFile = async (file: File): Promise<string> => {
    try {
      const compressedDataUrl = await compressImageFile(file, 950, 0.78);
      return await WordPressFirebaseService.uploadVehicleImage(compressedDataUrl, file.name);
    } catch {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          if (typeof reader.result === 'string') {
            try {
              const uploadedUrl = await WordPressFirebaseService.uploadVehicleImage(
                reader.result,
                file.name
              );
              resolve(uploadedUrl);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error('Fichier image illisible'));
          }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsDataURL(file);
      });
    }
  };

  // Upload multiple photos (up to 5 total per vehicle) OR fill a specific slot index
  const handleImagesChange = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
    targetImageIndex?: number
  ) => {
    const fileList: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (fileList.length === 0) return;

    const currentSlot = slots.find((s) => s.id === id);
    if (!currentSlot) return;

    setFormError(null);
    setUploadingSlotId(id);

    try {
      const existing = [...currentSlot.images];
      const maxToProcess =
        typeof targetImageIndex === 'number'
          ? 1
          : Math.max(0, MAX_IMAGES_PER_VEHICLE - existing.length);

      if (typeof targetImageIndex !== 'number' && maxToProcess === 0) {
        setFormError(
          `Maximum ${MAX_IMAGES_PER_VEHICLE} photos atteint pour ce véhicule. Supprimez-en une pour la remplacer.`
        );
        return;
      }

      const filesToUpload = fileList.slice(0, typeof targetImageIndex === 'number' ? 1 : maxToProcess);
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const url = await compressAndUploadFile(file);
        uploadedUrls.push(url);
      }

      setSlots((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          if (typeof targetImageIndex === 'number') {
            const nextImages = [...s.images];
            if (targetImageIndex < nextImages.length) {
              nextImages[targetImageIndex] = uploadedUrls[0];
            } else {
              nextImages.push(uploadedUrls[0]);
            }
            return { ...s, images: nextImages.slice(0, MAX_IMAGES_PER_VEHICLE) };
          }
          return {
            ...s,
            images: [...s.images, ...uploadedUrls].slice(0, MAX_IMAGES_PER_VEHICLE),
          };
        })
      );
    } catch (err: any) {
      setFormError(
        `Erreur lors du traitement des photos : ${err?.message || 'Format non pris en charge'}`
      );
    } finally {
      setUploadingSlotId(null);
    }
  };

  const handleRemoveImage = (slotId: string, imgIndex: number) => {
    setFormError(null);
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, images: s.images.filter((_, idx) => idx !== imgIndex) }
          : s
      )
    );
  };

  const handleSaveAll = async () => {
    setFormError(null);
    const enabledSlots = slots.filter((s) => s.enabled);
    if (enabledSlots.length === 0) {
      setFormError('Veuillez cocher au moins 1 véhicule à enregistrer.');
      return;
    }

    // Automatically skip completely untouched blank cards if at least 1 card has data
    const startedSlots = enabledSlots.filter(isSlotStarted);
    const slotsToProcess = startedSlots.length > 0 ? startedSlots : enabledSlots;

    for (const s of slotsToProcess) {
      if (!s.brand.trim() || !s.model.trim() || !s.price || Number(s.price) <= 0) {
        setFormError(
          `Veuillez vérifier le véhicule "${s.brand || 'Sans marque'} ${
            s.model || 'Sans modèle'
          }" : la marque, le modèle et un prix valide sont obligatoires.`
        );
        return;
      }

      if (s.images.length === 0) {
        setFormError(
          `Veuillez ajouter au moins 1 photo (jusqu'à 5 images) pour le véhicule "${s.brand} ${s.model}".`
        );
        return;
      }
    }

    setSaving(true);
    let savedCount = 0;

    try {
      for (let i = 0; i < slotsToProcess.length; i++) {
        const slot = slotsToProcess[i];
        setProgress({ current: i + 1, total: slotsToProcess.length });

        const finalGallery = slot.images.slice(0, MAX_IMAGES_PER_VEHICLE);
        const finalMainImage = finalGallery[0];

        await WordPressFirebaseService.saveVehicle({
          brand: slot.brand.trim(),
          model: slot.model.trim(),
          price: Number(slot.price),
          year: Number(slot.year) || new Date().getFullYear(),
          mileage: Number(slot.mileage) || 0,
          energy: slot.energy,
          condition: slot.condition,
          gearbox: 'Automatique (variateur)',
          power: '1 ch fiscal / 6 kW',
          color: slot.color,
          availability: 'available',
          status: 'publish',
          mainImage: finalMainImage,
          gallery: finalGallery,
          features: [
            'Écran multimédia tactile Bluetooth',
            'Caméra de recul',
            'Vitres électriques',
            'Jantes alu',
          ],
          description: `Véhicule ${slot.brand} ${slot.model} (${slot.year}, ${slot.mileage} km) révisé avec carnet d'entretien complet. Disponible immédiatement chez Jean Auto VSP à Aix-les-Bains.`,
          warrantyMonths: Number(slot.warrantyMonths || 12),
        });

        savedCount++;
      }

      handleClearForm();
      onSaved(savedCount);
      onClose();
    } catch (err: any) {
      setFormError(`Erreur lors de l'enregistrement groupé : ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col border border-gray-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Ajout groupé illimité de véhicules
                </h2>
                <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  5 images par véhicule · Sans limite
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ajoutez 1, 2, 5, 10 voitures ou plus avec jusqu'à 5 photos chacune. Les fiches laissées vides sont ignorées automatiquement.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une voiture</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tout cocher ({slots.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Square className="w-3.5 h-3.5 text-gray-400" />
              <span>Tout décocher</span>
            </button>
            <button
              type="button"
              onClick={handleLoadPresets}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Pré-remplir 6 modèles types (Aixam, Ligier, Microcar, Chatenet, Citroën, Bellier)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Modèles types (x6)</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-700">
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mr-1 font-black">
              {readyToSaveSlots.length} prête{readyToSaveSlots.length > 1 ? 's' : ''} / {enabledCount} active{enabledCount > 1 ? 's' : ''}
            </span>
            <span>(Sans limite)</span>
          </div>
        </div>

        {/* Inline Error Banner */}
        {formError && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-center justify-between gap-2 text-xs font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-500 hover:text-red-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Unlimited Grid of Vehicle Slots */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100/60">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot, index) => {
              const isEnabled = slot.enabled;
              const isUploadingThis = uploadingSlotId === slot.id;
              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl border transition-all shadow-xs flex flex-col bg-white overflow-hidden ${
                    isEnabled
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 opacity-60 bg-gray-50'
                  }`}
                >
                  {/* Slot Top Banner */}
                  <div
                    className={`px-3.5 py-2 flex items-center justify-between border-b ${
                      isEnabled
                        ? 'bg-emerald-50/80 border-emerald-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleSlot(slot.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-900">
                        Véhicule #{index + 1}
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {slot.images.length}/{MAX_IMAGES_PER_VEHICLE} photos
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {isEnabled ? 'Inclus' : 'Ignoré'}
                      </span>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.id)}
                          title="Retirer cette fiche"
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot Body */}
                  <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    {/* 5-Photo Multi-Upload Section */}
                    <div className="space-y-2">
                      {/* Multi-select button / dropzone */}
                      <label
                        htmlFor={`bulk-multi-input-${slot.id}`}
                        className={`relative rounded-xl border-2 border-dashed p-2.5 flex items-center justify-center gap-2 transition-all select-none ${
                          isEnabled
                            ? 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 cursor-pointer'
                            : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        <input
                          id={`bulk-multi-input-${slot.id}`}
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={!isEnabled || isUploadingThis}
                          onChange={(e) => handleImagesChange(slot.id, e)}
                          className="sr-only"
                        />
                        {isUploadingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            <span className="text-[11px] font-bold text-emerald-800">
                              Compression des photos...
                            </span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-800">
                              Importer jusqu'à 5 photos ({slot.images.length}/{MAX_IMAGES_PER_VEHICLE})
                            </span>
                          </>
                        )}
                      </label>

                      {/* 5 Individual Numbered Slots (1..5) */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {Array.from({ length: MAX_IMAGES_PER_VEHICLE }).map((_, imgIdx) => {
                          const imgUrl = slot.images[imgIdx];
                          return (
                            <div
                              key={imgIdx}
                              className={`relative aspect-square rounded-lg border overflow-hidden flex items-center justify-center ${
                                imgUrl
                                  ? 'border-emerald-400 bg-slate-100'
                                  : 'border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400'
                              }`}
                            >
                              {imgUrl ? (
                                <>
                                  <img
                                    src={imgUrl}
                                    alt={`Photo ${imgIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute top-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-black px-1 rounded">
                                    {imgIdx === 0 ? '1★' : imgIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={!isEnabled}
                                    onClick={() => handleRemoveImage(slot.id, imgIdx)}
                                    title="Supprimer cette photo"
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs hover:bg-red-700 cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </>
                              ) : (
                                <label
                                  className={`w-full h-full flex flex-col items-center justify-center text-center p-0.5 ${
                                    isEnabled ? 'cursor-pointer' : 'cursor-not-allowed'
                                  }`}
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={!isEnabled || isUploadingThis}
                                    onChange={(e) => handleImagesChange(slot.id, e, imgIdx)}
                                    className="sr-only"
                                  />
                                  <Upload className="w-3 h-3 text-emerald-600" />
                                  <span className="text-[8px] font-bold text-gray-500 mt-0.5">
                                    #{imgIdx + 1}
                                  </span>
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Visible native file input fallback for mobile / iframe multi-select */}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={!isEnabled || isUploadingThis}
                        onChange={(e) => handleImagesChange(slot.id, e)}
                        className="w-full text-[10.5px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-emerald-600 file:text-white cursor-pointer"
                      />
                    </div>

                    {/* Marque & Prix */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                          Marque *
                        </label>
                        <select
                          value={slot.brand}
                          disabled={!isEnabled}
                          onChange={(e) => handleUpdateSlot(slot.id, 'brand', e.target.value)}
                          className="w-full text-xs font-semibold border border-gray-300 rounded-lg p-1.5 bg-white disabled:bg-gray-100"
                        >
                          {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                          {slot.brand && !brands.some((b) => b.name === slot.brand) && (
                            <option value={slot.brand}>{slot.brand}</option>
                          )}
                          <option value="Autre">Autre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                          Prix TTC (€) *
                        </label>
                        <input
                          type="number"
                          value={slot.price}
                          disabled={!isEnabled}
                          onChange={(e) =>
                            handleUpdateSlot(slot.id, 'price', Number(e.target.value))
                          }
                          className="w-full text-xs font-bold text-slate-900 border border-gray-300 rounded-lg p-1.5 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Modèle & Finition */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                        Modèle et finition *
                      </label>
                      <input
                        type="text"
                        value={slot.model}
                        disabled={!isEnabled}
                        placeholder="ex: City Pack Sensation"
                        onChange={(e) => handleUpdateSlot(slot.id, 'model', e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded-lg p-1.5 disabled:bg-gray-100 font-medium"
                      />
                    </div>

                    {/* Année & Kilométrage */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-gray-700 mb-0.5">
                          Année
                        </label>
                        <input
                          type="number"
                          value={slot.year}
                          disabled={!isEnabled}
                          onChange={(e) =>
                            handleUpdateSlot(slot.id, 'year', Number(e.target.value))
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg p-1.5 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-gray-700 mb-0.5">
                          Kilométrage (km)
                        </label>
                        <input
                          type="number"
                          value={slot.mileage}
                          disabled={!isEnabled}
                          onChange={(e) =>
                            handleUpdateSlot(slot.id, 'mileage', Number(e.target.value))
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg p-1.5 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Énergie & Couleur */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-gray-700 mb-0.5">
                          Énergie
                        </label>
                        <select
                          value={slot.energy}
                          disabled={!isEnabled}
                          onChange={(e) =>
                            handleUpdateSlot(
                              slot.id,
                              'energy',
                              e.target.value as VehicleEnergy
                            )
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg p-1.5 bg-white disabled:bg-gray-100"
                        >
                          <option value="Diesel">Diesel</option>
                          <option value="Électrique">Électrique</option>
                          <option value="Essence">Essence</option>
                          <option value="Hybride">Hybride</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-gray-700 mb-0.5">
                          Couleur
                        </label>
                        <input
                          type="text"
                          value={slot.color}
                          disabled={!isEnabled}
                          placeholder="ex: Blanc Nacré"
                          onChange={(e) => handleUpdateSlot(slot.id, 'color', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg p-1.5 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* État & Garantie */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-gray-700 mb-0.5">
                          État
                        </label>
                        <select
                          value={slot.condition}
                          disabled={!isEnabled}
                          onChange={(e) =>
                            handleUpdateSlot(
                              slot.id,
                              'condition',
                              e.target.value as VehicleCondition
                            )
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg p-1.5 bg-white disabled:bg-gray-100"
                        >
                          <option value="Occasion">Occasion</option>
                          <option value="Neuf">Neuf</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-gray-700 mb-0.5">
                          Garantie (mois)
                        </label>
                        <input
                          type="number"
                          value={slot.warrantyMonths}
                          disabled={!isEnabled}
                          onChange={(e) =>
                            handleUpdateSlot(slot.id, 'warrantyMonths', Number(e.target.value))
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg p-1.5 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Unlimited add extra slot card */}
            <button
              type="button"
              onClick={handleAddSlot}
              className="rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 min-h-[220px] flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-emerald-950">
                + Ajouter une voiture supplémentaire
              </span>
              <span className="text-xs text-emerald-700 mt-1">
                Ajoutez autant de fiches que nécessaire (5 photos chacune)
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {progress ? (
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>
                  Enregistrement du véhicule {progress.current} sur {progress.total}...
                </span>
              </div>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 shrink-0 ${isFirebaseAdmin ? 'text-emerald-600' : 'text-amber-500'}`} />
                <span>
                  <strong>{readyToSaveSlots.length} véhicule{readyToSaveSlots.length > 1 ? 's' : ''}</strong> prêt{readyToSaveSlots.length > 1 ? 's' : ''} —{' '}
                  {isFirebaseAdmin
                    ? 'enregistrement direct et permanent dans Cloud Firestore.'
                    : 'enregistrement immédiat + file d’attente Cloud Firestore.'}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={saving || Boolean(uploadingSlotId) || enabledCount === 0}
              onClick={handleSaveAll}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistrer ({readyToSaveSlots.length}) en 1 clic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
