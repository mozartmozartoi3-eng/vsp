import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Car,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Palette,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  Share2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  FileJson,
  ShieldCheck,
  Cloud,
  RefreshCw
} from 'lucide-react';
import {
  Vehicle,
  VehicleBrand,
  VehicleAvailability,
  VehicleEnergy,
  VehicleCondition,
} from '../../../types/wordpress';
import { auth, FirebaseConnectionStatus, isAuthorizedAdminUser } from '../../../firebase';
import { WordPressFirebaseService } from '../../../services/wordpressService';
import { VSP_COLOR_PRESETS, VehicleColorPreset, compressImageFile } from '../../../utils/vehicleColors';
import { WpBulkVehiclesModal, INITIAL_6_VSP_PRESETS } from './WpBulkVehiclesModal';
import { VehicleShareModal } from './VehicleShareModal';

interface WpVehiclesProps {
  vehicles: Vehicle[];
  brands: VehicleBrand[];
  connectionStatus?: FirebaseConnectionStatus;
  isFirebaseAdmin?: boolean;
  onViewInFront?: (slug: string) => void;
  isCreating?: boolean;
  onCloseCreate?: () => void;
  onVehiclesUpdated?: (newVehicles: Vehicle[]) => void;
  onViewSpotlight?: (vehicleId: string) => void;
}

