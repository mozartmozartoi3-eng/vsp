import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Check,
  Database,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { WPSiteSettings, WPCategory } from '../../types/wordpress';
import { firebaseConfig, FirebaseConnectionStatus } from '../../firebase';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpSettingsProps {
  settings: WPSiteSettings;
  categories: WPCategory[];
  connectionStatus: FirebaseConnectionStatus;
  onTestConnection: () => void;
  activeSubTab?: 'general' | 'firebase';
}

export const WpSettings: React.FC<WpSettingsProps> = ({
  settings,
  categories,
  connectionStatus,
  onTestConnection,
  activeSubTab = 'general',
}) => {
  const [tab, setTab] = useState<'general' | 'firebase'>(activeSubTab);
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [siteUrl, setSiteUrl] = useState(settings.siteUrl || window.location.origin);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || 'admin@base-de-donnees-p.firebaseapp.com');
  const [defaultCategory, setDefaultCategory] = useState(settings.defaultCategory || 'Non classé');
  const [postsPerPage, setPostsPerPage] = useState(settings.postsPerPage || 10);
  const [timezone, setTimezone] = useState(settings.timezone || 'Europe/Paris');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setTab(activeSubTab);
  }, [activeSubTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await WordPressFirebaseService.updateSettings({
        siteTitle,
        tagline,
        siteUrl,
        adminEmail,
        defaultCategory,
        postsPerPage,
        timezone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Erreur d'enregistrement: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-300">
        <h1 className="text-2xl font-normal text-[#1d2327]">Réglages du site</h1>
        <div className="flex border border-gray-300 rounded overflow-hidden">
          <button
            onClick={() => setTab('general')}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors ${
              tab === 'general' ? 'bg-[#2271b1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Général
          </button>
          <button
            onClick={() => setTab('firebase')}
            className={`px-3 py-1.5 font-semibold text-xs transition-colors flex items-center space-x-1 ${
              tab === 'firebase' ? 'bg-[#2271b1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Base Firebase</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Réglages enregistrés dans Firebase avec succès !</span>
        </div>
      )}

      {tab === 'general' && (
        <form onSubmit={handleSave} className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Titre du site</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full sm:w-96 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Slogan</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full sm:w-96 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              />
              <p className="text-gray-400 text-[11px] mt-1">En quelques mots, expliquez de quoi traite ce site.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Adresse web (URL)</label>
            <div className="md:col-span-3">
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full sm:w-96 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Adresse e-mail d'administration</label>
            <div className="md:col-span-3">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full sm:w-96 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              />
              <p className="text-gray-400 text-[11px] mt-1">Cette adresse sert pour les notifications du site.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Catégorie par défaut</label>
            <div className="md:col-span-3">
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="w-full sm:w-64 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Articles par page</label>
            <div className="md:col-span-3">
              <input
                type="number"
                min={1}
                max={50}
                value={postsPerPage}
                onChange={(e) => setPostsPerPage(Number(e.target.value))}
                className="w-24 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="font-bold text-gray-700 md:text-right">Fuseau horaire</label>
            <div className="md:col-span-3">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full sm:w-64 p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
              >
                <option value="Europe/Paris">Europe/Paris (UTC+1 / UTC+2)</option>
                <option value="UTC">Temps universel coordonné (UTC)</option>
                <option value="America/New_York">New York (UTC-5 / UTC-4)</option>
                <option value="America/Montreal">Montréal</option>
                <option value="Africa/Casablanca">Casablanca</option>
                <option value="Africa/Dakar">Dakar</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-start">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold rounded shadow-2xs transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}

      {tab === 'firebase' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-[#f0b849]" />
                <h2 className="text-base font-bold text-gray-800">Paramètres de la base Firebase Firestore</h2>
              </div>
              <button
                onClick={onTestConnection}
                disabled={connectionStatus.testing}
                className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold flex items-center space-x-1 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
                <span>Tester la connexion</span>
              </button>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Ce site WordPress est synchronisé en continu avec votre instance Firebase configurée. Les opérations de création, modification et suppression sont sauvegardées dans les collections Firestore correspondantes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <span className="text-gray-500 font-semibold">Projet Firebase :</span>
                <div className="font-mono font-bold text-gray-900 mt-0.5">{firebaseConfig.projectId}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <span className="text-gray-500 font-semibold">Auth Domain :</span>
                <div className="font-mono text-gray-900 mt-0.5">{firebaseConfig.authDomain}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <span className="text-gray-500 font-semibold">Storage Bucket :</span>
                <div className="font-mono text-gray-900 mt-0.5">{firebaseConfig.storageBucket}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <span className="text-gray-500 font-semibold">Statut & Latence :</span>
                <div className="font-bold text-emerald-700 mt-0.5 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Connecté {connectionStatus.latencyMs !== undefined ? `(${connectionStatus.latencyMs} ms)` : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