export const WpVehicles: React.FC<WpVehiclesProps> = ({
  vehicles,
  brands,
  connectionStatus,
  isFirebaseAdmin = false,
  onViewInFront,
  isCreating: isCreatingProp,
  onCloseCreate,
  onVehiclesUpdated,
  onViewSpotlight,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [loadingStarterCatalog, setLoadingStarterCatalog] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [sharingVehicle, setSharingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [clearAllConfirmText, setClearAllConfirmText] = useState('');
  const [pendingSyncIds, setPendingSyncIds] = useState<Set<string>>(() =>
    WordPressFirebaseService.getPendingCloudSyncIds()
  );
  const [syncingCloud, setSyncingCloud] = useState(false);

  // Image Uploading States (single unified gallery + main image)
  const [isCompressingGallery, setIsCompressingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<{ current: number; total: number; filename: string } | null>(null);

  // Color selection category filter
  const [colorCategory, setColorCategory] = useState<string>('all');

  // File input refs & modal scroll ref
  const galleryImagesInputRef = useRef<HTMLInputElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const prevIsCreatingPropRef = useRef(false);

  // Form State
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formPrice, setFormPrice] = useState(8000);
  const [formYear, setFormYear] = useState(2023);
  const [formMileage, setFormMileage] = useState(15000);
  const [formEnergy, setFormEnergy] = useState<VehicleEnergy>('Diesel');
  const [formCondition, setFormCondition] = useState<VehicleCondition>('Occasion');
  const [formGearbox, setFormGearbox] = useState('Automatique (variateur)');
  const [formPower, setFormPower] = useState('1 ch fiscal / 6 kW');
  const [formColor, setFormColor] = useState('Gris Titane Métallisé');
  const [formCustomColorHex, setFormCustomColorHex] = useState('#5D6571');
  const [formAvailability, setFormAvailability] = useState<VehicleAvailability>('available');
  const [formMainImage, setFormMainImage] = useState('');
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [formGalleryInput, setFormGalleryInput] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [formFeatureInput, setFormFeatureInput] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWarrantyMonths, setFormWarrantyMonths] = useState(12);
  const [formVin, setFormVin] = useState('');
  const [formStatus, setFormStatus] = useState<'publish' | 'draft'>('publish');

  // Trigger create modal only on false -> true transition from parent
  useEffect(() => {
    if (isCreatingProp && !prevIsCreatingPropRef.current) {
      openCreateModal();
    }
    prevIsCreatingPropRef.current = Boolean(isCreatingProp);
  }, [isCreatingProp]);

  // Hide toasts automatically
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Live subscription to pending Cloud Firestore sync queue
  useEffect(() => {
    const refreshPending = () => {
      setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());
    };
    refreshPending();
    window.addEventListener('vsp-cloud-sync-status', refreshPending);
    window.addEventListener('vsp-vehicles-sync', refreshPending);
    return () => {
      window.removeEventListener('vsp-cloud-sync-status', refreshPending);
      window.removeEventListener('vsp-vehicles-sync', refreshPending);
    };
  }, [vehicles.length, isFirebaseAdmin]);

  const handleForceSyncToCloud = async () => {
    if (!isAuthorizedAdminUser(auth.currentUser)) {
      setErrorToast('Session Cloud non active. Veuillez vous reconnecter au backoffice.');
      return;
    }
    setSyncingCloud(true);
    setErrorToast(null);
    try {
      const syncedCount = await WordPressFirebaseService.syncLocalVehiclesToFirestore();
      setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());
      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      setSuccessToast(
        syncedCount > 0
          ? `☁️ ${syncedCount} véhicule${syncedCount > 1 ? 's' : ''} synchronisé${syncedCount > 1 ? 's' : ''} de façon permanente dans Cloud Firestore !`
          : '☁️ Tout votre inventaire est déjà 100% synchronisé et protégé dans Cloud Firestore.'
      );
    } catch (err: any) {
      setErrorToast(`Erreur de synchronisation Cloud Firestore : ${err?.message || 'Vérifiez votre connexion.'}`);
    } finally {
      setSyncingCloud(false);
    }
  };

  const openCreateModal = () => {
    setFormError(null);
    setEditingVehicle(null);
    setFormBrand(brands[0]?.name || 'Aixam');
    setFormModel('');
    setFormPrice(8990);
    setFormYear(new Date().getFullYear());
    setFormMileage(12000);
    setFormEnergy('Diesel');
    setFormCondition('Occasion');
    setFormGearbox('Automatique (variateur)');
    setFormPower('1 ch fiscal / 6 kW');
    setFormColor('Gris Titane Métallisé');
    setFormCustomColorHex('#5D6571');
    setFormAvailability('available');
    setFormMainImage('');
    setFormGallery([]);
    setFormFeatures([]);
    setFormDescription('');
    setFormWarrantyMonths(12);
    setFormVin('');
    setFormStatus('publish');
    setIsCreating(true);
  };

  const openEditModal = (veh: Vehicle) => {
    setFormError(null);
    setEditingVehicle(veh);
    setFormBrand(veh.brand);
    setFormModel(veh.model);
    setFormPrice(veh.price);
    setFormYear(veh.year);
    setFormMileage(veh.mileage);
    setFormEnergy(veh.energy);
    setFormCondition(veh.condition);
    setFormGearbox(veh.gearbox);
    setFormPower(veh.power);
    setFormColor(veh.color || 'Gris Titane Métallisé');
    setFormAvailability(veh.availability);
    setFormMainImage(veh.mainImage);
    setFormGallery(veh.gallery || [veh.mainImage]);
    setFormFeatures(veh.features || []);
    setFormDescription(veh.description || '');
    setFormWarrantyMonths(veh.warrantyMonths || 12);
    setFormVin(veh.vin || '');
    setFormStatus(veh.status === 'draft' ? 'draft' : 'publish');
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setFormError(null);
    setIsCreating(false);
    setEditingVehicle(null);
    onCloseCreate?.();
  };

  // Multiple Gallery Images Upload (up to 5+ photos, either all at once OR into a specific slot 1..5)
  const handleGalleryImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSlotIndex?: number
  ) => {
    const inputEl = e.target;
    const files = inputEl.files;
    if (!files || files.length === 0) return;

    setFormError(null);
    const fileList: File[] =
      typeof targetSlotIndex === 'number' ? [files[0]] : Array.from(files);
    setIsCompressingGallery(true);
    setGalleryUploadProgress({ current: 0, total: fileList.length, filename: fileList[0].name });

    try {
      const newImages: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setGalleryUploadProgress({
          current: i + 1,
          total: fileList.length,
          filename: file.name,
        });

        const compressed = await compressImageFile(file, 850, 0.75);
        const uploadedUrl = await WordPressFirebaseService.uploadVehicleImage(compressed, file.name);
        newImages.push(uploadedUrl);
      }

      if (typeof targetSlotIndex === 'number') {
        const uploadedUrl = newImages[0];
        setFormGallery((prev) => {
          const next = [...prev];
          if (targetSlotIndex < next.length) {
            next[targetSlotIndex] = uploadedUrl;
          } else {
            next.push(uploadedUrl);
          }
          return next;
        });
        if (targetSlotIndex === 0 || !formMainImage.trim() || formMainImage.includes('unsplash')) {
          setFormMainImage(uploadedUrl);
        }
      } else {
        setFormGallery((prev) => [...prev, ...newImages]);
        if (!formMainImage.trim() || formMainImage.includes('unsplash')) {
          setFormMainImage(newImages[0]);
        }
      }
    } catch (err: any) {
      setFormError(`Erreur lors du traitement des images : ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setIsCompressingGallery(false);
      setGalleryUploadProgress(null);
      inputEl.value = '';
      if (galleryImagesInputRef.current) galleryImagesInputRef.current.value = '';
    }
  };

  // Reorder gallery photos: slot #1 (index 0) is always the main cover image
  const handleMoveGalleryImage = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formGallery.length) return;
    const updated = [...formGallery];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormGallery(updated);
    if (updated[0]) {
      setFormMainImage(updated[0]);
    }
  };

  // Promote any photo to slot #1 (main cover image)
  const handleSetGalleryImageAsMain = (imgUrl: string) => {
    setFormGallery((prev) => {
      const remaining = prev.filter((item) => item !== imgUrl);
      return [imgUrl, ...remaining];
    });
    setFormMainImage(imgUrl);
  };

  const handleAddFeature = () => {
    if (!formFeatureInput.trim()) return;
    if (!formFeatures.includes(formFeatureInput.trim())) {
      setFormFeatures([...formFeatures, formFeatureInput.trim()]);
    }
    setFormFeatureInput('');
  };

  const handleRemoveFeature = (feat: string) => {
    setFormFeatures(formFeatures.filter((f) => f !== feat));
  };

  const handleAddGalleryImage = () => {
    const url = formGalleryInput.trim();
    if (!url) return;
    setFormGallery((prev) => [...prev, url]);
    if (!formMainImage.trim()) {
      setFormMainImage(url);
    }
    setFormGalleryInput('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    const removed = formGallery[idx];
    const nextGallery = formGallery.filter((_, i) => i !== idx);
    setFormGallery(nextGallery);
    if (formMainImage === removed) {
      setFormMainImage(nextGallery[0] || '');
    }
  };

  // Save Vehicle (Auto-persisted to Server + LocalStorage + Firestore + immediate homepage update)
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formBrand.trim() || !formModel.trim() || !formPrice || Number(formPrice) <= 0) {
      setFormError('Veuillez renseigner la marque, le modèle et un prix TTC valide.');
      return;
    }

    const finalMainImage = formMainImage.trim() || formGallery[0]?.trim() || '';
    if (!finalMainImage) {
      setFormError('Veuillez importer au moins 1 photo du véhicule (jusqu’à 5 photos recommandées).');
      return;
    }

    setSaving(true);
    try {
      const cleanedGallery = formGallery.map((g) => g.trim()).filter(Boolean);
      const finalGallery = cleanedGallery.length > 0
        ? cleanedGallery.includes(finalMainImage)
          ? cleanedGallery
          : [finalMainImage, ...cleanedGallery]
        : [finalMainImage];

      await WordPressFirebaseService.saveVehicle({
        id: editingVehicle?.id,
        brand: formBrand.trim(),
        model: formModel.trim(),
        price: Number(formPrice),
        year: Number(formYear) || new Date().getFullYear(),
        mileage: Number(formMileage) || 0,
        energy: formEnergy,
        condition: formCondition,
        gearbox: formGearbox,
        power: formPower,
        color: formColor,
        availability: formAvailability,
        status: formStatus,
        mainImage: finalMainImage,
        gallery: finalGallery,
        features: formFeatures,
        description: formDescription,
        warrantyMonths: Number(formWarrantyMonths) || 12,
        vin: formVin.trim(),
      });

      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());

      const syncedToCloud = isAuthorizedAdminUser(auth.currentUser);
      setSuccessToast(
        editingVehicle
          ? syncedToCloud
            ? `☁️ "${formBrand} ${formModel}" mis à jour dans Cloud Firestore et visible partout immédiatement !`
            : `"${formBrand} ${formModel}" enregistré. Utilisez « Vérifier & Synchroniser » si nécessaire.`
          : syncedToCloud
            ? `☁️ Nouveau véhicule "${formBrand} ${formModel}" enregistré dans Cloud Firestore et visible partout immédiatement !`
            : `"${formBrand} ${formModel}" enregistré. Utilisez « Vérifier & Synchroniser » si nécessaire.`
      );

      handleCloseModal();
    } catch (err: any) {
      setFormError(`Erreur d'enregistrement : ${err?.message || 'Impossible de sauvegarder le véhicule.'}`);
    } finally {
      setSaving(false);
    }
  };

  // Enregistrer le véhicule courant et enchaîner directement sur le suivant
  const handleSaveAndAddAnother = async (e: React.MouseEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formBrand.trim() || !formModel.trim() || !formPrice || Number(formPrice) <= 0) {
      setFormError('Veuillez renseigner la marque, le modèle et un prix TTC valide.');
      return;
    }

    const finalMainImage = formMainImage.trim() || formGallery[0]?.trim() || '';
    if (!finalMainImage) {
      setFormError('Veuillez importer au moins 1 photo de votre véhicule.');
      return;
    }

    setSaving(true);
    try {
      const cleanedGallery = formGallery.map((g) => g.trim()).filter(Boolean);
      const finalGallery = cleanedGallery.length > 0
        ? cleanedGallery.includes(finalMainImage)
          ? cleanedGallery
          : [finalMainImage, ...cleanedGallery]
        : [finalMainImage];

      await WordPressFirebaseService.saveVehicle({
        brand: formBrand.trim(),
        model: formModel.trim(),
        price: Number(formPrice),
        year: Number(formYear) || new Date().getFullYear(),
        mileage: Number(formMileage) || 0,
        energy: formEnergy,
        condition: formCondition,
        gearbox: formGearbox,
        power: formPower,
        color: formColor,
        availability: formAvailability,
        status: formStatus,
        mainImage: finalMainImage,
        gallery: finalGallery,
        features: formFeatures,
        description: formDescription,
        warrantyMonths: Number(formWarrantyMonths) || 12,
        vin: formVin.trim(),
      });

      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());

      const syncedToCloud = isAuthorizedAdminUser(auth.currentUser);
      setSuccessToast(
        syncedToCloud
          ? `☁️ "${formBrand} ${formModel}" enregistré définitivement dans Cloud Firestore ! Saisissez maintenant le véhicule suivant :`
          : `"${formBrand} ${formModel}" enregistré (en attente de synchronisation Cloud). Saisissez maintenant le véhicule suivant :`
      );

      setFormModel('');
      setFormPrice(8990);
      setFormMileage(10000);
      setFormMainImage('');
      setFormGallery([]);
      setFormGalleryInput('');
      setFormDescription('');
      setFormVin('');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(`Erreur d'enregistrement : ${err?.message || 'Impossible de sauvegarder le véhicule.'}`);
    } finally {
      setSaving(false);
    }
  };

  // Duplicate Vehicle
  const handleDuplicate = async (veh: Vehicle) => {
    try {
      await WordPressFirebaseService.duplicateVehicle(veh);
      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      setSuccessToast(`Véhicule "${veh.brand} ${veh.model}" dupliqué avec succès.`);
    } catch (err: any) {
      setErrorToast(`Erreur de duplication : ${err?.message || 'Action impossible'}`);
    }
  };

  // Open Delete Confirmation Modal
  const handleDelete = (veh: Vehicle) => {
    setVehicleToDelete(veh);
  };

  // Execute actual permanent deletion
  const executeDeleteVehicle = async (veh: Vehicle) => {
    try {
      await WordPressFirebaseService.deleteVehiclePermanently(veh.id);
      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      if (editingVehicle?.id === veh.id) {
        handleCloseModal();
      }
      setSuccessToast(`Véhicule "${veh.brand} ${veh.model}" supprimé définitivement du catalogue et de l'accueil.`);
    } catch (err: any) {
      setErrorToast(`Erreur de suppression : ${err?.message || 'Action impossible'}`);
    }
  };

  // Vider tout le catalogue (uniquement après confirmation explicite VIDER)
  const handleClearAllVehicles = async () => {
    if (clearAllConfirmText.trim().toUpperCase() !== 'VIDER') return;
    try {
      await WordPressFirebaseService.clearAllVehicles();
      onVehiclesUpdated?.([]);
      setPendingSyncIds(new Set());
      setClearAllConfirmText('');
      setIsConfirmingClearAll(false);
      setSuccessToast("Catalogue vidé volontairement. Aucun véhicule n'est présent sur le site ni dans le backoffice.");
    } catch (err: any) {
      setErrorToast(`Erreur lors du vidage du catalogue : ${err?.message || 'Action impossible'}`);
    }
  };

  // Quick Availability Toggle
  const handleQuickAvailabilityChange = async (veh: Vehicle, newAvail: VehicleAvailability) => {
    try {
      await WordPressFirebaseService.updateVehicleAvailability(veh.id, newAvail);
      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
    } catch (err: any) {
      setErrorToast(`Erreur : ${err?.message || 'Action impossible'}`);
    }
  };

  // Export backup JSON
  const handleExportJson = async () => {
    try {
      const list = await WordPressFirebaseService.exportVehiclesBackup();
      const payload = JSON.stringify(list, null, 2);
      const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `jean-auto-vsp-stock-${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessToast(`Sauvegarde téléchargée (${list.length} véhicule${list.length > 1 ? 's' : ''}).`);
    } catch (err: any) {
      setErrorToast(`Erreur lors de l'export JSON : ${err?.message || 'Erreur inconnue'}`);
    }
  };

  // Import backup JSON
  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingBackup(true);
    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);
      const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.vehicles) ? parsed.vehicles : [];
      if (items.length === 0) {
        setErrorToast('Le fichier JSON ne contient aucun véhicule valide.');
        return;
      }
      const importedCount = await WordPressFirebaseService.importVehiclesBackup(items);
      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());
      const syncedToCloud = isAuthorizedAdminUser(auth.currentUser);
      setSuccessToast(
        syncedToCloud
          ? `☁️ ${importedCount} véhicule${importedCount > 1 ? 's' : ''} importé${importedCount > 1 ? 's' : ''} et sauvegardé${importedCount > 1 ? 's' : ''} de façon permanente dans Cloud Firestore !`
          : `${importedCount} véhicule${importedCount > 1 ? 's' : ''} importé${importedCount > 1 ? 's' : ''}. Cliquez sur « Synchroniser vers Cloud » si nécessaire.`
      );
    } catch (err: any) {
      setErrorToast(`Fichier JSON invalide : ${err?.message || 'Format incorrect'}`);
    } finally {
      setImportingBackup(false);
      if (backupFileInputRef.current) backupFileInputRef.current.value = '';
    }
  };

  // 1-click starter catalog (6 typical VSP models, clearly labeled as editable starter models)
  const handleLoadStarterCatalog = async () => {
    setLoadingStarterCatalog(true);
    const starterImages = [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549317661-bd82c8356d96?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1000&auto=format&fit=crop&q=80',
    ];
    try {
      for (let i = 0; i < INITIAL_6_VSP_PRESETS.length; i++) {
        const preset = INITIAL_6_VSP_PRESETS[i];
        const img = starterImages[i % starterImages.length];
        await WordPressFirebaseService.saveVehicle({
          brand: preset.brand,
          model: preset.model,
          price: preset.price,
          year: preset.year,
          mileage: preset.mileage,
          energy: preset.energy,
          condition: preset.condition,
          color: preset.color,
          warrantyMonths: preset.warrantyMonths,
          availability: 'available',
          status: 'publish',
          mainImage: img,
          gallery: [img],
          features: ['Boîte automatique', 'Révision atelier 100 points', `Garantie ${preset.warrantyMonths} mois`],
          description: `${preset.brand} ${preset.model} révisée et garantie ${preset.warrantyMonths} mois par JEAN AUTO VSP (modèle type modifiable librement).`,
        });
      }
      const updatedList = WordPressFirebaseService.getLocalVehicles();
      onVehiclesUpdated?.(updatedList);
      setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());
      const syncedToCloud = isAuthorizedAdminUser(auth.currentUser);
      setSuccessToast(
        syncedToCloud
          ? '☁️ Catalogue de départ (6 modèles VSP types) enregistré définitivement dans Cloud Firestore !'
          : 'Catalogue de départ chargé. Cliquez sur « Synchroniser vers Cloud » si nécessaire.'
      );
    } catch (err: any) {
      setErrorToast(`Erreur lors du chargement du catalogue de départ : ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setLoadingStarterCatalog(false);
    }
  };

  // Filtered vehicles
  const filtered = vehicles.filter((v) => {
    if (v.status === 'trash') return false;
    const matchSearch =
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.color && v.color.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchBrand = selectedBrand === 'all' || v.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchAvail = selectedAvailability === 'all' || v.availability === selectedAvailability;
    return matchSearch && matchBrand && matchAvail;
  });

  // Filtered color presets
  const filteredColorPresets = VSP_COLOR_PRESETS.filter(
    (preset) => colorCategory === 'all' || preset.category === colorCategory
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorToast && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{errorToast}</span>
          </div>
          <button
            onClick={() => setErrorToast(null)}
            className="text-red-700 hover:text-red-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Permanent Cloud Protection Shield / Sync Banner when Cloud Admin is connected */}
      {isFirebaseAdmin && pendingSyncIds.size > 0 ? (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <Cloud className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="block text-amber-950">
                {pendingSyncIds.size} véhicule{pendingSyncIds.size > 1 ? 's' : ''} en attente d'envoi vers Cloud Firestore
              </strong>
              <span className="text-amber-800">
                Cliquez sur le bouton ci-contre pour envoyer immédiatement ces véhicules et leurs photos vers Cloud Firestore afin qu'ils soient visibles partout.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleForceSyncToCloud}
            disabled={syncingCloud}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            {syncingCloud ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{syncingCloud ? 'Synchronisation...' : 'Synchroniser vers Cloud'}</span>
          </button>
        </div>
      ) : isFirebaseAdmin ? (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="block text-emerald-950">
                Protection permanente Cloud Firestore active · Synchronisé en temps réel ({vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''})
              </strong>
              <span className="text-emerald-800">
                Toutes vos fiches et photos sont enregistrées dans Cloud Firestore (<code className="font-mono bg-emerald-100 px-1 rounded">{connectionStatus?.projectId || 'Firebase'}</code>) et visibles immédiatement côté concepteur et sur le site public.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleForceSyncToCloud}
            disabled={syncingCloud}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            {syncingCloud ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Vérifier & Synchroniser</span>
          </button>
        </div>
      ) : null}

      {/* Firebase Connection Fallback Warning Banner */}
      {connectionStatus && !connectionStatus.testing && !connectionStatus.connected && (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block text-amber-950">
              Mode de secours serveur actif (Cloud Firestore temporairement inaccessible)
            </strong>
            <span className="text-amber-800">
              Votre nouvelle base Firebase (<code className="font-mono bg-amber-100 px-1 rounded">{connectionStatus.projectId}</code>) est momentanément injoignable. Vos véhicules ajoutés ici restent sauvegardés sur le serveur du site et téléchargeables en JSON.
            </span>
          </div>
        </div>
      )}

      {/* Hidden JSON Backup Import Input */}
      <input
        ref={backupFileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportJsonFile}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-[#2271b1]" />
            Inventaire Voitures Sans Permis (VSP)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez vos véhicules en stock. Tout ajout, modification ou suppression est sauvegardé automatiquement et répercuté instantanément sur la page d'accueil.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter 1 véhicule</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer shrink-0 hover:shadow-emerald-600/20"
          >
            <Layers className="w-4 h-4" />
            <span>Ajout groupé illimité</span>
            <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-black ml-0.5">
              Sans limite
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
            title="Télécharger une sauvegarde complète du stock au format JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exporter (.json)</span>
          </button>

          <button
            type="button"
            disabled={importingBackup}
            onClick={() => backupFileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Restaurer un stock à partir d'un fichier .json"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>{importingBackup ? 'Import...' : 'Importer (.json)'}</span>
          </button>

          {vehicles.length > 0 && (
            <button
              onClick={() => {
                setClearAllConfirmText('');
                setIsConfirmingClearAll(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
              title="Vider tous les véhicules du catalogue pour repartir de zéro"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Vider le catalogue ({vehicles.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par modèle, marque, couleur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2271b1]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter by Brand */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer"
            >
              <option value="all">Toutes les marques</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Availability */}
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">🟢 Disponibles</option>
            <option value="reserved">🟠 Réservés</option>
            <option value="sold">🔴 Vendus</option>
          </select>

          <div className="text-xs text-gray-500 font-medium ml-auto">
            <strong>{filtered.length}</strong> véhicule{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Table of Vehicles with full horizontal visibility */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-xs">
        <table className="w-full min-w-[780px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Véhicule</th>
              <th className="py-3 px-4">Couleur</th>
              <th className="py-3 px-4">Prix TTC</th>
              <th className="py-3 px-4">Année / Km</th>
              <th className="py-3 px-4">Énergie</th>
              <th className="py-3 px-4">Disponibilité</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 px-6 text-center text-gray-500">
                  <Car className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  {vehicles.length === 0 ? (
                    <div className="max-w-xl mx-auto space-y-3">
                      <p className="font-bold text-slate-800 text-sm">
                        Aucun véhicule enregistré pour le moment dans cette nouvelle base permanente.
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Si vos anciennes annonces étaient enregistrées uniquement dans l'ancienne base Firebase externe (<code className="font-mono bg-slate-100 px-1 rounded">base-de-donnees-p</code>), elles ne sont pas lisibles automatiquement sans y ouvrir les règles. Vous pouvez repartir immédiatement avec votre propre stock, importer une sauvegarde <code className="font-mono bg-slate-100 px-1 rounded">.json</code>, ou charger 6 modèles VSP types modifiables :
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter 1 véhicule</span>
                        </button>
                        <button
                          type="button"
                          disabled={loadingStarterCatalog}
                          onClick={handleLoadStarterCatalog}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-60"
                        >
                          {loadingStarterCatalog ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>Charger 6 modèles VSP types (Catalogue de départ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => backupFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          <FileJson className="w-3.5 h-3.5 text-blue-600" />
                          <span>Importer sauvegarde (.json)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold">Aucun véhicule ne correspond aux filtres.</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-3 text-xs text-[#2271b1] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter un nouveau véhicule maintenant
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((veh) => (
                <tr key={veh.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {veh.mainImage ? (
                        <img
                          src={veh.mainImage}
                          alt={veh.model}
                          className="w-14 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-lg border border-gray-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
                          <Car className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">
                          {veh.brand} <span className="text-gray-700">{veh.model}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>{veh.condition} · Réf: {veh.id.slice(0, 12)}</span>
                          {pendingSyncIds.has(veh.id) || !isFirebaseAdmin ? (
                            <span
                              title="En attente de synchronisation vers Cloud Firestore Google"
                              className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold"
                            >
                              ⏳ Synchro Google requise
                            </span>
                          ) : (
                            <span
                              title="Enregistré et protégé de manière permanente dans Cloud Firestore"
                              className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold"
                            >
                              ☁️ Cloud OK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-xs font-medium">
                      <span className="w-2.5 h-2.5 rounded-full border border-gray-400 shrink-0" />
                      <span>{veh.color || 'Non spécifiée'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {veh.price.toLocaleString('fr-FR')} €
                  </td>

                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {veh.year} · {veh.mileage.toLocaleString('fr-FR')} km
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                      {veh.energy}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={veh.availability}
                      onChange={(e) => handleQuickAvailabilityChange(veh, e.target.value as VehicleAvailability)}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${
                        veh.availability === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : veh.availability === 'reserved'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      <option value="available">🟢 Disponible</option>
                      <option value="reserved">🟠 Réservé</option>
                      <option value="sold">🔴 Vendu</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSharingVehicle(veh)}
                        title="Créer un lien exclusif pour vos annonces TikTok & Facebook (met en avant uniquement ce véhicule)"
                        className="inline-flex items-center gap-1 px-2 py-1 text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-pink-200"
                      >
                        <Share2 className="w-3.5 h-3.5 text-pink-600" />
                        <span className="hidden sm:inline">Lien Pub (TikTok/FB)</span>
                      </button>

                      {onViewInFront && (
                        <button
                          onClick={() => onViewInFront(veh.slug)}
                          title="Voir sur le site public / accueil"
                          className="p-1.5 text-gray-500 hover:text-[#2271b1] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(veh)}
                        title="Modifier ce véhicule"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(veh)}
                        title="Dupliquer ce véhicule"
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(veh)}
                        title="Supprimer définitivement ce véhicule"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT / CREATE VEHICLE */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            ref={modalScrollRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto my-6 flex flex-col border border-gray-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3 sticky top-0 bg-white z-20">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2 flex-wrap">
                  <Car className="w-5 h-5 text-[#2271b1]" />
                  <span>{editingVehicle ? `Modifier : ${editingVehicle.brand} ${editingVehicle.model}` : 'Ajouter un nouveau véhicule'}</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Jusqu'à 5 photos et plus par véhicule · Enchaînement multi-véhicules ou ajout groupé illimité.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!editingVehicle && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      setIsBulkModalOpen(true);
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ajouter plusieurs d'un coup</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVehicle} noValidate className="p-6 space-y-6 flex-1 text-xs">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed flex-1">{formError}</div>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="text-red-500 hover:text-red-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Marque & Modèle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Marque *</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus:ring-1 focus:ring-[#2271b1]"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    {formBrand && !brands.some((b) => b.name === formBrand) && (
                      <option value={formBrand}>{formBrand}</option>
                    )}
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Modèle et Finition *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: City Pack Sensation, JS50 Sport DCI, M.Go X..."
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>
              </div>

              {/* Prix, Année, Km, Garantie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Prix TTC (€) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full text-xs font-bold text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Année *</label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kilométrage (km) *</label>
                  <input
                    type="number"
                    required
                    value={formMileage}
                    onChange={(e) => setFormMileage(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Garantie (mois)</label>
                  <input
                    type="number"
                    value={formWarrantyMonths}
                    onChange={(e) => setFormWarrantyMonths(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              {/* Énergie, État, Disponibilité */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Motorisation / Énergie</label>
                  <select
                    value={formEnergy}
                    onChange={(e) => setFormEnergy(e.target.value as VehicleEnergy)}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Essence">Essence</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">État du véhicule</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as VehicleCondition)}
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="Occasion">Occasion révisée</option>
                    <option value="Neuf">Neuf 0 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Disponibilité à la vente</label>
                  <select
                    value={formAvailability}
                    onChange={(e) => setFormAvailability(e.target.value as VehicleAvailability)}
                    className="w-full text-xs font-bold border border-gray-300 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="available">🟢 Disponible immédiatement</option>
                    <option value="reserved">🟠 Réservé (Acompte 150 €)</option>
                    <option value="sold">🔴 Vendu</option>
                  </select>
                </div>
              </div>

              {/* SECTION COULEURS ENRICHIE (GRAND CHOIX DE COULEURS) */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-blue-600" />
                    <span>Palette de couleurs ({VSP_COLOR_PRESETS.length} teintes disponibles)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Couleur sélectionnée :</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded-lg font-bold text-slate-900">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-gray-400"
                        style={{ backgroundColor: formCustomColorHex }}
                      />
                      <span>{formColor}</span>
                    </span>
                  </div>
                </div>

                {/* Categories filter tabs */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { id: 'all', label: 'Toutes les teintes' },
                    { id: 'Classiques', label: 'Classiques (Blancs, Noirs, Gris)' },
                    { id: 'Sportives & Vives', label: 'Sport & Vives (Bleus, Rouges, Jaune)' },
                    { id: 'Élégantes & Rares', label: 'Élégantes (Vert, Bronze, Moka)' },
                    { id: 'Bicolores', label: 'Bicolores & Toit Noir' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setColorCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        colorCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Visual Swatches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {filteredColorPresets.map((preset) => {
                    const isSelected = formColor === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormColor(preset.name);
                          setFormCustomColorHex(preset.hex);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full shrink-0 shadow-xs border border-gray-300 relative flex items-center justify-center"
                          style={{
                            background: preset.gradient || preset.hex,
                          }}
                        >
                          {isSelected && <Check className={`w-3 h-3 ${preset.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-800 truncate" title={preset.name}>
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color override input */}
                <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-[11px] text-gray-500 font-medium">Nuancier personnalisé :</label>
                    <input
                      type="color"
                      value={formCustomColorHex}
                      onChange={(e) => setFormCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Nom personnalisé de la couleur (ex: Bleu Miami Nacré)..."
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* PLAGE UNIQUE DE TÉLÉCHARGEMENT DES PHOTOS (PRINCIPALE #1 + SECONDAIRES #2..#5+) */}
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Photos du véhicule * ({formGallery.length} ajoutée{formGallery.length > 1 ? 's' : ''})</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Toutes vos photos passent ici : la photo <strong>#1 ★</strong> sert automatiquement de photo principale sur le site. Importez 1 à 5+ images d'un coup ou case par case.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <label
                      htmlFor="wp-vehicle-gallery-input"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer select-none active:scale-[0.99]"
                    >
                      <input
                        id="wp-vehicle-gallery-input"
                        ref={galleryImagesInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleGalleryImagesUpload(e)}
                        className="sr-only"
                      />
                      {isCompressingGallery ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Import en cours...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ Importer des photos (1 à 5+)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Visible native multi-file input fallback for smartphones & iFrames */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-left w-full sm:w-auto">
                    <span className="text-[11px] font-bold text-blue-950 block">Sélection directe depuis l'appareil :</span>
                    <span className="text-[10px] text-gray-600 block">Choisissez une ou plusieurs images (principale et secondaires) en une seule fois</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleGalleryImagesUpload(e)}
                    className="text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full sm:w-auto"
                  />
                </div>

                {/* Real-time Compression Progress Bar */}
                {galleryUploadProgress && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span>Optimisation de la photo {galleryUploadProgress.current} sur {galleryUploadProgress.total}</span>
                      </span>
                      <span>{Math.round((galleryUploadProgress.current / galleryUploadProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.round((galleryUploadProgress.current / galleryUploadProgress.total) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-blue-700 truncate font-mono">
                      Fichier : {galleryUploadProgress.filename}
                    </p>
                  </div>
                )}

                {/* Quick URL Adder */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Ou ajouter une photo par URL directe..."
                    value={formGalleryInput}
                    onChange={(e) => setFormGalleryInput(e.target.value)}
                    className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Ajouter URL
                  </button>
                </div>

                {/* Unified 5-Slot Photo Grid (Slot #1 is automatically the Main Photo) */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-gray-700 flex items-center justify-between flex-wrap gap-1">
                    <span>Emplacements photos (#1 à #{Math.max(5, formGallery.length)}) :</span>
                    <span className="text-gray-500 font-normal">Flèches pour réordonner · ★ pour passer en photo principale (#1)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {Array.from({ length: Math.max(5, formGallery.length) }).map((_, i) => {
                      const imgUrl = formGallery[i];
                      const isMain = Boolean(imgUrl && (formMainImage === imgUrl || (!formMainImage && i === 0)));

                      if (!imgUrl) {
                        return (
                          <label
                            key={`empty-slot-${i}`}
                            className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all group"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGalleryImagesUpload(e, i)}
                              className="sr-only"
                            />
                            <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
                              <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800">
                              Photo #{i + 1}
                            </span>
                            <span className="text-[9.5px] text-gray-500">
                              {i === 0 ? 'Principale' : 'Ajouter une image'}
                            </span>
                          </label>
                        );
                      }

                      return (
                        <div
                          key={`filled-slot-${i}`}
                          className={`relative rounded-xl border overflow-hidden bg-white shadow-xs flex flex-col ${
                            isMain ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200'
                          }`}
                        >
                          <div className="relative h-24 bg-gray-100 overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={`Photo véhicule ${i + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Order Badge */}
                            <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                              #{i + 1}
                            </span>

                            {/* Main cover badge */}
                            {isMain && (
                              <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>Principale</span>
                              </span>
                            )}
                          </div>

                          {/* Actions under image */}
                          <div className="p-1.5 bg-slate-50 border-t border-gray-100 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={i === 0}
                                onClick={() => handleMoveGalleryImage(i, 'left')}
                                title="Déplacer vers la gauche"
                                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={i === formGallery.length - 1}
                                onClick={() => handleMoveGalleryImage(i, 'right')}
                                title="Déplacer vers la droite"
                                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => handleSetGalleryImageAsMain(imgUrl)}
                                  title="Définir comme photo principale (#1)"
                                  className="p-1 text-amber-600 hover:bg-amber-50 rounded cursor-pointer text-[10px] font-bold"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(i)}
                                title="Supprimer cette photo"
                                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Équipements & Options */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Équipements & Points forts</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ex: Caméra de recul, Écran tactile CarPlay, Jantes alu, Radar..."
                    value={formFeatureInput}
                    onChange={(e) => setFormFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formFeatures.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded-full border border-blue-200 font-medium"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat)}
                        className="text-blue-500 hover:text-blue-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description commerciale */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description commerciale</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-xl p-3"
                  placeholder="Présentation du véhicule, révision atelier 100 points, carnet d'entretien, points forts..."
                />
              </div>

              {/* Validation error repeated near submit buttons for visibility when scrolled */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Footer with Delete button if editing */}
              <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                {editingVehicle ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingVehicle)}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer ce véhicule</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-gray-500 italic">
                    Sauvegarde automatique activée
                  </div>
                )}

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>

                  {!editingVehicle && (
                    <button
                      type="button"
                      disabled={saving || isCompressingGallery}
                      onClick={handleSaveAndAddAnother}
                      className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Enregistrer et ajouter un autre</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={saving || isCompressingGallery}
                    className="px-6 py-2.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingVehicle ? 'Enregistrer les modifications' : 'Enregistrer le véhicule'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Boîte de dialogue de confirmation de suppression définitive */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Supprimer définitivement ce véhicule ?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Êtes-vous certain de vouloir supprimer <strong>{vehicleToDelete.brand} {vehicleToDelete.model}</strong> ({vehicleToDelete.price.toLocaleString('fr-FR')} €) ?
                <br />
                Il sera retiré immédiatement du catalogue et de l'accueil de la concession.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const veh = vehicleToDelete;
                  setVehicleToDelete(null);
                  await executeDeleteVehicle(veh);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout groupé illimité en 1 clic */}
      <WpBulkVehiclesModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        brands={brands}
        isFirebaseAdmin={isFirebaseAdmin}
        onSaved={(count) => {
          setPendingSyncIds(WordPressFirebaseService.getPendingCloudSyncIds());
          const syncedToCloud = isAuthorizedAdminUser(auth.currentUser);
          setSuccessToast(
            syncedToCloud
              ? `☁️ ${count} véhicule${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''} dans Cloud Firestore et visible${count > 1 ? 's' : ''} partout !`
              : `${count} véhicule${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}. Cliquez sur « Synchroniser vers Cloud » si nécessaire.`
          );
          const updated = WordPressFirebaseService.getLocalVehicles();
          onVehiclesUpdated?.(updated);
        }}
      />

      {/* Modal de partage exclusif pour TikTok / Facebook (Lien Direct Véhicule Unique) */}
      {sharingVehicle && (
        <VehicleShareModal
          vehicle={sharingVehicle}
          commercialSettings={{
            companyName: 'JEAN AUTO VSP',
            address: '11 Avenue du Grand Port',
            postalCode: '73100',
            city: 'Aix-les-Bains',
            phone: '+33 2 59 50 89 31',
            whatsapp: '+33 6 37 38 55 90',
            email: 'amautosanspermis@gmail.com',
            installmentDepositAmount: 150,
          } as any}
          onClose={() => setSharingVehicle(null)}
          onViewSpotlight={(vId) => {
            onViewSpotlight?.(vId);
            setSharingVehicle(null);
          }}
        />
      )}

      {/* Modal de confirmation sécurisé : Vider tout le catalogue */}
      {isConfirmingClearAll && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Vider tout le catalogue ?</h3>
                <p className="text-xs text-gray-500">Suppression définitive de tous les véhicules ({vehicles.length})</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Par sécurité, aucun véhicule ne peut être effacé accidentellement. Pour confirmer la suppression volontaire de <strong>tous les véhicules ({vehicles.length})</strong>, tapez <code className="font-mono font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">VIDER</code> ci-dessous :
            </p>
            <input
              type="text"
              value={clearAllConfirmText}
              onChange={(e) => setClearAllConfirmText(e.target.value)}
              placeholder="Tapez VIDER pour déverrouiller"
              className="w-full text-xs font-bold border border-red-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setClearAllConfirmText('');
                  setIsConfirmingClearAll(false);
                }}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={clearAllConfirmText.trim().toUpperCase() !== 'VIDER'}
                onClick={handleClearAllVehicles}
                className="px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmer et vider tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
